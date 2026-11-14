/* Daily Ruqyah — রুকইয়াহ অডিও অ্যালার্ম + টাইম উইজেট সেটিংসের বোতাম।
   অ্যালার্ম: মেনুর "রুকইয়াহ অডিও অ্যালার্ম" (#alarm) পাতা। সময় ঠিক করলে ফোন নিজে ওই সময়ে বাছা অডিও চালায় (অ্যাপ বন্ধ থাকলেও)।
   নেটিভ অংশ: AudioAlarmPlugin / AlarmStore / RuqyahAudioService (native/*.java)। শুধু ইনস্টল করা অ্যাপে চলে। */
(function () {
  "use strict";
  var C = window.Capacitor;
  var NATIVE = !!(C && C.isNativePlatform && C.isNativePlatform());
  var P = NATIVE && C.Plugins && C.Plugins.AudioAlarm;
  var W = NATIVE && C.Plugins && C.Plugins.TimeWidgetNative;
  var host = document.getElementById("drAlarm");

  function openWidget() {
    if (W && W.openSettings) { W.openSettings().catch(function () {}); return true; }
    alert("টাইম উইজেটের সেটিংস ও হোম স্ক্রিনে বসানো শুধু ইনস্টল করা অ্যাপে চলে।");
    return false;
  }

  /* হোম পাতায় কার্ডের নিচের বোতাম */
  /* হোম স্ক্রিনে বসান: বোতাম উইজেটের সূর্যোদয়-সূর্যাস্ত সারির মাঝখানে (widget.js আঁকে); উইজেট বারবার আঁকে, তাই ক্লিক document-এ ধরা হয় */
  if (NATIVE && W) window.__drPinOK = true;
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("[data-pin]");
    if (!b || !W || !W.pin) return;
    W.pin().then(function (r) {
      if (r && r.ok === false) alert("এই ফোনের লঞ্চার সরাসরি বসাতে দেয় না। হোম স্ক্রিনে ফাঁকা জায়গায় চেপে ধরে ‘উইজেট’ থেকে “টাইম উইজেট” বেছে নিন।");
    }).catch(function () {});
  });

  var BD = "০১২৩৪৫৬৭৮৯";
  function bn(s) { return String(s).replace(/[0-9]/g, function (c) { return BD.charAt(+c); }); }
  var DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
  var PRESETS = [
    { k: "ruqyah", t: "রুকইয়াহ সংকলন (ফাতিহা, আয়াতুল কুরসী, বাকারার শেষ ২ আয়াত, তিন কুল)", r: [[1, 1, 7], [2, 255, 255], [2, 285, 286], [112, 1, 4], [113, 1, 5], [114, 1, 6]] },
    { k: "kursi", t: "আয়াতুল কুরসী", r: [[2, 255, 255]] },
    { k: "fatiha", t: "সূরা ফাতিহা", r: [[1, 1, 7]] },
    { k: "kul3", t: "তিন কুল (ইখলাস, ফালাক, নাস)", r: [[112, 1, 4], [113, 1, 5], [114, 1, 6]] },
    { k: "bk2", t: "সূরা বাকারার শেষ দুই আয়াত", r: [[2, 285, 286]] },
    { k: "mulk", t: "সূরা আল-মুলক", r: [[67, 1, 30]] },
    { k: "kahf", t: "সূরা আল-কাহফ", r: [[18, 1, 110]] },
    { k: "yasin", t: "সূরা ইয়াসীন", r: [[36, 1, 83]] },
    { k: "baqara", t: "সূরা আল-বাকারা (পুরো)", r: [[2, 1, 286]] },
    { k: "surah", t: "অন্য যেকোনো সূরা (নম্বর দিন)", r: null },
    { k: "file", t: "📁 ফোনের নিজের অডিও ফাইল (অফলাইনে বাজে)", r: null, file: true }
  ];

  var list = [], meta = { exact: true, notif: true, playing: false, battery: true };
  var built = false, adding = false;

  function aud() { return window.__drAud; }
  function build(preset, surahNo) {
    var A = aud();
    if (!A) throw new Error("অডিওর তথ্য পাওয়া যায়নি");
    var ranges = preset.r;
    if (!ranges) {
      var s = Math.max(1, Math.min(114, +surahNo || 1));
      ranges = [[s, 1, A.AYN[s - 1]]];
    }
    var urls = [];
    ranges.forEach(function (r) { for (var a = r[1]; a <= r[2]; a++) urls.push(A.urls(r[0], a)); });
    return urls;
  }
  function when(t) {
    var h = +t.split(":")[0], m = t.split(":")[1];
    var part = h < 4 ? "রাত" : h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকাল" : h < 20 ? "সন্ধ্যা" : "রাত";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return part + " " + bn(h12) + ":" + bn(m);
  }
  function daysText(d) {
    if (!d || !d.length || d.length === 7) return "প্রতিদিন";
    return d.slice().sort().map(function (x) { return DAYS[x]; }).join(", ");
  }

  async function reload() {
    var r = await P.list();
    list = r.alarms || [];
    meta = { exact: r.exact !== false, notif: r.notif !== false, playing: !!r.playing, battery: r.battery !== false };
  }
  async function persist() {
    var r = await P.save({ alarms: list });
    meta.exact = r.exact !== false;
    meta.notif = r.notif !== false;
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function render() {
    host.innerHTML = "";
    var hello = el("div", "dr-hello");
    hello.appendChild(el("b", null, "রুকইয়াহ অডিও অ্যালার্ম"));
    host.appendChild(hello);

    if (!NATIVE || !P) {
      host.appendChild(el("div", "al-note", "এই সুবিধা শুধু ইনস্টল করা অ্যাপে (APK) চলে। ওয়েব সংস্করণে অ্যালার্ম বাজানো যায় না।"));
      return;
    }
    if (!meta.notif) {
      var nb = el("button", "al-warn", "🔔 নোটিফিকেশনের অনুমতি দিন (অডিও চলার সময় বন্ধ করার বোতাম দেখাতে লাগে)");
      nb.type = "button";
      nb.onclick = function () { P.requestNotif(); setTimeout(function () { reload().then(render); }, 4000); };
      host.appendChild(nb);
    }
    if (!meta.exact) {
      var eb = el("button", "al-warn", "⏰ ঠিক সময়ে বাজতে “অ্যালার্ম ও রিমাইন্ডার” অনুমতি দিন");
      eb.type = "button";
      eb.onclick = function () { P.openExactSettings(); };
      host.appendChild(eb);
    }

    if (!meta.battery) {
      var bb = el("button", "al-warn", "🔋 ব্যাটারি সীমাবদ্ধতা বন্ধ করুন (অ্যাপটিকে “Don’t optimize / Unrestricted” দিন, নইলে ফোন অ্যালার্ম আটকে দিতে পারে)");
      bb.type = "button";
      bb.onclick = function () { P.openBatterySettings(); setTimeout(function () { reload().then(render); }, 5000); };
      host.appendChild(bb);
    }

    var top = el("div", "al-top");
    var add = el("button", "al-add", adding ? "✕ বাতিল" : "＋ নতুন অ্যালার্ম");
    add.type = "button";
    add.onclick = function () { adding = !adding; render(); };
    top.appendChild(add);
    if (meta.playing) {
      var st = el("button", "al-stop", "⏹ চলমান অডিও বন্ধ করুন");
      st.type = "button";
      st.onclick = function () { P.stop().then(function () { meta.playing = false; render(); }); };
      top.appendChild(st);
    }
    host.appendChild(top);

    if (adding) host.appendChild(form());

    host.appendChild(diag());
    list.slice().sort(function (a, b) { return a.time < b.time ? -1 : 1; }).forEach(function (a) { host.appendChild(card(a)); });

  }

  /* নির্ণয়: আসল অ্যালার্ম-পথে ১ মিনিটের পরীক্ষা ও লগ */
  function diag() {
    var d = el("div", "al-form");
    d.appendChild(el("div", "al-d", "অ্যালার্ম না বাজলে: নিচের বোতাম চেপে অ্যাপ বন্ধ করে ফোন লক করুন, ১ মিনিট অপেক্ষা করুন। তারপর অ্যাপ খুলে “লগ দেখুন” চাপুন।"));
    var row = el("div", "al-top");
    var t = el("button", "al-add", "⏱ ১ মিনিট পরে পরীক্ষা"); t.type = "button";
    t.onclick = function () {
      var a = list[0] || { id: 1, on: true, title: "পরীক্ষা", repeat: 1, urls: [] };
      var q = PRESETS[2];
      var test = { id: -99, on: true, title: "পরীক্ষা: সূরা ফাতিহা", repeat: 1, urls: build(q, 1) };
      P.testIn({ alarm: test, secs: 60 }).then(function () { alert("১ মিনিট পরের পরীক্ষা-অ্যালার্ম বসানো হয়েছে। এখন অ্যাপ বন্ধ করে ফোন লক করুন।"); })
        .catch(function (e) { alert("বসানো যায়নি: " + (e && e.message || "")); });
    };
    row.appendChild(t);
    var lg = el("button", "al-add", "📋 লগ দেখুন"); lg.type = "button";
    var out = el("pre", "al-d"); out.style.whiteSpace = "pre-wrap"; out.style.fontSize = "12px"; out.style.direction = "ltr";
    lg.onclick = function () {
      P.getLog().then(function (r) { out.textContent = (r.log && r.log.length) ? r.log.join("\n") : "এখনো কোনো লগ নেই — অ্যালার্ম একবারও আসেনি।"; })
        .catch(function (e) { out.textContent = "লগ পড়া যায়নি"; });
    };
    row.appendChild(lg);
    d.appendChild(row); d.appendChild(out);
    return d;
  }

  function form() {
    var f = el("div", "al-form");
    var r1 = el("div", "al-row");
    r1.appendChild(el("label", null, "সময়"));
    var tm = el("input"); tm.type = "time"; tm.value = "05:00";
    r1.appendChild(tm);
    f.appendChild(r1);

    var r2 = el("div", "al-row");
    r2.appendChild(el("label", null, "অডিও"));
    var sel = el("select");
    PRESETS.forEach(function (p, i) { var o = el("option", null, p.t); o.value = i; sel.appendChild(o); });
    r2.appendChild(sel);
    f.appendChild(r2);

    var r2b = el("div", "al-row"); r2b.hidden = true;
    r2b.appendChild(el("label", null, "সূরা নং"));
    var sn = el("input"); sn.type = "number"; sn.min = 1; sn.max = 114; sn.value = 1;
    r2b.appendChild(sn);
    f.appendChild(r2b);
    var r2c = el("div", "al-row"); r2c.hidden = true;
    var pk = el("button", "al-add", "অডিও ফাইল বাছুন"); pk.type = "button";
    var pn = el("span", null, "");
    var picked = null;
    pk.onclick = function () {
      P.pickAudio().then(function (r) { picked = r; pn.textContent = " " + r.name; })
        .catch(function (e) { if (!e || e.message !== "বাতিল") pn.textContent = " ফাইল নেওয়া যায়নি"; });
    };
    r2c.appendChild(pk); r2c.appendChild(pn);
    f.appendChild(r2c);
    sel.onchange = function () { var q = PRESETS[+sel.value]; r2b.hidden = !!q.r || !!q.file; r2c.hidden = !q.file; };

    var r3 = el("div", "al-row");
    r3.appendChild(el("label", null, "কতবার"));
    var rp = el("select");
    [1, 2, 3, 5, 7, 11].forEach(function (n) { var o = el("option", null, bn(n) + " বার"); o.value = n; rp.appendChild(o); });
    r3.appendChild(rp);
    f.appendChild(r3);

    var r4 = el("div", "al-days");
    var on = [0, 1, 2, 3, 4, 5, 6];
    DAYS.forEach(function (d, i) {
      var b = el("button", "on", d); b.type = "button";
      b.onclick = function () {
        var k = on.indexOf(i);
        if (k >= 0) { on.splice(k, 1); b.classList.remove("on"); } else { on.push(i); b.classList.add("on"); }
      };
      r4.appendChild(b);
    });
    f.appendChild(r4);

    var msg = el("div", "al-msg");
    f.appendChild(msg);
    var save = el("button", "al-save", "সংরক্ষণ করুন"); save.type = "button";
    save.onclick = async function () {
      if (!on.length) { msg.textContent = "অন্তত একটি দিন বেছে নিন।"; return; }
      var p = PRESETS[+sel.value];
      var urls;
      if (p.file) {
        if (!picked) { msg.textContent = "আগে একটি অডিও ফাইল বাছুন।"; return; }
        urls = [[picked.path]];
        p = { t: "📁 " + picked.name, r: true };
      } else
      try { urls = build(p, sn.value); } catch (e) { msg.textContent = "অডিও তৈরি করা যায়নি: " + e.message; return; }
      var title = p.r ? p.t : "সূরা নং " + bn(sn.value);
      list.push({ id: Math.floor(Date.now() / 1000) % 2000000000, time: tm.value || "05:00", days: on.length === 7 ? [] : on.slice().sort(), on: true, title: title, repeat: +rp.value, urls: urls });
      save.disabled = true;
      try { await persist(); adding = false; render(); } catch (e) { list.pop(); save.disabled = false; msg.textContent = "সংরক্ষণ হয়নি: " + (e && e.message || ""); }
    };
    f.appendChild(save);
    return f;
  }

  function card(a) {
    var c = el("div", "al-card" + (a.on ? "" : " off"));
    var l = el("div", "al-l");
    l.appendChild(el("div", "al-time", when(a.time)));
    l.appendChild(el("div", "al-t", a.title + (a.repeat > 1 ? " · " + bn(a.repeat) + " বার" : "")));
    l.appendChild(el("div", "al-d", daysText(a.days)));
    c.appendChild(l);
    var r = el("div", "al-r");
    var sw = el("label", "al-sw"); var cb = el("input"); cb.type = "checkbox"; cb.checked = !!a.on;
    cb.onchange = async function () { a.on = cb.checked; try { await persist(); } catch (e) {} render(); };
    sw.appendChild(cb); sw.appendChild(el("i"));
    r.appendChild(sw);
    var pl = el("button", "al-i", "▶"); pl.type = "button"; pl.title = "এখনই চালিয়ে দেখুন";
    pl.onclick = function () { P.testPlay({ alarm: a }).then(function () { meta.playing = true; render(); }).catch(function (e) { alert("চালানো যায়নি: " + (e && e.message || "")); }); };
    r.appendChild(pl);
    var del = el("button", "al-i", "🗑"); del.type = "button"; del.title = "মুছুন";
    del.onclick = async function () {
      if (!confirm("এই অ্যালার্মটি মুছে ফেলবেন?")) return;
      try { var u0 = a.urls && a.urls[0] && a.urls[0][0]; if (u0 && u0.indexOf("/alarm_audio/") > 0) P.removeFile({ path: u0 }); } catch (e) {}
      list = list.filter(function (x) { return x.id !== a.id; });
      try { await persist(); } catch (e) {}
      render();
    };
    r.appendChild(del);
    c.appendChild(r);
    return c;
  }

  window.DRALARM = {
    openWidget: openWidget,
    show: async function () {
      if (!host) return;
      if (NATIVE && P) { try { await reload(); } catch (e) {} }
      render();
    }
  };
})();
