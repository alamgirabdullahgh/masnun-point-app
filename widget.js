/* টাইম উইজেট কার্ড (Android TimeWidget-এর হুবহু ওয়েব সংস্করণ)
 * ব্যবহার: <div id="drWidget"></div> + <script src="widget.js"></script> — নিজে থেকে #drWidget-এ বসে যায়।
 * ইন্টারনেট ছাড়াই চলে; সব হিসাব ফোনেই (সূর্যের অবস্থান থেকে; ফজর/ইশা ১৮°, আসর হানাফি)।
 * ওয়াক্তের ঘরে চাপলে নিচে সেই ওয়াক্তের শুরু-শেষ; চলতি ওয়াক্তের ঘরে চাপলে নফল (আউয়াবীন/তাহাজ্জুদ) ↔ ওয়াক্ত।
 */
(function () {
  "use strict";
  var DUHA_AFTER_SUNRISE = 24;   // ইশরাক শুরু: সূর্যোদয়ের ২৪ মিনিট পর
  var ISHRAQ_END = 60;           // ইশরাক শেষ ধরা: সূর্যোদয়ের প্রায় ১ ঘণ্টা পর, তারপর সালাতুদ্দোহা
  var DUHA_BEFORE_DHUHR = 6;     // চাশত শেষ: যোহরের ৬ মিনিট আগে
  var OFF = [0, 1, 0, 3, 0];     // ফজর, যোহর, আসর, মাগরিব, ইশা — মিনিটের সমন্বয় (অ্যান্ড্রয়েড উইজেটের ডিফল্ট)
  var NAMES = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
  var NAFL = 5;

  // অ্যাপে (APK) চললে অবস্থান, মিনিটের সমন্বয়, হানাফি ও তারিখের সেটিং আসে নেটিভ উইজেটের Cfg থেকে — যাতে কার্ড আর হোম-স্ক্রিন উইজেট সবসময় হুবহু এক সময় দেখায়।
  // ব্রাউজারে/PWA-তে নিজের সেটিং (নিচের ডিফল্ট ও localStorage) চলে।
  var CAP = window.Capacitor;
  var NW = CAP && CAP.isNativePlatform && CAP.isNativePlatform() && CAP.Plugins && CAP.Plugins.TimeWidgetNative;
  var CFG = null;       // নেটিভ থেকে পাওয়া সর্বশেষ সেটিং
  var HANAFI = true;    // আসরে ছায়া দ্বিগুণ
  var HIJRI_ADJ = null; // নেটিভ থেকে এলে হিজরি তারিখের সমন্বয় (দিন)
  var BANGLA_ADJ = 0;
  var BN_DIGITS = true;

  var PLACES = [
    ["ঢাকা", 23.8103, 90.4125], ["চট্টগ্রাম", 22.3569, 91.7832], ["রাজশাহী", 24.3745, 88.6042],
    ["খুলনা", 22.8456, 89.5403], ["বরিশাল", 22.7010, 90.3535], ["সিলেট", 24.8949, 91.8687],
    ["রংপুর", 25.7439, 89.2752], ["ময়মনসিংহ", 24.7471, 90.4203], ["কুমিল্লা", 23.4607, 91.1809],
    ["নারায়ণগঞ্জ", 23.6238, 90.5000], ["গাজীপুর", 23.9999, 90.4203], ["ফরিদপুর", 23.6070, 89.8429],
    ["বগুড়া", 24.8465, 89.3773], ["যশোর", 23.1664, 89.2081], ["কক্সবাজার", 21.4272, 92.0058],
    ["নোয়াখালী", 22.8696, 91.0995], ["দিনাজপুর", 25.6279, 88.6332], ["টাঙ্গাইল", 24.2513, 89.9167],
    ["পাবনা", 24.0064, 89.2372]
  ];
  var BANGLA_MONTHS = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
  var HIJRI_MONTHS = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানিয়া", "রজব", "শা’বান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];

  // ───────── অঙ্ক ─────────
  var BD = "০১২৩৪৫৬৭৮৯";
  function bn(s) { return BN_DIGITS ? String(s).replace(/[0-9]/g, function (c) { return BD.charAt(+c); }) : String(s); }

  // ───────── তারিখ ─────────
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function dayDiff(a, b) { return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 864e5); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }

  // বাংলাদেশের সংশোধিত পঞ্জিকা: নববর্ষ ১৪ এপ্রিল
  function banglaText(d) {
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    var gy = (m > 4 || (m === 4 && day >= 14)) ? y : y - 1;
    var idx = dayDiff([gy, 4, 14], [y, m, day]);
    var falgun = isLeap(gy + 1) ? 30 : 29;
    var len = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgun, 30];
    var mi = 0;
    while (mi < 11 && idx >= len[mi]) { idx -= len[mi]; mi++; }
    return bn(idx + 1) + " " + BANGLA_MONTHS[mi] + " " + bn(gy - 593) + " বঙ্গাব্দ";
  }

  // হিজরি (উম্মুল কুরা); বাংলাদেশে ডিফল্টে −১ দিন (চাঁদ সৌদির একদিন পরে)
  function hijriText(d, inBd) {
    try {
      var x = addDays(d, HIJRI_ADJ !== null ? HIJRI_ADJ : (inBd ? -1 : 0));
      var parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(x);
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var yr = parseInt(String(o.year).replace(/\D/g, ""), 10);
      return bn(parseInt(o.day, 10)) + " " + HIJRI_MONTHS[parseInt(o.month, 10) - 1] + " " + bn(yr) + " হিজরি";
    } catch (e) { return ""; }
  }

  // ───────── নামাজের সময় (PrayTimes অ্যালগরিদম) ─────────
  function rad(d) { return d * Math.PI / 180; }
  function deg(r) { return r * 180 / Math.PI; }
  function fixA(a) { return a - 360 * Math.floor(a / 360); }
  function fixH(a) { return a - 24 * Math.floor(a / 24); }
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  }
  function sunPos(jd) {
    var d = jd - 2451545.0;
    var g = fixA(357.529 + 0.98560028 * d), q = fixA(280.459 + 0.98564736 * d);
    var l = fixA(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)));
    var e = 23.439 - 0.00000036 * d;
    var ra = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(l)), Math.cos(rad(l)))) / 15;
    return [deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(l)))), q / 15 - fixH(ra)];
  }
  // ফলাফল: ঘণ্টা (দশমিক) — fajr, sunrise, dhuhr, asr, maghrib(সূর্যাস্ত), isha
  function times(y, m, d, lat, lng, tz, hanafi) {
    var jd = julian(y, m, d) - lng / 360;
    function midDay(t) { return fixH(12 - sunPos(jd + t)[1]); }
    function angleTime(angle, t, ccw) {
      var decl = sunPos(jd + t)[0], noon = midDay(t);
      var x = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
      var h = deg(Math.acos(Math.max(-1, Math.min(1, x)))) / 15;
      return noon + (ccw ? -h : h);
    }
    function asrTime(factor, t) {
      var decl = sunPos(jd + t)[0];
      return angleTime(-deg(Math.atan(1 / (factor + Math.tan(rad(Math.abs(lat - decl)))))), t, false);
    }
    var adj = tz - lng / 15;
    return {
      fajr: angleTime(18, 5 / 24, true) + adj,
      sunrise: angleTime(0.833, 6 / 24, true) + adj,
      dhuhr: midDay(12 / 24) + adj,
      asr: asrTime(hanafi ? 2 : 1, 13 / 24) + adj,
      maghrib: angleTime(0.833, 18 / 24, false) + adj,
      isha: angleTime(18, 18 / 24, false) + adj
    };
  }
  function mins(h) { return Math.floor(h * 60 + 0.5); }
  function fmt(min) {
    var m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60) % 12;
    if (h === 0) h = 12;
    return bn(h + ":" + ("0" + (m % 60)).slice(-2));
  }
  function tzOf(d) { return -d.getTimezoneOffset() / 60; }
  function tms(d, loc) { return times(d.getFullYear(), d.getMonth() + 1, d.getDate(), loc.lat, loc.lng, tzOf(d), HANAFI); }

  // ───────── আজকের সব হিসাব ─────────
  function compute(now, loc) {
    var date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var t = tms(date, loc);
    var m = [mins(t.fajr) + OFF[0], mins(t.dhuhr) + OFF[1], mins(t.asr) + OFF[2], mins(t.maghrib) + OFF[3], mins(t.isha) + OFF[4]];
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var cur = 4, i;
    for (i = 0; i < 5; i++) if (m[i] <= nowMin) cur = i;
    var sunrise = mins(t.sunrise), sunset = mins(t.maghrib);
    var ws = m.slice(), we = [sunrise, m[2], sunset, m[4], 0], nightStart;
    if (nowMin < m[0]) {
      var y = tms(addDays(date, -1), loc);
      ws[4] = mins(y.isha) + OFF[4] - 1440;
      we[4] = m[0];
      nightStart = mins(y.maghrib) - 1440;
    } else {
      var n = tms(addDays(date, 1), loc);
      we[4] = mins(n.fajr) + OFF[0] + 1440;
      nightStart = sunset;
    }
    var tahajjud = nightStart + Math.floor((we[4] - nightStart) * 2 / 3);
    return { m: m, cur: cur, sunrise: sunrise, sunset: sunset, ws: ws, we: we, nowMin: nowMin + now.getSeconds() / 60, tahajjud: tahajjud };
  }

  // চলতি ওয়াক্তের নফল: ফজর-শেষে ইশরাক → সালাতুদ্দোহা; মাগরিবে আউয়াবীন; ইশায় তাহাজ্জুদ
  function nafl(s, cur) {
    var ishraqStart = s.sunrise + DUHA_AFTER_SUNRISE;
    var ishraqEnd = Math.min(s.sunrise + ISHRAQ_END, s.m[1] - DUHA_BEFORE_DHUHR - 1);
    var duhaEnd = Math.max(s.m[1] - DUHA_BEFORE_DHUHR, ishraqEnd + 1);
    if (cur === 0 && s.nowMin >= s.sunrise && s.nowMin < s.m[1])
      return s.nowMin < ishraqEnd ? { name: "ইশরাক", start: ishraqStart, end: ishraqEnd } : { name: "সালাতুদ্দোহা", start: ishraqEnd, end: duhaEnd };
    if (cur === 3) return { name: "আউয়াবীন", start: s.ws[3], end: s.we[3] };
    if (cur === 4) return { name: "তাহাজ্জুদ", start: s.tahajjud, end: s.we[4] };
    return null;
  }
  function naflByDefault(s) {
    if (s.cur === 0) return !!nafl(s, 0);
    if (s.cur === 4) return s.nowMin >= s.tahajjud;
    return false;
  }

  // ───────── অবস্থান ─────────
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function loadLoc() {
    try { var o = JSON.parse(store("drw_loc") || "null"); if (o && isFinite(o.lat) && isFinite(o.lng)) return o; } catch (e) { }
    return { lat: PLACES[0][1], lng: PLACES[0][2], auto: false };
  }
  function inBd(lat, lng) { return lat >= 20.5 && lat <= 26.7 && lng >= 87.9 && lng <= 92.8; }
  function placeName(loc) {
    if (CFG) return CFG.place + (CFG.auto && !CFG.located ? " 📍" : "");
    var best = -1, bd = 1e9, i;
    for (i = 0; i < PLACES.length; i++) {
      var dx = (loc.lat - PLACES[i][1]) * 111.2, dy = (loc.lng - PLACES[i][2]) * 111.2 * Math.cos(rad(loc.lat));
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bd) { bd = dist; best = i; }
    }
    if (!loc.auto) return PLACES[0][0];
    return bd <= 60 ? PLACES[best][0] : "বর্তমান অবস্থান";
  }

  // ───────── রূপ ─────────
  var CSS =
    ".drw{box-sizing:border-box;max-width:660px;margin:12px auto 0;padding:7px 14px 8px;border-radius:24px;background:#F2F5F8;color:#14212B;font-family:inherit;user-select:none;-webkit-user-select:none}" +
    ".drw *{box-sizing:border-box}" +
    ".drw-r{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
    ".drw-sun{display:flex;align-items:center;gap:5px;font-size:11px;color:#3B4A55;white-space:nowrap}" +
    ".drw-sun svg{width:20px;height:20px;flex:none}" +
    ".drw-time{display:flex;align-items:flex-end;gap:4px;margin-top:1px}" +
    ".drw-time b{font-size:40px;line-height:1;font-weight:800;letter-spacing:-.5px;font-variant-numeric:lining-nums}" +
    ".drw-time span{font-size:12px;color:#3B4A55;padding-bottom:6px}" +
    ".drw-en{text-align:right;line-height:1.25}" +
    ".drw-en b{display:block;font-size:15px;font-weight:800}" +
    ".drw-lr{display:flex;align-items:center;justify-content:flex-end;gap:6px}" +
    ".drw-upd{font-size:10px;line-height:1.1;text-align:center;color:#3B4A55;background:none;border:0;padding:0;margin-left:2px;cursor:pointer;font-family:inherit}" +
    ".drw-loc{font-size:12px;color:#3B4A55;cursor:pointer;background:none;border:0;padding:0;font-family:inherit}" +
    ".drw-d{margin-top:2px;font-size:12px;color:#3B4A55;white-space:nowrap}" +
    ".drw-p{display:flex;margin:5px -4px 0}" +
    ".drw-c{flex:1;text-align:center;padding:5px 0 4px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".drw-c.on{background:#d0d6e5}" +
    ".drw-c i{display:block;font-style:normal;font-size:11px;color:#3B4A55}" +
    ".drw-c b{display:block;font-size:14px;font-weight:800;margin-top:1px}" +
    ".drw-b{display:flex;align-items:center;gap:8px;margin-top:3px;font-size:11px;color:#3B4A55}" +
    ".drw-b span{white-space:nowrap}" +
    ".drw-bar{flex:1;height:4px;border-radius:2px;background:#C9D3DA;overflow:hidden}" +
    ".drw-bar u{display:block;height:100%;background:#21418b;border-radius:2px;text-decoration:none}" +
    "@media (prefers-color-scheme:dark){.drw{background:#161921;color:#e8eaf0}.drw-sun,.drw-time span,.drw-loc,.drw-upd,.drw-d,.drw-c i,.drw-b{color:#b4bac8}.drw-c.on{background:#202c49}.drw-bar{background:#2b313f}}";

  var SUNRISE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2v2.6M5 5.6l1.8 1.8M19 5.6l-1.8 1.8M2.4 11.5H5M19 11.5h2.6" stroke="#FFB300" stroke-width="1.7" stroke-linecap="round" fill="none"/><circle cx="12" cy="13" r="5.5" fill="#FFC21A"/><path d="M2 15.5q2.5-2.2 5 0t5 0t5 0t5 0V22H2z" fill="#1E88E5"/><path d="M2 15.5q2.5-2.2 5 0t5 0t5 0t5 0" stroke="#8FD0FF" stroke-width="1" fill="none"/><path d="M9 18.3h6M10.5 20.5h3" stroke="#FFD97A" stroke-width="1.3" stroke-linecap="round"/></svg>';
  var SUNSET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2v2.6M5 5.6l1.8 1.8M19 5.6l-1.8 1.8M2.4 11.5H5M19 11.5h2.6" stroke="#FF7043" stroke-width="1.7" stroke-linecap="round" fill="none"/><circle cx="12" cy="13" r="5.5" fill="#FF6D3A"/><path d="M2 15.5q2.5-2.2 5 0t5 0t5 0t5 0V22H2z" fill="#1E88E5"/><path d="M2 15.5q2.5-2.2 5 0t5 0t5 0t5 0" stroke="#8FD0FF" stroke-width="1" fill="none"/><path d="M9 18.3h6M10.5 20.5h3" stroke="#FFB59A" stroke-width="1.3" stroke-linecap="round"/></svg>';

  function mount(el) {
    if (!el || el.getAttribute("data-drw")) return;
    el.setAttribute("data-drw", "1");
    if (!document.getElementById("drwCss")) {
      var st = document.createElement("style"); st.id = "drwCss"; st.textContent = CSS; document.head.appendChild(st);
    }
    var loc = loadLoc();
    var pick = -1, pickCur = -1;

    // নেটিভ সেটিং টেনে এনে কার্ডে বসায়; বদলে থাকলে true
    function applyCfg(c) {
      if (!c || !isFinite(c.lat) || !isFinite(c.lng)) return false;
      var before = JSON.stringify([CFG, loc]);
      CFG = c;
      if (c.off && c.off.length === 5) for (var k = 0; k < 5; k++) OFF[k] = +c.off[k] || 0;
      HANAFI = !!c.hanafi;
      HIJRI_ADJ = isFinite(c.hijriShift) ? +c.hijriShift : null;
      BANGLA_ADJ = isFinite(c.banglaAdj) ? +c.banglaAdj : 0;
      BN_DIGITS = c.bnDigits !== false;
      loc = { lat: +c.lat, lng: +c.lng, auto: !!c.located };
      return before !== JSON.stringify([CFG, loc]);
    }
    function pullCfg() {
      if (!NW) return Promise.resolve(false);
      return NW.config().then(applyCfg, function () { return false; });
    }

    function shownIndex(s) {
      var ok = (pick >= 0 && pick <= 4) || (pick === NAFL && nafl(s, s.cur));
      if (ok && pickCur === s.cur) return pick;
      return naflByDefault(s) ? NAFL : s.cur;
    }
    function render() {
      var now = new Date(), s = compute(now, loc);
      var hh = now.getHours() % 12 || 12, mm = ("0" + now.getMinutes()).slice(-2);
      var en = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      var shown = shownIndex(s), nf = shown === NAFL ? nafl(s, s.cur) : null;
      var idx = Math.max(0, Math.min(4, shown));
      var bs = nf ? nf.start : s.ws[idx], be = nf ? nf.end : s.we[idx];
      var frac = Math.max(0, Math.min(1, (s.nowMin - bs) / Math.max(1, be - bs)));
      var cells = "";
      for (var i = 0; i < 5; i++)
        cells += '<div class="drw-c' + (i === s.cur ? " on" : "") + '" data-i="' + i + '"><i>' + NAMES[i] + "</i><b>" + fmt(s.m[i]) + "</b></div>";
      el.innerHTML =
        '<div class="drw"><div class="drw-r"><span class="drw-sun">' + SUNRISE + "সূর্যোদয় " + fmt(s.sunrise) + '</span><span class="drw-sun">' + SUNSET + "সূর্যাস্ত " + fmt(s.sunset) + "</span></div>" +
        '<div class="drw-r"><div class="drw-time"><b>' + hh + ":" + mm + "</b><span>" + (now.getHours() < 12 ? "AM" : "PM") + "</span></div>" +
        '<div class="drw-en"><b>' + en + '</b><div class="drw-lr"><button class="drw-loc" type="button" data-loc="1">' + placeName(loc) + '</button><button class="drw-upd" type="button" data-upd="1">' + (updBusy ? "হচ্ছে…" : "আপডেট<br>লোকেশন") + "</button></div></div></div>" +
        '<div class="drw-r drw-d"><span>' + hijriText(now, inBd(loc.lat, loc.lng)) + "</span><span>" + banglaText(addDays(now, BANGLA_ADJ)) + "</span></div>" +
        '<div class="drw-p">' + cells + "</div>" +
        '<div class="drw-b"><span>' + (nf ? nf.name + " শুরু " : "ওয়াক্ত শুরু ") + fmt(bs) + '</span><div class="drw-bar"><u style="width:' + (frac * 100).toFixed(1) + '%"></u></div><span>' + (nf ? "শেষ " : "ওয়াক্ত শেষ ") + fmt(be) + "</span></div></div>";
    }
    var updBusy = false;
    // "আপডেট লোকেশন": চাপলে এখনই নতুন অবস্থান নেয় (নেট লাগে); পাওয়া গেলে কার্ড নিজে বদলে যায়
    function updateLoc() {
      if (updBusy) return;
      updBusy = true; render();
      locate(true);
      [3000, 8000, 15000].forEach(function (ms, n) {
        setTimeout(function () {
          pullCfg().then(function (ch) {
            if (ch) render();
            if (n === 2) { updBusy = false; render(); }
          });
          if (!NW && n === 2) { updBusy = false; render(); }
        }, ms);
      });
    }
    el.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t.closest && t.closest("[data-upd]")) { updateLoc(); return; }
      var c = t.closest ? t.closest("[data-i]") : null;
      if (!c) {
        // কার্ডের যেকোনো জায়গায় চাপলে (ওয়াক্তের ঘর বাদে) নেটিভ অ্যাপে টাইম উইজেটের সেটিংস খোলে
        if (NW && NW.openSettings) { NW.openSettings().catch(function () {}); return; }
        if (t.closest && t.closest("[data-loc]")) locate(true);
        return;
      }
      var i = +c.getAttribute("data-i"), s = compute(new Date(), loc), shown = shownIndex(s);
      var target = (i === s.cur && nafl(s, s.cur)) ? (shown === NAFL ? s.cur : NAFL) : i;
      pick = target === shown ? -1 : target; pickCur = s.cur;
      render();
    });
    // স্বয়ংক্রিয় অবস্থান: খোলার সময়, সামনে ফিরলে ও প্রতি ১০ মিনিটে ফোনের অবস্থান নেয়; ১ কিমির বেশি সরলে শহর ও নামাজের সময় নিজে বদলে যায়
    var locBusy = false;
    var asked = false;
    function locate(userTap) {
      if (NW) {
        // অ্যাপে: নেটিভ উইজেটের অবস্থান-ব্যবস্থাই একমাত্র উৎস (ওয়েবের আলাদা অবস্থান নয়); অনুমতি না থাকলে খোলার সময় একবার, আর নামে চাপলে আবার চায়
        var ask = userTap === true || !asked;
        asked = true;
        NW.locate({ ask: ask }).then(function (c) { if (applyCfg(c)) render(); }, function () { });
        return;
      }
      if (!navigator.geolocation || locBusy) return;
      locBusy = true;
      navigator.geolocation.getCurrentPosition(function (p) {
        locBusy = false;
        var la = p.coords.latitude, ln = p.coords.longitude;
        var dx = (la - loc.lat) * 111.2, dy = (ln - loc.lng) * 111.2 * Math.cos(rad(la));
        var moved = Math.sqrt(dx * dx + dy * dy);
        if (!loc.auto || loc.ip || moved > 1) {
          loc = { lat: la, lng: ln, auto: true };
          store("drw_loc", JSON.stringify(loc));
          render();
        }
      }, function () { locBusy = false; ipLocate(); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 });
    }
    // ফোনের লোকেশন না পেলে (অনুমতি নেই/বন্ধ) এবং নেট থাকলে আইপি থেকে মোটামুটি শহর ধরে (শুধু ফলব্যাক; অফলাইনে কিছু করে না)
    function ipLocate() {
      if (loc.auto && !loc.ip) return;
      if (navigator.onLine === false || !window.fetch) return;
      var ac = window.AbortController ? new AbortController() : null;
      var to = setTimeout(function () { if (ac) ac.abort(); }, 8000);
      fetch("https://ipwho.is/?fields=success,latitude,longitude", ac ? { signal: ac.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
        clearTimeout(to);
        if (!j || !j.success || !isFinite(j.latitude) || !isFinite(j.longitude)) return;
        var dx = (j.latitude - loc.lat) * 111.2, dy = (j.longitude - loc.lng) * 111.2 * Math.cos(rad(j.latitude));
        if (loc.ip && Math.sqrt(dx * dx + dy * dy) <= 5) return;
        loc = { lat: j.latitude, lng: j.longitude, auto: true, ip: true };
        store("drw_loc", JSON.stringify(loc));
        render();
      }).catch(function () { clearTimeout(to); });
    }
    render();
    pullCfg().then(function (ch) { if (ch) render(); locate(); });
    if (!NW) locate();
    setInterval(function () { pullCfg().then(function () { render(); }); }, 30000);
    setInterval(locate, 10 * 60 * 1000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { pullCfg().then(function () { render(); }); locate(); } });
  }

  window.DRWidget = { mount: mount, _compute: compute, _nafl: nafl, _times: times, _fmt: fmt, _banglaText: banglaText };
  // অ্যাপে: হোম-স্ক্রিনের নেটিভ উইজেটটাই এই জায়গায় বসে (আলাদা ওয়েব-কার্ড নয়), তাই দুটো হুবহু এক
  function nativeCard(el) {
    el.setAttribute("data-drw", "1");
    el.style.minHeight = "130px";
    el.style.paddingTop = "12px";
    var last = "", h = 0, failed = 0;
    function send(force) {
      var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      var pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
      var full = r.width - pl - pr, w = Math.min(full, 660), x = r.left + pl + (full - w) / 2, y = r.top + 12;
      var top = null;
      try { top = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, r.left + r.width / 2)), Math.max(0, Math.min(innerHeight - 1, r.top + 6))); } catch (e) { }
      var shown = r.width > 0 && r.bottom > 0 && r.top < innerHeight && !document.hidden && !!top && (top === el || el.contains(top));
      var key = [shown, Math.round(x), Math.round(y), Math.round(w)].join();
      if (key === last && !force) return;
      last = key;
      NW.card({ visible: shown, x: x, y: y, w: w }).then(function (o) {
        failed = 0;
        if (o && o.h && Math.abs(o.h + 12 - h) > 1) { h = o.h + 12; el.style.minHeight = h + "px"; el.style.height = h + "px"; }
      }, function () { if (++failed > 3) { clearInterval(iv); NW.card({ visible: false, x: 0, y: 0, w: 300 }).catch(function () { }); el.removeAttribute("data-drw"); el.style.cssText = "padding:0 12px"; mount(el); } });
    }
    var iv = setInterval(function () { send(false); }, 250);
    window.addEventListener("scroll", function () { send(false); }, true);
    window.addEventListener("resize", function () { send(true); });
    window.addEventListener("hashchange", function () { setTimeout(function () { send(true); }, 50); });
    document.addEventListener("visibilitychange", function () { send(true); });
    send(true);
    // অবস্থান: খোলার সময় একবার (অনুমতি চায়), এরপর সামনে ফিরলে ও প্রতি ১০ মিনিটে
    function loc(ask) { NW.locate({ ask: ask }).catch(function () { }); }
    loc(true);
    setInterval(function () { loc(false); }, 10 * 60 * 1000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) loc(false); });
  }
  function auto() {
    var el = document.getElementById("drWidget");
    if (NW && NW.card) nativeCard(el); else mount(el);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
