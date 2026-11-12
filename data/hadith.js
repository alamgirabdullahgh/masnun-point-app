/* Daily Ruqyah — হাদিস সার্চ। আয়াত-সার্চের ওপরে তিনটি অপশন বসায়: শুধু কুরআন / হাদিস / কুরআন ও হাদিস।
   ডেটা: data/hadith-chunks/ (বুখারী, মুসলিম, আবূ দাউদ, তিরমিযী, নাসাঈ, ইবনু মাজাহ, মালিক, নাবাবী ৪০, কুদসী ৪০, শামাঈল, আদাবুল মুফরাদ, রিয়াযুস সালিহীন — শুধু রুকইয়া/সুরক্ষা/সকাল-সন্ধ্যা/রোগের দোয়া সংক্রান্ত হাদীস, tools/ruqyah-filter.js দিয়ে ছাঁটা)।
   শব্দের রূপ: data/hadith-norm.js (ডেটা বানানোর সময়ের সাথে হুবহু এক থাকতে হবে)।
   নোট: ডেটা-ফাইলের নাম .json হলেও ভেতরে gzip থাকে (Android বিল্ড .gz নামের ফাইল নিজে খুলে এক্সটেনশন কেটে দেয়, তাই .gz নাম চলে না);
   getJson() প্রথম বাইট দেখে gzip/সাধারণ দুটোই পড়ে। কুরআনের কোডে হাত না দিয়ে ক্যাপচার-লিসেনারে যুক্ত হয়। */
(function () {
  "use strict";
  var DV = "10";
  var D = new URL("data/hadith-chunks/", document.baseURI).href;
  var PAGE = 10;
  /* বানানের ভিন্নতা: একটি লিখলে সবকটি খোঁজা হবে (সাধারণীকৃত রূপে) */
  var SYN = [
    ["নিয়ত", "নিয়্যত", "নিয়াত", "নিয়্যাত", "نيه", "نيته", "نيات", "بالنيه", "بالنيات", "بنيته"],
    ["সদকা", "সাদাকা", "সদাকা", "সাদকা", "সদকাহ", "صدقه"],
    ["তাওবা", "তওবা", "তাওবাহ", "তওবাহ", "توبه"],
    ["দুআ", "দোয়া", "দোআ", "দুয়া", "دعاء", "دعا"],
    ["কুরআন", "কোরআন", "কুরান", "কোরান", "قران"],
    ["রাসূল", "রাসুল", "রসূল", "রসুল", "رسول"],
    ["মুমিন", "মোমিন", "মুমীন", "مومن"],
    ["নজর", "নযর"]
  ];
  /* বদনজর: বুখারী-মুসলিমের বাংলায় লেখা "বদ-নযর" (দুই শব্দ, ভিন্ন বানান) আর আরবি "العين حق" — সবই একসাথে খোঁজা হয় */
  var EYEKEY = { "বদনজ": 1, "বদনয": 1, "বদনজর": 1, "বদনযর": 1 };
  var EYEALT = [["বদনজ"], ["বদনয"], ["বদনজর"], ["বদনযর"], ["বদ", "নজর"], ["বদ", "নযর"], ["عين", "حق"]];
  var EYEWORDS = ["বদনজ", "বদনয", "বদনজর", "বদনযর", "বদ", "নজর", "নযর", "عين"];
  var SYNMAP = {};
  SYN.forEach(function (g) { g.forEach(function (w) { SYNMAP[w] = g; }); });
  var $ = function (i) { return document.getElementById(i); };
  try { window.caches && caches.keys().then(function (ks) { ks.forEach(function (k) { if (/^hd-/.test(k) && k !== "hd-" + DV) caches.delete(k); }); }); } catch (e) {}
  if (window.__hdLoaded) return;
  window.__hdLoaded = 1;
  var SHORT = [];
  var ALIAS = [
    ["বুখারী", "বুখারি", "bukhari", "بخاري", "বোখারী"],
    ["মুসলিম", "muslim", "مسلم"],
    ["আবূদাউদ", "আবুদাউদ", "abudawud", "abudawood", "ابوداود", "আবুদাঊদ"],
    ["তিরমিযী", "তিরমিজি", "তিরমিযি", "tirmidhi", "tirmizi", "ترمذي"],
    ["নাসাঈ", "নাসায়ী", "নাসাই", "nasai", "nasa'i", "نسائي"],
    ["ইবনুমাজাহ", "ইবনেমাজাহ", "ইবনমাজাহ", "ibnmajah", "ابنماجه"],
    ["মালিক", "মুয়াত্তা", "মোয়াত্তা", "malik", "موطأ"],
    ["নাবাবী", "নববী", "নাওয়াবী", "নওয়াবী", "nawawi", "نووي"],
    ["কুদসী", "কুদসি", "qudsi", "قدسي"],
    ["শামাঈল", "শামায়েল", "শামাইল", "shamail", "شمائل"],
    ["আদাবুলমুফরাদ", "আদাব", "আদবুলমুফরাদ", "adab", "الادبالمفرد"],
    ["রিয়াযুসসালিহীন", "রিয়াদুসসালেহীন", "রিয়াজুসসালেহীন", "riyad", "رياضالصالحين"],
    ["মুসনাদেআহমদ", "মুসনাদেআহমাদ", "আহমদ", "আহমাদ", "মুসনাদআহমদ", "ahmad", "مسندأحمد"]
  ];


  var MODES = [["q", "শুধু কুরআন"], ["h", "হাদিস"], ["b", "কুরআন ও হাদিস"]];

  function build(N) {
    var box = $("rsBox"), q = $("rsQ");
    var META = null, memo = {}, st = null, gen = 0;
    var mode = "q";
    var QPH = q.placeholder || "সার্চ করুন";

    /* ───── অপশন-সারি, হাদিসের পাত্র, লাফ-বোতাম ───── */
    var bar = document.createElement("div");
    bar.className = "hd-scope"; bar.setAttribute("role", "radiogroup"); bar.setAttribute("aria-label", "কোথায় খুঁজবেন");
    MODES.forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("data-m", m[0]); b.textContent = m[1];
      bar.appendChild(b);
    });
    box.insertBefore(bar, box.querySelector(".rs-bar"));

    var jump = document.createElement("button");
    jump.type = "button"; jump.className = "hd-jump"; jump.id = "hdJump"; jump.hidden = true;
    box.insertBefore(jump, $("rsInfo"));

    var hb = document.createElement("div");
    hb.id = "hdBox";
    hb.innerHTML = '<div class="hd-sec">📜 হাদিস</div><div class="hd-books" id="hdBooks"></div><div class="hd-chips" id="hdChips"></div><div class="hd-info" id="hdInfo"></div><div id="hdOut"></div><button type="button" class="hd-more" id="hdMore" style="display:none"></button>';
    var anchor = $("rsOut");
    anchor.parentNode.insertBefore(hb, anchor.nextSibling);
    var booksEl = $("hdBooks"), chipsEl = $("hdChips"), infoEl = $("hdInfo"), outEl = $("hdOut"), moreEl = $("hdMore");

    var quranIds = ["rsTp", "rsRs", "rsInfo", "rsOut"];

    function syncJump() {
      if (mode !== "b" || !st || st.browse !== undefined || !st.all || !st.all.length) { jump.hidden = true; return; }
      jump.hidden = false;
      jump.textContent = "📜 হাদিসে " + bnum(st.all.length) + "টি পাওয়া গেছে — দেখুন ↓";
    }
    function clearAll() {
      gen++; st = null;
      outEl.innerHTML = ""; chipsEl.innerHTML = ""; infoEl.innerHTML = ""; moreEl.style.display = "none";
      syncJump();
      drawBooks();
    }
    /* কিতাবের তালিকা: নামে চাপলে ওই কিতাবের সব হাদীস (স্ক্রল করে) */
    function drawBooks() {
      booksEl.innerHTML = "";
      if (mode === "q") return;
      var my = gen;
      ensureMeta().then(function (m) {
        if (my !== gen || st || mode === "q") return;
        var dd = document.createElement("button");
        dd.type = "button"; dd.className = "hd-dd";
        dd.innerHTML = "<span>📚 কিতাবসমূহ</span><i>▾</i>";
        dd.setAttribute("aria-haspopup", "dialog");
        dd.onclick = function () { openMenu(m); };
        booksEl.appendChild(dd);
      }).catch(function () {});
    }
    /* কিতাবসমূহ: পুরো পর্দার মেনু, দুই কলামে কিতাবের নাম */
    function openMenu(m) {
      var ov = document.createElement("div");
      ov.className = "hd-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "কিতাবসমূহ");
      var hd = document.createElement("div");
      hd.className = "hd-ovh";
      hd.innerHTML = "<b>📚 কিতাবসমূহ</b>";
      var x = document.createElement("button");
      x.type = "button"; x.className = "hd-ovx"; x.textContent = "✕"; x.setAttribute("aria-label", "বন্ধ করুন");
      hd.appendChild(x); ov.appendChild(hd);
      var g = document.createElement("div");
      g.className = "hd-ovg";
      function close() { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; if (ov.parentNode) ov.parentNode.removeChild(ov); }
      function onKey(e) { if (e.key === "Escape") close(); }
      m.cols.forEach(function (c, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "hd-ovb";
        b.innerHTML = "<span></span><small></small>";
        b.firstChild.textContent = c.bn;
        b.lastChild.textContent = bnum(c.count) + "টি হাদীস";
        b.onclick = function () { close(); openBook(i); };
        g.appendChild(b);
      });
      ov.appendChild(g);
      x.onclick = close;
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      document.body.appendChild(ov);
    }
    function openBook(i) {
      var c = META.cols[i], ids = [];
      for (var x = c.start; x < c.start + c.count; x++) ids.push(x);
      gen++;
      st = { all: ids, ids: ids, toks: [], set: new Set(), page: 0, col: -1, counts: null, raw: "", browse: i };
      outEl.innerHTML = ""; chipsEl.innerHTML = ""; moreEl.style.display = "none";
      booksEl.innerHTML = "";
      var back = document.createElement("button");
      back.type = "button"; back.className = "hd-bk hd-back"; back.textContent = "← কিতাবের তালিকা";
      back.onclick = function () { clearAll(); hb.scrollIntoView({ block: "start" }); };
      booksEl.appendChild(back);
      var h = document.createElement("div");
      h.className = "hd-bt"; h.textContent = c.bn + " — মোট " + bnum(c.count) + "টি হাদীস";
      booksEl.appendChild(h);
      syncJump();
      hb.scrollIntoView({ block: "start" });
      show();
    }
    jump.onclick = function () { hb.scrollIntoView({ behavior: "smooth", block: "start" }); };

    function setPh() { q.placeholder = QPH; }
    function setMode(m, run) {
      var prev = mode;
      mode = m;
      Array.prototype.forEach.call(bar.children, function (b) {
        var on = b.getAttribute("data-m") === m;
        b.classList.toggle("on", on); b.setAttribute("aria-checked", on ? "true" : "false");
      });
      quranIds.forEach(function (id) { var e = $(id); if (e) e.style.display = m === "h" ? "none" : ""; });
      hb.classList.toggle("on", m !== "q");
      hb.classList.toggle("b", m === "b");
      setPh();
      if (prev !== m) {
        if (m === "q") { gen++; jump.hidden = true; }
        else if (m === "h") { if (q.value.trim()) search(); else intro(); ensureMeta().catch(function () {}); }
        else { if (q.value.trim()) search(); else clearAll(); ensureMeta().catch(function () {}); }
      }
      try { localStorage.setItem("drScope", m); } catch (e) {}
    }
    bar.onclick = function (e) {
      var b = e.target.closest("button");
      if (b && b.getAttribute("data-m") !== mode) setMode(b.getAttribute("data-m"));
    };

    /* ───── ডেটা আনা (ক্যাশসহ) ───── */
    async function getJson(path) {
      var url = D + path + "?v=" + DV;
      var c = null, r = null;
      try { c = window.caches && await caches.open("hd-" + DV); r = c && await c.match(url); } catch (e) { c = null; }
      if (!r) {
        r = await fetch(url);
        if (!r.ok) throw new Error(r.status);
        try { c && await c.put(url, r.clone()); } catch (e) {}
      }
      var buf = new Uint8Array(await r.arrayBuffer());
      if (buf[0] === 0x1f && buf[1] === 0x8b) {
        if (typeof DecompressionStream === "undefined") throw new Error("এই ব্রাউজারে হাদিস সার্চ চলবে না — Chrome আপডেট করুন");
        var ds = new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip")));
        return JSON.parse(await ds.text());
      }
      return JSON.parse(new TextDecoder().decode(buf));
    }
    var active = 0, waitQ = [];
    function lim(fn) {
      return new Promise(function (ok, no) {
        var run = function () { active++; fn().then(ok, no).then(function () { active--; var n = waitQ.shift(); if (n) n(); }); };
        if (active < 5) run(); else waitQ.push(run);
      });
    }
    function load(path) {
      if (memo[path]) return memo[path];
      var p = lim(async function () {
        for (var i = 0; ; i++) {
          try { return await getJson(path); } catch (e) { if (i >= 2) throw e; await new Promise(function (z) { setTimeout(z, 400 * (i + 1)); }); }
        }
      });
      memo[path] = p;
      p.catch(function () { delete memo[path]; });
      return p;
    }
    function ensureMeta() {
      if (META) return Promise.resolve(META);
      return load("meta.json").then(function (m) { META = m; META.cols.forEach(function (c, i) { if (!SHORT[i]) SHORT[i] = c.bn; }); return m; });
    }
    /* muslimbangla থেকে আসা লেখায় কাঁচা <br> থাকে — নতুন লাইনে বদলে নিই (খণ্ড প্রথমবার লোডের সময় একবারই) */
    function fixTx(s) { return typeof s === "string" ? s.replace(/<br\s*\/?>/gi, "\n").replace(/[ \t]*\n[ \t]*/g, "\n").replace(/\n{3,}/g, "\n\n").trim() : s; }
    function chunkOf(id) {
      return load("t/" + Math.floor(id / META.chunk) + ".json").then(function (c) {
        if (!c.fx) { for (var i = 0; i < c.length; i++) { c[i][2] = fixTx(c[i][2]); c[i][3] = fixTx(c[i][3]); } c.fx = 1; }
        return c;
      });
    }
    async function recOf(id) { var c = await chunkOf(id); return c[id % META.chunk]; }
    /* শুধু "বদনজর সত্য" জাতীয় হাদিস (চিকিৎসা/ঝাড়ফুঁকের কোনো নির্দেশ নেই) — সার্চ থেকে বাদ */
    var HIDE = {1295:1,1350:1,3450:1,4117:1,6079:1,6080:1,6958:1,8178:1,8180:1,8183:1,10657:1,10690:1};
    async function postings(w) {
      var sh = await load("i/" + N.shard(w) + ".json");
      var d = sh[w];
      if (!d) return [];
      var out = [], p = 0;
      for (var i = 0; i < d.length; i++) { p += d[i]; if (!HIDE[p]) out.push(p); }
      return out;
    }

    async function postingsSyn(w) {
      if (EYEKEY[w]) {
        var alts = await Promise.all(EYEALT.map(async function (alt) {
          var ls = await Promise.all(alt.map(postings));
          return ls.reduce(function (a, b) { return intersect(a, b); });
        }));
        var u = [].concat.apply([], alts).sort(function (a, b) { return a - b; });
        return u.filter(function (x, i) { return !i || x !== u[i - 1]; });
      }
      var g = SYNMAP[w];
      if (!g) return postings(w);
      var all = await Promise.all(g.map(postings));
      var m = [].concat.apply([], all).sort(function (a, b) { return a - b; });
      return m.filter(function (x, i) { return !i || x !== m[i - 1]; });
    }

    /* ───── ছোট সহায়ক ───── */
    function bkLabel(v) { return /^\d+$/.test(String(v)) ? "কিতাব " + bnum(v) : String(v); }
    function bnum(n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯".charAt(d); }); }
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function norm(s) { return String(s).toLowerCase().replace(/[\s‌‍.'’‘\-]/g, ""); }
    async function copyTxt(x) {
      try { await navigator.clipboard.writeText(x); return true; } catch (e) {
        try { var t = document.createElement("textarea"); t.value = x; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select(); var ok = document.execCommand("copy"); t.remove(); return ok; } catch (e2) { return false; }
      }
    }
    var HL = new RegExp(N.AR_TOKEN.source + "|" + N.BN_TOKEN.source, "g");
    function mark(text, set) {
      text = text.normalize("NFC");
      if (!set || !set.size) return esc(text);
      var out = "", last = 0;
      text.replace(HL, function (m, off) {
        out += esc(text.slice(last, off));
        var w = m.charCodeAt(0) < 0x0900 ? N.arWord(m) : N.bnWord(m);
        out += set.has(w) ? "<mark>" + esc(m) + "</mark>" : esc(m);
        last = off + m.length;
        return m;
      });
      return out + esc(text.slice(last));
    }
    function colOf(id) {
      for (var i = META.cols.length - 1; i >= 0; i--) if (id >= META.cols[i].start) return i;
      return 0;
    }

    /* ───── কার্ড ───── */
    function card(r, set) {
      var col = META.cols[r[0]];
      var el = document.createElement("div");
      el.className = "hd-card";
      var h = '<div class="hd-hd"><b>' + esc(col.bn) + "</b><span>হাদীস নং " + bnum(r[1]) + "</span>" + (r[5] ? "<span>· " + esc(bkLabel(r[5])) + "</span>" : "") + (r[4] ? '<span class="hd-gr">' + esc(r[4]) + "</span>" : "") + "</div>";
      if (r[2]) h += '<div class="hd-ar">' + mark(r[2], set) + "</div>";
      if (r[3]) {
        if (col.lang === "en") h += '<div style="font-size:11px;color:#777;margin-top:4px">ইংরেজি অনুবাদ</div><div class="hd-bn" dir="ltr" lang="en" style="font-family:system-ui,sans-serif">' + mark(r[3], set) + "</div>";
        else h += '<div class="hd-bn">' + mark(r[3], set) + "</div>";
      } else if (col.hasBn === false) h += '<div class="hd-no">(এই সংকলনের বাংলা অনুবাদ ডেটায় নেই)</div>';
      else h += '<div class="hd-no">(এই হাদীসের বাংলা অনুবাদ ডেটায় নেই)</div>';
      if (col.src) h += '<div class="hd-src">সূত্র: ' + esc(col.src) + "</div>";
      el.innerHTML = h;
      var tg = null; // হাদীস সবসময় পুরোটা দেখানো হয় (ছোট/বড় করার বোতাম নেই)
      var cp = document.createElement("button");
      cp.type = "button"; cp.className = "hd-ex hd-tg"; cp.textContent = "📋 কপি";
      cp.onclick = async function () {
        cp.disabled = true;
        var tr = r[3] || "";
        if (col.lang === "en" && tr) tr = "ইংরেজি অনুবাদ\n" + tr;
        var t = col.bn + " — হাদীস নং " + r[1] + (r[5] ? " (" + bkLabel(r[5]) + ")" : "") + "\n" + (r[2] || "") + "\n" + tr + (r[4] ? "\n[" + r[4] + "]" : "") + (col.src ? "\nসূত্র: " + col.src : "");
        var ok = await copyTxt(t);
        cp.textContent = ok ? "✅ কপি হয়েছে" : "কপি করা যায়নি";
        setTimeout(function () { cp.textContent = "📋 কপি"; cp.disabled = false; }, 1500);
      };
      var row = document.createElement("div");
      if (tg) row.appendChild(tg);
      row.appendChild(cp);
      el.appendChild(row);
      return el;
    }

    /* ───── সার্চ ───── */
    function chipsDraw() {
      chipsEl.innerHTML = "";
      if (!st || !st.counts) return;
      var tot = st.counts.reduce(function (a, b) { return a + b; }, 0);
      function chip(label, n, val) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = label + " (" + bnum(n) + ")";
        b.className = st.col === val ? "on" : "";
        b.disabled = !n && st.col !== val;
        b.onclick = function () { if (st.col !== val) { st.col = val; apply(); } };
        chipsEl.appendChild(b);
      }
      chip("সব", tot, -1);
      st.counts.forEach(function (n, i) { chip(SHORT[i] || META.cols[i].bn, n, i); });
    }
    function inCol(ids, c) {
      if (c < 0) return ids;
      var a = META.cols[c].start, b = a + META.cols[c].count;
      return ids.filter(function (x) { return x >= a && x < b; });
    }
    function countsOf(ids) {
      var cs = META.cols.map(function () { return 0; });
      for (var i = 0; i < ids.length; i++) cs[colOf(ids[i])]++;
      return cs;
    }
    function intersect(a, b) {
      var o = [], i = 0, j = 0;
      while (i < a.length && j < b.length) { if (a[i] === b[j]) { o.push(a[i]); i++; j++; } else if (a[i] < b[j]) i++; else j++; }
      return o;
    }

    function intro() {
      if (mode === "b") { clearAll(); return; }
      outEl.innerHTML = "";
      chipsEl.innerHTML = "";
      moreEl.style.display = "none";
      infoEl.innerHTML = "";
      drawBooks();
    }

    function message(t) { infoEl.textContent = t; syncJump(); }

    async function byNumber(raw) {
      var s = raw.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).trim();
      var m = s.match(/^(.*?)[\s:#]*(?:হাদীস|হাদিস|নং|নম্বর|no\.?)?[\s:#]*(\d{1,5})$/i) || s.match(/^(\d{1,5})[\s:#]*(.+)$/);
      if (!m) return null;
      var name = isNaN(m[1]) ? m[1] : m[2], num = isNaN(m[1]) ? +m[2] : +m[1];
      name = norm(name.replace(/(?:হাদীস|হাদিস|নং|নম্বর|no)\.?$/i, ""));
      if (!name) return null;
      var ci = -1;
      ALIAS.forEach(function (al, i) { al.forEach(function (a) { if (ci < 0 && name === norm(a)) ci = i; }); });
      if (ci < 0) return null;
      return { ci: ci, num: num };
    }
    /* নম্বর দিয়ে খোঁজা: ডেটা ছাঁটা (নম্বরে ফাঁক) থাকায় বাইনারি সার্চ */
    async function findNum(ci, num) {
      var col = META.cols[ci], lo = col.start, hi = col.start + col.count - 1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        var rec = await recOf(mid);
        if (!rec) return -1;
        var v = +rec[1];
        if (v === num) return mid;
        if (isNaN(v)) { lo = mid + 1; continue; }
        if (v < num) lo = mid + 1; else hi = mid - 1;
      }
      return -1;
    }

    async function search() {
      var raw = q.value.trim();
      var my = ++gen;
      moreEl.style.display = "none";
      if (!raw) { st = null; return intro(); }
      outEl.innerHTML = ""; chipsEl.innerHTML = ""; booksEl.innerHTML = "";
      message("⏳ খোঁজা হচ্ছে… (প্রথমবার একটু সময় লাগতে পারে)");
      try {
        await ensureMeta();
        var nm = await byNumber(raw);
        if (nm) {
          var id = await findNum(nm.ci, nm.num);
          if (my !== gen) return;
          if (id < 0) return message((SHORT[nm.ci] || META.cols[nm.ci].bn) + "-এ " + bnum(nm.num) + " নম্বর হাদীস পাওয়া যায়নি।");
          st = { ids: [id], all: [id], toks: [], set: new Set(), page: 0, col: -1, counts: null, raw: raw };
          infoEl.textContent = "";
          return show();
        }
        var toks = Array.from(new Set(N.tokens(raw)));
        if (!toks.length) return message("বাংলা বা আরবি অক্ষরে শব্দ লিখুন (ইংরেজি অক্ষরে সার্চ চলে না)। সংকলনের নাম ও নম্বর দিয়েও খোঁজা যায়, যেমন: বুখারী ১");
        var lists = await Promise.all(toks.map(postingsSyn));
        if (my !== gen) return;
        var order = lists.map(function (l, i) { return i; }).sort(function (a, b) { return lists[a].length - lists[b].length; });
        var ids = lists[order[0]];
        for (var i = 1; i < order.length && ids.length; i++) ids = intersect(ids, lists[order[i]]);
        var note = "";
        if (!ids.length && toks.length > 1) {
          /* সব শব্দ একসাথে নেই — যেগুলোয় বেশি শব্দ মেলে সেগুলো আগে */
          var cnt = new Map();
          lists.forEach(function (l) { l.forEach(function (x) { cnt.set(x, (cnt.get(x) || 0) + 1); }); });
          ids = Array.from(cnt.keys()).sort(function (a, b) { return cnt.get(b) - cnt.get(a) || a - b; });
          if (ids.length) note = "সব শব্দ একসাথে কোনো হাদীসে নেই; যেসব হাদীসে বেশি শব্দ মেলে সেগুলো আগে দেখানো হচ্ছে।";
        }
        if (!ids.length) {
          var miss = toks.filter(function (w, i) { return !lists[i].length; });
          return message("কিছু পাওয়া যায়নি" + (miss.length ? " (“" + miss.join("”, “") + "” শব্দটি কোনো হাদীসে নেই)" : "") + "। অন্য বানানে বা অন্য শব্দে চেষ্টা করুন।");
        }
        var hl = new Set(toks); toks.forEach(function (w) { (SYNMAP[w] || []).forEach(function (v) { hl.add(v); }); if (EYEKEY[w]) EYEWORDS.forEach(function (v) { hl.add(v); }); });
        st = { all: ids, ids: ids, toks: toks, set: hl, page: 0, col: -1, counts: countsOf(ids), raw: raw, note: note, ranked: !!note };
        apply();
      } catch (e) {
        if (my === gen) message("⚠ হাদীসের ডেটা আনা যায়নি: " + (e && e.message ? e.message : "ইন্টারনেট দেখুন") + "।");
      }
    }

    function apply() {
      st.ids = st.ranked ? (st.col < 0 ? st.all : inCol(st.all, st.col)) : inCol(st.all, st.col);
      st.page = 0;
      outEl.innerHTML = "";
      show();
    }

    async function show() {
      var my = gen;
      chipsDraw();
      syncJump();
      var from = st.page * PAGE, part = st.ids.slice(from, from + PAGE);
      var total = st.ids.length;
      infoEl.textContent = st.browse !== undefined ? "" : (st.note ? st.note + " " : "") + (st.toks.length ? bnum(total) + "টি হাদীস পাওয়া গেছে" : "");
      moreEl.style.display = "none";
      try {
        var recs = await Promise.all(part.map(recOf));
        if (my !== gen) return;
        recs.forEach(function (r) { if (r) outEl.appendChild(card(r, st.set)); });
        st.page++;
        var left = total - st.page * PAGE;
        if (left > 0) { moreEl.textContent = "আরও দেখুন (বাকি " + bnum(left) + "টি)"; moreEl.style.display = "block"; }
      } catch (e) {
        if (my === gen) message("⚠ হাদীসের ডেটা আনা যায়নি: " + (e && e.message ? e.message : "ইন্টারনেট দেখুন") + "।");
      }
    }
    moreEl.onclick = function () { if (st) show(); };
    /* নিচে স্ক্রল করলে নিজে থেকেই পরের হাদীসগুলো আসে */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && st && moreEl.style.display !== "none" && !moreEl.disabled) { moreEl.disabled = true; show().then(function () { moreEl.disabled = false; }, function () { moreEl.disabled = false; }); }
      }, { rootMargin: "400px" }).observe(moreEl);
    }

    
    /* ───── কুরআনের সার্চ-বোতামগুলোর সাথে জোড়া ───── */
    document.addEventListener("click", function (e) {
      if (mode === "q") return;
      var t = e.target; if (!t.closest) return;
      if (t.closest("#rsGo")) {
        if (mode === "h") { e.stopImmediatePropagation(); e.preventDefault(); q.blur(); }
        search();
      } else if (t.closest("#rsX")) {
        if (mode === "h") { e.stopImmediatePropagation(); e.preventDefault(); q.value = ""; clearAll(); intro(); q.focus(); }
        else clearAll();
      } else if (mode === "b" && t.closest("#rsTp")) {
        clearAll();
      }
    }, true);
    /* কুরআনের তালিকা (রুট/শব্দ/বিষয়) থেকে কিছু বাছলে প্রশ্ন বদলে যায় — হাদিসও সেই অনুযায়ী মিলিয়ে নেওয়া */
    document.addEventListener("click", function (e) {
      if (mode !== "b" || !e.target.closest || !e.target.closest("#rsRs .rs-ri")) return;
      if (q.value.trim()) search(); else clearAll();
    });
    document.addEventListener("keydown", function (e) {
      if (mode === "q" || e.target !== q || e.key !== "Enter") return;
      if (mode === "h") { e.stopImmediatePropagation(); e.preventDefault(); q.blur(); }
      search();
    }, true);
    q.addEventListener("input", function () { setPh(); });
    var padEl = $("rsPad");
    if (padEl) padEl.addEventListener("click", function (e) {
      if (mode !== "h" || !e.target.closest || !e.target.closest("button")) return;
      setTimeout(function () { if (q.value.trim()) search(); else intro(); }, 0);
    });
    /* সাইডবারের "বিষয়ভিত্তিক আয়াত" কুরআনের নিজস্ব — তাই সেখানে গেলে শুধু কুরআনে ফেরা */
    addEventListener("hashchange", function () { if (/^#topics/.test(location.hash) && mode === "h") setMode("q"); });

    var saved = "q";
    try { saved = localStorage.getItem("drScope") || "q"; } catch (e) {}
    if (!/^(q|h|b)$/.test(saved) || /^#topics/.test(location.hash)) saved = "q";
    setMode("q");
    if (saved !== "q") setMode(saved);
  }

  function start() {
    if (!$("rsBox") || !$("rsQ") || !window.HDNORM) return;
    build(window.HDNORM);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
