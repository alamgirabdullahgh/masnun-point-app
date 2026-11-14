const V="dr-shell-v145";
// ডেইলি রুকিয়া — অফলাইনে অ্যাপ খোলার জন্য। আয়াতের বড় ডেটা অ্যাপ নিজেই (Cache API "rs-…") জমা রাখে, তাই এখানে শুধু অ্যাপের কাঠামো।

const SHELL=["./","index.html","style.css?v=145","app.js?v=145","alarm.js?v=4","routine.js?v=2","mushaf.js?v=7","fonts/indopak-waqf-lazim.woff2","data/routine.json?v=2","data/patient-guide.json?v=1","data/ads.json?v=1","widget.js?v=10","boot.js?v=5","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","fonts/amiri-arabic-400-normal.woff2","fonts/amiri-arabic-700-normal.woff2","fonts/scheherazade-new-arabic-400-normal.woff2","fonts/scheherazade-new-arabic-700-normal.woff2","data/lame.min.js?v=1","data/hadith-norm.js?v=2","data/hadith.js?v=15"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("dr-shell-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET"||u.origin!==location.origin)return;
 if(u.pathname.indexOf("/_capacitor_file_/")===0)return;                  // ফোনের ভেতরের অডিও ফাইল: সরাসরি, ক্যাশে নকল নয়
 if(/\/data\/(quran-|hadith-chunks)/.test(u.pathname))return;                 // বড় ডেটা: অ্যাপের নিজস্ব ক্যাশ
 e.respondWith(caches.open(V).then(async c=>{
  const hit=await c.match(r,{ignoreSearch:r.mode==="navigate"});
  const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>null);
  return hit||await net||(r.mode==="navigate"?c.match("index.html"):Response.error())}))});
