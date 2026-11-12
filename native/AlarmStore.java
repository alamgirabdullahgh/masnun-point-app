package com.masnun.ruqyah;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

// রুকইয়াহ অডিও অ্যালার্মের তালিকা (SharedPreferences-এ JSON) ও পরের সময়ে অ্যালার্ম বসানো।
// অ্যালার্ম: {id, time:"HH:MM", days:[0..6] (0=রবি; ফাঁকা = প্রতিদিন), on, title, repeat, urls:[[url,…ফলব্যাক],…]}
public class AlarmStore {
    static final String PREF = "dr_alarm";
    static final String ACTION = "com.masnun.ruqyah.AUDIO_ALARM";

    static SharedPreferences sp(Context c) { return c.getSharedPreferences(PREF, Context.MODE_PRIVATE); }

    static JSONArray load(Context c) {
        try { return new JSONArray(sp(c).getString("alarms", "[]")); } catch (Exception e) { return new JSONArray(); }
    }

    static void save(Context c, JSONArray a) { sp(c).edit().putString("alarms", a.toString()).apply(); }

    static JSONObject find(Context c, int id) {
        JSONArray a = load(c);
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null && o.optInt("id") == id) return o;
        }
        return null;
    }

    static boolean canExact(Context c) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        return Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
    }

    private static PendingIntent pi(Context c, int id, int flags) {
        Intent i = new Intent(c, AlarmReceiver.class).setAction(ACTION).putExtra("id", id);
        return PendingIntent.getBroadcast(c, id, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    // পরের বাজার সময় (মিলিসেকেন্ড); কোনো দিনই না মিললে -1
    static long nextTime(JSONObject o, long now) {
        try {
            String[] hm = o.optString("time", "05:00").split(":");
            int h = Integer.parseInt(hm[0]), m = Integer.parseInt(hm[1]);
            JSONArray days = o.optJSONArray("days");
            for (int d = 0; d <= 7; d++) {
                Calendar c = Calendar.getInstance();
                c.setTimeInMillis(now);
                c.add(Calendar.DAY_OF_YEAR, d);
                c.set(Calendar.HOUR_OF_DAY, h);
                c.set(Calendar.MINUTE, m);
                c.set(Calendar.SECOND, 0);
                c.set(Calendar.MILLISECOND, 0);
                if (c.getTimeInMillis() <= now + 1000) continue;
                int dow = c.get(Calendar.DAY_OF_WEEK) - 1; // 0 = রবিবার
                boolean ok = days == null || days.length() == 0;
                if (!ok) for (int k = 0; k < days.length(); k++) if (days.optInt(k, -1) == dow) ok = true;
                if (ok) return c.getTimeInMillis();
            }
        } catch (Exception e) { }
        return -1;
    }

    // আগের সব বসানো অ্যালার্ম বাতিল করে চালু থাকাগুলোর পরের সময় বসায়
    static void scheduleAll(Context c) {
        AlarmManager am = c.getSystemService(AlarmManager.class);
        SharedPreferences s = sp(c);
        try {
            JSONArray old = new JSONArray(s.getString("sched", "[]"));
            for (int i = 0; i < old.length(); i++) am.cancel(pi(c, old.optInt(i), PendingIntent.FLAG_UPDATE_CURRENT));
        } catch (Exception e) { }
        JSONArray sched = new JSONArray();
        JSONArray a = load(c);
        long now = System.currentTimeMillis();
        boolean exact = canExact(c);
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o == null || !o.optBoolean("on", true)) continue;
            long t = nextTime(o, now);
            if (t < 0) continue;
            int id = o.optInt("id");
            PendingIntent p = pi(c, id, PendingIntent.FLAG_UPDATE_CURRENT);
            try {
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, p);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, p);
                sched.put(id);
            } catch (Exception e) { }
        }
        s.edit().putString("sched", sched.toString()).apply();
    }
}
