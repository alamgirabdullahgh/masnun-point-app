package com.masnun.ruqyah;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// অফলাইন অডিও সার্ভিস চালু করা ও অগ্রগতি জানা (JS থেকে)
@CapacitorPlugin(name = "OfflineAudio")
public class OfflineAudioPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        try {
            Context c = getContext();
            Intent i = new Intent(c, OfflineAudioService.class);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        try {
            long[] s = OfflineAudioService.scan(getContext());
            JSObject r = new JSObject();
            r.put("done", s[0]);
            r.put("bytes", s[1]);
            r.put("total", OfflineAudioService.TOTAL);
            r.put("running", OfflineAudioService.running);
            r.put("last", OfflineAudioService.last);
            r.put("dir", OfflineAudioService.dir(getContext()).getAbsolutePath());
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }
}
