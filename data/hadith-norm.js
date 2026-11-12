/* হাদিস সার্চের শব্দ-সাধারণীকরণ। ব্রাউজারের hadith.js আর ডেটা বানানোর tools/build-hadith.js দুটোই এটি ব্যবহার করে,
   যাতে সূচি বানানোর সময় আর খোঁজার সময় শব্দের রূপ হুবহু এক হয়। এখানে কিছু বদলালে hadith-chunks নতুন করে বানাতে হবে। */
(function (g) {
  var AR_TOKEN = /[ء-ؿف-يٱ-ۓؐ-ًؚ-ٰٟۖ-ۭـ]+/g;
  var AR_DIA = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
  var BN_TOKEN = /[ঁ-৿‌‍­’‘'ʼ]+/g;
  var BN_JUNK = /[‌‍­’‘'ʼ]/g;
  var HASANTA = '্';
  var SUF = ['গুলো', 'গুলি', 'েরা', 'দের', 'ের', 'রা', 'টি', 'টা', 'ে', 'র', 'ও'];
  var CANON = {
    'নামাজ': 'নামায', 'নামাযে': 'নামায', 'রোজা': 'রোযা', 'অজু': 'ওযু', 'ওজু': 'ওযু', 'অযু': 'ওযু', 'উযু': 'ওযু', 'ওযূ': 'ওযু', 'অযূ': 'ওযু',
    'জাকাত': 'যাকাত', 'যাকাত': 'যাকাত', 'হজ্জ': 'হজ', 'ইমান': 'ঈমান', 'জান্নাত': 'জান্নাত', 'জাহান্নাম': 'জাহান্নাম', 'দোযখ': 'জাহান্নাম',
    'সালাত': 'নামায', 'সলাত': 'নামায', 'সালাহ': 'নামায', 'সিয়াম': 'রোযা', 'সাওম': 'রোযা', 'সওম': 'রোযা', 'আযান': 'আযান', 'আজান': 'আযান',
    'বাকারাহ': 'বাকারা', 'বাক্বারাহ': 'বাকারা', 'বাক্বারা': 'বাকারা', 'বাকারার': 'বাকারা'
  };

  /* এই শব্দগুলোর শেষ কাটা হয় না: নইলে 'বাকারা' (সূরা) আর 'বাকার' (আবূ বাকার) দুটোই 'বাকা' হয়ে মিশে যায় */
  var NOSTEM = { 'বাকারা': 1, 'বাকার': 1, 'বাকরা': 1, 'বাকরাহ': 1 };

  function arWord(w) {
    w = w.replace(AR_DIA, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
    if (w.indexOf('وال') === 0 && w.length > 5) w = w.slice(3);
    else if (w.indexOf('ال') === 0 && w.length > 4) w = w.slice(2);
    return w;
  }

  function bnWord(w) {
    w = w.replace(BN_JUNK, '');
    while (w.length && w.charAt(w.length - 1) === HASANTA) w = w.slice(0, -1);
    if (w.length < 2) return '';
    if (/^[০-৯]+$/.test(w)) return '';
    if (NOSTEM[w]) return w;
    for (var i = 0; i < SUF.length; i++) {
      var s = SUF[i];
      if (w.length - s.length >= 3 && w.slice(-s.length) === s) { w = w.slice(0, -s.length); break; }
    }
    return CANON[w] || w;
  }

  /* বাংলা ও আরবি শব্দের তালিকা (সাধারণীকৃত রূপে) */
  function tokens(text) {
    var out = [];
    var t = String(text || '').normalize('NFC');
    var m = t.match(AR_TOKEN) || [];
    var i, w;
    for (i = 0; i < m.length; i++) { w = arWord(m[i]); if (w.length >= 2) out.push(w); }
    m = t.match(BN_TOKEN) || [];
    for (i = 0; i < m.length; i++) { w = bnWord(m[i]); if (w) out.push(w); }
    return out;
  }

  /* শব্দ থেকে সূচি-খণ্ড নম্বর (০–২৫৫): FNV-1a */
  function shard(w) {
    var x = 2166136261;
    for (var i = 0; i < w.length; i++) { x ^= w.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return x & 255;
  }

  var api = { tokens: tokens, shard: shard, arWord: arWord, bnWord: bnWord, AR_TOKEN: AR_TOKEN, BN_TOKEN: BN_TOKEN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else g.HDNORM = api;
})(typeof window !== 'undefined' ? window : this);
