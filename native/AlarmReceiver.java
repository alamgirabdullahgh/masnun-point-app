package com.masnun.ruqyah;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.content.ContextCompat;

import org.json.JSONObject;

// অ্যালার্মের সময় হলে অডিও-সার্ভিস চালু করে, আর এই অ্যালার্মের পরের দিনের সময় বসায়
public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        int id = i.getIntExtra("id", -1);
        try { // সার্ভিস চালু হওয়ার আগে ফোন আবার ঘুমিয়ে না পড়ে
            android.os.PowerManager.WakeLock w = c.getSystemService(android.os.PowerManager.class).newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "masnunruqyah:alarmrx");
            w.acquire(30000);
        } catch (Throwable e) { }
        AlarmStore.log(c, "অ্যালার্ম এসেছে (id " + id + ")");
        try {
            String direct = i.getStringExtra("alarmJson"); // পরীক্ষা-অ্যালার্ম
            JSONObject o = direct != null ? new JSONObject(direct) : AlarmStore.find(c, id);
            if (o == null) AlarmStore.log(c, "অ্যালার্মটি তালিকায় পাওয়া যায়নি");
            else if (!o.optBoolean("on", true)) AlarmStore.log(c, "অ্যালার্ম বন্ধ করা ছিল");
            else {
                try {
                    Intent s = new Intent(c, RuqyahAudioService.class).putExtra("alarm", o.toString());
                    ContextCompat.startForegroundService(c, s);
                    AlarmStore.log(c, "অডিও-সার্ভিস চালু করা হলো");
                } catch (Throwable e) {
                    AlarmStore.log(c, "সার্ভিস চালু হয়নি: " + e.getClass().getSimpleName() + " " + e.getMessage());
                    fallback(c, o.optString("title", "রুকইয়াহ অডিও"));
                }
            }
        } catch (Throwable e) { AlarmStore.log(c, "ত্রুটি: " + e); }
        AlarmStore.scheduleAll(c);
    }

    // সার্ভিস চালু না হলে অন্তত নোটিফিকেশন দেখায়, চাপলে অ্যাপ খোলে
    private void fallback(Context c, String title) {
        try {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            nm.createNotificationChannel(new NotificationChannel("ruqyah_alarm_fb", "রুকইয়াহ অ্যালার্ম", NotificationManager.IMPORTANCE_HIGH));
            PendingIntent open = PendingIntent.getActivity(c, 3, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            Notification n = new Notification.Builder(c, "ruqyah_alarm_fb")
                    .setSmallIcon(android.R.drawable.ic_media_play)
                    .setContentTitle("রুকইয়াহ অ্যালার্মের সময় হয়েছে")
                    .setContentText(title + " — চাপ দিয়ে অ্যাপ খুলুন")
                    .setContentIntent(open).setAutoCancel(true).build();
            nm.notify(78, n);
        } catch (Throwable e) { }
    }
}
