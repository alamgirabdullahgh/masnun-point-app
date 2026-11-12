// ব্যবহার: node tools/merge-shards.js <book_id> <শার্ড-ফোল্ডার> [আউটপুট-ফোল্ডার=data-src/muslimbangla] [--single]
// scrape-muslimbangla.js-এর SHARD=i/N দিয়ে বানানো অংশগুলো যাচাই করে (সংখ্যা, ফাঁক, খালি লেখা, ফাইলের আকার)।
// ডিফল্টে অংশ-ফাইলগুলো (<id>-<k>.partIofN.json) যেমন আছে তেমনই আউটপুট-ফোল্ডারে রাখে —
// tools/build-hadith.js সেগুলো একই কিতাব হিসেবে জুড়ে নেয়। বড় কিতাব এক ফাইলে রাখলে GitHub-এর ১০০MB সীমা ছুঁতে পারে।
// --single দিলে জোড়া লাগিয়ে একটিই ফাইল বানায় (ছোট কিতাবের জন্য)।
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const single = process.argv.includes('--single');
const bookId = args[0];
const inDir = args[1];
const outDir = args[2] || 'data-src/muslimbangla';
if (!bookId || !inDir) {
  console.error('Usage: node tools/merge-shards.js <book_id> <shard_dir> [out_dir] [--single]');
  process.exit(1);
}

const MAX_FILE_BYTES = 90 * 1024 * 1024; // GitHub: ১০০MB-এর বেশি ফাইল পুশ হয় না
const files = fs.readdirSync(inDir)
  .filter(f => new RegExp('^' + bookId + '-.*\\.part\\d+of\\d+\\.json$').test(f))
  .sort();
if (!files.length) { console.error('No shard files found'); process.exit(1); }

const total = Number(/of(\d+)\.json$/.exec(files[0])[1]);
const parts = new Set(files.map(f => Number(/part(\d+)of/.exec(f)[1])));
for (let i = 1; i <= total; i++) {
  if (!parts.has(i)) { console.error(`Shard ${i}/${total} missing. Found: ${files.join(', ')}`); process.exit(2); }
}
if (files.length !== total) { console.error(`Expected ${total} shards, found ${files.length}: ${files.join(', ')}`); process.exit(2); }

let head = null;
const map = new Map();
let dup = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(inDir, f), 'utf8'));
  if (!head) head = d;
  if (d.id !== head.id || d.k !== head.k) { console.error(`${f}: কিতাবের id/k মেলে না`); process.exit(2); }
  console.log(f, d.hadiths.length, 'হাদীস,', (fs.statSync(path.join(inDir, f)).size / 1048576).toFixed(1) + 'MB');
  for (const h of d.hadiths) {
    if (map.has(h.site_id)) dup++;
    else map.set(h.site_id, h);
  }
}

const hadiths = Array.from(map.values())
  .sort((a, b) => (typeof a.n === 'number' && typeof b.n === 'number') ? a.n - b.n : 0);
const nums = new Set(hadiths.map(h => h.n).filter(n => typeof n === 'number'));
const maxN = nums.size ? Math.max(...nums) : 0;
const missing = [];
for (let i = 1; i <= maxN; i++) if (!nums.has(i)) missing.push(i);
const emptyBn = hadiths.filter(h => !h.bn || !h.bn.trim()).length;
const emptyAr = hadiths.filter(h => !h.ar || !h.ar.trim()).length;
const corrupt = hadiths.filter(h => /^\$[0-9a-fA-F]+$/.test(h.bn || '') || /^\$[0-9a-fA-F]+$/.test(h.ar || '')).length;

const summary =
  `মোট ${hadiths.length} | সর্বোচ্চ নং ${maxN} | অনুপস্থিত নং ${missing.length} | খালি bn ${emptyBn} | খালি ar ${emptyAr} | ভাঙা রেফারেন্স ${corrupt} | অংশের মাঝে দ্বিগুণ ${dup}`;
console.log(summary);
if (missing.length) console.log('অনুপস্থিত নং (প্রথম ৫০):', missing.slice(0, 50).join(','));
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### ${head.bn} (book ${head.id})\n\n${summary}\n\nঅংশ: ${files.join(', ')}\n`);
}
if (corrupt > 0) { console.error('ভাঙা `$ref` রেফারেন্স পাওয়া গেছে — সংরক্ষণ করা হচ্ছে না'); process.exit(3); }

fs.mkdirSync(outDir, { recursive: true });
if (single) {
  const out = Object.assign({}, head, { scraped_at: new Date().toISOString().slice(0, 10), hadiths });
  const body = JSON.stringify(out);
  if (Buffer.byteLength(body) > MAX_FILE_BYTES) { console.error('এক ফাইলের আকার ৯০MB-এর বেশি — --single ছাড়া চালান'); process.exit(4); }
  const outFile = path.join(outDir, `${head.id}-${head.k}.json`);
  fs.writeFileSync(outFile, body, 'utf8');
  console.log('Saved', outFile);
} else {
  for (const f of files) {
    const size = fs.statSync(path.join(inDir, f)).size;
    if (size > MAX_FILE_BYTES) { console.error(`${f} ৯০MB-এর বেশি — আরও বেশি ভাগে (shard) চালান`); process.exit(4); }
    fs.copyFileSync(path.join(inDir, f), path.join(outDir, f));
    console.log('Saved', path.join(outDir, f));
  }
}
