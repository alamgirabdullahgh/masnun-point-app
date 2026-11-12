package com.dailyruqyah.app;

import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UpdaterPlugin.class);
        registerPlugin(AudioAlarmPlugin.class);
        registerPlugin(WidgetPlugin.class);
        registerPlugin(OfflineAudioPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            WebView w = getBridge().getWebView();
            w.addJavascriptInterface(new Dl(), "DRDl");
            // অডিও প্লেয়ারের তিন-ডট মেনুর "Download" (blob:) ধরে একই সেভারে পাঠায়
            w.setDownloadListener((url, ua, cd, mime, len) -> {
                if (url != null && url.startsWith("blob:"))
                    w.evaluateJavascript("fetch(" + org.json.JSONObject.quote(url) + ").then(r=>r.blob()).then(b=>window.__drSave&&window.__drSave(b))", null);
            });
        } catch (Exception ignored) {}
        BgUpdater.schedule(this, 60 * 1000L); // অ্যাপ খোলার ১ মিনিট পর থেকে ব্যাকগ্রাউন্ড আপডেট-পাহারা চালু
    }

    @Override
    public void onResume() {
        super.onResume();
        BgUpdater.fg = true;
        BgUpdater.clearNotice(this);
    }

    @Override
    public void onPause() {
        BgUpdater.fg = false;
        super.onPause();
    }

    /** JS থেকে ফাইল টুকরো টুকরো করে নিয়ে Downloads ফোল্ডারে সেভ করে */
    private class Dl {
        private final Map<String, OutputStream> os = new HashMap<>();
        private final Map<String, String> where = new HashMap<>();
        private final Map<String, Uri> uris = new HashMap<>();

        @JavascriptInterface public void begin(String id, String name, String mime) {
            try {
                OutputStream o;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, mime);
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/MasnunRuqyah");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    o = getContentResolver().openOutputStream(u);
                    uris.put(id, u);
                } else {
                    File d = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    d.mkdirs();
                    File f = new File(d, name);
                    o = new FileOutputStream(f);
                    where.put(id, f.getAbsolutePath());
                }
                os.put(id, o);
            } catch (Exception e) { toast("ডাউনলোড শুরু করা যায়নি: " + e.getMessage()); }
        }

        @JavascriptInterface public void chunk(String id, String b64) {
            try { OutputStream o = os.get(id); if (o != null) o.write(Base64.decode(b64, Base64.DEFAULT)); }
            catch (Exception e) { toast("সেভ করতে সমস্যা: " + e.getMessage()); }
        }

        @JavascriptInterface public void end(String id) {
            try {
                OutputStream o = os.remove(id);
                if (o != null) { o.flush(); o.close(); }
                String w = where.remove(id);
                uris.remove(id);
                toast(w == null ? "✅ ডাউনলোড হয়েছে — Downloads/MasnunRuqyah ফোল্ডারে" : "✅ সেভ হয়েছে: " + w);
            } catch (Exception e) { toast("সেভ শেষ করা যায়নি: " + e.getMessage()); }
        }

        /** শেয়ার: ফাইল সেভ শেষ করে (Downloads/MasnunRuqyah-এ একটা কপি থাকে) Android-এর শেয়ার-শিট খোলে */
        @JavascriptInterface public void endShare(String id, String mime) {
            try {
                OutputStream o = os.remove(id);
                if (o != null) { o.flush(); o.close(); }
                where.remove(id);
                Uri u = uris.remove(id);
                if (u == null) { toast("শেয়ার করা যায়নি (এই ফোনের Android পুরনো)"); return; }
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType(mime == null || mime.isEmpty() ? "audio/mpeg" : mime);
                i.putExtra(Intent.EXTRA_STREAM, u);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent ch = Intent.createChooser(i, "শেয়ার করুন");
                ch.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                runOnUiThread(() -> { try { startActivity(ch); } catch (Exception e) { toast("শেয়ার খোলা যায়নি: " + e.getMessage()); } });
            } catch (Exception e) { toast("শেয়ার করা যায়নি: " + e.getMessage()); }
        }

        @JavascriptInterface public void fail(String m) { toast("ডাউনলোড ব্যর্থ: " + m); }

        private void toast(String m) { runOnUiThread(() -> Toast.makeText(MainActivity.this, m, Toast.LENGTH_LONG).show()); }
    }
}
