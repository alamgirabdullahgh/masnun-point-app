package com.masnun.ruqyah;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.widget.Toast;

// PackageInstaller-এর ফল: ফোন নিশ্চিত করতে চাইলে সেই পর্দা খোলে
public class UpdateResultReceiver extends BroadcastReceiver {
    @Override
    @SuppressWarnings("deprecation")
    public void onReceive(Context c, Intent i) {
        int st = i.getIntExtra(PackageInstaller.EXTRA_STATUS, -1);
        if (st == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent ui = i.getParcelableExtra(Intent.EXTRA_INTENT);
            // ফোন নিশ্চিত-পর্দা চাইল মানে নীরব ইনস্টল এবার হয়নি
            BgUpdater.sp(c).edit().putBoolean("inst_pending", true).apply();
            if (i.getBooleanExtra("silent", false)) BgUpdater.noteSilentFail(c);
            if (ui != null) {
                ui.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (BgUpdater.fg) {
                    try {
                        c.startActivity(ui);
                    } catch (Exception e) {
                        Toast.makeText(c, "নিশ্চিত করার পর্দা খুলল না — আবার চেষ্টা করুন", Toast.LENGTH_LONG).show();
                    }
                } else {
                    // অ্যাপ সামনে নেই: ব্যাকগ্রাউন্ড থেকে পর্দা খোলা যায় না, তাই নোটিফিকেশন
                    BgUpdater.confirmNotice(c, ui);
                }
            }
        } else if (st != PackageInstaller.STATUS_SUCCESS) {
            String m = i.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
            BgUpdater.sp(c).edit().putBoolean("inst_pending", true).remove("reopen").apply();
            if (i.getBooleanExtra("silent", false)) BgUpdater.noteSilentFail(c);
            if (BgUpdater.fg) Toast.makeText(c, "আপডেট হয়নি: " + (m == null ? "" : m), Toast.LENGTH_LONG).show();
        }
    }
}
