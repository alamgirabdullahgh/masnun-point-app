package com.dailyruqyah.app;

import android.Manifest;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import kotlin.Unit;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RemoteViews;

// টাইম উইজেট: সেটিংস পর্দা খোলা, হোম স্ক্রিনে বসানো, এবং অ্যাপের ভেতরের কার্ডের সাথে সেটিং/অবস্থান ভাগ করা।
// নেটিভ উইজেট (Cfg) আর অ্যাপের ওয়েব-কার্ড (widget.js) যেন সবসময় হুবহু একই সময় দেখায়, তাই কার্ড এখান থেকেই অবস্থান, সমন্বয় ও হানাফি-সেটিং নেয়।
@CapacitorPlugin(name = "TimeWidgetNative")
public class WidgetPlugin extends Plugin {

    private JSObject cfgJson() {
        Context c = getContext();
        Cfg cfg = new Cfg(c);
        JSObject r = new JSObject();
        r.put("lat", cfg.lat());
        r.put("lng", cfg.lng());
        r.put("hanafi", cfg.getHanafi());
        JSArray off = new JSArray();
        for (int i = 0; i < 5; i++) off.put(cfg.off(i));
        r.put("off", off);
        r.put("place", cfg.placeName());
        r.put("auto", cfg.getAuto());
        r.put("located", cfg.autoFix() != null);
        r.put("hasPerm", LocationUpdater.INSTANCE.hasPerm(c));
        r.put("hasBg", LocationUpdater.INSTANCE.hasBg(c));
        r.put("hijriShift", cfg.hijriShift());
        r.put("banglaAdj", cfg.getBanglaAdj());
        r.put("bnDigits", cfg.getBnDigits());
        return r;
    }

    // বর্তমান সেটিং (অবস্থান, সমন্বয়, হানাফি ইত্যাদি) — উইজেটের সাথে হুবহু এক
    @PluginMethod
    public void config(PluginCall call) {
        try {
            LocationUpdater.INSTANCE.sync(getContext()); // ফোনের সর্বশেষ জানা অবস্থান (নতুন করে খোঁজে না)
            call.resolve(cfgJson());
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // অবস্থান হাল-নাগাদ করা। অনুমতি না থাকলে ও ask = true হলে একবার অনুমতি চায় (উইজেট-সেটিংস না খুললেও যেন অবস্থান পায়)
    @PluginMethod
    public void locate(PluginCall call) {
        try {
            final Context c = getContext();
            boolean asked = false;
            if (!LocationUpdater.INSTANCE.hasPerm(c)) {
                if (Boolean.TRUE.equals(call.getBoolean("ask", false)) && getActivity() != null && new Cfg(c).getAuto()) {
                    ActivityCompat.requestPermissions(getActivity(), new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, 4412);
                    asked = true;
                }
            } else {
                LocationUpdater.INSTANCE.sync(c);
                LocationUpdater.INSTANCE.register(c);
                LocationUpdater.INSTANCE.fresh(c, () -> {
                    ClockWidget.Companion.refresh(c);
                    return Unit.INSTANCE;
                });
            }
            JSObject r = cfgJson();
            r.put("asked", asked);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), WidgetSettingsActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void pin(PluginCall call) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(getContext());
            ClockWidget.pushPreview(getContext(), true); // শিটে আসল (লাইভ) প্রিভিউ
            boolean ok = m.isRequestPinAppWidgetSupported() && m.requestPinAppWidget(new ComponentName(getContext(), ClockWidget.class), null, null);
            JSObject r = new JSObject();
            r.put("ok", ok);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // ───── অ্যাপের ভেতরে হোম-স্ক্রিনের উইজেটটাই (একই RemoteViews) ওয়েবপেজের নির্দিষ্ট জায়গায় বসানো ─────
    private View cardView;
    private int cardW = 0;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (cardView != null && cardView.getVisibility() == View.VISIBLE) redraw();
            ui.postDelayed(this, 3000);
        }
    };

    private void redraw() {
        try {
            RemoteViews rv = ClockWidget.Companion.viewFor(getContext(), cardW);
            rv.reapply(getContext(), cardView);
        } catch (Exception e) { }
    }

    @PluginMethod
    public void card(final PluginCall call) {
        final boolean vis = Boolean.TRUE.equals(call.getBoolean("visible", true));
        final double x = call.getDouble("x", 0.0), y = call.getDouble("y", 0.0), w = call.getDouble("w", 0.0);
        getActivity().runOnUiThread(() -> {
            try {
                float d = getContext().getResources().getDisplayMetrics().density;
                ViewGroup parent = (ViewGroup) getBridge().getWebView().getParent();
                int wdp = (int) Math.max(200, Math.round(w));
                if (cardView == null || cardW != wdp) {
                    if (cardView != null) parent.removeView(cardView);
                    cardW = wdp;
                    RemoteViews rv = ClockWidget.Companion.viewFor(getContext(), wdp);
                    cardView = rv.apply(getContext(), parent);
                    // কার্ডে চাপলে (ওয়াক্তের ঘর বাদে) উইজেট-সেটিংস খোলে
                    cardView.setOnClickListener(v -> {
                        try {
                            Intent i = new Intent(getContext(), WidgetSettingsActivity.class);
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            getContext().startActivity(i);
                        } catch (Exception e) { }
                    });
                    parent.addView(cardView, new ViewGroup.LayoutParams((int) (wdp * d), ViewGroup.LayoutParams.WRAP_CONTENT));
                    ui.removeCallbacks(tick);
                    ui.postDelayed(tick, 3000);
                }
                cardView.measure(View.MeasureSpec.makeMeasureSpec((int) (wdp * d), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
                cardView.layout(0, 0, cardView.getMeasuredWidth(), cardView.getMeasuredHeight());
                View wv = getBridge().getWebView();
                cardView.setTranslationX((float) (x * d) + wv.getLeft());
                cardView.setTranslationY((float) (y * d) + wv.getTop());
                cardView.setVisibility(vis ? View.VISIBLE : View.INVISIBLE);
                cardView.bringToFront();
                if (vis) redraw();
                JSObject r = new JSObject();
                r.put("h", cardView.getMeasuredHeight() / d);
                call.resolve(r);
            } catch (Exception e) {
                call.reject(String.valueOf(e.getMessage()));
            }
        });
    }
}
