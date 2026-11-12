#!/usr/bin/env node
/* হাদিস ডেটা বানায় (রিসার্চ পেজের "হাদিস" মোডের জন্য)।
   উৎস: fawazahmed0/hadith-api (editions/ara-*.json ও ben-*.json; The Unlicense — https://github.com/fawazahmed0/hadith-api)।
   ব্যবহার: node tools/build-hadith.js <editions-ফোল্ডার> [আউটপুট-ফোল্ডার=hadith-chunks]
   আউটপুট:
     meta.json            সংকলনের তালিকা ও আইডি-পরিসর
     t/<n>.json        n-তম খণ্ড: CHUNK টি হাদিসের লেখা — [সংকলন, নম্বর, আরবি, বাংলা, মান, কিতাব]
     i/<s>.json        শব্দ-সূচি (২৫৬ ভাগ): { শব্দ: [আইডি (ডেল্টা)…] }
   শব্দের রূপ hadith-norm.js থেকে — সেটি বদলালে সব নতুন করে বানাতে হবে। */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const N = require('../data/hadith-norm.js');

const SRC = process.argv[2];
const OUT = process.argv[3] || path.join(__dirname, '..', 'data', 'hadith-chunks');
if (!SRC) { console.error('ব্যবহার: node tools/build-hadith.js <editions>'); process.exit(1); }

const CHUNK = 20;
const COLS = [
  { k: 'bukhari', bn: 'সহীহ বুখারী' },
  { k: 'muslim', bn: 'সহীহ মুসলিম' },
  { k: 'abudawud', bn: 'সুনান আবূ দাউদ' },
  { k: 'tirmidhi', bn: 'জামে’ আত-তিরমিযী' },
  { k: 'nasai', bn: 'সুনান আন-নাসাঈ' },
  { k: 'ibnmajah', bn: 'সুনান ইবনু মাজাহ' },
  { k: 'malik', bn: 'মুয়াত্তা মালিক' },
  { k: 'nawawi', bn: 'আরবাঈন নাবাবী (৪০ হাদীস)' },
  { k: 'qudsi', bn: 'হাদীসে কুদসী (৪০ হাদীস)' }
];

/* মানের (গ্রেড) বাংলা: শব্দ ধরে ধরে */
const GW = {
  Sahih: 'সহীহ', Daif: 'যঈফ', Hasan: 'হাসান', Isnaad: 'সনদ', Sanad: 'সনদ', Very: 'অত্যন্ত', Mauquf: 'মাওকূফ', Muquf: 'মাওকূফ', Maqtu: 'মাকতূ’',
  Munkar: 'মুনকার', Shadh: 'শায', Mawdu: 'মাওযূ’ (জাল)', Lighairihi: 'লিগাইরিহী', Agreed: 'মুত্তাফাকুন', Upon: 'আলাইহি', Bukhari: 'বুখারী',
  Muslim: 'মুসলিম', And: 'ও', Hadith: 'হাদীস', Mutawatir: 'মুতাওয়াতির', Mursal: 'মুরসাল', Gharib: 'গরীব'
};
const GN = { 'Al-Albani': 'আলবানী', 'Zubair Ali Zai': 'যুবায়ের আলী যাঈ' };
function gradeText(gs) {
  if (!gs || !gs.length) return '';
  const pick = gs.filter(g => GN[g.name] && g.grade && g.grade !== '-');
  const use = pick.length ? pick : gs.filter(g => g.grade && g.grade !== '-').slice(0, 1);
  return use.map(g => {
    const w = g.grade.replace(/\s*-\s*/g, ' ').split(/\s+/).map(x => GW[x] || x).join(' ');
    return (GN[g.name] || g.name) + ': ' + w.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  }).join(' · ');
}

const clean = s => String(s || '').normalize('NFC').replace(/[­​]/g, '').replace(/^[\s।]+/, '').replace(/\s+/g, ' ').trim();
const numOf = n => (Number.isInteger(n) ? n : String(n));

const recs = [];
const meta = { v: 1, chunk: CHUNK, shards: 256, cols: [] };
for (const c of COLS) {
  const A = JSON.parse(fs.readFileSync(path.join(SRC, 'ara-' + c.k + '.json'), 'utf8')).hadiths;
  let B = [];
  const bf = path.join(SRC, 'ben-' + c.k + '.json');
  if (fs.existsSync(bf)) B = JSON.parse(fs.readFileSync(bf, 'utf8')).hadiths;
  const bmap = new Map(B.map(h => [h.hadithnumber, h]));
  const start = recs.length;
  for (const a of A) {
    const b = bmap.get(a.hadithnumber);
    const ar = clean(a.text), bn = clean(b && b.text);
    if (!ar && !bn) continue;
    recs.push([meta.cols.length, numOf(a.hadithnumber), ar, bn, gradeText((a.grades && a.grades.length) ? a.grades : (b && b.grades)), (a.reference && a.reference.book) || 0]);
  }
  meta.cols.push({ k: c.k, bn: c.bn, start, count: recs.length - start, hasBn: B.length > 0 });
  console.log(c.k, 'আরবি', A.length, 'বাংলা', B.length, 'রাখা হলো', recs.length - start);
}

/* data-src/muslimbangla/*.json ফাইল থেকে নতুন কিতাব যুক্ত করার পাইপলাইন */
const mbDir = path.join(__dirname, '..', 'data-src', 'muslimbangla');
if (fs.existsSync(mbDir)) {
  const mbFiles = fs.readdirSync(mbDir).filter(f => f.endsWith('.json'));
  const mbBooks = [];
  const partGroups = new Map(); // id -> { total, parts: Map(i -> content) } — <id>-<k>.partIofN.json ফাইলগুলো এক কিতাব
  for (const f of mbFiles) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(mbDir, f), 'utf8'));
      if (!(content && content.id && Array.isArray(content.hadiths))) continue;
      const pm = /\.part(\d+)of(\d+)\.json$/.exec(f);
      if (pm) {
        let g = partGroups.get(content.id);
        if (!g) partGroups.set(content.id, g = { total: Number(pm[2]), parts: new Map() });
        g.parts.set(Number(pm[1]), content);
      } else {
        mbBooks.push(content);
      }
    } catch (e) {
      console.warn('ত্রুটি: ' + f + ' ফাইল পড়া যায়নি:', e.message);
    }
  }
  /* ভাগ-করা কিতাব: সব অংশ থাকতে হবে; site_id ধরে দ্বিগুণ বাদ দিয়ে হাদীস-নম্বর ক্রমে সাজানো */
  for (const [id, g] of partGroups) {
    for (let i = 1; i <= g.total; i++) {
      if (!g.parts.has(i)) { console.error('ত্রুটি: কিতাব ' + id + '-এর অংশ ' + i + '/' + g.total + ' পাওয়া যায়নি'); process.exit(2); }
    }
    if (mbBooks.some(b => b.id === id)) { console.error('ত্রুটি: কিতাব ' + id + ' একই সাথে পূর্ণ ফাইল ও অংশ-ফাইল আকারে আছে'); process.exit(2); }
    const first = g.parts.get(1);
    const seen = new Map();
    for (let i = 1; i <= g.total; i++) for (const h of g.parts.get(i).hadiths) if (!seen.has(h.site_id)) seen.set(h.site_id, h);
    const merged = Array.from(seen.values())
      .sort((a, b) => (typeof a.n === 'number' && typeof b.n === 'number') ? a.n - b.n : 0);
    mbBooks.push(Object.assign({}, first, { hadiths: merged }));
  }
  /* আগে থেকে অ্যাপে থাকা কিতাবগুলো (৮, ১২, ১৬, ১৭) আগের ক্রমেই থাকে, নতুনগুলো শেষে — যাতে পুরনো হাদীসের আইডি না বদলায় */
  const KEEP_FIRST = [8, 12, 16, 17];
  const ord = b => { const i = KEEP_FIRST.indexOf(Number(b.id)); return i >= 0 ? i : 100 + Number(b.id); };
  mbBooks.sort((a, b) => ord(a) - ord(b));

  for (const book of mbBooks) {
    const start = recs.length;
    let emptyBnCount = 0;
    for (const h of book.hadiths || []) {
      const ar = clean(h.ar);
      const bn = clean(h.bn);
      if (!bn) emptyBnCount++;
      recs.push([
        meta.cols.length,
        numOf(h.n),
        ar,
        bn,
        "",
        clean(h.chapter || "")
      ]);
    }
    meta.cols.push({
      k: book.k,
      bn: book.bn,
      start,
      count: recs.length - start,
      hasBn: true,
      src: "মুসলিম বাংলা"
    });
    console.log(book.k + ' (ID: ' + book.id + ')', 'রাখা হলো', recs.length - start, emptyBnCount ? '(খালি বাংলা: ' + emptyBnCount + ')' : '');
  }
}

/* ───── রুকইয়া-সংক্রান্ত ছাঁকনি ─────
   অ্যাপের নাম "ডেইলি রুকিয়া", তাই শুধু রুকইয়া / সূরা-আয়াতের ফযীলত / সকাল-সন্ধ্যার যিকির /
   রোগ ও আত্মরক্ষার দোয়া সংক্রান্ত হাদীস রাখা হয় (নিয়ম: tools/ruqyah-filter.js)।
   বন্ধ করতে: RUQYAH_FILTER=0 node tools/build-hadith.js …    ক্যাটাগরি বাছতে: RUQYAH_CATS=ruqyah,eye,surah,adhkar,illness,ta3awwudh,tibb,mental,quran,durood,jinn */
if (process.env.RUQYAH_FILTER !== '0') {
  const RF = require('./ruqyah-filter.js');
  const RX = require('./ruqyah-filter-ext.js'); // চিকিৎসা, মানসিক, সব সূরার ফযীলত, দরূদ, জিন-শয়তান-তাবিজ-কুলক্ষণ
  const want = process.env.RUQYAH_CATS ? new Set(process.env.RUQYAH_CATS.split(',')) : null;
  const before = recs.length, perCat = {};
  const kept = recs.filter(r => {
    const t = RF.classify(r[2], r[3]).concat(RX.classifyExt(r[2], r[3])).filter(x => !want || want.has(x));
    t.forEach(x => { perCat[x] = (perCat[x] || 0) + 1; });
    return t.length > 0;
  });
  recs.length = 0;
  kept.forEach(r => recs.push(r));
  let pos = 0;
  meta.cols.forEach((c, i) => {
    c.start = pos;
    c.count = recs.filter(r => r[0] === i).length;
    pos += c.count;
  });
  meta.filter = 'ruqyah';
  console.log('ছাঁকনির পর: ' + recs.length + ' / ' + before + ' (' + (recs.length / before * 100).toFixed(1) + '%)', JSON.stringify(perCat));
  meta.cols.forEach(c => console.log('  ' + c.k + ': ' + c.count));
}

meta.total = recs.length;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 't'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'i'), { recursive: true });
const gz = o => zlib.gzipSync(Buffer.from(JSON.stringify(o)), { level: 9, mtime: 0 });

let tb = 0, tn = 0;
for (let i = 0; i < recs.length; i += CHUNK) {
  const b = gz(recs.slice(i, i + CHUNK));
  fs.writeFileSync(path.join(OUT, 't', (i / CHUNK) + '.json'), b);
  tb += b.length; tn++;
}

/* শব্দ-সূচি */
const idx = new Map();
recs.forEach((r, id) => {
  const seen = new Set(N.tokens(r[2] + ' \n ' + r[3]));
  for (const w of seen) {
    let l = idx.get(w);
    if (!l) idx.set(w, l = []);
    l.push(id);
  }
});
const sh = Array.from({ length: 256 }, () => ({}));
for (const [w, l] of idx) {
  const d = new Array(l.length);
  let p = 0;
  for (let i = 0; i < l.length; i++) { d[i] = l[i] - p; p = l[i]; }
  sh[N.shard(w)][w] = d;
}
let ib = 0, imax = 0;
sh.forEach((o, s) => {
  const b = gz(o);
  fs.writeFileSync(path.join(OUT, 'i', s + '.json'), b);
  ib += b.length; imax = Math.max(imax, b.length);
});
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta));
console.log('মোট হাদীস', recs.length, '| খণ্ড', tn, (tb / 1048576).toFixed(1) + 'MB | শব্দ', idx.size, '| সূচি', (ib / 1048576).toFixed(1) + 'MB (বড়টি ' + (imax / 1024).toFixed(0) + 'KB)');
