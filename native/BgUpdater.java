package com.masnun.ruqyah;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInstaller;
import android.os.Build;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// নিজে থেকে আপডেট (AutoReply-এর মতো): ~১০ মিনিট পরপর ব্যাকগ্রাউন্ডে নতুন রিলিজ খোঁজে; পেলে বোতাম চাপা ছাড়াই নামিয়ে নীরবে ইনস্টল করে
// (Android ১২+ ও "অজানা উৎস" অনুমতি থাকলে); না পারলে নোটিফিকেশন দেয়। আপডেট শেষে অ্যাপ নিজে আবার খুলে যায়।
public class BgUpdater {
    static final String REPO = UpdaterPlugin.REPO;
    static final int BASE = UpdaterPlugin.BASE;
    private static final int MAX_AUTO_TRIES = 3, MAX_SILENT_FAILS = 3;
    private static final long EVERY = 10 * 60 * 1000L;

    // অ্যাপের পর্দা সামনে খোলা আছে কি না (MainActivity ঠিক করে)
    static volatile boolean fg = false;

    static SharedPreferences sp(Context c) { return c.getSharedPreferences("dr_upd", 0); }

    static int cur(Context c) {
        try {
            @SuppressWarnings("deprecation")
            int v = c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
            return v;
        } catch (Exception e) { return 0; }
    }

    static class Info { int v; String url; String tag; }

    static Info fetch() throws Exception {
        HttpURLConnection cn = (HttpURLConnection) new URL("https://github.com/" + REPO + "/releases/latest").openConnection();
        try {
            cn.setInstanceFollowRedirects(false);
            cn.setConnectTimeout(10000);
            cn.setReadTimeout(10000);
            String loc = cn.getHeaderField("Location");
            if (loc == null) throw new Exception("no redirect");
            Info i = new Info();
            i.tag = loc.substring(loc.lastIndexOf('/') + 1);
            i.v = BASE + Integer.parseInt(i.tag.substring(i.tag.lastIndexOf('.') + 1));
            i.url = "https://github.com/" + REPO + "/releases/download/" + i.tag + "/Masnun-Ruqyah.apk";
            return i;
        } finally { cn.disconnect(); }
    }

    // ───── সময়সূচি ─────
    static PendingIntent tickPi(Context c) {
        return PendingIntent.getBroadcast(c, 21, new Intent(c, UpdateTickReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context c, long delay) {
        try {
            ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE))
                    .setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + delay, tickPi(c));
        } catch (Exception e) { }
    }

    static void schedule(Context c) { schedule(c, EVERY); }

    // ───── ব্যাকগ্রাউন্ড চেক ─────
    // ব্যাকগ্রাউন্ড থ্রেড থেকে ডাকতে হবে
    static void backgroundCheck(Context c, long minGapMs) {
        SharedPreferences sp = sp(c);
        if (System.currentTimeMillis() - sp.getLong("t", 0L) < minGapMs) return;
        Info i;
        try { i = fetch(); } catch (Exception e) { return; }
        sp.edit().putLong("t", System.currentTimeMillis()).apply();
        if (i.v <= cur(c)) { clearNotice(c); return; }

        int tries = sp.getInt("auto_v", 0) == i.v ? sp.getInt("auto_n", 0) : 0;
        boolean silentOk = Build.VERSION.SDK_INT >= 31 && sp.getInt("silent_fail", 0) < MAX_SILENT_FAILS;
        boolean can = silentOk && !fg && c.getPackageManager().canRequestPackageInstalls() && tries < MAX_AUTO_TRIES;
        if (can) {
            sp.edit().putInt("auto_v", i.v).putInt("auto_n", tries + 1).apply();
            try {
                install(c, i.url, true, null);
                return;
            } catch (Exception e) { }
        }
        if (sp.getInt("n_v", 0) == i.v) return;
        sp.edit().putInt("n_v", i.v).apply();
        notice(c);
    }

    interface Pct { void on(int p); }

    // APK নামিয়ে PackageInstaller-এ জমা দেয়; silent হলে (Android 12+) ফোন অনুমতি দিলে নিশ্চিত-পর্দা ছাড়াই বসে
    static void install(Context c, String url, boolean silent, Pct pct) throws Exception {
        PackageInstaller inst = c.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams p = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
        if (Build.VERSION.SDK_INT >= 31) {
            p.setRequireUserAction(silent ? PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED : PackageInstaller.SessionParams.USER_ACTION_REQUIRED);
        }
        int id = inst.createSession(p);
        try {
            PackageInstaller.Session s = inst.openSession(id);
            HttpURLConnection cn = (HttpURLConnection) new URL(url).openConnection();
            try {
                cn.setConnectTimeout(15000);
                cn.setReadTimeout(30000);
                if (cn.getResponseCode() != 200) throw new Exception("HTTP " + cn.getResponseCode());
                long total = cn.getContentLengthLong();
                try (InputStream in = cn.getInputStream(); OutputStream out = s.openWrite("a", 0, -1)) {
                    byte[] buf = new byte[32 * 1024];
                    long done = 0; int last = -1, n;
                    while ((n = in.read(buf)) >= 0) {
                        out.write(buf, 0, n);
                        done += n;
                        if (total > 0 && pct != null) {
                            int q = (int) Math.max(0, Math.min(100, done * 100 / total));
                            if (q != last) { last = q; pct.on(q); }
                        }
                    }
                    s.fsync(out);
                }
            } finally { cn.disconnect(); }
            PendingIntent pi = PendingIntent.getBroadcast(c, id, new Intent(c, UpdateResultReceiver.class).putExtra("silent", silent),
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
            // আপডেটের পর অ্যাপ আবার খুলে দেওয়ার চিহ্ন, আর নীরব চেষ্টা ছিল কি না
            sp(c).edit().putBoolean("reopen", true).putBoolean("inst_silent", silent).putBoolean("inst_pending", false).apply();
            s.commit(pi.getIntentSender());
        } catch (Exception e) {
            try { inst.abandonSession(id); } catch (Exception x) { }
            throw e;
        }
    }

    static void noteSilentFail(Context c) {
        SharedPreferences sp = sp(c);
        sp.edit().putInt("silent_fail", sp.getInt("silent_fail", 0) + 1).apply();
    }

    // ───── নোটিফিকেশন ─────
    static void notify(Context c, int id, String chan, String chanName, int imp, String title, String text, Intent go) {
        try {
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            nm.createNotificationChannel(new NotificationChannel(chan + "_q", chanName, NotificationManager.IMPORTANCE_LOW)); // নীরব: শব্দ/পপআপ নেই
            Notification.Builder b = new Notification.Builder(c, chan + "_q")
                    .setSmallIcon(android.R.drawable.stat_sys_download_done)
                    .setContentTitle(title).setContentText(text).setAutoCancel(true);
            if (go != null) b.setContentIntent(PendingIntent.getActivity(c, id, go, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            nm.notify(id, b.build());
        } catch (Exception e) { }
    }

    static Intent openApp(Context c) {
        return new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    }

    static void notice(Context c) {
        notify(c, 31, "update", "Masnun Ruqyah আপডেট", NotificationManager.IMPORTANCE_DEFAULT,
                "Masnun Ruqyah-এর নতুন সংস্করণ এসেছে", "চাপুন — অ্যাপ খুলে আপডেট করুন", openApp(c));
    }

    static void confirmNotice(Context c, Intent ui) {
        notify(c, 32, "update", "Masnun Ruqyah আপডেট", NotificationManager.IMPORTANCE_DEFAULT,
                "Masnun Ruqyah-এর নতুন সংস্করণ তৈরি", "চাপুন — ইনস্টল নিশ্চিত করুন", ui);
    }

    static void clearNotice(Context c) {
        try { NotificationManager nm = c.getSystemService(NotificationManager.class); nm.cancel(31); nm.cancel(32); } catch (Exception e) { }
    }

    // আপডেটের পর নতুন সংস্করণ চালু হলে (MY_PACKAGE_REPLACED): অ্যাপ নিজে আবার খুলে দেয়
    static void afterUpdate(Context c) {
        SharedPreferences sp = sp(c);
        if (sp.getBoolean("inst_silent", false) && !sp.getBoolean("inst_pending", false)) sp.edit().putInt("silent_fail", 0).apply();
        boolean reopen = sp.getBoolean("reopen", false);
        sp.edit().remove("inst_silent").remove("inst_pending").remove("reopen").apply();
        clearNotice(c);
        if (!reopen) return;
        Intent go = openApp(c);
        // ১) সরাসরি খোলার চেষ্টা (নতুন Android ব্যাকগ্রাউন্ড থেকে খুলতে না দিলে নিঃশব্দে ব্যর্থ হয়)
        try { c.startActivity(go); } catch (Exception e) { }
        // আপডেটের পর কোনো নোটিফিকেশন নয়; পুরোনো "updated" চ্যানেলও মুছে দিই
        try { c.getSystemService(NotificationManager.class).deleteNotificationChannel("updated"); } catch (Exception e) { }
    }

    // ───── রিসিভার: ~১০ মিনিট পরপর জাগে ─────
    public static class UpdateTickReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context c, Intent i) {
            schedule(c);
            final BroadcastReceiver.PendingResult pr = goAsync();
            final Context app = c.getApplicationContext();
            new Thread(() -> {
                try { backgroundCheck(app, 9 * 60 * 1000L); } catch (Exception e) { } finally { pr.finish(); }
            }).start();
        }
    }
}
