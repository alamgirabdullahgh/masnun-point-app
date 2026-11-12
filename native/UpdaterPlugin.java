package com.dailyruqyah.app;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// অ্যাপের নিজের আপডেট: GitHub-এর "latest release" দেখে, APK নামিয়ে PackageInstaller দিয়ে ইনস্টল করে
@CapacitorPlugin(name = "AppUpdater")
public class UpdaterPlugin extends Plugin {
    static final String REPO = "alamgirabdullahgh/daily-ruqyah";
    static final int BASE = 100;
    private volatile boolean busy = false;

    @PluginMethod
    public void info(PluginCall call) {
        try {
            Context c = getContext();
            PackageInfo pi = c.getPackageManager().getPackageInfo(c.getPackageName(), 0);
            JSObject r = new JSObject();
            r.put("versionName", pi.versionName);
            r.put("versionCode", Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode);
            r.put("canInstall", c.getPackageManager().canRequestPackageInstalls());
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    // ট্যাগ v1.0.N → সংস্করণ নম্বর 100 + N (বিল্ডের versionCode-এর সাথে মেলে)
    @PluginMethod
    public void check(final PluginCall call) {
        new Thread(() -> {
            HttpURLConnection cn = null;
            try {
                cn = (HttpURLConnection) new URL("https://github.com/" + REPO + "/releases/latest").openConnection();
                cn.setInstanceFollowRedirects(false);
                cn.setConnectTimeout(10000);
                cn.setReadTimeout(10000);
                String loc = cn.getHeaderField("Location");
                if (loc == null) throw new Exception("no redirect");
                String tag = loc.substring(loc.lastIndexOf('/') + 1);
                int n = Integer.parseInt(tag.substring(tag.lastIndexOf('.') + 1));
                JSObject r = new JSObject();
                r.put("tag", tag);
                r.put("versionCode", BASE + n);
                r.put("url", "https://github.com/" + REPO + "/releases/download/" + tag + "/Daily-Ruqyah.apk");
                call.resolve(r);
            } catch (Exception e) {
                call.reject("check failed: " + e.getClass().getSimpleName());
            } finally {
                if (cn != null) cn.disconnect();
            }
        }).start();
    }

    // অ্যাপের APK "Daily Ruqyah.apk" নামে শেয়ার (ফাইলের নাম ApkShareProvider ঠিক করে)
    @PluginMethod
    public void share(PluginCall call) {
        try {
            Context c = getContext();
            Uri u = ApkShareProvider.uri(c);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("application/vnd.android.package-archive");
            i.putExtra(Intent.EXTRA_STREAM, u);
            i.putExtra(Intent.EXTRA_SUBJECT, "Daily Ruqyah");
            i.setClipData(android.content.ClipData.newRawUri(ApkShareProvider.NAME, u));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent ch = Intent.createChooser(i, "Daily Ruqyah শেয়ার করুন");
            ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(ch);
            call.resolve();
        } catch (Exception e) {
            call.reject("share failed: " + e.getClass().getSimpleName());
        }
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Context c = getContext();
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + c.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void install(final PluginCall call) {
        final String url = call.getString("url");
        final Context c = getContext();
        if (url == null || !url.startsWith("https://github.com/" + REPO + "/")) {
            call.reject("bad url");
            return;
        }
        if (!c.getPackageManager().canRequestPackageInstalls()) {
            call.reject("permission");
            return;
        }
        if (busy) {
            call.reject("busy");
            return;
        }
        busy = true;
        new Thread(() -> {
            PackageInstaller inst = c.getPackageManager().getPackageInstaller();
            int id = -1;
            try {
                PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
                if (Build.VERSION.SDK_INT >= 31) p.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
                id = inst.createSession(p);
                PackageInstaller.Session s = inst.openSession(id);
                HttpURLConnection cn = (HttpURLConnection) new URL(url).openConnection();
                cn.setConnectTimeout(15000);
                cn.setReadTimeout(30000);
                if (cn.getResponseCode() != 200) throw new Exception("HTTP " + cn.getResponseCode());
                long total = cn.getContentLengthLong();
                try (InputStream in = cn.getInputStream(); OutputStream out = s.openWrite("a", 0, -1)) {
                    byte[] buf = new byte[32 * 1024];
                    long done = 0;
                    int last = -1, n;
                    while ((n = in.read(buf)) >= 0) {
                        out.write(buf, 0, n);
                        done += n;
                        if (total > 0) {
                            int pct = (int) Math.max(0, Math.min(100, done * 100 / total));
                            if (pct != last) {
                                last = pct;
                                JSObject o = new JSObject();
                                o.put("pct", pct);
                                notifyListeners("progress", o);
                            }
                        }
                    }
                    s.fsync(out);
                }
                BgUpdater.sp(c).edit().putBoolean("reopen", true).apply();
                PendingIntent pi = PendingIntent.getBroadcast(
                        c, id, new Intent(c, UpdateResultReceiver.class).putExtra("silent", Build.VERSION.SDK_INT >= 31),
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
                s.commit(pi.getIntentSender());
                call.resolve();
            } catch (Exception e) {
                try { if (id >= 0) inst.abandonSession(id); } catch (Exception x) { }
                call.reject("install failed: " + e.getClass().getSimpleName());
            } finally {
                busy = false;
            }
        }).start();
    }
}
