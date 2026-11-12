package com.dailyruqyah.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

// রুকইয়াহ অডিও চালায় (আয়াতের তালিকা ধরে একটার পর একটা, প্রতিটির ফলব্যাক লিংকসহ); নোটিফিকেশনে "বন্ধ করুন" বোতাম
public class RuqyahAudioService extends Service {
    static final String STOP = "com.dailyruqyah.app.STOP_AUDIO";
    static volatile boolean playing = false;

    private final Handler h = new Handler(Looper.getMainLooper());
    private MediaPlayer mp;
    private PowerManager.WakeLock wl;
    private List<List<String>> items = new ArrayList<>();
    private int repeat = 1, round = 0, idx = 0, cand = 0, fails = 0;
    private boolean stopped = false;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent in, int flags, int startId) {
        if (in != null && STOP.equals(in.getAction())) { finish(); return START_NOT_STICKY; }
        String title = "রুকইয়াহ অডিও";
        try {
            JSONObject o = new JSONObject(in.getStringExtra("alarm"));
            title = o.optString("title", title);
            repeat = Math.max(1, Math.min(20, o.optInt("repeat", 1)));
            JSONArray u = o.optJSONArray("urls");
            items.clear();
            if (u != null) for (int i = 0; i < u.length(); i++) {
                JSONArray c = u.optJSONArray(i);
                List<String> l = new ArrayList<>();
                if (c != null) for (int k = 0; k < c.length(); k++) l.add(c.optString(k));
                else l.add(u.optString(i));
                if (!l.isEmpty()) items.add(l);
            }
        } catch (Exception e) { }
        startFg(title);
        if (items.isEmpty()) { finish(); return START_NOT_STICKY; }
        playing = true;
        stopped = false;
        round = 0; idx = 0; cand = 0; fails = 0;
        try {
            PowerManager pm = getSystemService(PowerManager.class);
            wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "dailyruqyah:audio");
            wl.acquire(3 * 60 * 60 * 1000L);
        } catch (Exception e) { }
        try {
            AudioManager am = getSystemService(AudioManager.class);
            am.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        } catch (Exception e) { }
        playCurrent();
        return START_NOT_STICKY;
    }

    private void startFg(String title) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel("ruqyah_audio", "রুকইয়াহ অডিও", NotificationManager.IMPORTANCE_LOW));
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, RuqyahAudioService.class).setAction(STOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent open = PendingIntent.getActivity(this, 2, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(this, "ruqyah_audio")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle("রুকইয়াহ অডিও চলছে")
                .setContentText(title)
                .setContentIntent(open)
                .setOngoing(true)
                .addAction(new Notification.Action.Builder(null, "বন্ধ করুন", stop).build())
                .build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(77, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(77, n);
    }

    private void release() {
        if (mp != null) { try { mp.reset(); mp.release(); } catch (Exception e) { } mp = null; }
    }

    private void playCurrent() {
        if (stopped) return;
        if (idx >= items.size()) {
            round++; idx = 0;
            if (round >= repeat) { finish(); return; }
        }
        List<String> c = items.get(idx);
        if (cand >= c.size()) { // এই আয়াতের সব লিংক ব্যর্থ: পরেরটায়
            idx++; cand = 0; fails++;
            if (fails >= 6) { finish(); return; } // পরপর অনেকগুলো ব্যর্থ (নেট নেই) — আর চেষ্টা নয়
            h.post(this::playCurrent);
            return;
        }
        release();
        try {
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            mp.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            mp.setDataSource(c.get(cand));
            mp.setOnPreparedListener(m -> { if (!stopped) { fails = 0; m.start(); } });
            mp.setOnCompletionListener(m -> { idx++; cand = 0; h.post(this::playCurrent); });
            mp.setOnErrorListener((m, w, x) -> { cand++; h.post(this::playCurrent); return true; });
            mp.prepareAsync();
        } catch (Exception e) {
            cand++;
            h.post(this::playCurrent);
        }
    }

    private void finish() {
        stopped = true;
        playing = false;
        h.removeCallbacksAndMessages(null);
        release();
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) { }
        try { getSystemService(AudioManager.class).abandonAudioFocus(null); } catch (Exception e) { }
        stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        stopped = true;
        playing = false;
        release();
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) { }
        super.onDestroy();
    }
}
