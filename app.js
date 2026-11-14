(()=>{"use strict";
const BASE=new URL("data/",location.href).href,DV="3",$=i=>document.getElementById(i);
const SN="الفاتحة,البقرة,آل عمران,النساء,المائدة,الأنعام,الأعراف,الأنفال,التوبة,يونس,هود,يوسف,الرعد,إبراهيم,الحجر,النحل,الإسراء,الكهف,مريم,طه,الأنبياء,الحج,المؤمنون,النور,الفرقان,الشعراء,النمل,القصص,العنكبوت,الروم,لقمان,السجدة,الأحزاب,سبأ,فاطر,يس,الصافات,ص,الزمر,غافر,فصلت,الشورى,الزخرف,الدخان,الجاثية,الأحقاف,محمد,الفتح,الحجرات,ق,الذاريات,الطور,النجم,القمر,الرحمن,الواقعة,الحديد,المجادلة,الحشر,الممتحنة,الصف,الجمعة,المنافقون,التغابن,الطلاق,التحريم,الملك,القلم,الحاقة,المعارج,نوح,الجن,المزمل,المدثر,القيامة,الإنسان,المرسلات,النبأ,النازعات,عبس,التكوير,الانفطار,المطففين,الانشقاق,البروج,الطارق,الأعلى,الغاشية,الفجر,البلد,الشمس,الليل,الضحى,الشرح,التين,العلق,القدر,البينة,الزلزلة,العاديات,القارعة,التكاثر,العصر,الهمزة,الفيل,قريش,الماعون,الكوثر,الكافرون,النصر,المسد,الإخلاص,الفلق,الناس".split(",");
const MARKS=/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g;
const nz=(s,dag)=>String(s||"").replace(/\u0670/g,dag?"ا":"").replace(MARKS,"").replace(/[أإآٱ]/g,"ا").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[^\u0621-\u064A]/g,"");
const lk=s=>nz(s).replace(/[اويء]/g,"");
const lessAl=s=>s.length>3&&s.startsWith("ال")?s.slice(2):s;
let R=null,AY=null,ayP=null,BN=null,WB=null;
const el=(t,c,x)=>{const e=document.createElement(t);c&&(e.className=c);x!=null&&(e.textContent=x);return e};
const bn2=n=>String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
const POSBN={N:"বিশেষ্য",ADJ:"বিশেষণ",PN:"নামবাচক বিশেষ্য",V:"ক্রিয়া"};
const rsFetch=async u=>{let c=null;try{c=window.caches&&await caches.open("rs-"+DV);const m=c&&await c.match(u);if(m)return await m.json()}catch(e){c=null}const r=await fetch(u);if(!r.ok)throw new Error(r.status);try{c&&await c.put(u,r.clone())}catch(e){}return await r.json()};
// নামবাচক শব্দের আরবি রুট নেই বলে রুট-তালিকায় আসে না (ইবলিস, হারুত, মারুত); এখানে নিজে যোগ করা হলো। ফরম্যাট রুট-ফাইলের মতোই: [রুট,[[শব্দ,মূল রূপ,"সূরা:আয়াত:শব্দনং,…",বাংলা অর্থ,ধরন]]]
const EXTRA=[["إبليس",[["إِبْلِيسَ","إِبْلِيس","2:34:8,7:11:12,15:31:2,15:32:2,17:61:8,18:50:8,20:116:8,26:95:2,34:20:4,38:74:2,38:75:2","ইবলিস","PN"]]],["مدخل صدق",[["أَدْخِلْنِى","أَدْخَلَ","17:80:3","আমাকে প্রবেশ করাও","V"],["مُدْخَلَ","مُدْخَل","17:80:4","প্রবেশ করা","N"],["صِدْقٍ","صِدْق","17:80:5,17:80:8","সত্যের","N"],["وَأَخْرِجْنِى","أَخْرَجَ","17:80:6","এবং আমাকে বের করো","V"],["مُخْرَجَ","مُخْرَج","17:80:7","বের করা","N"]]],["هاروت",[["هَٰرُوتَ","هَٰرُوت","2:102:22","হারুত","PN"],["وَمَٰرُوتَ","مَٰرُوت","2:102:23","মারুত","PN"]]]];
async function loadRoots(){if(R)return R;const j=await rsFetch(BASE+"quran-roots.json?v="+DV+"p");
j.roots=j.roots.concat(EXTRA);
R=j.roots.map(([r,fs])=>{const forms=fs.map(([t,l,refs,m,p])=>({t,l,m:m||"",p:p||"",refs:refs.split(","),k1:nz(t,1),k2:nz(t),k3:lk(t),kl:nz(l)}));return{r,rn:nz(r),r3:lk(r),forms,n:forms.reduce((a,f)=>a+f.refs.length,0)}});return R}
const jf=n=>fetch(BASE+n+"?v="+DV).then(r=>r.json());
const CH={c:{},a:{},b:{},w:{},m:{}};
let actN=0;const qN=[],qL=[];const lim=(f,low)=>new Promise((ok,no)=>{const run=()=>{actN++;f().then(ok,no).finally(()=>{actN--;const n=qN.shift()||qL.shift();n&&n()})};if(actN<5&&(!low||!qN.length))run();else(low?qL:qN).push(run)});
const CS=new Set([6,11,15,17,21,24,29,31,44,48,114]);const TR="c";
const chunk=(k,s,low)=>k==="c"&&!CS.has(s)?chunk("b",s,low):CH[k][s]||(CH[k][s]=lim(async()=>{for(let i=0;;i++){try{return await rsFetch(BASE+"quran-chunks/"+k+"/"+s+".json?v="+DV)}catch(e){if(i>=3)throw e;await new Promise(z=>setTimeout(z,500*(i+1)))}}},low).catch(e=>{delete CH[k][s];throw e}));window.__drChunk=chunk;
function search(q){const out=[];for(const r of R){let sc=0,mf=null;
 if(r.rn===q)sc=100;
 else{const ex=r.forms.filter(f=>f.k1===q||f.k2===q||lessAl(f.k1)===q||lessAl(f.k2)===q);
  if(ex.length){sc=80;mf=ex}
  else if(q.length>=2&&r.rn.includes(q))sc=60;
  else if(q.length>=2){const p=r.forms.filter(f=>f.k1.includes(q)||f.k2.includes(q));if(p.length){sc=40;mf=p}else{const l=r.forms.filter(f=>f.kl.includes(q));if(l.length){sc=30;mf=l}}}}
 if(sc)out.push({r,sc,mf})}
 if(!out.length){const q3=lk(q);if(q3.length>=2)for(const r of R){let sc=0,mf=null;
  if(r.r3===q3)sc=50;else{const p=r.forms.filter(f=>f.k3.includes(q3));if(p.length){sc=35;mf=p}}
  if(sc)out.push({r,sc,mf,loose:1})}}
 return out.sort((a,b)=>b.sc-a.sc||b.r.n-a.r.n)}
let ALLF=false,GEN=0;
const fb=s=>String(s||"").normalize("NFC").replace(/[\u200c\u200d\u0981]/g,"").replace(/\u09df|য\u09bc/g,"য").replace(/ী/g,"ি").replace(/ূ/g,"ু").replace(/ঈ/g,"ই").replace(/ঊ/g,"উ").replace(/ভালো/g,"ভাল").replace(/ণ/g,"ন").replace(/য/g,"জ").replace(/জ্দু/g,"জাদু");
/* শব্দের ভেতরের টুকরো নয়, পুরো শব্দ (বা অল্প প্রত্যয়সহ) মিললেই হিট — নইলে "রায়িনা"-তে "জিনা" মিলে যেত */
const SUFRE=new RegExp("^(?:"+["দেরকে","েরকে","গুলোকে","গুলোর","গুলোতে","গুলো","সমূহকে","সমূহের","সমূহে","সমূহ","কারীদের","কারীরা","কারীর","কারী","গ্রস্তদের","গ্রস্ত","করদের","কররা","করকে","করের","করা","কর","শীল","শীলদের","ময়","ময়ী","লু","পরবশ","দের","ের","রা","কে","তে","টি","টা","য়ে","ে","য়","র","ও","ই"].map(x=>fb(x)).join("|")+")(?:ও|ই)?$");
// ছোট (২ অক্ষরের) শব্দ, যেমন "পা"/"মন": শুধু বিশেষ্যের প্রত্যয় চলবে — নইলে "পাও/পাই/পার" (পাওয়া) বা "মনে করো" ভুলে মিলে যায়
const SUFNOUN=new RegExp("^(?:"+["গুলোকে","গুলোর","গুলোতে","গুলো","সমূহকে","সমূহের","সমূহে","সমূহ","য়ের","য়ে","ের"].map(x=>fb(x)).join("|")+")$");
const wordHas=(fm,k)=>fm.split(/[\s,()।;:\-–—'"‘’“”]+/).filter(Boolean).some(w=>w===k||(w.startsWith(k)&&(k.length<=2?SUFNOUN:SUFRE).test(w.slice(k.length))));
/* ক্রিয়া-রূপ: "ভালোবাসা" লিখলে ভালোবাসে/ভালোবাসেন/ভালোবাসবেন... এর মতো রূপও ধরা পড়ে (শুধু "া"-তে শেষ হওয়া শব্দের ধাতু ধরে) */
const VSUF=new RegExp("^(?:"+["ে","েন","ি","ো","ছে","ছেন","ছি","েছে","েছেন","েছি","েছিল","েছিলেন","তে","ব","বে","বেন","বো","ল","লে","লেন","ত","তো","তেন","ক","ুক","ন","নি","েনি","ো না","ে না","ে।"].map(x=>fb(x)).join("|")+")$");
const verbHas=(fm,s)=>fm.split(/[\s,()।;:\-–—'"‘’“”]+/).filter(Boolean).some(w=>w.length>s.length&&w.startsWith(s)&&VSUF.test(w.slice(s.length)));
/* ভালোবাসা-গুচ্ছ: এই শব্দ লিখলে ভালোবাসা/প্রেম/মহব্বতের আরবি রুপের (হুব্ব, আহবাব, মাহাব্বাহ, ওয়াদুদ, মাওয়াদ্দাহ...) সব আয়াত আসে */
const LOVEL=new Set(["أَحْبَبْ","حُبّ","مَحَبَّة","اسْتَحَبُّ","أَحَبّ","حَبَّبَ","أَحِبّاؤ","وَدُود","وُدّ","مَوَدَّة"]);
/* এই শব্দ লিখলে নির্দিষ্ট আরবি রুটের সব আয়াত আসবে (অর্থে ঠিক ওই শব্দ না থাকলেও) */
const BROOT=[[["জিনা","জেনা","যিনা","যেনা"],"زني"]];
// একমুখী সংযোজন: প্রথম তালিকার যেকোনো শব্দ লিখলে দ্বিতীয় তালিকার শব্দগুলোর আয়াতও আসে (উল্টোটা হয় না)। যেমন "চোখ" লিখলে "অন্ধ"-ও, কিন্তু "অন্ধ" লিখলে সব চোখের আয়াত নয়
const BEXT=[[["চোখ","নয়ন","চক্ষু","আঁখি","দৃষ্টি"],["অন্ধ"]]];
// বাদ-দেওয়া বাক্যাংশ: গুচ্ছের কোনো শব্দ লিখলে যেসব অর্থে (ইডিয়ম) আসল অঙ্গ বোঝায় না সেগুলো বাদ। যেমন "মুখ ফিরিয়ে নেওয়া" মুখের আয়াত নয়
const BEXCL=[[["মুখ","চেহারা","মুখমণ্ডল","বদন","আনন"],["মুখ ফির","মুখ ফের","মুখ ঘুর"]]];
// জিন-জাতি গুচ্ছ (একমুখী): জিন/জ্বিন লিখলে জিন, শয়তান, ইবলিস, মারিদ, ইফরিত, খান্নাস ইত্যাদির সব আয়াত আসে (উল্টোটা হয় না: শুধু "শয়তান" লিখলে সব জিন আসবে না)
const JINNL=new Set(["جِنّ","جانّ","شَيْطان","إِبْلِيس","مارِد","مَرِيد","عِفْرِيت","خَنّاس"]);
// আগুন-গুচ্ছ: আগুন/অগ্নি/অনল/নার লিখলে আরবির নার ছাড়াও সা'ঈর, হারীক, ওয়াক্বূদ, জায্ওয়াহ, ক্বাবাস, তালাযযা, হাত্বাব, শিহাব ইত্যাদির আয়াতও আসে
const FIREL=new Set(["نار","سَعِير","حَرِيق","جَذْوَة","قَبَس","وَقُود","أَوْقَدُ","اسْتَوْقَدَ","مُوقَدَة","تَلَظَّى","حَطَب","شِهاب","شُهُب"]);
const BLEM=[[["ভালোবাসা","ভালবাসা","প্রেম","মহব্বত","মুহাব্বত","মুহব্বত","ভালোবাসি","ভালোবাসে","ভালোবাসেন","ভালোবাসতে"],f=>LOVEL.has(f.l)&&!/প্রাধান্য/.test(f.m)],[["আগুন","অগ্নি","অনল","নার"],f=>FIREL.has(f.l)||/আগুন|অগ্নি|অনল/.test(f.m)],[["জিন","জ্বিন","জ্বীন","জীন","জিন জাতি","জ্বিন জাতি","জিনজাতি","জিনের","জিনদের"],f=>JINNL.has(f.l)||(f.l==="جِنَّة"&&/জ্বিন|জিন/.test(f.m))||/শয়তান|ইবলিস|ইবলীস|মারিদ|ইফরিত|জ্বিন/.test(f.m)]];
function searchBn(q){const out=[];const xs=[];for(const[k,ph]of BEXCL)if(k.some(x=>fb(x)===fb(q)))ph.forEach(p=>xs.push(fb(p)));let qs=[q];for(const g of BSYN)if(g.some(x=>fb(x)===fb(q))){qs=g.slice();break}
 for(const[k,ex]of BEXT)if(k.some(x=>fb(x)===fb(q)))qs=qs.concat(ex.filter(x=>!qs.includes(x)));
 const fq=qs.map(fb);const vst=fq.filter(x=>x.endsWith("া")&&x.length>=4).map(x=>x.slice(0,-1));
 const lm=[];for(const[g,fn]of BLEM)if(g.some(x=>fb(x)===fb(q)))lm.push(fn);
 const rt=[];for(const[g,rr]of BROOT)if(g.some(x=>fb(x)===fb(q)))rt.push(rr);
 for(const r of R){const ex=[],pt=[];for(const f of r.forms){if(!f.m)continue;const fm=f._b||(f._b=fb(f.m));if(xs.length&&xs.some(p=>fm.includes(p)))continue;if(fq.some(k=>fm===k))ex.push(f);else if(fq.some(k=>wordHas(fm,k))||vst.some(s=>verbHas(fm,s)))pt.push(f)}
  if(rt.some(rr=>r.r===rr||r.rn===nz(rr))){const seen=new Set(ex.concat(pt));r.forms.forEach(f=>{if(!seen.has(f))ex.push(f)})}
  if(lm.length){const seen=new Set(ex.concat(pt));r.forms.forEach(f=>{if(!seen.has(f)&&lm.some(fn=>fn(f)))ex.push(f)})}
  if(ex.length||pt.length)out.push({r,sc:ex.length?60:40,mf:ex.concat(pt),bn:1})}
 return out.sort((a,b)=>b.sc-a.sc||b.mf.length-a.mf.length||b.r.n-a.r.n)}
// কাছাকাছি শব্দ: কিছু না পেলে অনুবাদের শব্দভান্ডার থেকে ১ অক্ষর ভুল বা একই শুরুর শব্দ দেখায় (বেশি আয়াতে থাকা শব্দ আগে)
let BWL=null;
const near1=(a,b)=>{if(a===b)return true;const la=a.length,lb=b.length;if(Math.abs(la-lb)>1)return false;let i=0;while(i<la&&i<lb&&a[i]===b[i])i++;if(la===lb)return a.slice(i+1)===b.slice(i+1);if(la>lb)return a.slice(i+1)===b.slice(i);return b.slice(i+1)===a.slice(i)};
async function bnSuggest(q){const fq=fb(bnw(q));if(fq.length<3)return[];BWL=BWL||(await rsFetch(BASE+"quran-bn-words.json?v="+DV+"w")).w;
 const seen=new Set(),out=[];for(const x of BWL){const w=x[0],fw=fb(bnw(w));if(!fw||fw===fq||seen.has(fw))continue;if(near1(fw,fq)||(fq.length>=4&&fw.startsWith(fq))){seen.add(fw);out.push([w,x[2]||0])}}
 return out.sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0])}
const BSTOP=new Set(["সহ","ও","এবং","এর","তার","তাদের","যে","এই","সে","কি","কী","না","তো","হয়","করে","থেকে","দ্বারা","জন্য","একটি","এক","তাঁর","তিনি","আর","বা","যারা","তারা","আমার","আমি","আমাকে","আমাদের","আমরা","আমাদেরকে","তোমার","তুমি","তোমাকে","তোমরা","তোমাদের","তাকে","তাঁকে","তাঁদের","তিনি","সে","এটি","ওই","ঐ","সেই","এর","ওর","তা","যা","কে","হে","নিশ্চয়","অবশ্যই","কিন্তু","যদি","তবে","পর","মধ্যে","উপর","প্রতি","সাথে","সঙ্গে","করা","করো","করুন","হবে","হল","হলো","ছিল","আছে","তাহলে","এবং","অথবা"]);
const bnw=x=>x.replace(/[()\[\],.;:!?"'“”‘’।–—-]/g,"");
function bnHit(w,toks){w=fb(bnw(w));if(w.length<2)return false;for(let k of toks){k=fb(k);if(w===k)return true;let n=0;const L=Math.min(w.length,k.length);while(n<L&&w[n]===k[n])n++;if(n>=3&&n>=Math.ceil(L*0.7))return true}return false}
const BSYN=[["ভালোবাসা","ভালবাসা","প্রেম","মহব্বত","মুহাব্বত","মুহব্বত","ভালোবাসি","ভালোবাসে","ভালোবাসেন","ভালোবাসতে"],["আগুন","অগ্নি","অনল","নার"],["জিনা","জেনা","যিনা","যেনা"],["ইবলিস","ইবলীস","ইবলিশ","ইবলীশ"],["চুল","কেশ","কেশগুচ্ছ","কেশরাজি","কেশদাম","ঝুঁটি"],["মাথা","মস্তক","শির","শিরোদেশ"],["চোখ","নয়ন","চক্ষু","আঁখি","দৃষ্টি"],["হাত","হস্ত"],["পা","চরণ"],["মুখ","চেহারা","মুখমণ্ডল","বদন","আনন"],["কান","কর্ণ","শ্রবণ"],["পেট","উদর","জঠর"],["পিঠ","পৃষ্ঠ","পৃষ্ঠদেশ"],["বুক","বক্ষ","সিনা","ছাতি"],["ঘাড়","গর্দান","গ্রীবা","গলা"],["কণ্ঠ","কণ্ঠদেশ","কণ্ঠনালী"],["অন্তর","হৃদয়","মন","কলব"],["রক্ত","খুন","শোণিত"],["কপাল","ললাট","ভ্রূ"],["জিহ্বা","জিভ","জবান","রসনা"],["দাঁত","দন্ত"],["নাক","নাসিকা","নাসারন্ধ্র"],["আঙুল","অঙ্গুলি","আঙ্গুল"]];
/* আরবির মতো সরাসরি অবস্থান: quran-chunks/m — প্রতিটা আয়াতে "আরবি শব্দ নং:অনুবাদের শব্দ-শুরু-শেষ"। না থাকলে নিচের আন্দাজ-পদ্ধতি (markBn) কাজ করে */
function alRange(str,w){for(const it of String(str||"").split(",")){const p=it.split(":");if(+p[0]===w&&p[1]){const r=p[1].split("-").map(Number);if(r.length===2&&r[0]>=0&&r[1]>=r[0])return r}}return null}
/* দুই রঙের মার্ক: <mark> = মূল শব্দ; span.rs-gold = সমস্যার সাথে সংশ্লিষ্ট অংশ (box.__port = [শুরু, শেষ], ০-ভিত্তিক শব্দ-সূচক) */
function paintBn(box,ws,hit){box.__st={ws,hit};const pr=box.__port;box.textContent="";let seg=null,i=0;
 while(i<ws.length){const inP=!!(pr&&i>=pr[0]&&i<=pr[1]);
  if(i)(inP&&seg?seg:box).appendChild(document.createTextNode(" "));
  if(inP&&!seg){seg=el("span","rs-gold");box.appendChild(seg)}else if(!inP)seg=null;
  const h=seg||box;
  if(hit[i]){let j=i;while(j+1<ws.length&&hit[j+1]&&(!pr||((j+1>=pr[0]&&j+1<=pr[1])===inP)))j++;h.appendChild(el("mark",null,ws.slice(i,j+1).join(" ")));i=j+1}
  else{h.appendChild(document.createTextNode(ws[i]));i++}}}
/* আরবি অংশ → বাংলা অনুবাদের শব্দ-সীমা (০-ভিত্তিক): অ্যালাইনমেন্ট (quran-chunks/m) থেকে ওই অংশের শব্দগুলোর সবচেয়ে বাঁয়ের ও ডানের বাংলা শব্দ; আয়াতের শুরু/শেষ ছুঁয়ে থাকলে অনুবাদের শুরু/শেষ পর্যন্ত */
function bnPortion(al,PR,N,nb){let b=1e9,e=-1;for(const it of String(al||"").split(",")){const p=it.split(":");const w=+p[0];if(!p[1]||w<PR[0]||w>PR[1])continue;const r=p[1].split("-").map(Number);if(r.length!==2||!(r[1]>=r[0]))continue;b=Math.min(b,r[0]);e=Math.max(e,r[1])}
 if(e<0)return null;if(PR[0]<=1)b=0;if(PR[1]>=N)e=nb-1;e=Math.min(e,nb-1);return b<=e?[b,e]:null}
function setBnPort(box,r){box.__port=r;if(box.__st)paintBn(box,box.__st.ws,box.__st.hit)}
function markRange(box,text,r){const ws=String(text||"").split(" ");if(r[0]>=ws.length)return false;const b=r[0],e=Math.min(r[1],ws.length-1);if(ws.slice(b,e+1).every(x=>LV.test(bnw(x))))return false;const hit=ws.map((x,i)=>i>=b&&i<=e);paintBn(box,ws,hit);return true}
/* বাংলা সার্চে: যে শব্দ লিখে খোঁজা হয়েছে অনুবাদে সরাসরি সেই শব্দই মার্ক হয় (আন্দাজ নয়); পেলে true */
const QX=new Set(["কাজেই"]);
function markQ(box,text,q){q=String(q||"").trim();if(!q||!/[\u0980-\u09FF]/.test(q))return false;const toks=q.split(/[\s,،，、]+/).map(bnw).filter(x=>x.length>1&&!BSTOP.has(x));if(!toks.length)return false;
 const ws=String(text||"").split(" "),hit=ws.map(w=>{const n=bnw(w);return !!n&&!QX.has(n)&&bnHit(w,toks)});if(!hit.some(Boolean))return false;paintBn(box,ws,hit);return true}
/* "করছ/কর/হও" জাতীয় সাধারণ ক্রিয়া একা মার্ক করা হয় না — এতে ভুল জায়গায় মার্ক পড়ত */
const LV=/^(কর|করছ|করছো|করেছ|করেছো|করবে|করবো|করো|করুন|করে|করেন|করল|করলো|করত|করতে|করি|করব|করা|হও|হই|হয়|হবে|হলো|হল|দাও|দেয়|দেন|নিন|নাও)$/;
function markBn(box,text,gloss){box.textContent="";const toks=bnw(String(gloss||"").replace(/[()]/g," ")).split(/\s+/).map(bnw).filter(x=>x.length>1&&!BSTOP.has(x)&&!LV.test(x));for(const g of BSYN)if(toks.some(k=>bnHit(g[0],[k])||g.some(x=>fb(x)===fb(k))))for(const x of g)toks.push(x);
 const ws=String(text||"").split(" "),hit=ws.map(w=>!!(toks.length&&bnHit(w,toks)));paintBn(box,ws,hit)}
async function vtext(s,a){const t=((await chunk("a",s))||[])[a-1],b=((await chunk(TR,s))||[])[a-1];return t==null?"":"সূরা "+SN[s-1]+" — "+s+":"+a+"\n"+t+"\n"+(b||"")}
async function copyTxt(x){try{await navigator.clipboard.writeText(x);return true}catch(e){try{const t=document.createElement("textarea");t.value=x;t.style.cssText="position:fixed;opacity:0";document.body.appendChild(t);t.select();const ok=document.execCommand("copy");t.remove();return ok}catch(e2){return false}}}
function copyBtn(label,get,sh){const b=el("button","rs-wb",label);b.type="button";b.onclick=async()=>{b.disabled=true;const o=b.textContent;b.textContent=sh?"⏳":"কপি হচ্ছে…";let ok=false;try{ok=await copyTxt(await get())}catch(e){}b.textContent=sh?(ok?"✅":"⚠️"):(ok?"✅ কপি হয়েছে":"কপি করা যায়নি");setTimeout(()=>{b.textContent=o;b.disabled=false},1500)};return b}
function legend(info){}
function allCopy(info,forms,ord){legend(info);const set=new Set();WORDS.clear();forms.forEach(f=>f.refs.forEach(r=>{const p=r.split(":");if(p.length>2&&+p[2]){const k=p[0]+":"+p[1];let st=WORDS.get(k);if(!st){st=new Set();WORDS.set(k,st)}st.add(+p[2])}}));forms.forEach(f=>f.refs.forEach(r=>set.add(r.split(":").slice(0,2).join(":"))));const all=ord&&ord.length?ord:[...set].map(r=>r.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);if(!all.length)return;
 const b=copyBtn("📋 সব আয়াত কপি ("+bn2(all.length)+")",async()=>{await Promise.all([...new Set(all.map(x=>x[0]))].map(z=>Promise.all([chunk("a",z),chunk(TR,z)])));const o=[];for(const [z,y] of all)o.push(await vtext(z,y));return o.join("\n\n")});
 b.className="rs-wb rs-act";audioBar(info,all,b)}
const AYN=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const RECS=[["ar.alafasy","মিশারি আলাফাসি","Alafasy_128kbps"],["ar.mahermuaiqly","মাহের আল-মুআইকলি","MaherAlMuaiqly128kbps"],["ar.abdurrahmaansudais","আব্দুর রহমান আস-সুদাইস","Abdurrahmaan_As-Sudais_192kbps"],["ar.saoodshuraym","সাউদ আশ-শুরাইম","Saood_ash-Shuraym_128kbps"]];
const gNum=(s,a)=>AYN.slice(0,s-1).reduce((x,y)=>x+y,0)+a;
const recId=()=>{try{const v=localStorage.getItem("rsRec");if(RECS.some(r=>r[0]===v))return v}catch(e){}return RECS[0][0]};
const audUrls=(s,a)=>{const r=RECS.find(x=>x[0]===recId())||RECS[0],p3=n=>String(n).padStart(3,"0");return[...[128,64,192].map(b=>"https://cdn.islamic.network/quran/audio/"+b+"/"+r[0]+"/"+gNum(s,a)+".mp3"),"https://everyayah.com/data/"+r[2]+"/"+p3(s)+p3(a)+".mp3"]};
window.__drAud={urls:audUrls,AYN:AYN}; // alarm.js (রুকইয়াহ অডিও অ্যালার্ম) ব্যবহার করে
const els=(t,css,x)=>{const e=el(t,null,x);e.style.cssText=css;return e};
const SELV=new Set(),selUp=[];
const selChange=()=>selUp.forEach(f=>{try{f()}catch(e){}});
/* একটি আয়াত শোনা: ফোনে ফাইল থাকলে সরাসরি সেই ফাইল প্লেয়ারে (নামানো/মেমরিতে কপি ছাড়াই, সঙ্গে সঙ্গে চলে); না থাকলে নেট থেকে। নামানো দরকার শুধু মার্জের সময় (fetchAud) */
async function localUrl(s,a){const p=NAO();if(!p)return null;try{if(!NADIR)NADIR=(await p.status()).dir||"";if(!NADIR)return null;return window.Capacitor.convertFileSrc("file://"+NADIR+"/"+gNum(s,a)+".mp3")}catch(e){return null}}
function playBtn(s,a){const b=el("button","rs-wb","🔊 শুনুন");b.type="button";let au=null;
 b.onclick=async()=>{if(au){au.remove();au=null;b.textContent="🔊 শুনুন";return}
  const me=document.createElement("audio");au=me;me.controls=true;me.autoplay=true;me.style.cssText="flex:1 1 0;min-width:0;width:100%;height:38px;margin:0";
  b.parentNode.appendChild(me);b.textContent="⏹ বন্ধ";
  const c=[];
  if(offOn()){const lu=await localUrl(s,a);if(au!==me)return;if(lu)c.push(lu);else{const x=await offGet(s,a);if(au!==me)return;if(x)c.push(URL.createObjectURL(new Blob([x],{type:"audio/mpeg"})))}}
  c.push(...audUrls(s,a));let i=0;
  me.onerror=()=>{if(au!==me)return;if(++i<c.length){me.src=c[i];me.play().catch(()=>{})}else{b.textContent="অডিও পাওয়া যায়নি"}};
  me.src=c[0]};return b}
/* একটি আয়াত, পুনরাবৃত্তি ১: মার্জ/ডাউনলোড ছাড়াই সরাসরি প্লেয়ারে (ফোনে ফাইল থাকলে সেই ফাইল, না থাকলে নেট থেকে) */
async function playOne(s,a,out,note){out.textContent="";note.textContent="";const me=document.createElement("audio");me.controls=true;me.autoplay=true;me.style.cssText="display:block;width:100%;margin-top:8px";out.appendChild(me);
 const c=[];if(offOn()){const lu=await localUrl(s,a);if(lu)c.push(lu);else{const x=await offGet(s,a);if(x)c.push(URL.createObjectURL(new Blob([x],{type:"audio/mpeg"})))}}
 c.push(...audUrls(s,a));let i=0;me.onerror=()=>{if(++i<c.length){me.src=c[i];me.play().catch(()=>{})}else note.textContent="অডিও পাওয়া যায়নি"};me.src=c[0]}
function selBox(s,a){const k=s+":"+a,l=els("label","display:inline-flex;align-items:center;gap:5px;margin:6px 0 0 6px;font-size:12px;color:var(--primary);cursor:pointer"),c=document.createElement("input");c.type="checkbox";c.checked=SELV.has(k);c.onchange=()=>{c.checked?SELV.add(k):SELV.delete(k);selChange()};l.append(c,document.createTextNode("বাছাই"));
 const rs=numBox("rs-num rs-num-s",REP.get(k)||repAll(),v=>{REP.set(k,v)});rs.title="এই আয়াত কতবার";REPBX.push({k,i:rs});l.append(rs,document.createTextNode(" বার"));return l}
/* ───── মিশারি আলাফাসির অডিও অফলাইনে: একবার নামালে ফোনের ভেতরে (Cache) থাকে; মার্জ/শোনা আগে সেখান থেকে, না থাকলে নেট থেকে ───── */
const OFFC="dr-aud-alafasy",OFFID="ar.alafasy",OFFN=6236,OFFU=n=>"https://cdn.islamic.network/quran/audio/64/ar.alafasy/"+n+".mp3";
const offOn=()=>recId()===OFFID;
const offSrc=(s,a)=>{const p3=n=>String(n).padStart(3,"0"),n=gNum(s,a);return["https://everyayah.com/data/Alafasy_64kbps/"+p3(s)+p3(a)+".mp3",OFFU(n),"https://everyayah.com/data/Alafasy_128kbps/"+p3(s)+p3(a)+".mp3","https://cdn.islamic.network/quran/audio/128/ar.alafasy/"+n+".mp3"]};
const offRev=n=>{let s=1;for(const c of AYN){if(n<=c)return[s,n];n-=c;s++}return[114,1]};
const NAO=()=>{try{return window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.OfflineAudio||null}catch(e){return null}};
let NADIR="";
async function nativeGet(s,a){const p=NAO();if(!p)return null;try{if(!NADIR)NADIR=(await p.status()).dir||"";if(!NADIR)return null;
 const r=await fetch(window.Capacitor.convertFileSrc("file://"+NADIR+"/"+gNum(s,a)+".mp3"));if(!r.ok)return null;const b=await r.arrayBuffer();return b.byteLength>1024?b:null}catch(e){return null}}
async function offGet(s,a){const nb=await nativeGet(s,a);if(nb)return nb;try{const c=await caches.open(OFFC),r=await c.match(OFFU(gNum(s,a)));return r?await r.arrayBuffer():null}catch(e){return null}}
async function offPut(n,buf){const c=await caches.open(OFFC);await c.put(OFFU(n),new Response(buf,{headers:{"Content-Type":"audio/mpeg"}}))}
async function offCount(){try{return(await(await caches.open(OFFC)).keys()).length}catch(e){return 0}}
let OFFRUN=false,OFFTRY=0;
const OFFSAY=(t,pct)=>{const e=document.getElementById("drOff");if(!e)return;const x=e.querySelector(".off-t"),f=e.querySelector(".off-f");if(x)x.textContent=t;if(f)f.style.width=Math.max(0,Math.min(100,pct||0))+"%"};
/* পুরো মিশারি আলাফাসি ৬৪kbps — অ্যাপ খুললেই নিজে নামে, সাইডবারে অগ্রগতি; ব্যর্থ হলে নিজে আবার চেষ্টা করে */
async function offDownload(){
 if(OFFRUN)return;OFFRUN=true;
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 let c;try{c=await caches.open(OFFC)}catch(e){OFFRUN=false;OFFSAY("অফলাইন অডিও: এই ফোনে সংরক্ষণ চালু করা যায়নি");return}
 const have=new Set((await c.keys()).map(r=>r.url)),todo=[];for(let n=1;n<=OFFN;n++)if(!have.has(OFFU(n)))todo.push(n);
 let done=OFFN-todo.length,i=0,bytes=0,stop=false,full="",lastErr="",hi=0;const base=done;
 const show=()=>{const mb=bytes/1048576,est=done>base?Math.round(mb/(done-base)*todo.length):0;OFFSAY("📥 অফলাইন অডিও নামছে "+bn2(done)+"/"+bn2(OFFN)+(est?" · আনুমানিক মোট "+bn2(est)+" MB":"")+(hi?" · ১২৮kbps: "+bn2(hi):""),done*100/OFFN)};
 const work=async()=>{while(!stop&&i<todo.length){const n=todo[i++];let ok=false;const sa=offRev(n);
   for(const u of offSrc(sa[0],sa[1])){let b;try{const r=await fetch(u);if(!r.ok){lastErr="HTTP "+r.status;continue}b=await r.arrayBuffer()}catch(e){lastErr=String(e&&e.message||e).slice(0,30);continue}
    try{await offPut(n,b);bytes+=b.byteLength;ok=true;if(u.indexOf("128kbps")>=0||u.indexOf("/audio/128/")>=0)hi++}catch(e){stop=true;full="📥 অফলাইন অডিও: ফোনের জায়গা শেষ — কিছু ফাইল মুছুন"}break}
   if(ok)done++;if(done%5===0)show()}};
 show();await Promise.all([work(),work(),work(),work()]);OFFRUN=false;
 if(full){OFFSAY(full,done*100/OFFN);return}
 if(done>=OFFN){OFFSAY("✅ অফলাইন অডিও সম্পূর্ণ (সব "+bn2(OFFN)+"টি আয়াত)"+(hi?" · ১২৮kbps: "+bn2(hi):""),100);return}
 OFFSAY("📥 অফলাইন অডিও "+bn2(done)+"/"+bn2(OFFN)+" — নেট ঠিক হলে নিজে আবার নামবে"+(lastErr?" ("+lastErr+")":""),done*100/OFFN);
 if(++OFFTRY<=20)setTimeout(offDownload,60000)}
/* অ্যান্ড্রয়েড অ্যাপে: নামানো নেটিভ ফোরগ্রাউন্ড সার্ভিসে (স্ক্রিন বন্ধ/অন্য অ্যাপে গেলেও চলে); এখানে শুধু অগ্রগতি দেখানো */
let NATIVE_ON=false;
async function offNative(p){
 if(NATIVE_ON)return;NATIVE_ON=true;let lastStart=0;
 const kick=async()=>{lastStart=Date.now();try{await p.start()}catch(e){}};
 await kick();
 const poll=async()=>{
  try{const r=await p.status();NADIR=r.dir||NADIR;const mb=Math.round(r.bytes/1048576);
   if(r.done>=r.total){OFFSAY("✅ অফলাইন অডিও সম্পূর্ণ (সব "+bn2(r.total)+"টি আয়াত · "+bn2(mb)+" MB)",100);try{caches.delete(OFFC)}catch(e){}return}
   OFFSAY("📥 অফলাইন অডিও "+bn2(r.done)+"/"+bn2(r.total)+" · "+bn2(mb)+" MB"+(r.running?" — ব্যাকগ্রাউন্ডেও নামছে":" — থেমে আছে, নেট এলে নিজে চলবে")+(!r.running&&r.last?" ("+String(r.last).slice(0,30)+")":""),r.done*100/r.total);
   if(!r.running&&Date.now()-lastStart>30000)await kick()}catch(e){}
  setTimeout(poll,2500)};
 poll()}
async function offAuto(){
 try{const np=NAO();if(np){offNative(np);return}
  if(OFFRUN||!window.caches)return;
  if(lsGet("drOff64","")!=="1"){try{await caches.delete(OFFC)}catch(e){}lsSet("drOff64","1")} // আগের (১২৮kbps) ফাইল মুছে ৬৪kbps-এ নতুন করে
  const n=await offCount();if(n>=OFFN){OFFSAY("✅ অফলাইন অডিও সম্পূর্ণ (সব "+bn2(OFFN)+"টি আয়াত)",100);return}
  OFFSAY("📥 অফলাইন অডিও শুরু হচ্ছে…",n*100/OFFN);offDownload()}catch(e){}}
window.addEventListener("load",()=>setTimeout(offAuto,3000));
window.addEventListener("online",()=>{OFFTRY=0;offAuto()});
const AS={loc:0,net:0}; // মার্জে কয়টা আয়াত ফোনের ফাইল থেকে, কয়টা নেট থেকে এল
async function fetchAud(s,a){if(offOn()){const b=await offGet(s,a);if(b){AS.loc++;return b}}let e;for(const u of audUrls(s,a)){try{const r=await fetch(u);if(r.ok){AS.net++;return await r.arrayBuffer()}}catch(x){e=x}}throw e||new Error("audio")}
/* ───── MP3 এনকোডিং একাধিক কোরে (Web Worker পুল): প্রতিটি আয়াত আলাদা এনকোড হয়ে ক্রমানুসারে জোড়া লাগে; Worker না চললে আগের মতো মূল থ্রেডে ───── */
function encWorkerMain(){self.onmessage=function(e){var d=e.data;try{var en=new lamejs.Mp3Encoder(1,d.sr,64),o=[],t=0,p=d.pcm,i,m;for(i=0;i<p.length;i+=1152){m=en.encodeBuffer(p.subarray(i,i+1152));if(m.length){o.push(new Uint8Array(m));t+=m.length}}m=en.flush();if(m.length){o.push(new Uint8Array(m));t+=m.length}var r=new Uint8Array(t),q=0;for(i=0;i<o.length;i++){r.set(o[i],q);q+=o[i].length}self.postMessage({mp3:r},[r.buffer])}catch(x){self.postMessage({err:String(x)})}}}
function encMain(L,p,sr){const en=new L.Mp3Encoder(1,sr,64),o=[];let t=0,m;for(let i=0;i<p.length;i+=1152){m=en.encodeBuffer(p.subarray(i,i+1152));if(m.length){o.push(new Uint8Array(m));t+=m.length}}m=en.flush();if(m.length){o.push(new Uint8Array(m));t+=m.length}const r=new Uint8Array(t);let q=0;for(const x of o){r.set(x,q);q+=x.length}return r}
async function mkEncPool(){if(typeof Worker==="undefined")return null;const src=await(await fetch(BASE+"lame.min.js?v=1")).text();
 const url=URL.createObjectURL(new Blob([src+";("+encWorkerMain.toString()+")();"],{type:"application/javascript"}));
 const n=Math.max(2,Math.min(6,(navigator.hardwareConcurrency||4)-1)),ws=[],idle=[],q=[],waiters=[];let inflight=0;
 const wake=()=>{waiters.splice(0).forEach(r=>r())};
 const pump=()=>{while(idle.length&&q.length){const w=idle.pop(),j=q.shift();w.cur=j;const c=j.pcm.slice();w.postMessage({sr:j.sr,pcm:c},[c.buffer])}};
 for(let i=0;i<n;i++){const w=new Worker(url);w.cur=null;
  w.onmessage=e=>{const j=w.cur;w.cur=null;inflight--;idle.push(w);const d=e.data;j&&j.res(d&&d.mp3?d.mp3:null);wake();pump()};
  w.onerror=()=>{const j=w.cur;w.cur=null;if(j){inflight--;j.res(null)}try{w.terminate()}catch(x){}const k=ws.indexOf(w);if(k>=0)ws.splice(k,1);const id=idle.indexOf(w);if(id>=0)idle.splice(id,1);
   if(!ws.length)while(q.length){inflight--;q.shift().res(null)}wake();pump()};
  ws.push(w);idle.push(w)}
 return{run:(pcm,sr)=>new Promise(res=>{if(!ws.length)return res(null);inflight++;q.push({pcm,sr,res});pump()}),
  room:async()=>{while(inflight>=n*2&&ws.length)await new Promise(r=>waiters.push(r))},
  close:()=>{ws.forEach(w=>{try{w.terminate()}catch(x){}});try{URL.revokeObjectURL(url)}catch(x){}}}}
function wavOf(parts,sr){let n=0;parts.forEach(p=>n+=p.length);const buf=new ArrayBuffer(44+n*2),v=new DataView(buf),w=(o,t)=>[...t].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
 w(0,"RIFF");v.setUint32(4,36+n*2,true);w(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,n*2,true);
 let o=44;for(const p of parts)for(let i=0;i<p.length;i++){const x=Math.max(-1,Math.min(1,p[i]));v.setInt16(o,x<0?x*32768:x*32767,true);o+=2}return new Blob([buf],{type:"audio/wav"})}
function playList(list,out){const w=els("div","margin-top:8px"),lab=els("div","font-size:12.5px;color:var(--primary);margin-bottom:4px"),au=document.createElement("audio");au.controls=true;au.autoplay=true;au.style.cssText="display:block;width:100%";
 const nx=els("button","margin-top:6px","⏭ পরের আয়াত");nx.className="rs-wb";nx.type="button";let i=0,u=[],k=0;
 const go=n=>{i=n;if(i>=list.length){lab.textContent="✅ সব আয়াত শেষ";return}lab.textContent="আয়াত "+bn2(i+1)+"/"+bn2(list.length)+" — সূরা "+SN[list[i][0]-1]+" "+bn2(list[i][0])+":"+bn2(list[i][1]);u=audUrls(list[i][0],list[i][1]);k=0;au.src=u[0];au.play().catch(()=>{})};
 au.onended=()=>go(i+1);au.onerror=()=>{if(++k<u.length){au.src=u[k];au.play().catch(()=>{})}else go(i+1)};nx.onclick=()=>go(i+1);
 w.append(lab,au,nx);out.appendChild(w);go(0)}
let LAMEP=null;
const loadLame=()=>LAMEP||(LAMEP=new Promise((ok,no)=>{if(window.lamejs)return ok(window.lamejs);const t=document.createElement("script");t.src=BASE+"lame.min.js?v=1";t.onload=()=>window.lamejs?ok(window.lamejs):no(new Error("lamejs"));t.onerror=()=>no(new Error("lamejs load"));document.head.appendChild(t)}).catch(e=>{LAMEP=null;throw e}));
async function mp3Of(parts,sr,note){const L=await loadLame();let n=0;parts.forEach(p=>n+=p.length);const pcm=new Int16Array(n);let o=0;
 for(const p of parts)for(let i=0;i<p.length;i++){const x=Math.max(-1,Math.min(1,p[i]));pcm[o++]=x<0?x*32768:x*32767}
 const enc=new L.Mp3Encoder(1,sr,64),out=[],B=1152;let t=0;
 for(let i=0;i<n;i+=B){const m=enc.encodeBuffer(pcm.subarray(i,i+B));if(m.length)out.push(m);if(++t%300===0){note("MP3 বানানো হচ্ছে "+bn2(Math.round(i/n*100))+"%…");await new Promise(r=>setTimeout(r))}}
 const f=enc.flush();if(f.length)out.push(f);return new Blob(out,{type:"audio/mpeg"})}
// আয়াতের কোন কোন শব্দ সার্চে মিলেছে (আয়াত → শব্দ-নম্বরের সেট); মার্জ অডিওতে "শুধু সংশ্লিষ্ট অংশ" কাটার জন্য
const WORDS=new Map();
// পুনরাবৃত্তি: সবার জন্য সাধারণ বার (rsRep) + কোনো আয়াতের আলাদা বার (REP, পাতা খোলা থাকা পর্যন্ত)
const REP=new Map();
const repClamp=v=>{v=Math.floor(+v);return v>=1?Math.min(v,999):1};
const repAll=()=>{try{return repClamp(localStorage.getItem("rsRep"))}catch(e){}return 1};
const setAll=()=>{try{return repClamp(localStorage.getItem("rsSet"))}catch(e){}return 1}; // পুরো সেট একটানা কতবার
const REPBX=[];
const numBox=(cls,val,on)=>{const i=document.createElement("input");i.type="number";i.min="1";i.max="999";i.step="1";i.inputMode="numeric";i.className=cls;i.value=String(val);i.onchange=()=>{const v=repClamp(i.value);i.value=String(v);on(v)};i.onfocus=()=>{try{i.select()}catch(e){}};return i};
function spdBox(){const l=el("label","rs-rb"),sp=el("span","rs-rt","গতি"),i=document.createElement("input");i.type="number";i.min="0.8";i.max="1.6";i.step="0.05";i.inputMode="decimal";i.className="rs-num";i.value=String(spdOf());i.onchange=()=>{const v=spdClamp(i.value);i.value=String(v);try{localStorage.setItem("rsSpd",String(v))}catch(e){}};i.onfocus=()=>{try{i.select()}catch(e){}};l.append(sp,i,el("span",null,"×"));return l}
function repCtl(){const w=el("div","rs-rep"),mk=(t,key,val,cb)=>{const l=el("label","rs-rb"),sp=el("span","rs-rt",t),b=numBox("rs-num",val,v=>{try{localStorage.setItem(key,String(v))}catch(e){}cb&&cb(v)});l.append(sp,b,el("span",null,"বার"));return l};
 w.append(mk("প্রতিটি আয়াত","rsRep",repAll(),()=>{for(let n=REPBX.length;n--;){const x=REPBX[n];if(!x.i.isConnected)REPBX.splice(n,1);else if(!REP.has(x.k))x.i.value=String(repAll())}}),mk("পুরো সেট","rsSet",setAll()));return w}
const repOf=(s,a)=>REP.get(s+":"+a)||repAll();
const cutMode=()=>"full"; // সব ডাউনলোড সবসময় পুরো আয়াত
// শব্দের সীমা অনুমান: অডিওর শক্তি-রেখার (energy) গর্তগুলো থেকে ডিপি দিয়ে বাছাই, শব্দের অক্ষর-সংখ্যার অনুপাতে সময় মিলিয়ে — তাই যেকোনো ক্বারীর অডিওতে চলে, বাইরের সার্ভিস লাগে না; ফল আনুমানিক
function wordBounds(x,sr,W){
 const F=Math.round(sr*0.01),nF=Math.floor(x.length/F),N=W.length;if(N<1||nF<N*3)return null;
 const env=new Float32Array(nF);for(let i=0;i<nF;i++){let s=0;for(let j=i*F;j<(i+1)*F;j++)s+=x[j]*x[j];env[i]=Math.sqrt(s/F)}
 const sm=new Float32Array(nF);for(let i=0;i<nF;i++){let a=0,c=0;for(let j=Math.max(0,i-1);j<=Math.min(nF-1,i+1);j++){a+=env[j];c++}sm[i]=a/c}
 let mx=0;for(let i=0;i<nF;i++)if(sm[i]>mx)mx=sm[i];if(mx<=0)return null;
 const th=mx*0.06;let s0=0,s1=nF-1;while(s0<nF&&sm[s0]<th)s0++;while(s1>s0&&sm[s1]<th)s1--;s1++;if(s1-s0<N*3)return null;
 if(N===1)return[s0*F,s1*F];
 const C=[];for(let i=s0+2;i<s1-2;i++){const v=sm[i];if(v<=sm[i-1]&&v<=sm[i+1]&&v<=sm[i-2]&&v<=sm[i+2])C.push(i)}
 if(C.length<N-1)return null;
 const tot=W.reduce((a,b)=>a+b,0),E=(s1-s0)/tot,P=[s0].concat(C,[s1]),M=P.length,last=M-1;
 const pen=P.map((p,i)=>i===0||i===last?0:0.5*sm[p]/mx);
 const cost=(k,a,b)=>{const d=b-a;if(d<=1)return 1e3;const l=Math.log(d/(E*W[k-1]));return l*l};
 const INF=1e18;let prev=new Float64Array(M).fill(INF);prev[0]=0;const par=[];
 for(let k=1;k<N;k++){const cur=new Float64Array(M).fill(INF),pr=new Int32Array(M).fill(-1);
  for(let j=1;j<last;j++){let best=INF,bi=-1;for(let i=(k===1?0:1);i<j;i++){if(prev[i]>=INF)continue;if(k===1&&i!==0)continue;const v=prev[i]+cost(k,P[i],P[j]);if(v<best){best=v;bi=i}}if(bi>=0){cur[j]=best+pen[j];pr[j]=bi}}
  par.push(pr);prev=cur}
 let best=INF,bj=-1;for(let i=1;i<last;i++){if(prev[i]>=INF)continue;const v=prev[i]+cost(N,P[i],P[last]);if(v<best){best=v;bj=i}}
 if(bj<0)return null;
 const nodes=new Array(N+1);nodes[N]=last;nodes[N-1]=bj;for(let k=N-1;k>=2;k--)nodes[k-1]=par[k-1][nodes[k]];nodes[0]=0;
 return nodes.map(n=>P[n]*F)}
// ওয়াক্ফ চিহ্নের অবস্থান (quran-waqf.json: "সূরা:আয়াত" → "শব্দনম্বর+চিহ্ন,…"); কেবল থামার চিহ্ন (ۘ ۗ ۚ ۜ ۙ) অংশের সীমা; ۖ (মিলিয়ে পড়া) ও ۛ (দুইয়ের একটিতে থামা) সীমা ধরা হয় না
// অর্থ অনুযায়ী কাটার তালিকা (quran-meaning-cuts.json): রোগ নির্ণয় (dg) ও চিকিৎসা (tr) আলাদা সীমা
let MC=null;const meanLoad=async()=>{if(MC)return MC;try{MC=await rsFetch(BASE+"quran-meaning-cuts.json?v="+DV+"m29")}catch(e){MC={}}return MC};
let WQ=null;const wqLoad=async()=>{if(WQ)return WQ;try{WQ=await rsFetch(BASE+"quran-waqf.json?v="+DV)}catch(e){WQ={}}return WQ};
// আয়াতের শব্দ-নম্বর → ওয়াক্ফ চিহ্ন (শব্দের গায়ে লাগিয়ে দেখানো হয়)
const wqMarks=(s,a)=>{const v=WQ&&WQ[s+":"+a],m={};if(v)v.split(",").forEach(x=>{const r=/^(\d+)(.+)$/.exec(x);if(r)m[+r[1]]=r[2]});return m};
const WQL={"ۖ":"صلى","ۗ":"قلى","ۘ":"م","ۙ":"لا","ۚ":"ج","ۛ":"∴","ۜ":"س"};
// চিহ্ন শব্দের গায়ে না লাগিয়ে মুদ্রিত কুরআনের মতো শব্দের মাঝে আলাদা ছোট অক্ষর (ج, قلى, صلى, م, ∴…) হিসেবে বসে
const arFill=(box,s,a,t,hl,pr)=>{const m=wqMarks(s,a);let seg=null;t.split(" ").forEach((x,i)=>{const inP=!!(pr&&i+1>=pr[0]&&i+1<=pr[1]);if(i)(inP&&seg?seg:box).appendChild(document.createTextNode(" "));if(inP&&!seg){seg=el("span","rs-gold");box.appendChild(seg)}else if(!inP)seg=null;const h=seg||box;
 if(i===hl-1)h.appendChild(el("mark",null,x));else h.appendChild(document.createTextNode(x));const k=m[i+1];if(k){h.appendChild(document.createTextNode(" "));h.appendChild(el("span","rs-wq",[...k].map(c=>WQL[c]||"").filter(Boolean).join(" ")))}})};
/* সংশ্লিষ্ট অংশ (আরবি শব্দ-সীমা, ১-ভিত্তিক): অডিও কাটার নিয়মেরই হুবহু একই — ওয়াক্ফ-চিহ্নের মধ্যবর্তী বাক্যাংশ; অর্থ-অনুযায়ী কাটার তালিকায় (quran-meaning-cuts.json, tr) থাকলে সেটাই */
const AR_DIA=/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,arNz=x=>x.replace(AR_DIA,"").replace(/[ٱأإآ]/g,"ا").replace(/ى/g,"ي");
/* বাক্য শুরু করে এমন শব্দ (ফামা, ইয, লাকাদ, ছুম্মা, কুল, কালূ…): মিলে যাওয়া শব্দের বাক্যাংশ এখান থেকে শুরু/এখানে শেষ ধরা হয় */
const AR_ST=new Set("فما فلما فاذا فان فمن فهل فكيف فقد ولقد لقد ولما لما واذ اذ واذا اذا حتي ثم بل لكن ولكن انما وانما كيف هل ام الم افلم افلا اولم انه انهم انا اننا وانه وانا قل قال وقال فقال قالوا وقالوا فقالوا يا لو ولو لولا ومن فلا".split(" "));
const arPortion=(s,a,w,N,t)=>{if(!w||!N)return null;const al=wqAll(s,a),st=[];(t?t.split(" "):[]).forEach((x,i)=>{if(AR_ST.has(arNz(x)))st.push(i+1)});
 let lo=1,hi=N;for(const k of al)if(k<w)lo=Math.max(lo,k+1);for(const k of st)if(k<=w)lo=Math.max(lo,k);
 for(const k of al)if(k>=w)hi=Math.min(hi,k);for(const k of st)if(k>w)hi=Math.min(hi,k-1);
 if(hi-lo+1<4){const c=[N,...al.filter(k=>k>hi),...st.filter(k=>k-1>hi).map(k=>k-1)];hi=Math.min(Math.min(...c),lo+9)}
 if(hi-lo+1>14){lo=Math.max(lo,w-6);hi=Math.min(hi,w+5)}
 const ce=MC&&Array.isArray(MC[s+":"+a])?MC[s+":"+a].find(c=>c.w&&c.w.includes(w)&&Array.isArray(c.tr)):null;if(ce){lo=Math.max(1,ce.tr[0]);hi=Math.min(N,ce.tr[1])}
 return[Math.min(lo,w),Math.max(hi,w)]};
const wqAll=(s,a)=>{const v=WQ&&WQ[s+":"+a];return v?v.split(",").map(x=>{const m=/^(\d+)/.exec(x);return m?+m[1]:0}).filter(Boolean):[]};
const wqStops=(s,a)=>{const v=WQ&&WQ[s+":"+a];if(!v)return[];return v.split(",").map(x=>{const m=/^(\d+)(.+)$/.exec(x);return m&&/[ۘۗۚۜۙ]/.test(m[2])?+m[1]:0}).filter(Boolean)};
async function verseSegs(s,a,x,sr,ws,pad,mm){const t=((await chunk("a",s))||[])[a-1];if(!t)return null;const words=String(t).split(" "),N=words.length;
 const W=words.map(w=>Math.max(1,nz(w,true).length)),b=wordBounds(x,sr,W);if(!b)return null;
 const stops=pad<0?wqStops(s,a):[];
 const iv=[];[...ws].filter(w=>w>=1&&w<=N).sort((p,q)=>p-q).forEach(w=>{let lo=Math.max(1,w-pad),hi=Math.min(N,w+pad);if(pad<0){lo=1;for(const k of stops)if(k<w)lo=k+1;hi=N;for(const k of stops)if(k>=w){hi=k;break}const ce=mm&&MC&&Array.isArray(MC[s+":"+a])?MC[s+":"+a].find(c=>c.w&&c.w.includes(w)&&Array.isArray(c[mm])):null;if(ce){lo=Math.max(1,ce[mm][0]);hi=Math.min(N,ce[mm][1])}}const l=iv[iv.length-1];if(l&&lo<=l[1]+1)l[1]=Math.max(l[1],hi);else iv.push([lo,hi])});
 if(!iv.length||(iv.length===1&&iv[0][0]===1&&iv[0][1]===N))return null;const mg=Math.round(sr*0.04);
 return iv.map(r=>[Math.max(0,b[r[0]-1]-mg),Math.min(x.length,b[r[1]]+mg)])}
function i16(ch,a,b,fd){const n=Math.max(0,b-a),o=new Int16Array(n);for(let k=0;k<n;k++){let v=Math.max(-1,Math.min(1,ch[a+k]));if(fd){if(k<fd)v*=k/fd;else if(n-k<fd)v*=(n-k)/fd}o[k]=v<0?v*32768:v*32767}return o}
// নির্দিষ্ট শব্দ-সীমা [শুরু, শেষ] ধরে আয়াতের অডিও কাটা (রোগ নির্ণয়ের তালিকার জন্য)
async function rangeSegs(s,a,x,sr,rg){const t=((await chunk("a",s))||[])[a-1];if(!t)return null;const words=String(t).split(" "),N=words.length;
 const W=words.map(w=>Math.max(1,nz(w,true).length)),b=wordBounds(x,sr,W);if(!b)return null;const lo=Math.max(1,rg[0]),hi=Math.min(N,rg[1]);if(hi<lo||(lo===1&&hi===N))return null;const mg=Math.round(sr*0.04);
 return[[Math.max(0,b[lo-1]-mg),Math.min(x.length,b[hi]+mg)]]}
// পুরো আয়াত অক্ষত রেখে শুধু শুরু-শেষের ফাঁকা নীরবতা ছাঁটা + ভলিউম সমান + ছোট ফেড: ফলে আয়াত জোড়ার জায়গা (এমনকি ভিন্ন সূরার আয়াত) কানে ধরা পড়ে না
/* গতি: পিচ না বদলে সময় ছোট করা (WSOLA); rate>1 মানে দ্রুত। ডিফল্ট ১.১৫ */
const spdClamp=v=>{v=parseFloat(v);return v>=0.8&&v<=1.6?Math.round(v*100)/100:1.15};
const spdOf=()=>{try{const v=localStorage.getItem("rsSpd");return v==null?1.15:spdClamp(v)}catch(e){}return 1.15};
function tsm(x,sr,rate){if(!(rate>1.005||rate<0.995))return x;const n=x.length,N=2*Math.round(sr*0.015),H=N/2,Ha=H*rate,D=Math.round(sr*0.008),L=Math.ceil(n/rate)+N,y=new Float32Array(L),nw=new Float32Array(L),w=new Float32Array(N);
 if(n<N*3)return x;for(let i=0;i<N;i++)w[i]=0.5-0.5*Math.cos(2*Math.PI*i/N);let prev=0,end=0;
 for(let k=0;;k++){const o=k*H;if(o+N>L)break;let s=Math.round(k*Ha);
  if(k>0){const t=prev+H;let best=s,bc=-1e30;if(t+H<=n)for(let d=-D;d<=D;d+=4){const c=s+d;if(c<0||c+N>n)continue;let r=0;for(let i=0;i<H;i+=8)r+=x[c+i]*x[t+i];if(r>bc){bc=r;best=c}}s=best}
  if(s+N>n)break;for(let i=0;i<N;i++){y[o+i]+=x[s+i]*w[i];nw[o+i]+=w[i]}prev=s;end=o+N}
 for(let i=0;i<end;i++)if(nw[i]>1e-3)y[i]/=nw[i];return y.subarray(0,end)}
function smoothAyah(ch,sr){const n=ch.length;let pk=0;for(let i=0;i<n;i++){const v=Math.abs(ch[i]);if(v>pk)pk=v}
 if(pk<=0.0005)return new Int16Array(Math.round(sr*0.05));
 const th=pk*0.02;let a=0,b=n-1;while(a<n&&Math.abs(ch[a])<th)a++;while(b>a&&Math.abs(ch[b])<th)b--;
 a=Math.max(0,a-Math.round(sr*0.03));b=Math.min(n,b+1+Math.round(sr*0.06));const m=b-a;if(m<=0)return new Int16Array(0);
 let e=0;for(let i=a;i<b;i++)e+=ch[i]*ch[i];const rms=Math.sqrt(e/m)||0.1;let g=Math.max(0.6,Math.min(1.8,0.1/rms));g=Math.min(g,0.97/pk);
 const fi=Math.min(Math.round(sr*0.02),m>>1),fo=Math.min(Math.round(sr*0.04),m>>1),o=new Int16Array(m);
 for(let k=0;k<m;k++){let v=ch[a+k]*g;if(k<fi)v*=k/fi;else if(m-k<fo)v*=(m-k)/fo;v=Math.max(-1,Math.min(1,v));o[k]=v<0?v*32768:v*32767}return o}
async function mergeAudio(list,out,note,opt){if(!list.length)return;
 // কোনো সীমা নেই: প্রতিটি আয়াত নামিয়েই সাথে সাথে MP3-তে এনকোড হয়, মেমোরিতে শুধু ছোট MP3 টুকরো জমে — তাই হাজারো আয়াতেও একটাই ফাইল
 out.textContent="";let L=null;try{L=await loadLame()}catch(e){console.error(e)}
 if(!L){note("MP3 বানানোর লাইব্রেরি পাওয়া যায়নি (ইন্টারনেট দেখুন), তাই আয়াতগুলো ক্রমানুসারে একটার পর একটা চলছে");playList(setAll()>1?Array.from({length:setAll()},()=>list).flat():list,out);return}
 const sr=22050,AC=window.AudioContext||window.webkitAudioContext,ctx=new AC({sampleRate:sr}),enc=new L.Mp3Encoder(1,sr,64),mp3=[],B=1152,gap=new Int16Array(Math.round(sr*0.12));AS.loc=AS.net=0;let pool=null;try{pool=await mkEncPool()}catch(e){console.error(e);pool=null}const jobs=[];
 let wl=null;try{wl=await navigator.wakeLock.request("screen")}catch(e){}
 const push=pcm=>{for(let i=0;i<pcm.length;i+=B){const m=enc.encodeBuffer(pcm.subarray(i,i+B));if(m.length)mp3.push(new Uint8Array(m))}};
 const W=4,pf=[],get=i=>pf[i]||(pf[i]=fetchAud(list[i][0],list[i][1]).catch(()=>null));let ok=0,bad=0,cutN=0;
 for(let i=0;i<list.length;i++){for(let j=i;j<Math.min(i+W,list.length);j++)get(j);
  note("অডিও প্রস্তুত ও জোড়া লাগানো হচ্ছে "+bn2(i+1)+"/"+bn2(list.length)+(bad?" (বাদ: "+bn2(bad)+")":"")+"…");
  const ab=await get(i);pf[i]=null;
  if(!ab){bad++;if(!ok&&bad>=5)break;continue}
  try{const d=await ctx.decodeAudioData(ab),ch=d.getChannelData(0),pcm=smoothAyah(tsm(ch,sr,spdOf()),sr),rp=repOf(list[i][0],list[i][1]);
    if(pool){const fl=new Int16Array(pcm.length+gap.length);fl.set(pcm);fl.set(gap,pcm.length);await pool.room();jobs.push({p:pool.run(fl,sr),pcm:fl,rp})}else for(let q=0;q<rp;q++){push(pcm);push(gap)}
    ok++}catch(e){bad++;if(!ok&&bad>=5)break}
  if(i%10===0)await new Promise(r=>setTimeout(r))}
 try{ctx.close()}catch(x){}try{wl&&wl.release()}catch(x){}
 if(pool){note("MP3 ফাইল শেষ করা হচ্ছে…");for(const j of jobs){let c=await j.p;if(!c)c=encMain(L,j.pcm,sr);for(let q=0;q<j.rp;q++)mp3.push(c)}pool.close()}
 if(!ok){console.error("merge failed");note("একটা ফাইলে জোড়া লাগানো যায়নি (অডিও সার্ভার ফাইল দিতে দেয়নি), তাই আয়াতগুলো ক্রমানুসারে একটার পর একটা চলছে");out.textContent="";playList(setAll()>1?Array.from({length:setAll()},()=>list).flat():list,out);return}
 if(!pool){const f=enc.flush();if(f.length)mp3.push(new Uint8Array(f))}const SR=setAll(),parts=[];for(let q=0;q<SR;q++)for(const c of mp3)parts.push(c);const blob=new Blob(parts,{type:"audio/mpeg"}),ext="mp3";
 const url=URL.createObjectURL(blob),au=document.createElement("audio");au.controls=true;au.src=url;au.style.cssText="display:block;width:100%;margin-top:8px";
 const FN=(String(window.__sq||"").trim().replace(/\s*[,،，、]\s*/g,"-").replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,"-").replace(/\s+/g,"_").replace(/^[-_.]+|[-_.]+$/g,"").slice(0,60)||"quran-audio")+"."+ext;window.__lastFN=FN;const dl=els("a","display:none;pointer-events:none;flex-direction:column;align-items:center;gap:1px;flex:none;margin:0;padding:6px 12px;border-radius:12px;font-size:13px;background:var(--primary);color:#fff;text-decoration:none;font-weight:600;line-height:1.3","");dl.href=url;{const t1=document.createElement("span"),t2=document.createElement("span");t1.textContent="⬇ Download";t2.textContent=(Math.round(blob.size/1048576*10)/10)+" MB";t2.style.cssText="font-size:12px;font-weight:400;opacity:.9";dl.append(t1,t2)}dl.download=FN;dl.setAttribute("aria-hidden","true");dl.tabIndex=-1;dl.onclick=e=>{e.preventDefault();e.stopPropagation()};{const row=els("div","display:flex;align-items:center;gap:8px;margin-top:8px"),sh=document.createElement("button");au.style.cssText="flex:1 1 0;min-width:0;width:100%;margin:0";sh.type="button";sh.title="শেয়ার";sh.setAttribute("aria-label","শেয়ার");sh.style.cssText="flex:none;width:42px;height:42px;border-radius:50%;border:0;background:var(--primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0";
  sh.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16.1c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>';
  sh.onclick=()=>shareBlob(blob,FN);row.append(au,sh);out.append(row,dl)};
 note("✅ "+bn2(ok)+"টি আয়াতের অডিও একটি ফাইলে তৈরি হয়েছে"+(SR>1?" · পুরো সেট "+bn2(SR)+" বার":"")+(cutN?" (অংশ কাটা: "+bn2(cutN)+"টি আয়াত)":"")+(bad?" · "+bn2(bad)+"টির অডিও পাওয়া যায়নি, বাদ গেছে":"")+(AS.net?" · "+bn2(AS.net)+"টি আয়াত নেট থেকে এসেছে (ফোনে ফাইল ছিল না)":""));au.play().catch(()=>{})}
// ---------- অ্যাপের ভেতরে ফাইল সেভ (ওয়েবভিউ blob ডাউনলোড করে না, তাই নেটিভ DRDl দিয়ে Downloads ফোল্ডারে) ----------
async function saveBlob(blob,name){
 if(!window.DRDl){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();return}
 try{const id=String(Date.now()),S=3*512*1024;DRDl.begin(id,name,blob.type||"audio/mpeg");
  for(let o=0;o<blob.size;o+=S){const u8=new Uint8Array(await blob.slice(o,o+S).arrayBuffer());let b="";for(let i=0;i<u8.length;i+=8192)b+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));DRDl.chunk(id,btoa(b))}
  DRDl.end(id)}catch(e){try{DRDl.fail(String(e))}catch(x){}}}
window.__drSave=(b)=>saveBlob(b,window.__lastFN||"quran-audio.mp3");
// ---------- শেয়ার: প্রথমে ব্রাউজারের নিজস্ব ফাইল-শেয়ার, না চললে নেটিভ শেয়ার-শিট (DRDl.endShare) ----------
async function shareBlob(blob,name){
 try{const f=new File([blob],name,{type:blob.type||"audio/mpeg"});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name.replace(/\.[^.]+$/,"")});return}}catch(e){if(e&&e.name==="AbortError")return}
 if(!window.DRDl||!DRDl.endShare){alert("এই ফোনে শেয়ার চালু করা যায়নি");return}
 try{const id="s"+Date.now(),S=3*512*1024;DRDl.begin(id,name,blob.type||"audio/mpeg");
  for(let o=0;o<blob.size;o+=S){const u8=new Uint8Array(await blob.slice(o,o+S).arrayBuffer());let b="";for(let i=0;i<u8.length;i+=8192)b+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));DRDl.chunk(id,btoa(b))}
  DRDl.endShare(id,blob.type||"audio/mpeg")}catch(e){try{DRDl.fail(String(e))}catch(x){}}}
// ---------- আয়াতের অডিও থেকে অংশ কাটা ----------
const CUT=new Map(); // "সূরা:আয়াত" → [শুরু সেকেন্ড, শেষ সেকেন্ড]
const selList=()=>[...SELV].map(k=>k.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
const mkBtn=(t,f)=>{const b=el("button","rs-wb",t);b.type="button";b.onclick=f;return b};
let CURT=null,SHOWT=null;
function cutEditor(list,host,res,note,topic){
 host.textContent="";res.textContent="";
 if(list.length>40){alert("অংশ কাটার জন্য একবারে সর্বোচ্চ "+bn2(40)+"টি আয়াত বাছুন");return}
 const fmt=x=>bn2((Math.round(x*10)/10).toFixed(1))+" সে.";
 host.append(els("div","font-size:12.5px;color:var(--primary);margin:6px 0","✂ প্রতিটি আয়াতের যতটুকু দরকার ততটুকু বেছে নিন: অডিও চালিয়ে যেখানে শুরু করতে চান সেখানে ‘শুরু এখানে’, যেখানে শেষ করতে চান সেখানে ‘শেষ এখানে’ চাপুন (বা স্লাইডার টানুন)। কিছু না বদলালে পুরো আয়াত যাবে।"));
 const sum=els("div","font-size:12.5px;margin:6px 0"),S={};
 const upd=()=>{let t=0,c=0;list.forEach(([a,b])=>{const x=S[a+":"+b];if(x&&x.d){t+=x.e-x.s;if(x.s>0.05||x.e<x.d-0.05)c++}});sum.textContent="কাটা হয়েছে "+bn2(c)+"টি আয়াতে · বেছে নেওয়া অংশ মোট প্রায় "+bn2(Math.round(t))+" সেকেন্ড (আয়াতের মাঝে ০.৫ সেকেন্ড করে বিরতি যোগ হবে)"};
 list.forEach(([s,a])=>{
  const k=s+":"+a,x=S[k]={d:0,s:0,e:0},row=els("div","border:1px solid var(--border-light);border-radius:10px;padding:8px;margin:6px 0"),head=els("div","font-weight:700;font-size:13px","সূরা "+SN[s-1]+" — "+bn2(s)+":"+bn2(a)),au=document.createElement("audio");
  au.controls=true;au.preload="metadata";au.setAttribute("controlsList","nodownload");au.style.cssText="display:block;width:100%;margin:6px 0";
  const urls=audUrls(s,a);let ui=0;au.src=urls[0];au.onerror=()=>{if(++ui<urls.length)au.src=urls[ui];else head.textContent+=" — অডিও পাওয়া যায়নি"};
  const r1=document.createElement("input"),r2=document.createElement("input"),l1=els("div","font-size:12.5px"),l2=els("div","font-size:12.5px");
  [r1,r2].forEach(r=>{r.type="range";r.min="0";r.max="1";r.step="0.05";r.value="0";r.style.cssText="width:100%;margin:2px 0 6px"});
  const set=(sv,ev)=>{if(!x.d)return;let A=Math.max(0,Math.min(+sv||0,x.d)),B=Math.max(0,Math.min(+ev||0,x.d));if(B-A<0.1){if(A+0.1<=x.d)B=A+0.1;else A=Math.max(0,B-0.1)}
   x.s=A;x.e=B;r1.value=A;r2.value=B;l1.textContent="শুরু: "+fmt(A);l2.textContent="শেষ: "+fmt(B)+" (পুরো অডিও "+fmt(x.d)+")";
   if(A>0.05||B<x.d-0.05)CUT.set(k,[A,B]);else CUT.delete(k);upd()};
  au.addEventListener("loadedmetadata",()=>{if(!isFinite(au.duration)||!au.duration)return;x.d=au.duration;r1.max=r2.max=String(x.d);const c=CUT.get(k);set(c?c[0]:0,c?c[1]:x.d)});
  r1.oninput=()=>set(r1.value,x.e);r2.oninput=()=>set(x.s,r2.value);
  const bs=mkBtn("শুরু এখানে",()=>set(au.currentTime,x.e)),be=mkBtn("শেষ এখানে",()=>set(x.s,au.currentTime)),
   bp=mkBtn("▶ নির্বাচিত অংশ শুনুন",()=>{if(!x.d)return;au.currentTime=x.s;au.play().catch(()=>{});const stop=()=>{if(au.currentTime>=x.e-0.02){au.pause();au.removeEventListener("timeupdate",stop)}};au.addEventListener("timeupdate",stop)}),
   br=mkBtn("↺ পুরোটা",()=>set(0,x.d)),bt=els("div","display:flex;flex-wrap:wrap;gap:6px;margin-top:4px");bt.append(bs,be,bp,br);
  row.append(head,au,l1,r1,l2,r2,bt);host.appendChild(row)});
 const go=mkBtn("🔊 বেছে নেওয়া অংশগুলো মার্জ ও ডাউনলোড",async()=>{if(topic){topic.cuts={};CUT.forEach((v,k)=>{if(topic.refs.includes(k))topic.cuts[k]=v});TS.save()}await mergeAudio(list,res,note)});
 go.style.margin="6px 0";host.append(sum,go)}

// ---------- নিজের বিষয়-তালিকা (সংরক্ষণ: নিজের ইউজার-ডকুমেন্টে + এই ডিভাইসে) ----------
const TS={list:[],ok:false,
 local(){try{return JSON.parse(localStorage.getItem("rsTopics")||"null")}catch(e){return null}},
 async cloud(){return null},
 clean(d){return(d&&Array.isArray(d.topics)?d.topics:[]).filter(t=>t&&typeof t.name==="string"&&Array.isArray(t.refs)).map(t=>({id:String(t.id||("t"+Math.random().toString(36).slice(2,8))),name:t.name.slice(0,60),refs:t.refs.filter(r=>/^\d{1,3}:\d{1,3}$/.test(r)),cuts:t.cuts&&typeof t.cuts==="object"?t.cuts:{}}))},
 async load(force){if(this.ok&&!force)return this.list;let d=null;try{const c=await this.cloud();if(c){const v=await c.get();if(v)d=JSON.parse(v)}}catch(e){console.error(e)}
  if(!d)d=this.local();this.list=this.clean(d);this.ok=true;return this.list},
 async save(){const v=JSON.stringify({v:1,topics:this.list});try{localStorage.setItem("rsTopics",v)}catch(e){}let ok=false;try{const c=await this.cloud();if(c){await c.set(v);ok=true}}catch(e){console.error(e)}return ok},
 addRefs(name,keys){name=name.trim().slice(0,60);let t=this.list.find(x=>x.name===name);const isNew=!t;if(!t){t={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,refs:[],cuts:{}};this.list.push(t)}
  const have=new Set(t.refs);let added=0;keys.forEach(k=>{if(!have.has(k)){have.add(k);added++}});
  t.refs=[...have].map(k=>k.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]).map(x=>x[0]+":"+x[1]);return{t,added,isNew}}};
async function topicAddPanel(host){
 if(host.firstChild){host.textContent="";return}
 if(!SELV.size)return alert("আগে আয়াতের নিচের “বাছাই” বক্সে টিক দিন");
 await TS.load();
 const w=els("div","border:1px solid var(--border-light);border-radius:10px;padding:8px;margin:6px 0"),inp=document.createElement("input"),dl=document.createElement("datalist"),msg=els("div","font-size:12.5px;margin-top:6px");
 dl.id="rsTl"+Date.now();TS.list.forEach(t=>{const o=document.createElement("option");o.value=t.name;dl.appendChild(o)});
 inp.setAttribute("list",dl.id);inp.placeholder="বিষয়ের নাম (নতুন লিখুন বা তালিকা থেকে বাছুন)";inp.maxLength=60;inp.style.cssText="width:100%;box-sizing:border-box;padding:8px;border:1px solid var(--border-light);border-radius:8px;background:var(--card-bg);color:inherit;font:inherit;margin-bottom:6px";
 const go=mkBtn("➕ যোগ করুন",async()=>{const name=inp.value.trim();if(!name){msg.textContent="বিষয়ের নাম লিখুন";return}
  const r=TS.addRefs(name,selList().map(x=>x[0]+":"+x[1]));go.disabled=true;msg.textContent="সংরক্ষণ হচ্ছে…";const cloud=await TS.save();go.disabled=false;
  msg.textContent=(r.isNew?"নতুন বিষয় “"+name+"” তৈরি হয়েছে। ":"")+bn2(r.added)+"টি আয়াত “"+name+"” বিষয়ে যোগ হয়েছে (মোট "+bn2(r.t.refs.length)+"টি)"+" (এই ফোনেই সংরক্ষিত)"});
 w.append(inp,dl,go,msg);host.appendChild(w);inp.focus()}
function topicTools(t){const d=els("div","display:flex;flex-wrap:wrap;gap:6px;margin-top:6px");
 d.append(
  mkBtn("🗑 বাছাই করা আয়াত বিষয় থেকে বাদ দিন",async()=>{const l=[...SELV].filter(k=>t.refs.includes(k));if(!l.length)return alert("আগে যে আয়াত বাদ দেবেন তার নিচের “বাছাই” বক্সে টিক দিন");
   t.refs=t.refs.filter(k=>!l.includes(k));l.forEach(k=>{SELV.delete(k);delete t.cuts[k];CUT.delete(k)});selChange();await TS.save();openTopic(t)}),
  mkBtn("✏ নাম বদলান",async()=>{const n=prompt("বিষয়ের নতুন নাম",t.name);if(n&&n.trim()){t.name=n.trim().slice(0,60);await TS.save();openTopic(t)}}),
  mkBtn("❌ বিষয়টি মুছুন",async()=>{if(!confirm("“"+t.name+"” বিষয়টি (এর "+bn2(t.refs.length)+"টি আয়াতের তালিকাসহ) মুছে ফেলবেন? আয়াত নিজে মুছবে না, শুধু এই তালিকাটা।"))return;TS.list=TS.list.filter(x=>x!==t);await TS.save();$("rsOut").innerHTML="";$("rsInfo").textContent="";CURT=null;SHOWT&&SHOWT(true)}));return d}
async function openTopic(t){window.__bq="";GEN++;CURT=t;SELV.clear();selChange();const out=$("rsOut"),info=$("rsInfo");out.innerHTML="";info.textContent="";window.__sq=t.name;
 CUT.clear();Object.keys(t.cuts||{}).forEach(k=>{const v=t.cuts[k];if(Array.isArray(v)&&v.length===2)CUT.set(k,v)});
 if(!t.refs.length){info.textContent="“"+t.name+"” বিষয়ে এখনো কোনো আয়াত নেই। সার্চ করে আয়াত বাছাই করে ‘বিষয়ে যোগ’ করুন।";info.appendChild(topicTools(t));return}
 SB.set(new Set(t.refs));info.textContent="📚 বিষয়: “"+t.name+"” — "+bn2(t.refs.length)+"টি আয়াত (আপনার সংরক্ষিত তালিকা)";
 allCopy(info,[{refs:t.refs}],t.refs.map(r=>r.split(":").map(Number)));info.appendChild(topicTools(t));verses(out,t.refs.map(r=>r+":0"),"",0)}
function exportTopics(){const b=new Blob([JSON.stringify({v:1,topics:TS.list},null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="research-topics-backup.json";document.body.appendChild(a);a.click();a.remove()}
async function importTopics(file){try{const d=TS.clean(JSON.parse(await file.text()));let n=0;d.forEach(t=>{const r=TS.addRefs(t.name,t.refs);Object.assign(r.t.cuts,t.cuts);n+=r.added});await TS.save();alert(bn2(d.length)+"টি বিষয় ফেরানো হয়েছে ("+bn2(n)+"টি আয়াত যোগ হয়েছে)");SHOWT&&SHOWT(true)}catch(e){alert("ফাইলটি পড়া যায়নি — এটি এই পেজ থেকে নামানো ব্যাকআপ ফাইল তো?")}}
// ---------- আয়াত PDF ডাউনলোড: প্রতিটি পেজ ক্যানভাসে আঁকা হয় (ব্রাউজারের নিজের টেক্সট ইঞ্জিনে, তাই আরবি ও বাংলা হরফ ঠিকঠাক জোড়া লাগে), তারপর ছবিগুলো একটি PDF ফাইলে জোড়া হয় ----------
function jpegPdf(imgs,W,H){
 const enc=new TextEncoder(),parts=[],offs=[],N=imgs.length;let len=0;
 const add=d=>{const u=typeof d==="string"?enc.encode(d):d;parts.push(u);len+=u.length};
 const obj=(n,fn)=>{offs[n]=len;add(n+" 0 obj\n");fn();add("\nendobj\n")};
 const PW=595.28,PH=Math.round(595.28*H/W*100)/100;
 add("%PDF-1.4\n");
 obj(1,()=>add("<< /Type /Catalog /Pages 2 0 R >>"));
 obj(2,()=>add("<< /Type /Pages /Count "+N+" /Kids ["+imgs.map((_,i)=>(3+i*3)+" 0 R").join(" ")+"] >>"));
 imgs.forEach((u8,i)=>{const pg=3+i*3,ct=pg+1,im=pg+2,cs="q "+PW+" 0 0 "+PH+" 0 0 cm /Im0 Do Q";
  obj(pg,()=>add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im0 "+im+" 0 R >> >> /Contents "+ct+" 0 R >>"));
  obj(ct,()=>add("<< /Length "+cs.length+" >>\nstream\n"+cs+"\nendstream"));
  obj(im,()=>{add("<< /Type /XObject /Subtype /Image /Width "+W+" /Height "+H+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+u8.length+" >>\nstream\n");add(u8);add("\nendstream")})});
 const xr=len,T=3+3*N;let x="xref\n0 "+T+"\n0000000000 65535 f \n";
 for(let i=1;i<T;i++)x+=String(offs[i]).padStart(10,"0")+" 00000 n \n";
 add(x+"trailer\n<< /Size "+T+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF\n");
 return new Blob(parts,{type:"application/pdf"})}
async function ayatPdf(list,title,say){
 const W=1240,H=1754,M=96,CW=W-2*M,FOOT=70,BOT=H-M-FOOT;
 const AR='"Amiri","Noto Naskh Arabic","Droid Arabic Naskh","Traditional Arabic",serif',BNF='"Noto Sans Bengali","Hind Siliguri","Siyam Rupali","Nirmala UI",sans-serif';
 const f=(w,px,fam)=>w+" "+px+"px "+fam;
 say("⏳ আয়াত লোড হচ্ছে…");
 try{await Promise.all([document.fonts.load(f(400,38,AR),"بِسْمِ"),document.fonts.load(f(700,38,AR),"بِسْمِ"),document.fonts.load(f(400,26,BNF),"আয়াত"),document.fonts.load(f(700,26,BNF),"আয়াত")])}catch(e){}
 await Promise.all([...new Set(list.map(x=>x[0]))].map(z=>Promise.all([chunk("a",z),chunk(TR,z)])));
 const mc=document.createElement("canvas").getContext("2d");
 const wrap=(text,font,maxW,rtl)=>{mc.font=font;mc.direction=rtl?"rtl":"ltr";const ws=String(text||"").split(/\s+/).filter(Boolean),out=[];let cur="";
  for(const w of ws){const t=cur?cur+" "+w:w;if(cur&&mc.measureText(t).width>maxW){out.push(cur);cur=w}else cur=t}
  if(cur)out.push(cur);return out};
 const pages=[[]];let y=M;
 const put=(o,h)=>{if(y+h>BOT){pages.push([]);y=M}o.y=y;pages[pages.length-1].push(o);y+=h};
 // শিরোনাম (প্রথম পেজ)
 let dt="";try{dt=new Date().toLocaleDateString("bn-BD",{year:"numeric",month:"long",day:"numeric"})}catch(e){}
 put({t:"Masnun Ruqyah",font:f(700,40,BNF),c:"#0c2050",x:M,al:"left",dir:"ltr"},60);
 wrap(title,f(700,34,BNF),CW,false).forEach(l=>put({t:l,font:f(700,34,BNF),c:"#111",x:M,al:"left",dir:"ltr"},50));
 put({t:"মোট "+bn2(list.length)+"টি আয়াত"+(dt?" · "+dt:""),font:f(400,22,BNF),c:"#666",x:M,al:"left",dir:"ltr"},40);
 put({line:1,c:"#0c2050",w:3},30);
 for(let i=0;i<list.length;i++){
  const[s,a]=list[i],A=((await chunk("a",s))||[])[a-1],B=((await chunk(TR,s))||[])[a-1];if(A==null)continue;
  const al=wrap(A,f(400,38,AR),CW,true),bl=wrap(B||"",f(400,26,BNF),CW,false);
  const ref="সূরা "+(typeof SBN!=="undefined"?SBN[s-1]:SN[s-1])+" — "+bn2(s)+":"+bn2(a),hh=44+al.length*76+(bl.length?10+bl.length*42:0)+40;
  if(hh<=BOT-M&&y+hh>BOT){pages.push([]);y=M}
  put({t:ref,font:f(700,24,BNF),c:"#0c2050",x:M,al:"left",dir:"ltr"},44);
  al.forEach(l=>put({t:l,font:f(400,38,AR),c:"#111",x:W-M,al:"right",dir:"rtl"},76));
  if(bl.length){y+=10;bl.forEach(l=>put({t:l,font:f(400,26,BNF),c:"#333",x:M,al:"left",dir:"ltr"},42))}
  put({line:1,c:"#d8dbe2",w:1},40);
  if(i%10===9){say("⏳ সাজানো হচ্ছে… "+bn2(i+1)+"/"+bn2(list.length));await new Promise(r=>setTimeout(r))}}
 const N=pages.length,imgs=[];
 for(let p=0;p<N;p++){
  say("⏳ পেজ বানানো হচ্ছে… "+bn2(p+1)+"/"+bn2(N));
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");
  g.fillStyle="#fff";g.fillRect(0,0,W,H);g.textBaseline="alphabetic";
  for(const o of pages[p]){
   if(o.line){g.fillStyle=o.c;g.fillRect(M,o.y+o.w,CW,o.w);continue}
   g.font=o.font;g.fillStyle=o.c;g.direction=o.dir;g.textAlign=o.al;
   const fs=parseInt(o.font.match(/(\d+)px/)[1]);g.fillText(o.t,o.x,o.y+Math.round(fs*(o.dir==="rtl"?1.25:1.05)))}
  g.direction="ltr";g.fillStyle="#d8dbe2";g.fillRect(M,H-M-FOOT+18,CW,1);
  g.font=f(400,20,BNF);g.fillStyle="#777";g.textAlign="left";g.fillText("Masnun Ruqyah",M,H-M-FOOT+52);
  g.textAlign="right";g.fillText("পৃষ্ঠা "+bn2(p+1)+" / "+bn2(N),W-M,H-M-FOOT+52);
  const bl=await new Promise(r=>cv.toBlob(r,"image/jpeg",0.85));
  imgs.push(new Uint8Array(await bl.arrayBuffer()));cv.width=cv.height=0;
  await new Promise(r=>setTimeout(r))}
 say("⏳ PDF ফাইল জোড়া হচ্ছে…");
 const pdf=jpegPdf(imgs,W,H),nm=("আয়াত-"+String(title).replace(/[\\\/:*?"<>|\n\r]+/g," ").trim().slice(0,40)).trim()+".pdf";
 await saveBlob(pdf,nm);return N}
function audioBar(info,all,cb,title){if(!all.length)return;const box=els("div","margin-top:8px"),note=els("div","font-size:12px;color:var(--text-muted);margin-top:4px"),out=el("div"),row=els("div","display:flex;flex-wrap:wrap;gap:6px;align-items:center");
 const sel=el("select","rs-sel");RECS.forEach(r=>{const o=document.createElement("option");o.value=r[0];o.textContent=r[1];sel.appendChild(o)});sel.value=recId();sel.onchange=()=>{try{localStorage.setItem("rsRec",sel.value)}catch(e){}};
 const b1=el("button","rs-wb","🔊 সব আয়াত মার্জ অডিও ("+bn2(all.length)+")"),b2=el("button","rs-wb","🔊 বাছাই করা আয়াত মার্জ (০)");b1.type=b2.type="button";b1.className="rs-wb rs-act pri";b2.className="rs-wb rs-act";
 const pdfB=(label,get,empty)=>{const b=el("button","rs-wb rs-act",label);b.type="button";b.onclick=async()=>{const l=get();if(!l.length)return alert("আগে আয়াতের নিচের “বাছাই” বক্সে টিক দিন");if(l.length>300&&!confirm("আয়াত অনেক ("+bn2(l.length)+"টি) — PDF বানাতে সময় লাগবে ও ফাইল বড় হবে। চালিয়ে যাবেন?"))return;b.disabled=true;const o=b.textContent;let ok=false;try{await ayatPdf(l,title||window.__sq||"কুরআনের আয়াত",t=>{b.textContent=t});ok=true}catch(e){console.error(e)}b.textContent=ok?"✅ PDF সেভ হয়েছে":"PDF বানানো যায়নি";setTimeout(()=>{b.textContent=o;b.disabled=false},2500)};return b};
 const b5=pdfB("📄 সব আয়াত PDF ("+bn2(all.length)+")",()=>all),b6=pdfB("📄 বাছাই করা আয়াত PDF (০)",()=>selList());
 selUp.push(()=>{b6.textContent="📄 বাছাই করা আয়াত PDF ("+bn2(SELV.size)+")"});
 const mkRes=()=>[els("div","font-size:12px;color:var(--text-muted);margin-top:10px"),el("div")],[n1,o1]=mkRes(),[n2,o2]=mkRes(),clr=(o,n)=>{o.querySelectorAll("audio").forEach(a=>{try{a.pause()}catch(e){}});o.textContent="";n.textContent=""};
 b1.onclick=()=>{clr(o2,n2);mergeAudio(all,o1,t=>n1.textContent=t)};
 b2.onclick=()=>{const l=[...SELV].map(k=>k.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);if(!l.length)return alert("আগে আয়াতের নিচের “বাছাই” বক্সে টিক দিন");clr(o1,n1);mergeAudio(l,o2,t=>n2.textContent=t)};
 selUp.push(()=>{b2.textContent="🔊 বাছাই করা আয়াত মার্জ ("+bn2(SELV.size)+")"});
 
  
  const b3=el("button","rs-wb","📚 বাছাই করা আয়াত বিষয়ে যোগ ("+bn2(SELV.size)+")"),pn=el("div"),ed=el("div");b3.type="button";b3.className="rs-wb rs-act";
  b3.onclick=()=>topicAddPanel(pn);
  selUp.push(()=>{b3.textContent="📚 বাছাই করা আয়াত বিষয়ে যোগ ("+bn2(SELV.size)+")"});
    const grp=(t,cls,ex,...k)=>{const g=el("div","rs-grp"),r=el("div","rs-gr"+(cls?" "+cls:""));g.append(el("div","rs-gh",t));r.append(...k);g.appendChild(r);if(ex)g.append(...ex);return g};
  const panel=el("div","rs-panel");const ag=grp("অডিও সেটিং","one",null,sel,repCtl());
  panel.append(grp("সব আয়াত","",[n1,o1],...(cb?[cb]:[]),b1,b5),grp("বাছাই করা আয়াত","",[n2,o2],b2,b6,b3),ag);
  box.append(panel,pn,ed);info.appendChild(box)}
const SB={n:0,t:0,m:new Map,set(u){this.t=u.size;this.m=new Map([...u].map((k,i)=>[k,i+1]))}};
function verses(host,refs,fgl,off){let shown=0,fail=[];const step=15,g=GEN;
 const more=el("button","rs-more","আয়াত লোড হচ্ছে…");more.type="button";
 const one=async([s,a,w])=>{const n=SB.m.get(s+":"+a);const[A,B]=await Promise.all([chunk("a",s),chunk(TR,s)]);const t=(A||[])[a-1];if(t==null)return null;const bn=B||[];await wqLoad();
   const box=el("div","rs-vi"),rf=el("div","rs-vr");rf.append("সূরা ",el("span","rs-ar",SN[s-1])," — "+bn2(s)+":"+bn2(a));
   if(n){const nb=els("span","display:inline-block;margin:0 0 4px;padding:1px 9px;border-radius:10px;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary);font-size:12px;font-weight:700","ক্রমিক "+bn2(n)+" / "+bn2(SB.t));rf.prepend(nb,document.createElement("br"))}
   const tx=el("div","rs-vt rs-ar"),tb=el("div","rs-vb"),wb=el("button","rs-wb","শব্দে শব্দে অর্থ"),wh=el("div","rs-ww");
   wb.type="button";
   if(!markQ(tb,bn[a-1]||"",window.__bq)){markBn(tb,bn[a-1]||"",fgl);
   chunk("w",s,1).then(async W=>{const m=(W[a-1]||"").split("|")[w-1];let ok=false;try{const M=await chunk("m",s,1);const r=alRange((M||[])[a-1],w);if(r)ok=markRange(tb,bn[a-1]||"",r)}catch(e){}if(!ok&&m&&m!==fgl)markBn(tb,bn[a-1]||"",m)}).catch(()=>{});}
   try{await meanLoad()}catch(e){}
   const NW=t.split(" ").length,PR=arPortion(s,a,w,NW,t);
   arFill(tx,s,a,t,w,PR);
   if(PR){const nb=(bn[a-1]||"").split(" ").length;const ceb=MC&&Array.isArray(MC[s+":"+a])?MC[s+":"+a].find(c=>c.w&&c.w.includes(w)&&Array.isArray(c.bn)&&c.bn.length===2&&c.bn[0]>=1&&c.bn[1]>=c.bn[0]):null;if(ceb)setBnPort(tb,[ceb.bn[0]-1,Math.min(ceb.bn[1],nb)-1]);else if(PR[0]<=1&&PR[1]>=NW)setBnPort(tb,[0,nb-1]);else chunk("m",s,1).then(M=>{const r=bnPortion((M||[])[a-1],PR,NW,nb);if(r)setBnPort(tb,r)}).catch(()=>{})}
   let wl=false;wb.onclick=async()=>{wh.classList.toggle("on");if(wl)return;wl=true;wh.textContent="লোড হচ্ছে…";
    try{const m=((await chunk("w",s))||[])[a-1].split("|");wh.textContent="";t.split(" ").forEach((x,i)=>{const c=el("div","rs-wc"+(i===w-1?" hl":"")),ar=el("div","rs-wa rs-ar",x),b=el("div","rs-wm",m[i]||"");c.append(ar,b);wh.appendChild(c)})}catch(e){wh.textContent="লোড করা যায়নি — আবার চাপুন";wl=false}};
   const ft=el("div","rs-vf"),va=el("div","rs-va");ft.append(rf,el("span","rs-vw rs-ar",t.split(" ")[w-1]||""),el("span","rs-vm",fgl||""));va.append(wb,copyBtn("📋 কপি",()=>vtext(s,a)),playBtn(s,a),selBox(s,a));box.append(tx,tb,ft,va,wh);return box};
 let busy=false,vis=false,io=null;
 const add=async()=>{if(busy)return;busy=true;more.disabled=true;more.style.display="";more.textContent="আয়াত লোড হচ্ছে…";
  const st=shown,batch=fail.splice(0).concat(refs.slice(shown,shown+step).map((r,i)=>[...r.split(":").map(Number),off+st+i+1]));shown=Math.min(refs.length,shown+step);
  for(const r of batch){if(g!==GEN){busy=false;io&&io.disconnect();return}let box=null;try{box=await one(r)}catch(e){fail.push(r);continue}if(g!==GEN){busy=false;io&&io.disconnect();return}if(box)host.insertBefore(box,more);await new Promise(z=>setTimeout(z))}
  busy=false;more.disabled=false;
  if(fail.length){more.style.display="";more.textContent=bn2(fail.length)+"টি আয়াত লোড হয়নি — আবার চেষ্টা করতে চাপুন"}
  else if(shown<refs.length){more.style.display="";more.textContent="⏳ আরও আয়াত আসছে… ("+bn2(refs.length-shown)+" বাকি)";if(vis)add()}
  else{more.style.display="none";io&&io.disconnect()}};
 host.appendChild(more);more.onclick=add;
 if("IntersectionObserver"in window){io=new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting;if(g!==GEN){io.disconnect();return}if(vis&&!fail.length&&shown<refs.length)add()},{rootMargin:"800px 0px"});io.observe(more)}
 add()}
const vset=l=>{const u=new Set();let o=0;l.forEach(f=>f.refs.forEach(r=>{o++;u.add(r.split(":").slice(0,2).join(":"))}));return{o,u:u.size,s:u}};
const lst=(it,exact)=>it.bn?(ALLF?it.r.forms:it.mf):((exact||it.sc===60||!it.mf)?it.r.forms:it.mf);
function card(it,exact){const r=it.r,c=el("div","rs-root"),h=el("div","rs-rh"),
 l=el("div","rs-rl rs-ar"),
 m=el("div","rs-rm"),ch=el("div","rs-ch","▾");
 {const L=lst(it,exact),v=vset(L);m.innerHTML="<b>"+bn2(v.o)+"</b>টি ফলাফল · <b>"+bn2(L.length)+"</b>টি রূপ"+(v.o!==r.n&&!(it.bn&&!ALLF)?"<br><small>(রুটে মোট "+bn2(r.n)+"টি)</small>":"")}
 [...r.r].forEach(x=>l.appendChild(el("span",null,x)));h.append(l,m,ch);const fb=el("div","rs-forms");c.append(h,fb);let built=false;
 const list=lst(it,exact),base=SB.n;SB.n+=vset(list).o;
 h.onclick=()=>{c.classList.toggle("open");if(built)return;built=true;
  {const set=new Set();list.forEach(f=>f.refs.forEach(r=>set.add(r.split(":").slice(0,2).join(":"))));const all=[...set].map(r=>r.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
   const cb=copyBtn("📋 এই শব্দের সব আয়াত কপি ("+bn2(all.length)+")",async()=>{await Promise.all([...new Set(all.map(x=>x[0]))].map(z=>Promise.all([chunk("a",z),chunk(TR,z)])));const o=[];for(const [z,y] of all)o.push(await vtext(z,y));return o.join("\n\n")});
   cb.style.margin="6px 0";fb.append(cb)}
  {let o=base;[...list].sort((a,b)=>b.refs.length-a.refs.length).forEach(f=>{f.__off=o;o+=f.refs.length})}
  [...list].sort((a,b)=>b.refs.length-a.refs.length).forEach(f=>{const row=el("div","rs-f"),w=el("div"),fw=el("div","rs-fw rs-ar",f.t),fm=el("div","rs-fm",f.m||""),fl=el("div","rs-fl rs-ar",f.l||""),ct=el("div","rs-fc",bn2(f.refs.length)+" বার"+(f.p&&POSBN[f.p]?" · "+POSBN[f.p]:"")),vh=el("div","rs-v");
   row.append(el("span","rs-fa","▾"),ct,el("span","rs-fd","—"),fw,fm);let vb=false;
   row.onclick=()=>{row.classList.toggle("open");if(vb)return;vb=true;verses(vh,f.refs,f.m,f.__off)};
   fb.append(row,vh)});
  {let bud=24;const fs=[...fb.querySelectorAll(".rs-f")],srt=[...list].sort((a,b)=>b.refs.length-a.refs.length);fs.forEach((f,i)=>{if(bud>0){f.click();bud-=Math.min(srt[i].refs.length,15)}})}
  if(it.mf&&it.sc!==60&&list.length<r.forms.length){const all=el("button","rs-more","এই রুটের সব রূপ দেখান ("+bn2(r.forms.length)+")");all.type="button";all.onclick=()=>{fb.innerHTML="";built=false;it.sc=100;c.classList.remove("open");h.onclick()};fb.append(all)}};
 return c}
let tm=0;
async function refView(s,a,e){GEN++;CURT=null;const out=$("rsOut"),info=$("rsInfo");
 if(s<1||s>114){info.textContent="সূরা নম্বর ১ থেকে ১১৪-এর মধ্যে হতে হবে";return}
 info.textContent="⏳ আয়াত লোড হচ্ছে…";let A,B;
 try{[A,B]=await Promise.all([chunk("a",s),chunk(TR,s)])}catch(x){info.textContent="ডেটা লোড করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন";return}
 A=A||[];B=B||[];
 if(a<1||a>A.length){info.textContent="সূরা "+SN[s-1]+"-এ মোট "+bn2(A.length)+"টি আয়াত — "+bn2(a)+" নম্বর আয়াত নেই";return}
 e=Math.min(Math.max(e,a),A.length,a+29);
 info.textContent="সূরা "+SN[s-1]+" — "+bn2(s)+":"+bn2(a)+(e>a?" থেকে "+bn2(e):"");out.innerHTML="";await wqLoad();
 for(let i=a;i<=e;i++){const box=el("div","rs-vi"),rf=el("div","rs-vr");rf.append("সূরা ",el("span","rs-ar",SN[s-1])," — "+bn2(s)+":"+bn2(i));
  const tx=el("div","rs-vt rs-ar"),tb=el("div","rs-vb",B[i-1]||""),va=el("div","rs-va"),wb=el("button","rs-wb","শব্দে শব্দে অর্থ"),wh=el("div","rs-ww");wb.type="button";arFill(tx,s,i,A[i-1],0);
  let wl=false;wb.onclick=async()=>{wh.classList.toggle("on");if(wl)return;wl=true;wh.textContent="লোড হচ্ছে…";
   try{const m=((await chunk("w",s))||[])[i-1].split("|");wh.textContent="";A[i-1].split(" ").forEach((x,k)=>{const c=el("div","rs-wc"),ar=el("div","rs-wa rs-ar",x),bm=el("div","rs-wm",m[k]||"");c.append(ar,bm);wh.appendChild(c)})}catch(e){wh.textContent="লোড করা যায়নি — আবার চাপুন";wl=false}};
  va.append(wb,copyBtn("📋 কপি",()=>vtext(s,i)),playBtn(s,i),selBox(s,i));box.append(rf,tx,tb,va,wh);out.appendChild(box)}}
// বিষয়ভিত্তিক আয়াত (আলাদা বোতামে): কুরআনে সরাসরি নেই এমন বিষয়, যেমন বদনজর — সংশ্লিষ্ট শব্দগুলোর আয়াত আলাদা ভাগে দেখায়।
// নতুন বিষয় যোগ করতে TOPICS-এ একটা অংশ বাড়ান: {name:"বিষয়", desc:"তালিকায় ছোট বিবরণ", intro:"ফল দেখানোর আগের ব্যাখ্যা", terms:[["ভাগের শিরোনাম","সার্চের শব্দ (বাংলা অর্থ বা আরবি)"], ...]}
const TOPICS=[
 {name:"বদনজর",alias:["বদনজর","বদ নজর","নজর","নজর লাগা","নজরলাগা","নজর দোষ","কুনজর","কুদৃষ্টি","চোখ লাগা","evil eye","evileye"],desc:"চোখ · হাসাদ (হিংসা)",intro:"কুরআনে “বদনজর” শব্দটি সরাসরি নেই; এই বিষয়ের সাথে সংশ্লিষ্ট চোখ ও হাসাদ (হিংসা) সংক্রান্ত আয়াতগুলো আলাদা ভাগে দেখানো হচ্ছে",terms:[["চোখ সংক্রান্ত আয়াত","চোখ"],["হাসাদ (হিংসা) সংক্রান্ত আয়াত","حسد"],["মুগ্ধতার নজর — ইয়াকূব (আ.)-এর আলাদা দরজায় ঢোকার নির্দেশ (১২:৬৭)","দরজা",{"v":"12:67"}]]},
 {name:"জাদু",desc:"সিহর · হারুত-মারুত · গিঁটে ফুঁক",intro:"কুরআনে জাদু (সিহর), জাদুকর ও জাদুগ্রস্ত সংক্রান্ত আয়াত, হারুত-মারুতের ঘটনা এবং গিঁটে ফুঁক দেওয়ার উল্লেখ আলাদা ভাগে দেখানো হচ্ছে; একই রুটের “সাহার” (রাতের শেষ প্রহর) অর্থের শব্দ বাদ দেওয়া হয়েছে",terms:[["জাদু ও জাদুকর (সিহর)","سحر",{"x":"রাতের শেষ"}],["হারুত ও মারুত (সূরা বাকারা ২:১০২)","هاروت"],["গিঁটে ফুঁক দেওয়া (সূরা ফালাক)","نفث"]]},
 {name:"জাদুর প্রকার",desc:"কবর · দরজা · বিছানা · পানি · আগুন · বাতাস · কাপড় · মূর্তি · বাঁধন · বিয়ে-বিচ্ছেদ · রিজিক · বিদেশযাত্রা · বাধা",intro:"“কবরে পুঁতা”, “চৌকাঠ ও দরজায়”, “পানিতে”, “গাছে ঝুলানো”, “আগুনে পোড়ানো”, “ছবি ও পুতুলে” ইত্যাদি জাদুর ধরনের নাম কুরআনে সরাসরি নেই; প্রতিটি ধরনের সাথে সংশ্লিষ্ট শব্দ (কবর, দরজা, বিছানা, পানি, আগুন, বাতাস, কাপড়, মূর্তি, শিকল…) যেসব আয়াতে এসেছে সেগুলো ওই ধরনের ভাগে দেখানো হচ্ছে — এগুলো শব্দভিত্তিক সংগ্রহ, ধরনের প্রমাণ নয়। “পাহাড়ি জাদু”-র জন্য কোনো আলাদা শব্দ ধরা হয়নি। একইভাবে “বিয়েতে বাধা/বন্ধ”, “বিচ্ছেদ”, “রিজিকে বাধা/বন্ধ” ও “বিদেশযাত্রায় বাধা” নামের জাদুও কুরআনে সরাসরি নেই; এগুলোর সাথে সংশ্লিষ্ট শব্দ (নিকাহ, তালাক, বিচ্ছেদ, রিজিক, দারিদ্র্য, সফর, হিজরত, বাধা দেওয়া…) যেসব আয়াতে এসেছে সেগুলো আলাদা ভাগে দেখানো হচ্ছে",terms:[
  ["ছবি ও পুতুলে — মূর্তি/প্রতিমা (আসনাম)","صنم"],
  ["ছবি ও পুতুলে — ভাস্কর্য ও আকৃতি ধারণ (তামাসীল)","مثل",{"m":"মূর্তি|ভাস্কর্য|আকৃতি ধারণ"}],
  ["কাপড়-জামায় — কাপড়/পোশাক (সিয়াব)","ثوب",{"m":"কাপড়|পো[শষ]াক"}],
  ["কাপড়-জামায় — জামা (কামীস)","قمص"],
  ["বালিশ-তোষক-বিছানায় — বিছানা (ফারাশ)","فرش",{"m":"বিছানা|শয্যা"}],
  ["বালিশ-তোষক-বিছানায় — শয্যা (মাযজা‘)","ضجع",{"m":"শয্যা"}],
  ["চৌকাঠে ও দরজায়","بوب",{"m":"দরজা"}],
  ["সম্পর্ক/বন্ধন ছিন্ন (আরবি “সবাব” = সম্পর্ক, উপায়) — সম্পর্ক ও উপায়","سبب",{"x":"গালি"}],
  ["কবরে পুঁতে রাখা — কবর","قبر"],
  ["কবরে পুঁতে রাখা — লুকানো/আড়াল (ওয়ারা)","وري",{"m":"লুকা|গোপন"}],
  ["গাছে ঝুলানো — ঝুলন্ত (আল্লাকা)","علق",{"m":"ঝুল"}],
  ["গাছে ঝুলানো — বাতাস (রীহ)","روح",{"m":"বাতাস|বায়ু"}],
  ["চৌরাস্তা-ডাস্টবিন, চেহারা নষ্ট — চেহারা কালো হওয়া","سود",{"m":"কালো|মলিন","x":"রংও"}],
  ["চৌরাস্তা-ডাস্টবিন, চেহারা নষ্ট — অপবিত্রতা (রিজস)","رجس"],
  ["পানিতে — সাগর/নদী (ইয়াম্ম)","يمم",{"m":"সাগর|নদী"}],
  ["পানিতে — সাগর (বাহর)","بحر",{"x":"বাহীরা"}],
  ["পানিতে — ডুবিয়ে দেওয়া","غرق"],
  ["পানিতে — বন্যা/প্লাবন","طوف",{"m":"বন্যা|প্লাবন"}],
  ["আগুনে পোড়ানো — পুড়িয়ে ফেলা","حرق"],
  ["আগুনে পোড়ানো — ছাই","رمد",{"m":"ছাই"}],
  ["বিয়েতে বাধা/বন্ধ — বিয়ে (নিকাহ)","نكح"],
  ["বিয়েতে বাধা/বন্ধ — বিয়েতে বাধা দেওয়া (আদল)","عضل"],
  ["বিয়েতে বাধা/বন্ধ — বিয়ের প্রস্তাব (খিতবা)","خطب",{"m":"প্রস্তাব"}],
  ["বিয়েতে বাধা/বন্ধ — স্ত্রী/স্বামী (যাওজ)","زوج",{"m":"স্ত্রী|স্বামী"}],
  ["বিচ্ছেদের জাদু — তালাক","طلق",{"m":"তালাক"}],
  ["বিচ্ছেদের জাদু — বিচ্ছেদ ঘটানো (ফার্ক)","فرق",{"m":"বিচ্ছেদ|দুজনে পৃথক|তোমরা পৃথক করবে"}],
  ["বিচ্ছেদের জাদু — অবাধ্যতা/মনোমালিন্য (নুশুয)","نشز",{"m":"অবাধ্য|অবাধ্যতা|উপেক্ষা"}],
  ["বিচ্ছেদের জাদু — স্বামী-স্ত্রীর বিরোধ (শিকাক)","شقق",{"m":"সম্পর্কচ্ছেদ"}],
  ["বিচ্ছেদের জাদু — ছেড়ে দেওয়া (তাসরীহ)","سرح",{"m":"বিদায়|মুক্ত করে"}],
  ["বিচ্ছেদের জাদু — ঈলা (শপথ করে স্ত্রীর কাছে না যাওয়া)","ألو",{"m":"শপথ|কসম|বিরত"}],
  ["রিজিকে বাধা/বন্ধ — রিজিক","رزق"],
  ["রিজিকে বাধা/বন্ধ — দারিদ্র্য (ফকর)","فقر"],
  ["রিজিকে বাধা/বন্ধ — রিজিক সংকুচিত করা (কদর)","قدر",{"m":"সীমিত|সংকীর্ণ|সংকুচিত|কমিয়ে|পরিমিত"}],
  ["রিজিকে বাধা/বন্ধ — রিজিক প্রশস্ত করা (বাসত)","بسط",{"m":"প্রশস্ত|প্রসারিত|বাড়িয়ে"}],
  ["বিদেশযাত্রায় বাধা — হিজরত/দেশত্যাগ","هجر",{"m":"হিজরত|দেশত্যাগ"}],
  ["বিদেশযাত্রায় বাধা — সফর (সাফার)","سفر",{"m":"সফর|ভ্রমণ|মুসাফির"}],
  ["বিদেশযাত্রায় বাধা — ভ্রমণ (সায়র)","سير",{"m":"ভ্রমণ|চল|ঘুর"}],
  ["বিদেশযাত্রায় বাধা — যাত্রা (রিহলা)","رحل"],
  ["বিদেশযাত্রায় বাধা — যাত্রার দোয়া (সূরা ইসরা ১৭:৮০)","مدخل صدق"],
  ["বন্দি জাদু — শিকল/বাঁধন (আগলাল)","غلل",{"m":"শিকল|শৃংখল"}],
  ["বন্দি জাদু — তালা (আকফাল)","قفل"],
  ["সব ধরনের বাধা/আটকানো — বাধা দেওয়া (সদ্দ)","صدد",{"m":"বাধা|নিবৃত্ত|বিরত|ফিরিয়ে"}],
  ["সব ধরনের বাধা/আটকানো — নিষেধ করা (মানা‘)","منع"],
  ["সব ধরনের বাধা/আটকানো — আটক (হাবস)","حبس"],
  ["সব ধরনের বাধা/আটকানো — পর্দা/আড়াল (হিজাব)","حجب"],
  ["সব ধরনের বাধা/আটকানো — অন্তরায় (হাওল)","حول",{"m":"অন্তরায়|আড়াল|বাধা|প্রতিবন্ধক"}],
  ["বাচ্চা/জরায়ু বন্দি — বন্ধ্যা (আকীম)","عقم"],
  ["বাচ্চা/জরায়ু বন্দি — বন্ধ্যা নারী (আকির)","عقر",{"m":"বন্ধ্যা"}],
  ["বাচ্চা/জরায়ু বন্দি — রহমত আটকানো (ইমসাক)","مسك",{"m":"প্রতিরোধকারী|বন্ধ করেন"}],
  ["ঘর/মাথা বন্দি — প্রাচীর/বাধা (সাদ্দ)","سدد",{"m":"প্রাচীর"}],
  ["খাওয়ানো ও পান করানো — পান করানো (ইশরাব)","شرب",{"m":"সিঞ্চিত"}],
  ["বান মারা — উল্কাবাণ (শিহাব)","شهب"],
  ["বান মারা — নিক্ষেপ (রামী)","رمي",{"m":"নিক্ষেপ"}],
  ["বশীকরণ — ভালোবাসা/বন্ধুত্ব (মাওয়াদ্দা)","ودد",{"m":"বন্ধুত্ব"}],
  ["বশীকরণ — প্রীতি সঞ্চার (আলাফা)","ألف",{"m":"প্রীতি|মিলন|জুড়ে"}]]},
 {name:"জিন",desc:"জিনের প্রকার · ইবলিস · শয়তান · মারিদ · ইফরীত",intro:"কুরআনে জিন জাতি এবং তাদের অন্তর্ভুক্ত ইবলিস, শয়তান, মারিদ (অবাধ্য), ইফরীত, সত্যবিমুখ জিন ও কুমন্ত্রণাদাতাদের আয়াত আলাদা ভাগে দেখানো হচ্ছে। “সাধারণ / চালান / খাদেম / আশিক / জাবালী” জিনের এই নামগুলো কুরআনে নেই — এখানে শুধু কুরআনে যেসব প্রকার ও নাম এসেছে সেগুলোই আছে; একই আরবি রুটের অন্য অর্থের শব্দ (জান্নাত, বাগান, পাগল, সাপ) বাদ দেওয়া হয়েছে",terms:[
  ["জিন জাতি (জিন্ন ও জান্ন)","جنن",{"m":"জিন|জ্বিন|জ্বীন","x":"পাগল"}],
  ["ইবলিস","إبليس"],
  ["শয়তান","شطن"],
  ["বিতাড়িত শয়তান (রাজীম)","رجم",{"m":"অভিশপ্ত|বিতাড়িত"}],
  ["মারিদ (অবাধ্য শয়তান)","مرد",{"m":"বিদ্রোহী|উদ্ধত|অবাধ্য"}],
  ["ইফরীত (শক্তিশালী জিন)","عفر"],
  ["সত্যবিমুখ জিন (কাসিতুন, সূরা জিন)","قسط",{"m":"সত্যবিমুখ"}],
  ["কুমন্ত্রণা (ওয়াসওয়াসা)","وسوس"],
  ["খান্নাস (আত্মগোপনকারী কুমন্ত্রণাদাতা)","خنس",{"x":"পশ্চাদপসরণ"}],
  ["প্ররোচনা (নাযগ)","نزغ"],
  ["প্ররোচনা (হামযাত)","همز",{"m":"প্ররোচনা"}],
  ["শয়তানের স্পর্শে পাগল (খাবত, ২:২৭৫)","خبط"]]},
 {name:"চালানের প্রকার",desc:"হাঁড়ি · পুতুল · কবর · পানি · আগুন · বাতাস · মাছ · পাখি · চুল · ডিম · জুতা · চাঁদ · তারা",intro:"চালানের ১২ প্রকার ও চন্দ্র-তারার চালানের নাম কুরআনে সরাসরি নেই; প্রতিটি প্রকারের সাথে সংশ্লিষ্ট শব্দ (হাঁড়ি, পুতুল/মূর্তি, কবর, মাটি, পানি, আগুন, বাতাস, মাছ, পাখি, চুল, ডিম, জুতা, চাঁদ, তারা…) যেসব আয়াতে এসেছে সেগুলো ওই প্রকারের ভাগে দেখানো হচ্ছে — এগুলো শব্দভিত্তিক সংগ্রহ, প্রকারের প্রমাণ নয়। ছবি/ফটো চালানের সাথে মেলে এমন সরাসরি শব্দ নেই; কাছাকাছি হিসেবে পুতুলের ভাগের মূর্তি-ভাস্কর্যের আয়াত দেখুন",terms:[
  ["১. হাঁড়ি/পাতিল চালান — ডেগ (কুদূর)","قدر",{"m":"ডেগ|হাঁড়ি|পাতিল"}],
  ["১. হাঁড়ি/পাতিল চালান — বড় পাত্র (জিফান)","جفن"],
  ["২. পুতুল চালান — মূর্তি/প্রতিমা","صنم"],
  ["২. পুতুল চালান — ভাস্কর্য ও আকৃতি ধারণ","مثل",{"m":"মূর্তি|ভাস্কর্য|আকৃতি ধারণ"}],
  ["৩. কবর/মাটি চালান — কবর","قبر"],
  ["৩. কবর/মাটি চালান — মাটি (তুরাব)","ترب",{"m":"মাটি"}],
  ["৪. পানি/নদী চালান — সাগর/নদী (ইয়াম্ম)","يمم",{"m":"সাগর|নদী"}],
  ["৪. পানি/নদী চালান — ডুবিয়ে দেওয়া","غرق"],
  ["৫. আগুন/চিতা চালান — পুড়িয়ে ফেলা","حرق"],
  ["৫. আগুন/চিতা চালান — ছাই","رمد",{"m":"ছাই"}],
  ["৬. বাতাস/হাওয়া চালান","روح",{"m":"বাতাস|বায়ু"}],
  ["৭. মাছ চালান","حوت"],
  ["৮. পাখি/কবুতর চালান — পাখি","طير",{"m":"পাখি"}],
  ["৮. পাখি/কবুতর চালান — পাখি দিয়ে শুভ-অশুভ লক্ষণ (তাতাইয়ুর)","طير",{"m":"মন্দভাগ্য"}],
  ["৯. ছবি/ফটো চালান — মূর্তি/প্রতিমা (আসনাম)","صنم"],
  ["৯. ছবি/ফটো চালান — ভাস্কর্য ও আকৃতি ধারণ (তামাসীল)","مثل",{"m":"মূর্তি|ভাস্কর্য|আকৃতি ধারণ"}],
  ["১০. চুল-নখ চালান — চুল","চুল",{"x":"তার চুলগুলো"}],
  ["১১. ডিম চালান","بيض",{"m":"ডিম"}],
  ["১২. পায়ের ধুলা/জুতা চালান — জুতা","نعل",{"m":"জুতা"}],
  ["চন্দ্র চালান — চাঁদ","قمر"],
  ["চন্দ্র চালান — নতুন চাঁদ (আহিল্লা)","هلل",{"m":"চাঁদ"}],
  ["তারা/জ্যোতিষীর চালান — তারকা","نجم",{"m":"তারা|তারকা|নক্ষত্র"}],
  ["তারা/জ্যোতিষীর চালান — গ্রহ-নক্ষত্র (বুরুজ)","برج",{"m":"নক্ষত্র|গ্রহ"}],
  ["তারা/জ্যোতিষীর চালান — গণক (কাহিন)","كهن",{"m":"গণক"}],
  ["তারা/জ্যোতিষীর চালান — ভাগ্য নির্ধারক তীর (আযলাম)","زلم"]]}
];
// অঙ্গ-প্রত্যঙ্গ: কুরআনে মানুষের শরীরের যে যে অঙ্গের নাম এসেছে, অঙ্গ অনুযায়ী আলাদা বিষয়। প্রতিটি [অঙ্গের নাম, আরবি রুট (তালিকায় ছোট বিবরণ), [[ভাগের শিরোনাম, সার্চের শব্দ (আরবি রুট বা বাংলা), ছাঁকনি], ...]]
// নতুন অঙ্গ যোগ করতে ORG-এ একটা অংশ বাড়ালেই হবে
const ORG=[["মাথা","رأس",[["মাথা (রা’স)","رأس",{"m":"মাথা","x":"মূলধন"}]]],["চুল","شعر · نصي · حلق",[["চুল","চুল",{"x":"তার চুলগুলো"}],["মাথা মুণ্ডন (হালক)","حلق",{"m":"মুণ্ডন"}]]],["কপাল","جبه · جبن · نصي",[["কপাল (জাবহা)","جبه",{"m":"কপাল"}],["কপালের পাশ (জাবীন)","جبن",{}],["কপালের সামনের অংশ (নাসিয়া)","نصي",{}]]],["মুখমণ্ডল (চেহারা)","وجه",[["মুখমণ্ডল (ওয়াজহ)","وجه",{"m":"মুখ|চেহারা|মুখমন্ডল|মুখমণ্ডল|গালে","x":"মুখ ফির|মুখ ফের|মুখ ঘুর|সত্তা"}]]],["মুখ (মুখগহ্বর)","فوه",[["মুখ (ফাম/আফওয়াহ)","فوه",{"m":"মুখ"}]]],["জিহ্বা","لسن",[["জিহ্বা (লিসান)","لسن",{"m":"জিহ্?বা|রসনা","x":"ভাষা"}]]],["ঠোঁট","شفه",[["ঠোঁট (শাফাহ)","شفه",{}]]],["দাঁত","سنن",[["দাঁত (সিন্ন)","سنن",{"m":"দাঁত"}]]],["চোখ","عين · بصر",[["চোখ (আইন)","عين",{"m":"চোখ|চক্ষু|নয়ন|দৃষ্টি|আয়তলোচনা","x":"ঝর্ণা|ঝরনা|জলাশয়|ফোয়ারা|পর্যবেক্ষণ|চাক্ষুস"}],["চোখ/দৃষ্টি (বাসার)","بصر",{"p":"N","m":"চোখ|চক্ষু|দৃষ্টি|দর্শনশক্তি","x":"অন্তর্দৃষ্টি|প্রত্যক্ষ|সূক্ষ্ম|চক্ষুষ্মান|দৃষ্টিসম্পন্ন|দৃষ্টি সম্পন্ন|উজ্জ্বল|প্রসারণ"}]]],["কান","أذن · سمع",[["কান (উযুন)","اذن",{"m":"কান"}],["কান/শ্রবণশক্তি (সামউ)","سمع",{"m":"কান|শ্রবণশক্তি","x":"শ্রবণশীল"}]]],["নাক","أنف",[["নাক (আনফ)","انف",{"m":"নাক"}]]],["গাল","خد",[["গাল (খাদ্দ)","خدد",{"m":"গাল"}]]],["চিবুক","ذقن",[["চিবুক (যাকান)","ذقن",{}]]],["ঘাড় ও গলা","عنق · جيد · ورد",[["ঘাড়/গলা (উনুক)","عنق",{}],["গলা (জীদ)","جيد",{}],["ঘাড়ের শিরা (ওয়ারীদ)","ورد",{"m":"ঘাড়"}]]],["কণ্ঠনালী ও কণ্ঠার হাড়","حلقوم · حنجر · ترق",[["কণ্ঠনালী (হুলকুম)","حلق",{"m":"কণ্ঠনালী"}],["কণ্ঠ (হানজারা)","حنجر",{}],["কণ্ঠার হাড় (তারাকী)","ترق",{}]]],["ধমনী","وتين",[["ধমনী (ওয়াতীন)","وتن",{}]]],["বুক ও বক্ষ","صدر · ترائب",[["বুক/বক্ষ (সাদ্র)","صدر",{"p":"N"}],["বক্ষপিঞ্জর (তারাইব)","ترب",{"m":"বক্ষপিঞ্জর"}]]],["অন্তর (হৃদয়)","قلب · فؤاد",[["অন্তর (কলব)","قلب",{"m":"অন্তর|হৃদয়|মন"}],["অন্তর (ফুয়াদ)","فاد",{}]]],["পেট","بطن",[["পেট (বাতন)","بطن",{"m":"পেট"}]]],["পিঠ ও মেরুদণ্ড","ظهر · صلب",[["পিঠ (যাহর)","ظهر",{"m":"পিঠ|পৃষ্ঠ"}],["মেরুদণ্ড (সুলব)","صلب",{"m":"মেরুদণ্ড|ঔরস"}]]],["পার্শ্বদেশ","جنب",[["পার্শ্বদেশ (জানব)","جنب",{"m":"পার্শ্ব|পাশগুলো|পাশগুলোর|পাশের তার"}]]],["হাত","يد · كف",[["হাত (ইয়াদ)","يدي",{}],["হাতের তালু (কাফ্‌ফ)","كفف",{"m":"হাত"}]]],["বাহু ও বগল","عضد · جناح",[["বাহু (আদুদ)","عضد",{"m":"বাহু"}],["বাহু/বগল (জানাহ)","جنح",{"m":"বাহু|বগল"}]]],["আঙুল","أصبع · بنان · أنامل",[["আঙুল (ইসবা)","صبع",{}],["আঙুলের অগ্রভাগ (বানান)","بنن",{}],["আঙুলের ডগা (আনামিল)","نمل",{"m":"আঙ্গুল"}]]],["পা","رجل · قدم · ساق",[["পা (রিজল)","رجل",{"m":"(?:^|[^\\u0980-\\u09FF])পা(?:য়|গুলো|সমূহ|\\s?গুলো|\\s?সমূহ|(?![\\u0980-\\u09FF]))"}],["পা (কাদাম)","قدم",{"m":"(?:^|[^\\u0980-\\u09FF])পা(?:য়|গুলো|সমূহ|\\s?গুলো|\\s?সমূহ|(?![\\u0980-\\u09FF]))"}],["পায়ের গোছা (সাক)","سوق",{"m":"পিণ্ডলী|পিন্ডলি|গোড়ালী|পাগুলোর"}]]],["গোড়ালি","عقب",[["গোড়ালি (আকিব)","عقب",{"m":"গোড়ালি|গোঁড়ালি|গোড়ালী"}]]],["চামড়া (ত্বক)","جلد",[["চামড়া (জিলদ)","جلد",{"m":"চামড়া|ত্বক|দেহ","x":"দোররা"}]]],["হাড়","عظم",[["হাড় (আযম)","عظم",{"m":"হাড়|অস্তি|মজ্জা"}]]],["মাংস","لحم",[["মাংস (লাহম)","لحم",{}]]],["রক্ত","دم",[["রক্ত (দাম)","دمو",{}]]],["লজ্জাস্থান","فرج · سوأة",[["লজ্জাস্থান (ফারজ)","فرج",{"m":"লজ্জাস্থান|সতীত্ব"}],["লজ্জাস্থান (সাউআহ)","سوأ",{"m":"লজ্জাস্থান"}]]],["গর্ভ (জরায়ু)","رحم",[["গর্ভ/জরায়ু (রাহিম)","رحم",{"m":"গর্ভ|জরায়ু"}]]],["অন্ত্র ও নাড়িভুঁড়ি","حوايا · أمعاء",[["অন্ত্র (হাওয়ায়া)","حوي",{"m":"অন্ত্র"}],["নাড়িভুঁড়ি (আমআ)","معي",{}]]],["দাড়ি","لحية",[["দাড়ি (লিহইয়া)","لحي",{}]]]];
ORG.forEach(o=>TOPICS.push({name:o[0],desc:o[1],intro:"কুরআনে “"+o[0]+"” যেসব আয়াতে এসেছে সেগুলো আরবি রুট ধরে আলাদা ভাগে দেখানো হচ্ছে; একই রুটের অন্য অর্থের শব্দ (যেমন চোখের রুটে ঝর্ণা) বাদ দেওয়া হয়েছে",terms:o[2]}));
// সম্মিলিত বিষয়: বদনজর → জাদু → জিন (চালানসহ) → অঙ্গ-প্রত্যঙ্গ — প্রতিটি অঙ্গের আয়াতও এই তিনের অন্তর্ভুক্ত (অঙ্গে থাকা গিঁট/দুর্গ ভাঙার জন্য); এই ক্রমেই আয়াত, কপি ও মার্জ অডিও হয়, একই আয়াত দুবার এলে প্রথমবারেই থাকে
{const nm=n=>TOPICS.find(t=>t.name===n),T=[];
 const add=(pre,n)=>nm(n).terms.forEach(x=>T.push([pre+" — "+x[0]].concat(x.slice(1))));
 add("বদনজর","বদনজর");add("জাদু","জাদু");add("জাদু","জাদুর প্রকার");add("জিন","জিন");add("জিন (চালান)","চালানের প্রকার");
 ORG.forEach(o=>o[2].forEach(x=>T.push([ "অঙ্গ: "+o[0]+" — "+x[0]].concat(x.slice(1)))));
 TOPICS.unshift({name:"বদনজর · জাদু · জিন (সব একসাথে)",desc:"বদনজর → জাদু → জিন → প্রতিটি অঙ্গ-প্রত্যঙ্গ · মার্জ অডিও",ordered:true,intro:"ক্রম: প্রথমে বদনজর, তারপর জাদু (জাদুর প্রকারসহ), তারপর জিন (চালানের প্রকারসহ), সবশেষে শরীরের প্রতিটি অঙ্গ-প্রত্যঙ্গের আয়াত — অঙ্গে থাকা বদনজর, জাদু ও জিনের দুর্গ ভাঙার জন্য এগুলোও এর অন্তর্ভুক্ত। একই আয়াত একাধিক ভাগে এলে অডিও ও কপিতে শুধু প্রথমবারই আসে। প্রতিটি ভাগের ভেতরে আয়াত সূরার ক্রমে। এগুলো শব্দভিত্তিক সংগ্রহ।",terms:T});
 // শুধু অঙ্গ-প্রত্যঙ্গ, সব একসাথে (বদনজর/জাদু/জিন ছাড়া): প্রতিটি অঙ্গের আলাদা বিষয়ও আগের মতোই আছে
 const T2=[];ORG.forEach(o=>o[2].forEach(x=>T2.push([o[0]+" — "+x[0]].concat(x.slice(1)))));
 TOPICS.splice(1,0,{name:"অঙ্গ-প্রত্যঙ্গ (সব একসাথে)",desc:"মাথা → চুল → কপাল → মুখমণ্ডল → … সব অঙ্গ · মার্জ অডিও",ordered:true,org:true,intro:"কুরআনে শরীরের যেসব অঙ্গ-প্রত্যঙ্গের নাম এসেছে সবগুলোর আয়াত একসাথে, অঙ্গের ক্রমে। প্রতিটি অঙ্গের ভাগে আয়াত সূরার ক্রমে। একই আয়াত একাধিক ভাগে এলে অডিও ও কপিতে শুধু প্রথমবারই আসে। এগুলো শব্দভিত্তিক সংগ্রহ।",terms:T2})}
// কমা দিয়ে একাধিক বিষয় (যেমন "জিনা, চুল"): প্রথমে প্রথম বিষয়ের সব আয়াত, তারপর পরের বিষয়ের; সিরিয়াল, কপি ও মার্জ অডিও সব বিষয় মিলিয়ে একসাথে
// অঙ্গ-প্রত্যঙ্গের ছাঁকনি: রুটের অন্য অর্থের শব্দ (যেমন عين = ঝর্ণা, أذن = অনুমতি) বাদ দিতে। {m: বাংলা অর্থে যা থাকতে হবে, x: যা থাকলে বাদ, p: শব্দের ধরন (N = বিশেষ্য)}
// আরবি রুটে ছাঁকনি থাকলে শুধু হুবহু সেই রুটই ধরা হয় (আংশিক মিল নয়)
const nfc=s=>String(s||"").normalize("NFC");
function applyFl(items,fl){const rg=s=>s?new RegExp(nfc(s)):null,m=rg(fl.m),x=rg(fl.x),out=[],vs=fl.v?String(fl.v).split("|"):null;
 for(const it of items){if(!it.bn&&it.sc!==100)continue;
  const src=it.bn?it.mf:it.r.forms;let mf=src.filter(f=>{const t=nfc(f.m);return(!m||m.test(t))&&(!x||!x.test(t))&&(!fl.p||f.p===fl.p)});
  /* v: শুধু নির্দিষ্ট আয়াত(গুলো) ("সূরা:আয়াত|…") — রূপের বাকি আয়াত বাদ */
  if(vs)mf=mf.map(f=>({...f,refs:f.refs.filter(r=>vs.includes(r.split(":").slice(0,2).join(":")))})).filter(f=>f.refs.length);
  if(mf.length)out.push({r:it.r,sc:it.bn?it.sc:80,mf,bn:it.bn,loose:it.loose})}
 return out}
// বিষয়ের তালিকায় আয়াত সংখ্যা: runMulti-র মতো একই নিয়মে (সার্চ + ছাঁকনি) গোনা হয়, একই আয়াত একবারই
const TSET=new Map();
function topicSet(t){const u=new Set();for(const pp of t.terms){const t0=typeof pp==="string"?pp:pp[1],q=nz(t0),isBn=!q&&/[\u0980-\u09FF]/.test(t0);let items=[];
  if(isBn){if(t0.length>=2)items=searchBn(t0)}else if(q){if(q.length>=2)items=search(q)}
  const fl=typeof pp==="string"?null:pp[2];if(fl&&items.length)items=applyFl(items,fl);
  items.forEach(it=>[...lst(it,it.sc===100)].forEach(f=>f.refs.forEach(r=>u.add(r.split(":").slice(0,2).join(":")))))}return u}
async function fillCounts(cnt){try{await loadRoots()}catch(e){cnt.forEach(c=>c[1].textContent="");return}
 for(const [t,n] of cnt){if(t.ordered)continue;if(!TSET.has(t.name)){try{TSET.set(t.name,topicSet(t))}catch(e){TSET.set(t.name,new Set())}await new Promise(r=>setTimeout(r))}n.textContent=bn2(TSET.get(t.name).size)+" আয়াত"}
 for(const [t,n] of cnt)if(t.ordered){const u=new Set();TOPICS.forEach(x=>{if(!x.ordered&&(!t.org||ORG.some(o=>o[0]===x.name))&&TSET.has(x.name))TSET.get(x.name).forEach(k=>u.add(k))});n.textContent=bn2(u.size)+" আয়াত"}}
async function runMulti(parts,out,info,intro,ordered){
 await loadRoots();
 const intros=intro?[intro]:[];
 const G=[];
 for(const pp of parts){const t0=typeof pp==="string"?pp:pp[1],lab=typeof pp==="string"?pp:pp[0],t=t0,q=nz(t),isBn=!q&&/[\u0980-\u09FF]/.test(t);let items=[],note="";
  if(isBn){if(t.length<2)note="কমপক্ষে ২টি অক্ষর লিখুন";else items=searchBn(t)}
  else if(q){if(q.length<2)note="কমপক্ষে ২টি হরফ লিখুন";else items=search(q)}
  else note="বোঝা যায়নি";
  {const fl=typeof pp==="string"?null:pp[2];if(fl&&items.length)items=applyFl(items,fl)}
  G.push({t:lab,items,note})}
 const ex=it=>it.sc===100,fl=it=>[...lst(it,ex(it))].sort((a,b)=>b.refs.length-a.refs.length);
 if(!G.some(g=>g.items.length)){info.textContent="কিছু পাওয়া যায়নি — বানান বদলে বা কম লিখে দেখুন";return}
 const key=r=>r.split(":").slice(0,2).join(":"),all=new Set();let o=0;
 G.forEach(g=>{const u=new Set();g.items.forEach(it=>fl(it).forEach(f=>f.refs.forEach(r=>{o++;u.add(key(r));all.add(key(r))})));g.u=u.size});
 SB.set(all);
 let ORD=null;
 if(ordered){const seen=new Set();ORD=[];G.forEach(g=>{const u=new Set();g.items.forEach(it=>fl(it).forEach(f=>f.refs.forEach(r=>u.add(key(r)))));[...u].filter(k=>!seen.has(k)).map(k=>k.split(":").map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]).forEach(x=>{seen.add(x[0]+":"+x[1]);ORD.push(x)})})}
 info.textContent="সর্বমোট "+bn2(o)+"টি ফলাফল"+(o>all.size?" ("+bn2(all.size)+"টি আয়াত)":"")+" · "+G.map(g=>"“"+g.t+"” "+(g.u?bn2(g.u)+"টি আয়াত":"পাওয়া যায়নি")).join(" · ");
 
 allCopy(info,G.flatMap(g=>g.items.flatMap(it=>lst(it,ex(it)))),ORD);
 let bud=60;
 G.forEach(g=>{
  out.appendChild(els("div","margin:16px 0 6px;padding:6px 12px;border-radius:10px;font-weight:700;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary)","“"+g.t+"” — "+(g.u?bn2(g.u)+"টি আয়াত":(g.note||"কিছু পাওয়া যায়নি"))));
  g.items.forEach(it=>{const c=card(it,ex(it));out.appendChild(c);if(bud>0){c.querySelector(".rs-rh").click();bud-=Math.min(vset(lst(it,ex(it))).o,24)}})})}
async function run(topic){window.__bq="";GEN++;CURT=null;if(topic&&!topic.terms)topic=null;const raw=topic?topic.name:$("rsQ").value;window.__sq=raw;const q=nz(raw),out=$("rsOut"),info=$("rsInfo");out.innerHTML="";if(!R)info.textContent="⏳ ডেটা লোড হচ্ছে… (প্রথমবার ইন্টারনেট ধীর হলে সময় লাগে, পরে দ্রুত হবে)";
 if(topic)return runMulti(topic.terms,out,info,topic.intro,topic.ordered);
 {const parts=raw.split(/[,،，、]/).map(x=>x.trim()).filter(Boolean);if(parts.length>1)return runMulti(parts,out,info)}
 const bq=raw.trim();
 {const dg=bq.replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)),mr=dg.match(/^(\d{1,3})\s*[:.\/]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/);
  if(mr)return refView(+mr[1],+mr[2],+(mr[3]||mr[2]));
  if(/^\d{1,3}$/.test(dg)){info.textContent="আয়াত খুঁজতে সূরা:আয়াত লিখুন — যেমন 10:49 বা 2:255-257";return}}
 {const key=x=>String(x||"").normalize("NFC").replace(/[\s\u200c\u200d]/g,"").toLowerCase(),k=key(bq);
  const tp=k&&TOPICS.find(t=>(t.alias||[]).some(a=>key(a)===k));
  if(tp){ALLF=false;return run(tp)}}
 if(!q&&/[\u0980-\u09FF]/.test(bq)){if(bq.length<2){info.textContent="কমপক্ষে ২টি অক্ষর লিখুন";return}
  await loadRoots();const rb=searchBn(bq);if(!rb.length){info.textContent="এই বাংলা অর্থে কিছু পাওয়া যায়নি।";let sg=[];try{sg=await bnSuggest(bq)}catch(e){}
   if(sg.length){info.append(" কাছাকাছি শব্দ: ");sg.forEach(w=>{const b=els("button","margin:2px 3px;border:1px solid var(--border-light);background:var(--card-bg);color:var(--primary);border-radius:999px;padding:2px 12px;font-size:14px;cursor:pointer",w);b.type="button";b.onclick=()=>{$("rsQ").value=w;$("rsGo").click()};info.appendChild(b)})}else info.append(" অন্য শব্দ লিখে দেখুন (যেমন: কিতাব, জ্ঞান, দয়া)");return}
  const tv=(()=>{const u=new Set();let o=0;rb.forEach(it=>[...lst(it,!1)].sort((a,b)=>b.refs.length-a.refs.length).forEach(f=>f.refs.forEach(r=>{o++;u.add(r.split(":").slice(0,2).join(":"))})));return{o,u:u.size,s:u}})();SB.set(tv.s);info.textContent="সর্বমোট "+bn2(tv.o)+"টি ফলাফল"+(tv.o>tv.u?" ("+bn2(tv.u)+"টি আয়াত) · ":" · ")+"বাংলা অর্থে "+bn2(rb.length)+"টি রুট পাওয়া গেছে";
  {const cnt=f=>{const u=new Set();rb.forEach(it=>f(it).forEach(x=>x.refs.forEach(r=>u.add(r.split(":").slice(0,2).join(":")))));return u.size};
   const n1=cnt(it=>it.mf),n2=cnt(it=>it.r.forms),row=el("div","rs-seg");
   [[false,"“"+bq+"” অর্থের আয়াত ("+bn2(n1)+")"],[true,"রুটগুলোর সব আয়াত ("+bn2(n2)+")"]].forEach(([v,t])=>{const b=el("button","rs-seg-b"+(ALLF===v?" on":""),t);b.type="button";b.onclick=()=>{if(ALLF===v)return;ALLF=v;run().catch(e=>console.error(e))};row.appendChild(b)});
   info.appendChild(row)}
  window.__bq=bq;allCopy(info,rb.flatMap(it=>lst(it,!1)));
  {let bud=60;rb.forEach((it,i)=>{const c=card(it,!1);out.appendChild(c);if(bud>0){c.querySelector(".rs-rh").click();bud-=Math.min(vset(lst(it,!1)).o,24)}})};return}
 if(!q){info.textContent="";return}
 if(q.length<2){info.textContent="কমপক্ষে ২টি হরফ লিখুন";return}
 await loadRoots();const res=search(q);
 if(!res.length){info.textContent="কিছু পাওয়া যায়নি — হরফ বদলে বা কম লিখে দেখুন";return}
 const LIM=Infinity;const tv=(()=>{const u=new Set();let o=0;res.slice(0,LIM).forEach(it=>[...lst(it,it.sc===100)].sort((a,b)=>b.refs.length-a.refs.length).forEach(f=>f.refs.forEach(r=>{o++;u.add(r.split(":").slice(0,2).join(":"))})));return{o,u:u.size,s:u}})();SB.set(tv.s);info.textContent="সর্বমোট "+bn2(tv.o)+"টি ফলাফল"+(tv.o>tv.u?" ("+bn2(tv.u)+"টি আয়াত) · ":" · ")+bn2(res.length)+"টি রুট পাওয়া গেছে"+(res[0].loose?" (হুবহু মেলেনি, কাছাকাছি বানান ধরে খোঁজা হয়েছে)":"")+(res.length>LIM?" (প্রথম "+bn2(LIM)+"টি দেখানো হচ্ছে; আরও হরফ লিখে সংকীর্ণ করুন)":"");allCopy(info,res.slice(0,LIM).flatMap(it=>lst(it,it.sc===100)));
 {let bud=60;res.slice(0,LIM).forEach((it,i)=>{const c=card(it,it.sc===100);out.appendChild(c);if(bud>0){c.querySelector(".rs-rh").click();bud-=Math.min(vset(lst(it,it.sc===100)).o,24)}})}}
function init(){const q=$("rsQ"),pad=$("rsPad");let mode="ar",BW=null,kb=false;
 const setDir=()=>{q.placeholder=mode==="bn"?"সার্চ করুন":"সার্চ করুন"};
 const AR="ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" "),BNL="অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য় ৎ ং ঃ ঁ".split(" ");
 const drawPad=()=>{pad.innerHTML="";pad.classList.toggle("bn",mode==="bn");
  const lg=el("div","rs-lg");[["ar","আরবি"],["bn","বাংলা"]].forEach(([m,t])=>{const b=el("button",m===mode?"on":null,t);b.type="button";b.onclick=()=>{if(mode===m)return;mode=m;q.value="";rs.classList.remove("on");drawPad();setDir();$("rsOut").innerHTML="";$("rsInfo").textContent=""};lg.appendChild(b)});pad.appendChild(lg);
  (mode==="bn"?BNL:AR).forEach(ch=>{const b=el("button",null,ch);b.type="button";b.onclick=()=>{q.value=mode==="bn"?ch:q.value+ch;setDir();pad.classList.remove("on");padGo()};pad.appendChild(b)});
  const cm=el("button",null,",");cm.type="button";cm.onclick=()=>{q.value=q.value.replace(/\s+$/,"")+", ";setDir()};pad.appendChild(cm);
  const bs=el("button",null,"⌫");bs.type="button";bs.onclick=()=>{q.value=q.value.slice(0,-1);setDir();padGo()};pad.appendChild(bs)};
 $("rsKb").onclick=()=>{pad.classList.toggle("on");kb=true;if(pad.classList.contains("on"))padGo()};
 $("rsX").onpointerdown=e=>e.preventDefault();
 $("rsX").onclick=()=>{q.value="";rs.classList.remove("on");setDir();go();q.focus()};
 q.oninput=()=>{{const v=q.value,n=v.replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d));if(n!==v)q.value=n}setDir()};
 q.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();q.blur();padGo()}};
 $("rsGo").onpointerdown=e=>e.preventDefault();
 $("rsGo").onclick=()=>{q.blur();padGo()};
 const rs=el("div","rs-rs");rs.id="rsRs";pad.insertAdjacentElement("afterend",rs);
 drawPad();
 const bnList=async()=>{const p=q.value.trim();rs.classList.toggle("bn",true);
  if(!p||!/^[\u0980-\u09FF]+$/.test(p)){rs.classList.remove("on");return go()}
  try{BW=BW||(await rsFetch(BASE+"quran-bn-words.json?v="+DV+"w")).w}catch(e){rs.classList.remove("on");return go()}
  const fp=fb(p),l=BW.filter(x=>fb(x[0]).startsWith(fp));
  if(!l.length){rs.classList.remove("on");return go()}
  rs.innerHTML="";rs.classList.add("on");$("rsOut").innerHTML="";$("rsInfo").textContent="";
  rs.appendChild(el("div","rs-rh2","“"+p+"” দিয়ে শুরু "+bn2(l.length)+"টি শব্দ — একটি বেছে নিন"));
  l.forEach(x=>{const row=el("div","rs-ri"),b=el("b",null,x[0]+(x[3]&&x[3].length?" ("+x[3].join(", ")+")":"")),c=el("span",null,bn2(x[1])+" রুট · "+bn2(x[2])+" আয়াত");row.append(b,c);row.onclick=()=>{q.value=x[0];setDir();rs.classList.remove("on");go();window.scrollTo({top:rs.getBoundingClientRect().top+scrollY-60,behavior:"smooth"})};rs.appendChild(row)})}; const padGo=async()=>{rs.classList.toggle("bn",mode==="bn");if(kb&&mode==="bn")return bnList();const p=nz(q.value);if(!kb||!p||p.length>=3){rs.classList.remove("on");return go()}
  try{await loadRoots()}catch(e){rs.classList.remove("on");return go()}
  const l=R.filter(r=>r.rn.length>p.length&&r.rn.startsWith(p));
  if(!l.length){rs.classList.remove("on");return go()}
  rs.innerHTML="";rs.classList.add("on");$("rsOut").innerHTML="";$("rsInfo").textContent="";
  const hd=el("div","rs-rh2","“"+[...p].join(" ")+"” দিয়ে শুরু "+bn2(l.length)+"টি রুট — একটি বেছে নিন");rs.appendChild(hd);
  l.slice().sort((a,b)=>a.rn<b.rn?-1:a.rn>b.rn?1:0).forEach(r=>{const row=el("div","rs-ri"),b=el("b",null,[...r.rn].join(" ")),c=el("span",null,bn2(r.n)+" বার");row.append(b,c);row.onclick=()=>{q.value=r.rn;rs.classList.remove("on");go();window.scrollTo({top:rs.getBoundingClientRect().top+scrollY-60,behavior:"smooth"})};rs.appendChild(row)})};
 const go=()=>(ALLF=false,run()).catch(e=>{console.error(e);$("rsInfo").textContent="ডেটা লোড করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন"});
 const goTopic=t=>(ALLF=false,run(t)).catch(e=>{console.error(e);$("rsInfo").textContent="ডেটা লোড করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন"});
 const showTopics=async force=>{if(!force&&rs.classList.contains("on")&&rs.dataset.k==="topics"){rs.classList.remove("on");return}
  pad.classList.remove("on");rs.innerHTML="";rs.dataset.k="topics";rs.classList.add("bn","on");$("rsOut").innerHTML="";$("rsInfo").textContent="";
  const secH=t=>rs.appendChild(el("div","dr-sec",t));
  const drRow=(ic,title,desc,count,fn,hero)=>{const row=el("div","dr-row"+(hero?" hero":"")),i=el("div","dr-ic",ic),tx=el("div","dr-tx"),end=el("div","dr-end"),n=el("span","dr-cnt",count);tx.append(el("b",null,title));end.append(n,el("span","dr-go","›"));row.append(i,tx,end);row.onclick=fn;rs.appendChild(row);return n};
  secH("রোগ নির্ণয় ও চিকিৎসা");
  drRow("💊","শারীরিক রোগ ও আরোগ্যের আয়াত","রোগ → সংশ্লিষ্ট অঙ্গ → কাছের আয়াত (পাইলস, জ্বর, মাথা-পেট-দাঁত-গলা-পিঠের ব্যথা, ঘুম, ক্লান্তি…)","",()=>showDiag(DISEASE),1);
  let L=[];try{L=await TS.load()}catch(e){}
  if(rs.dataset.k!=="topics"||!rs.classList.contains("on"))return;
  if(L.length){secH("আপনার তালিকা");L.forEach(t=>{drRow("📚",t.name,"",bn2(t.refs.length)+" আয়াত",()=>{q.value="";setDir();rs.classList.remove("on");openTopic(t);window.scrollTo({top:rs.getBoundingClientRect().top+scrollY-60,behavior:"smooth"})})})}
  
  secH("বিষয়সমূহ");
  const cnt=[];TOPICS.forEach((t,i)=>{const n=drRow(bn2(i+1),t.name,t.desc||"","…",()=>{q.value=t.name;setDir();rs.classList.remove("on");goTopic(t);window.scrollTo({top:rs.getBoundingClientRect().top+scrollY-60,behavior:"smooth"})});cnt.push([t,n])});fillCounts(cnt);
  const ft=el("div","dr-bak"),fi=document.createElement("input");fi.type="file";fi.accept=".json,application/json";fi.style.display="none";fi.onchange=()=>{if(fi.files[0])importTopics(fi.files[0]);fi.value=""};
  ft.append(mkBtn("📥 নিজের তালিকার ব্যাকআপ নামান",exportTopics),mkBtn("📤 ব্যাকআপ ফেরান",()=>fi.click()),fi);ft.style.position="static";rs.appendChild(ft)};
// ---------- রোগ নির্ণয়ের তালিকা (quran-diagnosis.json) ----------
 const showDiag=async(cfg)=>{window.__bq="";const CF=Object.assign({file:"quran-diagnosis.json?v="+DV+"d19",title:"🩺 রোগ নির্ণয় (ডায়াগনোসিস)",sq:"রোগ নির্ণয়",nm:"নির্ণয়",badge:["আয়াতে সরাসরি আছে","শব্দভিত্তিক"],intro:null},cfg&&(cfg.file||cfg.host)?cfg:{});GEN++;CURT=null;rs.classList.remove("on");pad.classList.remove("on");const out=CF.host||$("rsOut"),info=CF.infoEl||$("rsInfo");out.innerHTML="";info.textContent="লোড হচ্ছে…";q.value="";setDir();window.__sq=CF.sq;
  let D;try{D=await rsFetch(BASE+CF.file)}catch(e){info.textContent="তালিকা লোড করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন";return}
  info.textContent="";if(!CF.host)info.appendChild(els("div","font-weight:700;color:var(--primary);margin-bottom:4px",CF.title));
  const resolve=sel=>{const terms=[];sel.forEach(x=>{const t=TOPICS.find(y=>y.name===x.topic);if(t)t.terms.forEach(y=>{if(x.all||(x.prefix?y[0].split(" — ")[0]===x.prefix:(x.titles||[]).includes(y[0])))terms.push(y)})});return terms};
  const keyList=cs=>{const list=[],seen=new Set();cs.forEach(c=>c.keys.forEach(k=>{const id=k.s+":"+k.a;if(!seen.has(id)){seen.add(id);list.push([k.s,k.a])}}));return{list}};
  const audio=(cs,label)=>{const w=els("div","margin-top:6px"),note=els("div","font-size:12px;color:var(--text-muted);margin-top:4px"),res=el("div"),b=mkBtn("🔊 "+label,()=>{window.__sq=CF.sq+" "+(cs.length===1?cs[0].name:label);const k=keyList(cs);if(k.list.length===1&&setAll()<=1&&repOf(k.list[0][0],k.list[0][1])<=1){playOne(k.list[0][0],k.list[0][1],res,note);return}mergeAudio(k.list,res,t=>note.textContent=t)});b.style.margin="0";w.append(b,note,res);w.btn=b;return w};
  const allB=audio(D.groups.flatMap(g=>g.cats),"সব রোগের "+CF.nm+" অডিও একসাথে ("+bn2(new Set(D.groups.flatMap(g=>g.cats.flatMap(c=>c.keys.map(k=>k.s+":"+k.a)))).size)+"টি আয়াত)");{const rc=repCtl(),row=el("div","rs-top"),nAy=new Set(D.groups.flatMap(g=>g.cats.flatMap(c=>c.keys.map(k=>k.s+":"+k.a)))).size;
  allB.btn.textContent="🔊 সব অডিও ("+bn2(nAy)+"টি)";allB.btn.classList.add("rs-mb");
  row.append(...rc.children,allB.btn);allB.style.marginTop="0";allB.style.marginBottom="10px";out.append(row,allB)}
  let curSec="";
  for(const g of D.groups){
   if(g.section&&g.section!==curSec){curSec=g.section;const sg=D.groups.filter(x=>x.section===curSec),sc=sg.flatMap(x=>x.cats);
    out.appendChild(els("div","margin:22px 0 4px;padding:9px 12px;border-radius:10px;font-weight:800;font-size:16px;background:var(--primary);color:#fff",(g.sechd||("শুধু "+curSec+"-এর "+CF.nm))+" — "+bn2(sc.length)+"টি"));
    out.appendChild(audio(sc,(g.sechd||("শুধু "+curSec+"-এর "+CF.nm))+" অডিও"))}
   const multi=D.groups.filter(x=>x.section===g.section).length>1;
   if(multi){out.appendChild(els("div","margin:14px 0 4px;padding:5px 12px;border-radius:10px;font-weight:700;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary)",g.name+" — "+bn2(g.cats.length)+"টি"));out.appendChild(audio(g.cats,"এই ভাগের "+CF.nm+" অডিও"))}
   for(const c of g.cats){
    const box=els("div","border:1px solid var(--border-light);border-radius:12px;padding:10px;margin:8px 0"),hd=els("div","display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap");
    hd.append(els("b","font-size:15px",c.name),els("span","font-size:11.5px;padding:1px 8px;border-radius:9px;border:1px solid var(--border-light);color:"+(c.direct?"var(--primary)":"var(--text-muted)"),c.direct?CF.badge[0]:CF.badge[1]));box.appendChild(hd);
    let KV=null;
    for(const k of c.keys){
     const v=el("div","rs-vi"),rf=el("div","rs-vr"),ar=el("div","rs-vt rs-ar"),bn=el("div","rs-vb"),va=el("div","rs-va"),wh=el("div","rs-ww"),wb=el("button","rs-wb","শব্দে শব্দে অর্থ");wb.type="button";
     rf.append("সূরা ",el("span","rs-ar",SN[k.s-1])," — "+bn2(k.s)+":"+bn2(k.a));
     let WW=null;
     wb.onclick=()=>{wh.classList.toggle("on");if(wh.firstChild||!WW)return;WW.forEach(([x,m])=>{const cl=el("div","rs-wc"),a2=el("div","rs-wa rs-ar",x),b2=el("div","rs-wm",m||"");cl.append(a2,b2);wh.appendChild(cl)})};
     const cpb=copyBtn("📋",()=>"সূরা "+SN[k.s-1]+" — "+k.s+":"+k.a+"\n"+ar.textContent+"\n"+bn.textContent,1);cpb.title="কপি";va.append(wb,cpb);KV={va,wb,cpb};
     if(CF.pick)va.append(CF.pick(c,k,g));v.append(rf,ar,bn,va,wh);box.appendChild(v);
     Promise.all([chunk("a",k.s),chunk(TR,k.s),chunk("w",k.s).catch(()=>null),wqLoad()]).then(([A,B,W])=>{const t=((A||[])[k.a-1]||"").split(" "),mk=wqMarks(k.s,k.a),sl=t.slice(k.from-1,k.to);sl.forEach((x,i)=>{if(i)ar.appendChild(document.createTextNode(" "));ar.appendChild(document.createTextNode(x));const q=mk[k.from+i];if(q){ar.appendChild(document.createTextNode(" "));ar.appendChild(el("span","rs-wq",[...q].map(c=>WQL[c]||"").filter(Boolean).join(" ")))}});
      const ms=((W||[])[k.a-1]||"").split("|").slice(k.from-1,k.to);WW=sl.map((x,i)=>[x,ms[i]]);
      const part=!(k.from<=1&&k.to>=t.length);let x=(B||[])[k.a-1]||"";if(k.bn)x=k.bn;else if(part){/* আয়াতের শুধু দেখানো অংশের অর্থ: bn না থাকলে শব্দার্থ — পুরো আয়াতের অনুবাদ নয় */const m=ms.join(" ").replace(/["“”]/g,"").trim();x=m?"শব্দার্থ: "+m:""}bn.textContent=x}).catch(()=>{ar.textContent="লোড করা যায়নি"})}
    const bt=els("div","display:flex;flex-wrap:wrap;gap:6px;margin-top:8px"),gt=o=>{if(CF.host){location.hash="#search";setTimeout(()=>goTopic(o),90)}else goTopic(o)};
    let tb=null;if(c.treat)bt.appendChild(tb=mkBtn("📚 চিকিৎসা",()=>{const terms=resolve(c.treat);if(!terms.length)return alert("এই রোগের জন্য আয়াতের তালিকা পাওয়া যায়নি");gt({name:c.name,terms,intro:"“"+c.name+"” — সংশ্লিষ্ট সব আয়াত",ordered:false});window.scrollTo({top:0,behavior:"smooth"})}));
    const au=audio([c],"অডিও");if(KV&&c.keys.length===1){KV.va.className="rs-va rs-va1";KV.va.replaceChildren(...[tb,KV.cpb,au.btn,KV.wb].filter(Boolean));box.append(au)}else box.append(bt,au);out.appendChild(box)}}
  if(!CF.host)window.scrollTo({top:rs.getBoundingClientRect().top+scrollY-60,behavior:"smooth"})};
 const DISEASE={file:"quran-disease.json?v="+DV+"x3",title:"💊 শারীরিক রোগ ও আরোগ্যের আয়াত",sq:"শারীরিক রোগ",nm:"আয়াত",badge:["সরাসরি আছে","অঙ্গ অনুযায়ী কাছের আয়াত"],intro:"প্রথমে ঠিক করা হয়েছে রোগটি শরীরের কোন কোন অঙ্গ বা বিষয়ের সাথে সম্পর্কিত; তারপর প্রতিটির জন্য সবচেয়ে কাছের একটি আয়াত (শুধু প্রাসঙ্গিক অংশ)। প্রতিটির নিচে “মিল” লেখা আছে — আয়াতে সরাসরি রোগ/অঙ্গের শব্দ আছে, নাকি শুধু অর্থ বা শব্দের মিল। কুরআনে রোগের নাম (যেমন অর্শ/বাওয়াসির) নেই, তাই অঙ্গ ও লক্ষণের শব্দ ধরে কাছের আয়াত নেওয়া হয়েছে; কোনোটি আয়াতে সরাসরি রোগের কথা নয়। প্রতিটি অঙ্গের নিচে ‘চিকিৎসা: এই রোগের সব আয়াত’ বোতামে ওই অঙ্গের সব আয়াত ও মার্জ অডিও। খসড়া তালিকা: ব্যবহারের আগে আলেম বা অভিজ্ঞদের পর্যালোচনা প্রয়োজন।"};

 /* ───── হোম: রোগীর তথ্য + পুরো রোগ নির্ণয় একসাথে; প্রতিটি আয়াতের পাশে টিক; নিচে WhatsApp-এ পাঠানো ───── */
 {let built=false;const SEL=new Map();
  window.__drHome=()=>{if(built)return;built=true;const H=$("drHome");if(!H)return;
   H.innerHTML="";const lg=k=>lsGet(k,"");
   H.appendChild(els("div","font-weight:800;font-size:18px;color:var(--primary);margin:4px 2px 10px","🩺 রোগ নির্ণয় (ডায়াগনোসিস)"));
   const card=els("div","display:flex;gap:8px;padding:10px;border:1px solid var(--border-light);border-radius:16px;background:var(--card-bg);margin:0 0 12px");
   
   const nm=document.createElement("input"),ph=document.createElement("input");
   [[nm,"Patient name","text","hmName","drPtN"],[ph,"WhatsApp","tel","hmPh","drPtP"]].forEach(([i,pl,t,id,key])=>{i.className="dr-find";i.style.cssText="flex:1;min-width:0;width:auto;margin:0;";i.type=t;i.id=id;i.placeholder=pl;i.autocomplete="off";i.value=lg(key);i.oninput=()=>lsSet(key,i.value);if(t==="tel")i.inputMode="tel";card.appendChild(i)});
   H.appendChild(card);
   /* সময়/মেয়াদের আয়াত এখন রোগ নির্ণয়ের অন্য ভাগগুলোর মতোই তালিকার একেবারে নিচে (data/quran-diagnosis.json) */
   const TM=[],DU=[],TSEL=new Set();let DSEL=null;const refTxt=r=>"সূরা "+SBN[r[0]-1]+" "+bn2(r[0])+":"+bn2(r[1]);
   const info=el("div"),out=el("div");H.append(info,out);
   const bar=els("div","margin:18px 0 6px;padding:12px;border:1px solid var(--border-light);border-radius:16px;background:var(--card-bg);text-align:center");
   const cnt=els("div","font-size:13px;color:var(--text-muted);margin-bottom:8px","কোনো আয়াত বাছা হয়নি");
   const upd=()=>{cnt.textContent=SEL.size?"✔ "+bn2(SEL.size)+"টি আয়াতে রিয়্যাকশন বাছা হয়েছে":"কোনো আয়াত বাছা হয়নি"};
   const send=mkBtn("📤 রোগীর WhatsApp-এ পাঠান",()=>{
    const name=nm.value.trim();let n=ph.value.replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d)).replace(/\D/g,"");
    if(!n){alert("রোগীর WhatsApp নম্বর লিখুন");ph.focus();return}
    if(n.startsWith("00"))n=n.slice(2);else if(n.startsWith("0"))n="88"+n;else if(n.length===10)n="880"+n;
    if(!SEL.size&&!TSEL.size&&!DSEL){alert("কমপক্ষে একটি আয়াতের পাশে টিক দিন বা সময় বাছুন");return}
    const by=new Map();SEL.forEach(x=>{const k=(x.sec?x.sec+" — ":"")+x.name;if(!by.has(k))by.set(k,[]);by.get(k).push("সূরা "+x.sn+" "+bn2(x.s)+":"+bn2(x.a))});
    let m="আসসালামু আলাইকুম"+(name?", "+name:"")+"।\n"+(SEL.size?"রুকইয়াহ রোগ নির্ণয়ে আয়াত শোনার সময় আপনার রিয়্যাকশন হয়েছে যেগুলোতে:\n":"");
    by.forEach((l,k)=>{m+="\n• "+k+"\n   "+l.join("، ")});
    if(TSEL.size){m+="\n\n⏱ সমস্যা বাড়ে: "+[...TSEL].join(", ");TM.forEach(([n,r])=>{if(TSEL.has(n))m+="\n   "+n+" — আয়াত: "+r.map(refTxt).join("، ")});m+="\n(এটি সমস্যা-বাড়ার সময়ের ইঙ্গিত; নিশ্চিত রোগনির্ণয় নয়)"}
    if(DSEL){const r=DU.find(x=>x[0]===DSEL)[1];m+="\n\n⏳ সমস্যা চলছে: "+DSEL+"\n   আয়াত (সময়-এককের উল্লেখ): "+r.map(refTxt).join("، ")}
    m+="\n\n— Masnun Ruqyah";
    const a=document.createElement("a");a.href="https://wa.me/"+n+"?text="+encodeURIComponent(m);a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()});
   send.style.margin="0";bar.append(cnt,send);H.appendChild(bar);
   const pick=(c,k,g)=>{const id=c.name+"|"+k.s+":"+k.a+":"+k.from,lb=els("label","display:inline-flex;align-items:center;gap:6px;margin:0 0 0 auto;padding:4px 10px;border:1px dashed var(--accent);border-radius:999px;font-size:12.5px;color:var(--primary);cursor:pointer;white-space:nowrap"),cb=document.createElement("input");
    cb.type="checkbox";cb.style.cssText="width:18px;height:18px;accent-color:var(--primary)";cb.checked=SEL.has(id);
    cb.onchange=()=>{if(cb.checked)SEL.set(id,{sec:g.section||"",name:c.name,s:k.s,a:k.a,sn:SN[k.s-1]});else SEL.delete(id);upd()};
    lb.append(els("span",null,"রিয়্যাকশন হয়েছে"),cb);return lb};
   showDiag({host:out,infoEl:info,pick})};}
 SHOWT=showTopics;$("rsTp").onclick=()=>showTopics();
 document.querySelectorAll(".rs-ex").forEach(b=>b.onclick=()=>{q.value=b.dataset.q;go()});
 go();loadRoots().catch(()=>{})}
loadRoots().catch(()=>{});
let dlDone=false,dlLast="";try{dlDone=localStorage.getItem("rsAll")===DV}catch(e){}
const dlNote=t=>{const i=$("rsInfo");if(!i)return;if(t){if(!i.textContent||i.textContent===dlLast){i.textContent=t;dlLast=t}}else if(i.textContent===dlLast){i.textContent="";dlLast=""}};
if(!dlDone)setTimeout(async()=>{try{if(navigator.connection&&navigator.connection.saveData)return;
 const ks=["a","c","w"],tot=114*ks.length;let done=0,bad=0;
 for(let z=1;z<=114;z+=3){await Promise.all([0,1,2].filter(d=>z+d<=114).flatMap(d=>ks.map(k=>chunk(k,z+d,1).then(()=>{done++},()=>{done++;bad++}))));dlNote("⬇ ডেটা সেভ হচ্ছে "+bn2(Math.round(done/tot*100))+"%…")}
 dlNote("");if(!bad)try{localStorage.setItem("rsAll",DV)}catch(e){}}catch(e){}},1200);
// ---------- সাইডবার, পেজ-রুট ও সম্পূর্ণ কুরআন রিডার ----------
const SBN="আল-ফাতিহা,আল-বাকারা,আলে ইমরান,আন-নিসা,আল-মায়িদা,আল-আনআম,আল-আরাফ,আল-আনফাল,আত-তাওবা,ইউনুস,হূদ,ইউসুফ,আর-রাদ,ইবরাহীম,আল-হিজর,আন-নাহল,আল-ইসরা,আল-কাহফ,মারইয়াম,ত্বা-হা,আল-আম্বিয়া,আল-হজ্জ,আল-মুমিনূন,আন-নূর,আল-ফুরকান,আশ-শুআরা,আন-নামল,আল-কাসাস,আল-আনকাবূত,আর-রূম,লুকমান,আস-সাজদা,আল-আহযাব,সাবা,ফাতির,ইয়াসীন,আস-সাফফাত,সোয়াদ,আয-যুমার,গাফির,ফুসসিলাত,আশ-শূরা,আয-যুখরুফ,আদ-দুখান,আল-জাসিয়া,আল-আহকাফ,মুহাম্মাদ,আল-ফাতহ,আল-হুজুরাত,ক্বাফ,আয-যারিয়াত,আত-তূর,আন-নাজম,আল-ক্বামার,আর-রহমান,আল-ওয়াকিয়া,আল-হাদীদ,আল-মুজাদালা,আল-হাশর,আল-মুমতাহিনা,আস-সফ,আল-জুমুআ,আল-মুনাফিকূন,আত-তাগাবুন,আত-তালাক,আত-তাহরীম,আল-মুলক,আল-কলম,আল-হাক্কাহ,আল-মাআরিজ,নূহ,আল-জিন,আল-মুযযাম্মিল,আল-মুদ্দাসসির,আল-কিয়ামাহ,আদ-দাহর,আল-মুরসালাত,আন-নাবা,আন-নাযিআত,আবাসা,আত-তাকভীর,আল-ইনফিতার,আল-মুতাফফিফীন,আল-ইনশিকাক,আল-বুরূজ,আত-তারিক,আল-আলা,আল-গাশিয়াহ,আল-ফাজর,আল-বালাদ,আশ-শামস,আল-লাইল,আদ-দুহা,আল-ইনশিরাহ,আত-তীন,আল-আলাক,আল-কদর,আল-বাইয়্যিনাহ,আয-যিলযাল,আল-আদিয়াত,আল-কারিআহ,আত-তাকাসুর,আল-আসর,আল-হুমাযাহ,আল-ফীল,কুরাইশ,আল-মাউন,আল-কাওসার,আল-কাফিরূন,আন-নাসর,আল-লাহাব,আল-ইখলাস,আল-ফালাক,আন-নাস".split(",");
const AC="7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6".split(",").map(Number);
const RMODES=[["ar","আরবি"],["bn","বাংলা"],["arbn","আরবি + বাংলা"],["word","শব্দে শব্দে"]];
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function setFs(n){n=Math.max(20,Math.min(44,n));document.documentElement.style.setProperty("--ar-size",n+"px");lsSet("drFs",String(n));return n}
function readerTop(mode,s){
 const top=el("div","dr-rtop"),seg=el("div","dr-seg");
 RMODES.forEach(([m,l])=>{const b=el("button",m===mode?"on":"",l);b.type="button";b.onclick=()=>{location.hash="#read/"+m+(s?"/"+s:"")};seg.appendChild(b)});
 const nv=el("div","dr-nv"),pv=el("button",null,"‹"),nx=el("button",null,"›"),sel=document.createElement("select");
 pv.type=nx.type="button";pv.title="আগের সূরা";nx.title="পরের সূরা";sel.setAttribute("aria-label","সূরা বেছে নিন");
 const o0=document.createElement("option");o0.value="0";o0.textContent="সূরার তালিকা — ১১৪টি";sel.appendChild(o0);
 SBN.forEach((n,i)=>{const o=document.createElement("option");o.value=i+1;o.textContent=bn2(i+1)+". "+n;sel.appendChild(o)});
 sel.value=String(s||0);
 const go=n=>{location.hash="#read/"+mode+(n?"/"+n:"")};
 sel.onchange=()=>go(+sel.value);pv.disabled=!s||s<=1;nx.disabled=!s||s>=114;pv.onclick=()=>go(s-1);nx.onclick=()=>go(s+1);
 const fm=el("button","fs","A−"),fp=el("button","fs","A+");fm.type=fp.type="button";fm.title="লেখা ছোট";fp.title="লেখা বড়";
 const cur=()=>parseInt(getComputedStyle(document.documentElement).getPropertyValue("--ar-size"))||26;
 fm.onclick=()=>setFs(cur()-2);fp.onclick=()=>setFs(cur()+2);
 nv.append(pv,sel,nx,fm,fp);top.append(seg,nv);return top}
function surahList(body,mode){
 const f=document.createElement("input");f.className="dr-find";f.type="search";f.placeholder="সূরার নাম বা নম্বর লিখে খুঁজুন";f.setAttribute("aria-label","সূরা খুঁজুন");f.autocomplete="off";
 const last=+lsGet("drLast","0");
 if(last>=1&&last<=114){const r=el("div","dr-sl"),n=el("div","dr-no");n.appendChild(el("span",null,bn2(last)));const t=el("div","dr-sn");t.append(el("b",null,"চালিয়ে যান — সূরা "+SBN[last-1]),el("small",null,"সর্বশেষ যে সূরা খুলেছিলেন"));r.append(n,t,el("div","dr-sa",SN[last-1]));r.onclick=()=>{location.hash="#read/"+mode+"/"+last};r.style.borderColor="var(--accent)";body.appendChild(r)}
 body.appendChild(f);
 const list=el("div");body.appendChild(list);
 const draw=()=>{const q=f.value.trim().replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d)),qa=nz(q),qb=fb(q);list.innerHTML="";let c=0;
  SBN.forEach((n,i)=>{if(q&&!(String(i+1)===q||(qa&&nz(SN[i]).includes(qa))||(/[ঀ-৿]/.test(q)&&fb(n).includes(qb))))return;c++;
   const r=el("div","dr-sl"),no=el("div","dr-no"),t=el("div","dr-sn");no.appendChild(el("span",null,bn2(i+1)));t.append(el("b",null,n),el("small",null,bn2(AC[i])+" আয়াত"));r.append(no,t,el("div","dr-sa",SN[i]));r.onclick=()=>{location.hash="#read/"+mode+"/"+(i+1)};list.appendChild(r)});
  if(!c)list.appendChild(el("div","rs-info","কোনো সূরা পাওয়া যায়নি"))};
 f.oninput=draw;draw()}
async function surahView(body,mode,s,g){
 const N=AC[s-1];lsSet("drLast",String(s));SELV.clear();selChange();CURT=null;
 const hero=el("div","dr-hero");hero.append(el("span","ar",SN[s-1]),el("b",null,"সূরা "+SBN[s-1]),el("small",null,"সূরা নং "+bn2(s)+" · মোট "+bn2(N)+" আয়াত"));body.appendChild(hero);
 // আয়াত নম্বরে লাফ
 const jr=els("div","display:flex;gap:8px;margin:0 0 12px"),ji=document.createElement("input");ji.className="dr-find";ji.style.margin="0";ji.type="number";ji.inputMode="numeric";ji.min=1;ji.max=N;ji.placeholder="আয়াত নং (১–"+bn2(N)+")";
 const jb=el("button","rs-wb","যান");jb.type="button";jb.style.cssText="margin:0;flex:none;padding:0 20px;border-radius:14px";jr.append(ji,jb);body.appendChild(jr);
 const ad=el("details","dr-audio"),as=el("summary",null,"🎧 অডিও ও অন্যান্য অপশন"),ab=el("div");ad.append(as,ab);body.appendChild(ad);
 audioBar(ab,Array.from({length:N},(_,i)=>[s,i+1]),null,"সূরা "+SBN[s-1]);
 const host=el("div");body.appendChild(host);
 host.appendChild(el("div","rs-info","লোড হচ্ছে…"));
 let A,B,W=null;
 try{[A,B]=await Promise.all([chunk("a",s),chunk(TR,s)]);await wqLoad()}catch(e){if(g!==RG)return;host.textContent="";const b=el("button","rs-more","লোড করা যায়নি — ইন্টারনেট দেখে আবার চেষ্টা করুন");b.type="button";b.onclick=()=>renderReader(mode,s);host.appendChild(b);return}
 if(mode==="word"||mode==="ar"||mode==="arbn"||mode==="bn")chunk("w",s).then(x=>{W=x}).catch(()=>{});
 if(mode==="word")try{W=await chunk("w",s)}catch(e){W=null}
 if(g!==RG)return;host.textContent="";
 if(s!==1&&s!==9){try{const[A1,B1]=await Promise.all([chunk("a",1),chunk(TR,1)]);if(g!==RG)return;
  if(mode==="bn"){const d=el("div","dr-bis");d.style.cssText="font-family:inherit;font-size:15px;direction:ltr";d.textContent=(B1||[])[0]||"";host.appendChild(d)}else host.appendChild(el("div","dr-bis",(A1||[])[0]||""))}catch(e){}}
 const mk=a=>{const t=A[a-1]||"",tb=(B||[])[a-1]||"";
  const box=el("div","dr-ay"+(mode==="bn"?" bnonly":"")+(mode==="word"?" wordm":""));box.id="ay-"+a;
  const hd=el("div","dr-ah");hd.append(el("span","dr-an",bn2(a)),el("em",null,"সূরা "+SBN[s-1]+" · "+bn2(s)+":"+bn2(a)));
  const tx=el("div","rs-vt rs-ar");arFill(tx,s,a,t,0);
  const tr=el("div","rs-vb");tr.textContent=tb;
  const wh=el("div","rs-ww"),va=el("div","rs-va");
  let filled=false;const fill=()=>{if(filled)return true;if(!W)return false;filled=true;const m=(W[a-1]||"").split("|");t.split(" ").forEach((x,i)=>{const c=el("div","rs-wc"),a2=el("div","rs-wa rs-ar",x),b2=el("div","rs-wm",m[i]||"");c.append(a2,b2);wh.appendChild(c)});return true};
  box.append(hd);
  if(mode==="ar"||mode==="arbn")box.append(tx);
  if(mode==="word"){fill();if(!filled){wh.textContent="শব্দার্থ লোড করা যায়নি";}wh.classList.add("on");box.append(wh,tr)}
  if(mode==="bn"||mode==="arbn")box.append(tr);
  if(mode!=="word"){const wb=el("button","rs-wb","শব্দে শব্দে অর্থ");wb.type="button";
   wb.onclick=async()=>{wh.classList.toggle("on");if(filled)return;wh.textContent="লোড হচ্ছে…";try{W=W||await chunk("w",s);wh.textContent="";if(!fill())wh.textContent="শব্দার্থ পাওয়া যায়নি"}catch(e){wh.textContent="লোড করা যায়নি — আবার চাপুন"}};
   va.appendChild(wb)}
  va.append(copyBtn("📋 কপি",()=>{const h="সূরা "+SN[s-1]+" — "+s+":"+a;return mode==="ar"?h+"\n"+t:mode==="bn"||mode==="word"?h+"\n"+tb:h+"\n"+t+"\n"+tb}),playBtn(s,a),selBox(s,a));
  box.append(va);if(mode!=="word")box.append(wh);return box};
 let i=0;const step=mode==="word"?10:20,more=el("button","rs-more","");more.type="button";host.appendChild(more);
 let io=null;
 const add=n=>{const to=Math.min(N,n||i+step);while(i<to){i++;host.insertBefore(mk(i),more)}
  if(i>=N){more.style.display="none";io&&io.disconnect()}else more.textContent="আরও আয়াত দেখুন ("+bn2(N-i)+" বাকি)"};
 more.onclick=()=>add();
 if("IntersectionObserver"in window){io=new IntersectionObserver(es=>{if(g!==RG){io.disconnect();return}if(es[es.length-1].isIntersecting)add()},{rootMargin:"700px 0px"});io.observe(more)}
 add();
 const jump=()=>{const n=Math.round(+ji.value);if(!n||n<1||n>N)return alert("১ থেকে "+bn2(N)+"-এর মধ্যে আয়াত নম্বর দিন");add(n);const e=$("ay-"+n);e&&e.scrollIntoView({behavior:"smooth",block:"start"})};
 jb.onclick=jump;ji.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();jump()}};
 const en=el("div","dr-end-nav"),pv=el("button",null,"‹ আগের সূরা"),nx=el("button",null,"পরের সূরা ›");pv.type=nx.type="button";pv.disabled=s<=1;nx.disabled=s>=114;
 pv.onclick=()=>{location.hash="#read/"+mode+"/"+(s-1)};nx.onclick=()=>{location.hash="#read/"+mode+"/"+(s+1)};en.append(pv,nx);body.appendChild(en)}
let RG=0;
function renderReader(mode,s){const g=++RG,rd=$("drReader");GEN++;rd.innerHTML="";rd.appendChild(readerTop(mode,s));const body=el("div","dr-rbody");rd.appendChild(body);if(!s)surahList(body,mode);else surahView(body,mode,s,g)}
function drShell(){
 setFs(+lsGet("drFs","26")||26);
 const side=$("drSide"),scrim=$("drScrim"),menu=$("drMenu"),box=$("rsBox"),rd=$("drReader");
 const open=on=>{side.classList.toggle("on",on);scrim.classList.toggle("on",on);document.body.classList.toggle("dr-lock",on);side.setAttribute("aria-hidden",on?"false":"true");menu.setAttribute("aria-expanded",on?"true":"false")};
 menu.onclick=()=>open(true);$("drClose").onclick=scrim.onclick=()=>open(false);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")open(false)});
 const navs=[...document.querySelectorAll(".dr-nav,.dr-bn,.dr-sbtn")];
 let prev="";

 /* ===== নতুন হোম: ৩টি হেডিং (রুকইয়াহ · হিজামা · অন্যান্য), প্রতিটির নিচে বড় বাটন ===== */
 {let built=false;
  const SECS=[
   ["ruq","🩺","রুকইয়াহ",3,[["📋","সিম্পটম ডায়াগনোসিস","#diag"],["💬","রেসপন্স ডায়াগনোসিস",null],["💊","ট্রিটমেন্ট",null]]],
   ["hij","🩸","হিজামা",2,[["📋","রোগ নির্ণয়",null],["💊","চিকিৎসা",null]]],
   ["oth","📜","আচরণবিধি",3,[["🧍","ব্যক্তি কেন্দ্রিক আচরণ",null],["🤝","সামাজিক আচরণ",null],["🏛","রাষ্ট্রীয় আচরণ",null]]],
    ["misc","🧩","অন্যান্য",4,[["📖","কুরআন","@quran"],["⏰","অ্যালার্ম","#alarm"],["🧭","কিবলা",null],["📿","তাসবীহ",null]]]
  ];
  window.__drMain=()=>{if(built)return;built=true;const H=$("mpHome");if(!H)return;H.innerHTML="";const tc=$("drTimeCard");if(tc)H.appendChild(tc);
   SECS.forEach(([id,ic,t,cols,items])=>{
    const sec=el("section","mp-sec");sec.id="mp-"+id;
    sec.appendChild(el("h2","mp-h",ic+" "+t));
    const g=el("div","mp-g");g.style.gridTemplateColumns="repeat("+cols+",minmax(0,1fr))";
    items.forEach(([i,l,h])=>{
     const q=h==="@quran";const b=el(q?"button":h?"a":"span","mp-b"+(h?"":" mp-soon"));if(q){b.type="button";b.onclick=()=>{const p=document.getElementById("mpQuran");if(p)p.hidden=!p.hidden}}else if(h)b.href=h;
     b.appendChild(el("i",null,i));b.appendChild(el("b",null,l));
     g.appendChild(b)});
    sec.appendChild(g);
    if(id==="misc"){const qp=el("div","mp-q");qp.id="mpQuran";qp.hidden=true;[["قرآن","আরবি কুরআন (১৫ লাইন)","#mushaf"],["عب","আরবি ও বাংলা অনুবাদসহ","#read/arbn"]].forEach(([ar,t,hr])=>{const a=el("a","mp-qb");a.href=hr;a.appendChild(el("i","ar",ar));a.appendChild(el("b",null,t));qp.appendChild(a)});sec.appendChild(qp)}
    H.appendChild(sec)});
  };
  window.__drSec=id=>{const x=document.getElementById("mp-"+id);if(x)x.scrollIntoView({behavior:"smooth",block:"start"})};
 }
 let lastH="home";
 const route=()=>{open(false);const h=(location.hash||"#home").replace(/^#/,""),p=h.split("/");
  document.querySelectorAll("audio").forEach(a=>{try{a.pause()}catch(e){}});
  const al=$("drAlarm");if(al)al.hidden=true;const hm=$("drHome");if(hm)hm.hidden=true;const mh=$("mpHome");if(mh)mh.hidden=true;const am=$("drAmol");if(am)am.hidden=true;const rt=$("drRoutine");if(rt)rt.hidden=true;const mf=$("drMushaf");if(mf)mf.hidden=true;
  if(p[0]==="timewidget"){window.DRALARM&&DRALARM.openWidget();location.hash="#"+lastH;return}
  let key="search";
  if(p[0]==="home"&&mh){key="home";box.hidden=true;rd.hidden=true;mh.hidden=false;window.__drMain&&window.__drMain();window.scrollTo(0,0)}
  else if(p[0]==="diag"&&hm){key="diag";box.hidden=true;rd.hidden=true;hm.hidden=false;window.__drHome&&window.__drHome();window.scrollTo(0,0)}
  else if(p[0]==="mushaf"&&mf){key="mushaf";box.hidden=true;rd.hidden=true;mf.hidden=false;window.__drMushaf&&window.__drMushaf(p[1]);window.scrollTo(0,0)}
  else if(p[0]==="routine"&&rt){key="routine";box.hidden=true;rd.hidden=true;rt.hidden=false;window.__drRoutine&&window.__drRoutine(p[1]);window.scrollTo(0,0)}
  else if(p[0]==="alarm"&&al){key="alarm";box.hidden=true;rd.hidden=true;al.hidden=false;window.DRALARM&&DRALARM.show();window.scrollTo(0,0)}
  else if(p[0]==="read"&&RMODES.some(m=>m[0]===p[1])){key="read/"+p[1];const s=+p[2]||0;box.hidden=true;rd.hidden=false;renderReader(p[1],s>=1&&s<=114?s:0);window.scrollTo(0,0)}
  else{rd.hidden=true;box.hidden=false;RG++;if(p[0]==="topics"){key="topics";SHOWT&&SHOWT(true);window.scrollTo(0,0)}else if(prev.startsWith("read/")||prev===""||prev==="home"||prev==="alarm"||prev==="routine"||prev==="mushaf")window.scrollTo(0,0)}
  prev=key;lastH=h;{const bk=$("drBackRow");if(bk)bk.hidden=key==="home";window.__drNav=(window.__drNav||0)+1}{const sh=key==="home"?"":"none";["drTimeCard"].forEach(i=>{const x=$(i);if(x)x.style.display=sh})}navs.forEach(a=>a.classList.toggle("on",a.dataset.nav===key))};
 {const bk=$("drBack");if(bk)bk.onclick=()=>{if((window.__drNav||0)>1)history.back();else location.hash="#home"}}
 navs.forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const sc=a.dataset.sec;if(sc){open(false);if((location.hash||"#home")!=="#home"){location.hash="#home";setTimeout(()=>window.__drSec&&window.__drSec(sc),160)}else window.__drSec&&window.__drSec(sc);return}const h=a.getAttribute("href");if(location.hash===h)route();else location.hash=h;open(false)}));
 addEventListener("hashchange",route);
 route()}
init();drShell();
// ---------- অ্যাপের নিজের আপডেট (শুধু ইনস্টল করা APK-তে; ওয়েবে ব্রাউজার নিজেই নতুন করে) ----------
function drUpdater(){
 const ver=$("drVer"),shr=$("drShare"),fl=$("drUfl"),btn=$("drUbtn"),ph=$("drUph"),pt=$("drUpt");
 const C=window.Capacitor,P=C&&C.Plugins&&C.Plugins.AppUpdater,native=!!(C&&C.isNativePlatform&&C.isNativePlatform()&&P);
 const NAME="Masnun Ruqyah",WEB=location.href.split("#")[0];
 ver.textContent=NAME;
 shr.onclick=async()=>{
  if(native){try{await P.share();return}catch(e){}}
  try{if(navigator.share){await navigator.share({title:NAME,url:WEB});return}}catch(e){return}
  try{await navigator.clipboard.writeText(WEB);shr.textContent="Copied";setTimeout(()=>shr.textContent="Share",1800)}catch(e){}};
 if(!native)return; // ওয়েবে ব্রাউজার নিজেই নতুন করে; আপডেট বোতাম শুধু ইনস্টল করা অ্যাপে
 let cur=null,nw=null,busy=false,pend=false,can=true,t0=0;
 // আপডেট বোতাম: আকার একই থাকে। চাপলে "Update" ঝাপসা প্লেসহোল্ডার হয়ে যায়, বোতামের ভেতরেই পার্সেন্টেজ/Installing… দেখায় ও বোতামটাই প্রগ্রেস বার
 const label=()=>{ph.textContent=can?"Update":"Allow update"};
 const show=()=>{const has=!!(nw&&cur&&nw.versionCode>cur.versionCode);fl.hidden=!(has||busy);if(!busy)label()};
 const setP=(p,t)=>{btn.style.setProperty("--p",p+"%");pt.textContent=t==null?p+"%":t};
 const idle=()=>{busy=false;btn.disabled=false;btn.classList.remove("busy");btn.style.removeProperty("--p");pt.textContent="";show()};
 const toast=t=>{ph.textContent=t;setTimeout(()=>{if(!busy)label()},3500)};
 const closeSide=()=>{const sd=$("drSide");sd.classList.remove("on");$("drScrim").classList.remove("on");document.body.classList.remove("dr-lock")};
 const check=async()=>{if(busy)return;
  try{cur=await P.info();can=!!cur.canInstall;nw=await P.check();lsSet("drChk",String(Date.now()))}catch(e){}
  show();
  if(nw&&cur&&nw.versionCode>cur.versionCode&&can&&!busy&&lsGet("drAutoV","")!==nw.tag){lsSet("drAutoV",nw.tag);go(true)}};
 const go=async auto=>{if(busy||!nw)return;
  let i;try{i=await P.info()}catch(e){return}
  can=!!i.canInstall;
  if(!can){if(auto)return;pend=true;closeSide();try{await P.openSettings()}catch(e){}return}
  busy=true;btn.disabled=true;btn.classList.add("busy");fl.hidden=false;t0=Date.now();setP(0);
  let h=null;try{h=await P.addListener("progress",e=>setP(e.pct))}catch(e){}
  try{await P.install({url:nw.url});setP(100,"Installing…");setTimeout(idle,60000)}
  catch(e){idle();toast("ব্যর্থ — আবার চাপুন")}
  if(h&&h.remove)try{h.remove()}catch(e){}};
 btn.onclick=()=>go(false);
 document.addEventListener("visibilitychange",async()=>{if(document.hidden)return;
  if(pend){try{const i=await P.info();if(i.canInstall){pend=false;can=true;go(false);return}}catch(e){}}
  if(Date.now()-(+lsGet("drChk","0")||0)>5*1000)check()});
 setInterval(()=>{if(!document.hidden)check()},5*1000);
 P.info().then(i=>{cur=i;ver.textContent=NAME+" v"+i.versionName}).catch(()=>{});
 check()}
drUpdater();
})();
