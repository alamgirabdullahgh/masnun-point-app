package com.dailyruqyah.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// ফোন চালু, অ্যাপ আপডেট বা সময়/টাইমজোন বদলালে অ্যালার্ম আবার বসায়
public class AlarmBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        AlarmStore.scheduleAll(c);
        if (Intent.ACTION_MY_PACKAGE_REPLACED.equals(i.getAction())) BgUpdater.afterUpdate(c);
        BgUpdater.schedule(c);
    }
}
