# Masnun Ruqyah

কুরআনের আয়াত খোঁজা, হাদিস সার্চ (১৮টি কিতাব, ৬১,৭৮১ হাদীস — আরবি ও বাংলা), শব্দে শব্দে অর্থ, রুকিয়ার আয়াত, রোগ/সমস্যা অনুযায়ী আয়াত, কপি ও অডিও — সব একটি ইনস্টলযোগ্য অ্যাপে (PWA)। একবার খুললে অফলাইনেও চলে।

## চালু করার নিয়ম
1. GitHub → এই রিপোর **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save
3. ১-২ মিনিট পর লিংক: `https://alamgirabdullahgh.github.io/daily-ruqyah/`
4. ফোনের Chrome-এ লিংক খুলে ⋮ → **Add to Home screen / Install app**
   (iPhone: Safari → Share → Add to Home Screen)

## ফাইল
- `index.html`, `app.js`, `style.css` — অ্যাপ
- `sw.js`, `boot.js`, `manifest.webmanifest` — অফলাইন ও ইনস্টল
- `data/` — কুরআনের ডেটা, `data/hadith-chunks/` ও `data/hadith.js` (হাদিস); নোটিশ: `QURAN-DATA-NOTICE.md`, `HADITH-DATA-NOTICE.md`, `LAMEJS-NOTICE.md`
