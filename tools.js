/* অন্যান্য: কুরআন (বাছাই পাতা) · কিবলা কম্পাস · ডিজিটাল তাসবীহ কাউন্টার — #quran #qibla #tasbih */
(function () {
  "use strict";
  var BD = "০১২৩৪৫৬৭৮৯";
  function bn(n) { return String(n).replace(/[0-9]/g, function (d) { return BD.charAt(+d); }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function rad(x) { return x * Math.PI / 180; }
  function deg(x) { return x * 180 / Math.PI; }
  function root() { return document.getElementById("drTools"); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var stopFns = [];
  function stopAll() { while (stopFns.length) { try { stopFns.pop()(); } catch (e) { } } }

  /* ───────── কুরআন ───────── */
  function quranPage(box) {
    box.innerHTML =
      '<h2 class="tl-h">📖 কুরআন</h2>' +
      '<a class="tl-opt" href="#mushaf"><i class="ar">قرآن</i><span><b>আরবি কুরআন</b><small>১৫ লাইনের মুসহাফ</small></span><em>›</em></a>' +
      '<a class="tl-opt" href="#read/arbn"><i class="ar">عب</i><span><b>আরবি ও বাংলা অনুবাদসহ</b><small>সূরা ধরে পড়ুন</small></span><em>›</em></a>';
  }

  /* ───────── কিবলা ───────── */
  var KAABA = { lat: 21.422487, lng: 39.826206 };
  function qiblaBearing(p) {
    var f1 = rad(p.lat), f2 = rad(KAABA.lat), dl = rad(KAABA.lng - p.lng);
    var y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
    return (deg(Math.atan2(y, x)) + 360) % 360;
  }
  function distKm(p) {
    var R = 6371, dp = rad(KAABA.lat - p.lat), dl = rad(KAABA.lng - p.lng);
    var a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(rad(p.lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function nativeW() {
    var C = window.Capacitor;
    return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.TimeWidgetNative || null;
  }
  function storedLoc() {
    try { var o = JSON.parse(store("drw_loc") || "null"); if (o && isFinite(o.lat) && isFinite(o.lng)) return { lat: +o.lat, lng: +o.lng, auto: !!o.auto }; } catch (e) { }
    return { lat: 23.8103, lng: 90.4125, auto: false }; /* ঢাকা */
  }
  function getLoc(ask) {
    return new Promise(function (res) {
      var NW = nativeW();
      var fin = function (c) { if (c && isFinite(c.lat) && isFinite(c.lng)) res({ lat: +c.lat, lng: +c.lng, auto: !!(c.located || c.auto) }); else res(storedLoc()); };
      if (NW && (NW.locate || NW.config)) {
        var p = ask && NW.locate ? NW.locate({ ask: true }) : (NW.config ? NW.config() : NW.locate({ ask: false }));
        p.then(fin, function () { res(storedLoc()); });
        return;
      }
      if (!navigator.geolocation) { res(storedLoc()); return; }
      navigator.geolocation.getCurrentPosition(function (p) {
        var o = { lat: p.coords.latitude, lng: p.coords.longitude, auto: true };
        store("drw_loc", JSON.stringify(o)); res(o);
      }, function () { res(storedLoc()); }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
    });
  }

  function qiblaPage(box) {
    var T = "";
    for (var a = 0; a < 360; a += 10) {
      var big = a % 90 === 0, mid = a % 30 === 0, r1 = 118, r2 = big ? 100 : mid ? 106 : 111;
      T += '<line x1="' + (150 + r1 * Math.sin(rad(a))).toFixed(1) + '" y1="' + (150 - r1 * Math.cos(rad(a))).toFixed(1) + '" x2="' + (150 + r2 * Math.sin(rad(a))).toFixed(1) + '" y2="' + (150 - r2 * Math.cos(rad(a))).toFixed(1) + '" stroke="currentColor" stroke-width="' + (big ? 2.4 : 1.2) + '" opacity="' + (big ? 0.9 : 0.5) + '"/>';
    }
    box.innerHTML =
      '<h2 class="tl-h">🧭 কিবলা</h2>' +
      '<div class="tl-card">' +
      '<div class="tl-qinfo" id="tlQInfo">লোকেশন নেওয়া হচ্ছে…</div>' +
      '<div class="tl-comp" id="tlComp">' +
      '<svg viewBox="0 0 300 300" class="tl-svg" aria-label="কিবলা কম্পাস">' +
      '<circle cx="150" cy="150" r="140" class="tl-ring" id="tlRing"/>' +
      '<g id="tlRose" style="transform-origin:150px 150px">' + T +
      '<text x="150" y="80" text-anchor="middle" class="tl-n">উ</text>' +
      '<text x="224" y="158" text-anchor="middle" class="tl-d">পূ</text>' +
      '<text x="150" y="238" text-anchor="middle" class="tl-d">দ</text>' +
      '<text x="76" y="158" text-anchor="middle" class="tl-d">প</text>' +
      '<g id="tlK" style="transform-origin:150px 150px"><line x1="150" y1="150" x2="150" y2="44" class="tl-kl"/><text x="150" y="40" text-anchor="middle" class="tl-kaaba">🕋</text></g>' +
      '</g>' +
      '<polygon points="150,6 140,28 160,28" class="tl-ptr"/>' +
      '<circle cx="150" cy="150" r="6" class="tl-hub"/>' +
      '</svg></div>' +
      '<div class="tl-qstat" id="tlQStat">কম্পাস সেন্সর খোঁজা হচ্ছে…</div>' +
      '<div class="tl-row"><button type="button" class="tl-b" id="tlQSens">🧭 কম্পাস চালু করুন</button><button type="button" class="tl-b" id="tlQLoc">📍 লোকেশন আপডেট</button></div>' +
      '<p class="tl-note">ফোনটি সমতলে ধরুন এবং কাছে চুম্বক/ধাতব জিনিস রাখবেন না। কম্পাস ঠিকমতো না চললে ফোন ৮-এর মতো করে ঘুরিয়ে ক্যালিব্রেট করুন। উপরের ত্রিভুজ বরাবর ফোনের মাথা ধরে 🕋 চিহ্ন ঠিক ত্রিভুজের নিচে এলে সেটাই কিবলার দিক।</p>' +
      '</div>';

    var rose = box.querySelector("#tlRose"), kEl = box.querySelector("#tlK"), ring = box.querySelector("#tlRing");
    var info = box.querySelector("#tlQInfo"), stat = box.querySelector("#tlQStat");
    var loc = storedLoc(), qb = qiblaBearing(loc), heading = null, got = false, wasOk = false;

    function showInfo() {
      qb = qiblaBearing(loc);
      info.innerHTML = '<b>কিবলার দিক: ' + bn(Math.round(qb)) + '°</b> <span>(উত্তর থেকে ডানে)</span><br><small>কাবা থেকে প্রায় ' + bn(Math.round(distKm(loc)).toLocaleString("en-US")) + ' কিমি' + (loc.auto ? "" : " · সংরক্ষিত/ডিফল্ট অবস্থান (ঢাকা) — সঠিক দিকের জন্য ‘লোকেশন আপডেট’ চাপুন") + '</small>';
      kEl.style.transform = "rotate(" + qb + "deg)";
      draw();
    }
    function draw() {
      if (heading == null) {
        rose.style.transform = "rotate(0deg)";
        stat.textContent = got ? "" : "কম্পাস সেন্সর পাওয়া যায়নি — দিকটি উত্তর (উ) থেকে " + bn(Math.round(qb)) + "° ডানে।";
        ring.classList.remove("ok"); return;
      }
      rose.style.transform = "rotate(" + (-heading) + "deg)";
      var diff = ((qb - heading + 540) % 360) - 180, ok = Math.abs(diff) <= 4;
      ring.classList.toggle("ok", ok);
      stat.innerHTML = ok ? '<b class="tl-ok">✅ আপনি কিবলার দিকে আছেন</b>' : "কিবলা আপনার " + (diff > 0 ? "ডানে" : "বামে") + " " + bn(Math.round(Math.abs(diff))) + "° ঘুরে";
      if (ok && !wasOk) { try { navigator.vibrate && navigator.vibrate(40); } catch (e) { } }
      wasOk = ok;
    }
    function onOri(e) {
      var h = null;
      if (typeof e.webkitCompassHeading === "number" && isFinite(e.webkitCompassHeading)) h = e.webkitCompassHeading;
      else if ((e.absolute || e.type === "deviceorientationabsolute") && typeof e.alpha === "number") h = (360 - e.alpha) % 360;
      if (h == null) return;
      got = true;
      if (heading == null) heading = h;
      else { /* বৃত্তাকার মসৃণ করা */
        var d = ((h - heading + 540) % 360) - 180; heading = (heading + d * 0.25 + 360) % 360;
      }
      draw();
    }
    function startSensor() {
      var go = function () {
        window.addEventListener("deviceorientationabsolute", onOri, true);
        window.addEventListener("deviceorientation", onOri, true);
        stopFns.push(function () { window.removeEventListener("deviceorientationabsolute", onOri, true); window.removeEventListener("deviceorientation", onOri, true); });
        setTimeout(function () { if (!got) { stat.textContent = "কম্পাস সেন্সর থেকে কোনো তথ্য আসছে না। ‘কম্পাস চালু করুন’ চাপুন বা ফোনটি একটু নাড়ান।"; } }, 2500);
      };
      try {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission().then(function (s) { if (s === "granted") go(); else stat.textContent = "কম্পাসের অনুমতি দেওয়া হয়নি।"; }).catch(function () { stat.textContent = "কম্পাসের অনুমতি পাওয়া যায়নি।"; });
        } else go();
      } catch (e) { go(); }
    }
    box.querySelector("#tlQSens").onclick = function () { stopAll(); stopFns.length = 0; got = false; heading = null; stat.textContent = "কম্পাস সেন্সর খোঁজা হচ্ছে…"; startSensor(); };
    box.querySelector("#tlQLoc").onclick = function () {
      var b = this; b.disabled = true; b.textContent = "⏳ লোকেশন নেওয়া হচ্ছে…";
      getLoc(true).then(function (l) { loc = l; if (l.auto) store("drw_loc", JSON.stringify({ lat: l.lat, lng: l.lng, auto: true })); showInfo(); b.disabled = false; b.textContent = "📍 লোকেশন আপডেট"; });
    };
    showInfo(); startSensor();
    getLoc(false).then(function (l) { loc = l; showInfo(); });
  }

  /* ───────── ডিজিটাল তাসবীহ ───────── */
  var PRE = [
    ["সুবহানাল্লাহ", "سُبْحَانَ ٱللَّٰهِ"],
    ["আলহামদুলিল্লাহ", "ٱلْحَمْدُ لِلَّٰهِ"],
    ["আল্লাহু আকবার", "ٱللَّٰهُ أَكْبَرُ"],
    ["লা ইলাহা ইল্লাল্লাহ", "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ"],
    ["আস্তাগফিরুল্লাহ", "أَسْتَغْفِرُ ٱللَّٰهَ"],
    ["দরূদ শরীফ", "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ"],
    ["মুক্ত গণনা", ""]
  ];
  var TARGETS = [33, 99, 100, 0];
  function tasbihPage(box) {
    var S = { i: 0, c: {}, l: {}, t: 33, v: true };
    try { var o = JSON.parse(store("mpTasbih") || "null"); if (o && typeof o === "object") { S.i = +o.i || 0; S.c = o.c || {}; S.l = o.l || {}; S.t = TARGETS.indexOf(+o.t) >= 0 ? +o.t : 33; S.v = o.v !== false; } } catch (e) { }
    if (S.i < 0 || S.i >= PRE.length) S.i = 0;
    var save = function () { store("mpTasbih", JSON.stringify(S)); };
    var C = 2 * Math.PI * 112;

    box.innerHTML =
      '<h2 class="tl-h">📿 তাসবীহ</h2>' +
      '<div class="tl-card">' +
      '<div class="tl-chips" id="tlChips"></div>' +
      '<div class="tl-ar ar" id="tlAr"></div>' +
      '<button type="button" class="tl-tap" id="tlTap" aria-label="গণনা করতে চাপুন">' +
      '<svg viewBox="0 0 260 260" class="tl-tsvg"><circle cx="130" cy="130" r="112" class="tl-tbg"/><circle cx="130" cy="130" r="112" class="tl-tfg" id="tlFg" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" transform="rotate(-90 130 130)"/></svg>' +
      '<span class="tl-cnt" id="tlCnt">০</span><span class="tl-tg" id="tlTg"></span></button>' +
      '<div class="tl-meta"><span id="tlLap"></span><span id="tlTot"></span></div>' +
      '<div class="tl-tgs" id="tlTgs"></div>' +
      '<div class="tl-row"><button type="button" class="tl-b" id="tlUndo">↩ একটি কমান</button><button type="button" class="tl-b" id="tlVib"></button><button type="button" class="tl-b tl-bad" id="tlReset">🔄 রিসেট</button></div>' +
      '</div>';

    var chips = box.querySelector("#tlChips"), ar = box.querySelector("#tlAr"), cnt = box.querySelector("#tlCnt"), tg = box.querySelector("#tlTg"),
      fg = box.querySelector("#tlFg"), lap = box.querySelector("#tlLap"), tot = box.querySelector("#tlTot"), tgs = box.querySelector("#tlTgs"), vib = box.querySelector("#tlVib");

    function n() { return +S.c[S.i] || 0; }
    function render() {
      chips.innerHTML = ""; PRE.forEach(function (p, k) {
        var b = el("button", "tl-chip" + (k === S.i ? " on" : ""), p[0]); b.type = "button";
        b.onclick = function () { S.i = k; save(); render(); }; chips.appendChild(b);
      });
      ar.textContent = PRE[S.i][1]; ar.style.display = PRE[S.i][1] ? "" : "none";
      var c = n(); cnt.textContent = bn(c);
      tg.textContent = S.t ? "লক্ষ্য: " + bn(S.t) : "লক্ষ্য: অসীম";
      fg.style.strokeDashoffset = (S.t ? C * (1 - Math.min(1, c / S.t)) : C).toFixed(1);
      lap.textContent = "চক্র সম্পন্ন: " + bn(+S.l[S.i] || 0);
      var all = 0; Object.keys(S.c).forEach(function (k) { all += +S.c[k] || 0; }); tot.textContent = "মোট (সব যিকির): " + bn(all + Object.keys(S.l).reduce(function (a, k) { return a + (+S.l[k] || 0) * (S.t || 0); }, 0));
      tgs.innerHTML = ""; TARGETS.forEach(function (t) {
        var b = el("button", "tl-chip" + (t === S.t ? " on" : ""), t ? bn(t) : "∞"); b.type = "button";
        b.onclick = function () { S.t = t; save(); render(); }; tgs.appendChild(b);
      });
      vib.textContent = S.v ? "📳 কম্পন: চালু" : "📴 কম্পন: বন্ধ";
    }
    function buzz(p) { if (S.v) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } } }
    box.querySelector("#tlTap").onclick = function () {
      var c = n() + 1;
      if (S.t && c >= S.t) { S.c[S.i] = 0; S.l[S.i] = (+S.l[S.i] || 0) + 1; buzz([70, 50, 70]); cnt.textContent = bn(S.t); fg.style.strokeDashoffset = "0"; setTimeout(render, 220); }
      else { S.c[S.i] = c; buzz(18); render(); }
      save();
    };
    box.querySelector("#tlUndo").onclick = function () { var c = n(); if (c > 0) { S.c[S.i] = c - 1; save(); render(); } };
    vib.onclick = function () { S.v = !S.v; save(); render(); if (S.v) buzz(30); };
    box.querySelector("#tlReset").onclick = function () {
      if (!n() && !(+S.l[S.i])) return;
      if (confirm("“" + PRE[S.i][0] + "”-এর গণনা ও চক্র শূন্য করবেন?")) { S.c[S.i] = 0; S.l[S.i] = 0; save(); render(); }
    };
    render();
  }

  /* ───────── রাউটার ───────── */
  window.__drTool = function (name) {
    var box = root(); if (!box) return;
    stopAll();
    if (name === "quran") quranPage(box);
    else if (name === "qibla") qiblaPage(box);
    else if (name === "tasbih") tasbihPage(box);
  };
  window.addEventListener("hashchange", function () { if (!/^#(qibla)/.test(location.hash || "")) stopAll(); });
  var m = /^#(quran|qibla|tasbih)/.exec(location.hash || "");
  if (m) { var b = root(); if (b) b.hidden = false; window.__drTool(m[1]); }
})();
