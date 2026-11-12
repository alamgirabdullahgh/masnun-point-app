const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const BOOK_MAP = {
  8: { k: 'shamail', bn: 'শামাঈলে তিরমিযী' },
  12: { k: 'adab', bn: 'আল-আদাবুল মুফরাদ' },
  9: { k: 'tahawi', bn: 'ত্বহাবী শরীফ' },
  10: { k: 'abuhanifa', bn: 'মুসনাদে আবু হানীফা' },
  11: { k: 'muwattamuhammad', bn: 'মুওয়াত্তা ইমাম মুহাম্মাদ' },
  13: { k: 'mishkat', bn: 'মিশকাতুল মাসাবীহ' },
  14: { k: 'fiqhussunan', bn: 'ফিকহুস সুনান' },
  15: { k: 'akhlaq', bn: 'আখলাকুন্নবী (ﷺ)' },
  16: { k: 'riyad', bn: 'রিয়াযুস সালিহীন' },
  17: { k: 'ahmad', bn: 'মুসনাদে আহমদ' }
};

// Approximate hadith counts per book, used as a completeness guard
const EXPECTED_COUNT = { 8: 415, 12: 1330, 16: 1041 };

const bookIdArg = process.argv[2];
if (!bookIdArg) {
  console.error('Usage: node tools/scrape-muslimbangla.js <book_id> [output_dir=data-src/muslimbangla]');
  process.exit(1);
}

const bookId = parseInt(bookIdArg, 10);
if (!BOOK_MAP[bookId]) {
  console.error(`Unknown book_id: ${bookIdArg}. Supported IDs: ${Object.keys(BOOK_MAP).join(', ')}`);
  process.exit(1);
}

const outDir = process.argv[3] || 'data-src/muslimbangla';
const cacheDir = path.join(os.tmpdir(), 'muslimbangla-cache', String(bookId));

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

let lastFetchTime = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkRobotsTxt() {
  try {
    const robotsUrl = 'https://muslimbangla.com/robots.txt';
    const robotsContent = await fetchUrl(robotsUrl, false);
    console.log('Checked robots.txt successfully. Content preview:');
    console.log(robotsContent.slice(0, 150).replace(/\n/g, ' '));
  } catch (err) {
    console.warn(`Warning: Could not fetch robots.txt: ${err.message}`);
  }
}

async function fetchUrl(url, enforceRateLimit = true) {
  if (enforceRateLimit) {
    const now = Date.now();
    const elapsed = now - lastFetchTime;
    if (elapsed < 2000) {
      await sleep(2000 - elapsed);
    }
  }

  let attempt = 0;
  const maxAttempts = 8;
  let backoffMs = 5000;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      if (enforceRateLimit) lastFetchTime = Date.now();
      const html = await new Promise((resolve, reject) => {
        const req = https.get(
          url,
          {
            headers: {
              'User-Agent': 'DailyRuqyahResearch/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          },
          (res) => {
            if (res.statusCode >= 400) {
              return reject(new Error(`HTTP status ${res.statusCode}`));
            }
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
          }
        );
        req.setTimeout(60000, () => req.destroy(new Error('timeout 60s')));
        req.on('error', reject);
      });
      return html;
    } catch (err) {
      console.warn(`Fetch error for ${url} (Attempt ${attempt}/${maxAttempts}): ${err.message}`);
      if (attempt >= maxAttempts) throw err;
      console.log(`Waiting ${backoffMs / 1000}s before retrying...`);
      await sleep(backoffMs);
      backoffMs = Math.min(backoffMs * 2, 120000);
    }
  }
}

async function fetchUrlCached(url, cacheKey) {
  const cacheFile = path.join(cacheDir, cacheKey);
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf8');
  }
  console.log(`Fetching: ${url}`);
  const html = await fetchUrl(url);
  fs.writeFileSync(cacheFile, html, 'utf8');
  return html;
}

function unescapeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)));
}

function extractFlightMap(fullPayload) {
  const flightMap = new Map();
  const regex = /([0-9a-fA-F]+):T[0-9a-fA-F]+,([\s\S]*?)(?=(?:[0-9a-fA-F]+:(?:T[0-9a-fA-F]+,|I|\[|\{|\"|\$))|$)/g;
  let match;
  while ((match = regex.exec(fullPayload)) !== null) {
    flightMap.set(match[1], match[2]);
  }
  return flightMap;
}

const parseFailures = { count: 0, samples: [] };

// Find the end of the JSON object starting at `start`, ignoring braces inside string literals.
function findObjectEnd(str, start) {
  let depth = 0;
  let inStr = false;
  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

function parseChapterPage(html) {
  const scriptRegex = /self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g;
  let match;
  let fullPayload = '';
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const arr = JSON.parse(match[1]);
      if (typeof arr[1] === 'string') {
        fullPayload += arr[1];
      }
    } catch (e) {}
  }

  const unescaped = fullPayload; // already JSON-decoded once via JSON.parse(arr[1]); keep \" inside strings intact
  const flightMap = extractFlightMap(unescaped);

  let totalPages = 1;
  const pageMatch = unescaped.match(/"totalPages":(\d+)/);
  if (pageMatch) {
    totalPages = parseInt(pageMatch[1], 10);
  }

  const hadithList = [];
  const seenIds = new Set();
  let pos = 0;
  while ((pos = unescaped.indexOf('"hadith_number":', pos)) !== -1) {
    // Walk back over candidate object starts until one whose full object really holds this hadith_number
    let cand = pos;
    let parsed = null;
    for (let tries = 0; tries < 6 && parsed === null; tries++) {
      const objStart = unescaped.lastIndexOf('{"id":', cand);
      if (objStart === -1) break;
      const objEnd = findObjectEnd(unescaped, objStart);
      if (objEnd !== -1 && objEnd > pos) {
        let jsonStr = unescaped.substring(objStart, objEnd);
        // Replace Next.js Flight deferred string references like "$65" with actual text from flightMap
        jsonStr = jsonStr.replace(/"\$([0-9a-fA-F]+)"/g, (m, refId) => {
          if (flightMap.has(refId)) {
            return JSON.stringify(flightMap.get(refId));
          }
          return m;
        });
        try {
          const obj = JSON.parse(jsonStr);
          if (obj.id && obj.hadith_number !== undefined) parsed = obj;
        } catch (e) {
          parseFailures.count++;
          if (parseFailures.samples.length < 5) parseFailures.samples.push(e.message);
        }
      }
      cand = objStart - 1;
      if (cand < 0) break;
    }
    if (parsed && !seenIds.has(parsed.id)) {
      seenIds.add(parsed.id);
      hadithList.push(parsed);
    }
    pos += 15;
  }
  return { hadithList, totalPages };
}

function extractCombinedFlightPayload(html) {
  const scriptRegex = /self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g;
  let match;
  let fullPayload = '';
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const arr = JSON.parse(match[1]);
      if (typeof arr[1] === 'string') {
        fullPayload += arr[1];
      }
    } catch (e) {}
  }
  return fullPayload;
}

async function main() {
  const bookInfo = BOOK_MAP[bookId];
  console.log(`Starting scraper for Book ${bookId} (${bookInfo.bn})...`);

  // Respect mandatory robots.txt check
  await checkRobotsTxt();

  const chaptersUrl = `https://muslimbangla.com/hadith-book/${bookId}/chapters`;
  const reg = new RegExp(`\\/hadith-book\\/${bookId}\\/chapter\\/(\\d+)`, 'g');
  const chapterIds = new Set();
  let cp = 1;
  let chapterPages = 1;
  while (cp <= chapterPages) {
    const url = cp > 1 ? `${chaptersUrl}?page=${cp}` : chaptersUrl;
    const chaptersHtml = await fetchUrlCached(url, cp > 1 ? `chapters_page_${cp}.html` : 'chapters.html');
    const payload = extractCombinedFlightPayload(chaptersHtml);
    const tpm = payload.match(/"totalPages":(\d+)/);
    if (tpm) chapterPages = Math.max(chapterPages, parseInt(tpm[1], 10));
    const before = chapterIds.size;
    let m;
    reg.lastIndex = 0;
    while ((m = reg.exec(payload)) !== null) chapterIds.add(m[1]);
    if (cp > 1 && chapterIds.size === before) break; // no new chapters -> stop
    cp++;
  }

  let sortedChapters = Array.from(chapterIds);
  console.log(`Found ${sortedChapters.length} chapter(s) for book ${bookId}.`);
  // Optional sharding: SHARD="i/N" (1-based). Each shard takes every N-th chapter; shards are merged by tools/merge-shards.js
  const shardMatch = /^(\d+)\/(\d+)$/.exec(process.env.SHARD || '');
  let shard = null;
  if (shardMatch) {
    shard = { i: parseInt(shardMatch[1], 10), n: parseInt(shardMatch[2], 10) };
    sortedChapters = sortedChapters.filter((_, idx) => idx % shard.n === shard.i - 1);
    console.log(`Shard ${shard.i}/${shard.n}: handling ${sortedChapters.length} chapter(s).`);
  }

  const hadithMap = new Map();

  for (const chapId of sortedChapters) {
    let p = 1;
    let totalPages = 1;
    while (p <= totalPages) {
      const cacheKey = `chapter_${chapId}_page_${p}.html`;
      const url = `https://muslimbangla.com/hadith-book/${bookId}/chapter/${chapId}${p > 1 ? '?page=' + p : ''}`;
      const pageHtml = await fetchUrlCached(url, cacheKey);
      const { hadithList, totalPages: tp } = parseChapterPage(pageHtml);
      totalPages = tp;

      for (const h of hadithList) {
        if (!hadithMap.has(h.id)) {
          const hadithNum = typeof h.hadith_number === 'number' ? h.hadith_number : parseInt(h.hadith_number, 10);
          hadithMap.set(h.id, {
            n: isNaN(hadithNum) ? h.hadith_number : hadithNum,
            ar: h.description_ar || '',
            bn: h.description || '',
            chapter: (h.chapter && h.chapter.title) ? h.chapter.title : '',
            site_id: h.id
          });
        }
      }
      p++;
    }
  }

  const resultHadiths = Array.from(hadithMap.values());
  console.log(`Total unique hadiths collected for Book ${bookId}: ${resultHadiths.length}`);

  let emptyBnCount = 0;
  let emptyArCount = 0;
  let corruptCount = 0;
  for (const h of resultHadiths) {
    if (!h.bn || h.bn.trim() === '') emptyBnCount++;
    if (!h.ar || h.ar.trim() === '') emptyArCount++;
    if (/^\$[0-9a-fA-F]+$/.test(h.bn) || /^\$[0-9a-fA-F]+$/.test(h.ar)) {
      corruptCount++;
    }
  }
  console.log(`Empty bn count: ${emptyBnCount}, Empty ar count: ${emptyArCount}, Corrupt refs: ${corruptCount}`);

  console.log(`Parse failures: ${parseFailures.count}`, parseFailures.samples);
  const expected = shard ? undefined : EXPECTED_COUNT[bookId];
  const nums = new Set(resultHadiths.map((h) => h.n).filter((n) => typeof n === 'number'));
  const maxN = nums.size ? Math.max(...nums) : 0;
  const missingNums = [];
  for (let i = 1; i <= maxN; i++) if (!nums.has(i)) missingNums.push(i);
  console.log(`Max number: ${maxN}, missing numbers (${missingNums.length}): ${missingNums.join(',')}`);
  // Fail only on real parse problems or a clearly short result (site numbering may legitimately have gaps)
  if (parseFailures.count > 0 || (expected && resultHadiths.length < expected * 0.95)) {
    console.error(`INCOMPLETE: got ${resultHadiths.length} of ~${expected} hadiths for book ${bookId}, parse failures ${parseFailures.count}. Not saving.`);
    process.exit(2);
  }
  resultHadiths.sort((a, b) => (typeof a.n === 'number' && typeof b.n === 'number') ? a.n - b.n : 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const outputData = {
    id: bookId,
    k: bookInfo.k,
    bn: bookInfo.bn,
    source: 'muslimbangla.com',
    source_url: `https://muslimbangla.com/hadith-book/${bookId}/chapters`,
    scraped_at: todayStr,
    hadiths: resultHadiths
  };

  const outFile = path.join(outDir, shard ? `${bookId}-${bookInfo.k}.part${shard.i}of${shard.n}.json` : `${bookId}-${bookInfo.k}.json`);
  // ভাগ-করা (shard) আউটপুট কম্প্যাক্ট: বড় কিতাবে ফাইল ছোট রাখতে (GitHub-এর ফাইল-সীমা)
  fs.writeFileSync(outFile, shard ? JSON.stringify(outputData) : JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Saved output to ${outFile}`);
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
