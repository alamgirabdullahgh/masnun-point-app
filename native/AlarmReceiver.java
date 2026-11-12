package com.dailyruqyah.app;

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
        try {
            JSONObject o = AlarmStore.find(c, id);
            if (o != null && o.optBoolean("on", true)) {
                Intent s = new Intent(c, RuqyahAudioService.class).putExtra("alarm", o.toString());
                ContextCompat.startForegroundService(c, s);
            }
        } catch (Exception e) { }
        AlarmStore.scheduleAll(c);
    }
}
