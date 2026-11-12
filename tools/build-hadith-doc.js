#!/usr/bin/env node
/* Google Doc থেকে নামানো হাদীসের লেখা (input/hadith-doc/doc.txt) → data/hadith-chunks (অ্যাপের "হাদিস" মোডের ডেটা)।
   ব্যবহার: node tools/build-hadith-doc.js [doc.txt=input/hadith-doc/doc.txt] [আউটপুট=data/hadith-chunks]
   নথির গঠন: "#শিরোনাম" লাইন, তার নিচে এক বা একাধিক হাদীস — আরবি লাইন, বাংলা লাইন, "(সূত্র)" ও লিংক লাইন।
   আউটপুট ফরম্যাট tools/build-hadith.js-এর সাথে হুবহু এক: meta.json, t/<n>.json (খণ্ড), i/<s>.json (শব্দ-সূচি)।
   প্রতিটি হাদীস: [সংকলন-ক্রম, নম্বর, আরবি, বাংলা (+সূত্র লাইন), "", শিরোনাম]। শব্দের রূপ data/hadith-norm.js থেকে। */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const N = require('../data/hadith-norm.js');

const SRC = process.argv[2] || path.join(__dirname, '..', 'input', 'hadith-doc', 'doc.txt');
const OUT = process.argv[3] || path.join(__dirname, '..', 'data', 'hadith-chunks');
const CHUNK = 20;
const COL = { k: 'ruqyah-doc', bn: 'রুকইয়ার হাদীস' };

const AR = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;
const BN = /[ঀ-৿]/g;
const clean = s => String(s || '').normalize('NFC').replace(/[­​‌‍﻿]/g, '').replace(/[  ]/g, ' ').replace(/[ \t]+/g, ' ').trim();
const count = (s, re) => (s.match(re) || []).length;
const unbalanced = s => count(s, /\(/g) > count(s, /\)/g);

const text = fs.readFileSync(SRC, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

const items = []; // { chapter, ar:[], bn:[], src:[] }
let chapter = '', cur = null, prevSrcOpen = false;
const warn = [];
for (const raw of lines) {
  if (raw[0] === '#') { chapter = clean(raw.replace(/^#+/, '')); cur = null; prevSrcOpen = false; continue; }
  const line = clean(raw);
  const ar = count(line, AR), bn = count(line, BN);
  let kind;
  if (/^https?:\/\//i.test(line)) kind = 'src';
  else if (prevSrcOpen) kind = 'src';          // আগের সূত্র-লাইনের বন্ধনী বন্ধ হয়নি: এটি তার ধারাবাহিকতা
  else if (line[0] === '(') kind = 'src';
  else kind = ar > bn ? 'ar' : 'bn';

  if (kind === 'src') {
    if (!cur) { warn.push('শিরোনামের পর সূত্র-লাইন আগে: ' + line.slice(0, 40)); continue; }
    if (line[0] === '(' && !cur.bn.length && ar > bn) cur.ar.push(line); // আরবি সূত্র-লাইন আরবির সাথেই থাকে
    else cur.src.push(line);
    prevSrcOpen = unbalanced(line) || (prevSrcOpen && !/\)/.test(line));
    continue;
  }
  prevSrcOpen = false;
  if (kind === 'ar') {
    if (!cur || cur.bn.length || cur.src.length) { cur = { chapter, ar: [], bn: [], src: [] }; items.push(cur); }
    cur.ar.push(line);
  } else {
    if (!cur) { warn.push('আরবি ছাড়া বাংলা লাইন: ' + line.slice(0, 40)); cur = { chapter, ar: [], bn: [], src: [] }; items.push(cur); }
    if (cur.src.length) warn.push('সূত্রের পর বাংলা লাইন (বাংলার সাথে জোড়া হলো): ' + line.slice(0, 40));
    cur.bn.push(line);
  }
}

/* ব্যাখ্যা: আরবি যে শব্দ দিয়ে শুরু হলে সেটি আলাদা হাদীস নয়, আগের হাদীসের ব্যাখ্যা — আগের কার্ডেই "ব্যাখ্যা" অংশে জোড়া হয় */
const EXPLAIN_START = ['فَقَوْلُهَا'];
for (let i = items.length - 1; i > 0; i--) {
  const it = items[i], prev = items[i - 1];
  if (it.chapter === prev.chapter && EXPLAIN_START.some(w => (it.ar[0] || '').startsWith(w))) {
    prev.ar.push('\n' + it.ar.join(' '));
    prev.bn.push('', 'ব্যাখ্যা:', ...it.bn);
    prev.src.push(...it.src);
    items.splice(i, 1);
  }
}

const recs = items.map((it, i) => [
  0,
  i + 1,
  it.ar.join(' ').replace(/ \n/g, '\n'),
  it.bn.join('\n') + (it.src.length ? '\n\n' + it.src.join('\n') : ''),
  '',
  it.chapter
]);

/* যাচাই: প্রতিটি হাদীসে আরবি ও বাংলা দুটোই থাকতে হবে */
let bad = 0;
recs.forEach(r => {
  if (!r[2] || !r[3].trim()) { bad++; console.error('ত্রুটি: হাদীস ' + r[1] + ' (' + r[5] + ') — আরবি বা বাংলা খালি'); }
});
warn.forEach(w => console.warn('সতর্কতা:', w));
if (!recs.length || bad) { console.error('বিল্ড বাতিল'); process.exit(1); }

const meta = { v: 1, chunk: CHUNK, shards: 256, cols: [{ k: COL.k, bn: COL.bn, start: 0, count: recs.length, hasBn: true }], total: recs.length };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 't'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'i'), { recursive: true });
const gz = o => zlib.gzipSync(Buffer.from(JSON.stringify(o)), { level: 9, mtime: 0 });

for (let i = 0; i < recs.length; i += CHUNK) fs.writeFileSync(path.join(OUT, 't', (i / CHUNK) + '.json'), gz(recs.slice(i, i + CHUNK)));

const idx = new Map();
recs.forEach((r, id) => {
  const seen = new Set(N.tokens(r[2] + ' \n ' + r[3]));
  for (const w of seen) { let l = idx.get(w); if (!l) idx.set(w, l = []); l.push(id); }
});
const sh = Array.from({ length: 256 }, () => ({}));
for (const [w, l] of idx) {
  const d = new Array(l.length);
  let p = 0;
  for (let i = 0; i < l.length; i++) { d[i] = l[i] - p; p = l[i]; }
  sh[N.shard(w)][w] = d;
}
sh.forEach((o, s) => fs.writeFileSync(path.join(OUT, 'i', s + '.json'), gz(o)));
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta));

console.log('মোট হাদীস', recs.length, '| শব্দ', idx.size);
const byCh = {};
recs.forEach(r => { byCh[r[5]] = (byCh[r[5]] || 0) + 1; });
Object.keys(byCh).forEach(k => console.log('  ' + byCh[k] + 'টি — ' + k));
if (process.env.GITHUB_STEP_SUMMARY) {
  let md = '### হাদীস ডেটা বিল্ড (Google Doc)\n\nমোট **' + recs.length + '** টি হাদীস\n\n| শিরোনাম | হাদীস |\n|---|---|\n';
  Object.keys(byCh).forEach(k => { md += '| ' + k + ' | ' + byCh[k] + ' |\n'; });
  if (warn.length) md += '\nসতর্কতা:\n' + warn.map(w => '- ' + w).join('\n') + '\n';
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
