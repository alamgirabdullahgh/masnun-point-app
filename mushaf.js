/* আরবি কুরআন: ১৫ লাইনের ইন্দো-পাক মুসহাফ (৬১০ পাতা). ডেটা: data/quran-mushaf15-N.json, ফন্ট: IndoPak Nastaleeq Waqf Lazim.
   পাতা = স্থির ১৫টা সারি; সূরার ব্যানার ও বিসমিল্লাহ নিজের সারিতে; ওপরে হেডার (পারা/পাতা/সূরা), নিচে মনযিল; বইয়ের মতো পাতা ওল্টানো। */
(function(){
 var SAR="الفاتحة|البقرة|آل عمران|النساء|المائدة|الأنعام|الأعراف|الأنفال|التوبة|يونس|هود|يوسف|الرعد|إبراهيم|الحجر|النحل|الإسراء|الكهف|مريم|طه|الأنبياء|الحج|المؤمنون|النور|الفرقان|الشعراء|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|الأحزاب|سبأ|فاطر|يس|الصافات|ص|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|محمد|الفتح|الحجرات|ق|الذاريات|الطور|النجم|القمر|الرحمن|الواقعة|الحديد|المجادلة|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|الإنسان|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|البينة|الزلزلة|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|النصر|المسد|الإخلاص|الفلق|الناس".split("|"),
 HS="1:1,2:2,50:3,77:4,107:5,128:6,151:7,177:8,187:9,208:10,222:11,236:12,249:13,256:14,262:15,268:16,282:17,293:18,306:19,313:20,322:21,332:22,342:23,350:24,360:25,367:26,377:27,386:28,397:29,405:30,412:31,415:32,418:33,428:34,435:35,441:36,446:37,453:38,459:39,468:40,477:41,483:42,490:43,496:44,499:45,502:46,507:47,511:48,516:49,518:50,521:51,524:52,526:53,529:54,532:55,535:56,538:57,542:58,546:59,549:60,552:61,554:62,555:63,556:64,558:65,560:66,562:67,565:68,568:69,570:70,572:71,574:72,577:73,578:74,581:75,582:76,585:77,586:78,588:79,590:80,591:81,592:82,593:83,595:84,596:85,597:87,598:88,599:89,600:90,601:91,602:92,603:95,604:96,605:98,606:100,607:103,608:106,609:109,610:113".split(",").map(function(x){x=x.split(":");return[+x[0],+x[1]]}),
 BD="০১২৩৪৫৬৭৮৯",AD="٠١٢٣٤٥٦٧٨٩",BIS="بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ",TOT=610,
 box=null,PG=1,BM=0,TK=0,CH={},FONT=null,RM=false;
 var bn=function(n){return String(n).replace(/\d/g,function(d){return BD[d]})},ad=function(n){return String(n).replace(/\d/g,function(d){return AD[d]})};
 var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
 var $=function(i){return document.getElementById(i)};
 function hsur(p){var s=1;for(var i=0;i<HS.length;i++){if(HS[i][0]<=p)s=HS[i][1];else break}return s}
 function juz(p){return p<=21?1:Math.min(30,Math.floor((p-22)/20)+2)}
 function manzil(s){return s<=4?1:s<=9?2:s<=16?3:s<=25?4:s<=36?5:s<=49?6:7}
 function chunk(k){return CH[k]||(CH[k]=fetch(new URL("data/quran-mushaf15-"+k+".json?v=1",location.href).href).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(e){delete CH[k];throw e}))}
 /* ১৫টা স্থির সারি সাজানো: ডেটার ফাঁকা সারিতে ব্যানার (ও বিসমিল্লাহ) বসে; ডেটায় ফাঁক না থাকলে (৫টা পাতা) নিচের লাইন সরে যায়; সূরা মাঝ-লাইনে শুরু হলে লাইন ভেঙে দেয় */
 function mk(t){return /[\uf500-\uf5ff]/.exec(t)}
 function layout(L){
  var R=new Array(16).fill(null),shift=0,ks=Object.keys(L).map(Number).sort(function(a,b){return a-b});
  function gap(p){var g=0;while(g<2&&p-1-g>=1&&!R[p-1-g])g++;return g}
  ks.forEach(function(ln){
   var e=L[ln],t=e.t,s=e.s,pos=ln+shift;
   if(s&&s!==1&&s!==9){var m=mk(t);if(m&&m[0]!=="\uf500"){var cut=t.indexOf(m[0])+1;R[pos]={t:t.slice(0,cut).trim()};shift++;pos++;t=t.slice(cut).trim()}}
   if(s){var need=(s===1||s===9)?1:2,g=gap(pos);if(g<need){shift+=need-g;pos+=need-g}
    if(pos-need>=1){R[pos-need]={ban:s};if(need===2)R[pos-1]={bis:1}}}
   if(pos<=15)R[pos]={t:t};
  });
  return R;
 }
 function words(t){var o=[];t.split(/\s+/).forEach(function(w){if(!w)return;if(o.length&&!/[\u0621-\u064A\u066E-\u06D3\u0671]/.test(w))o[o.length-1]+=" "+w;else o.push(w)});return o}
 function spans(a){return a.map(function(w){return"<span>"+esc(w)+"</span>"}).join("")}
 function sheetHTML(n,L){
  var R=L?layout(L):[],h="",s=hsur(n);
  for(var i=1;i<=15;i++){var r=R[i];
   if(!r)h+='<div class="mq-r mq-e"></div>';
   else if(r.ban)h+='<div class="mq-r mq-ban"><span lang="ar" dir="rtl">سورة '+esc(SAR[r.ban-1])+'</span></div>';
   else if(r.bis)h+='<div class="mq-r mq-c mq-bis" dir="rtl" lang="ar">'+spans(words(BIS))+'</div>';
   else h+='<div class="mq-r" dir="rtl" lang="ar">'+spans(words(r.t))+'</div>'}
  return '<div class="mq-hd" dir="rtl"><span lang="ar">الجزء '+ad(juz(n))+'</span><span class="mq-pn">'+bn(n)+' / '+bn(TOT)+'</span><span lang="ar">'+esc(SAR[s-1])+' '+ad(s)+'</span></div>'
   +'<button type="button" class="mq-bm'+(BM===n?' on':'')+'" data-bm="1" aria-label="বুকমার্ক"><svg viewBox="0 0 22 30" width="22" height="30"><path d="M2 1h18v27l-9-7-9 7z"/></svg></button>'
   +'<div class="mq-fr">'+h+'</div><div class="mq-ft" lang="ar">منزل '+ad(manzil(s))+'</div>';
 }
 /* প্রতি পাতায় সবচেয়ে চওড়া লাইন ঠিক ফ্রেমে ধরে এমন ফন্ট-সাইজ; বাকি লাইন দু-পাশে সমান করে ছড়ানো (justify); ছোট লাইন (সূরার শেষ) মাঝখানে */
 function fit(sh){
  var fr=sh&&sh.querySelector(".mq-fr");if(!fr||!fr.clientWidth)return;
  var cs=getComputedStyle(fr),av=fr.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var rows=[].slice.call(fr.querySelectorAll(".mq-r:not(.mq-e):not(.mq-ban)")),F0=40,worst=0;
  if(!rows.length||av<=0)return;
  fr.style.fontSize=F0+"px";
  rows.forEach(function(r){var w=0,n=r.children.length;[].forEach.call(r.children,function(c){w+=c.offsetWidth});r.__w=w;if(!r.classList.contains("mq-bis")){var need=(w+Math.max(0,n-1)*F0*.16)/av;if(need>worst)worst=need}});
  var fs=Math.min(F0/(worst||1),fr.clientHeight/15*.8);fs=Math.floor(fs*10)/10;
  fr.style.fontSize=fs+"px";
  rows.forEach(function(r){var nx=r.nextElementSibling,end=!nx||nx.classList.contains("mq-e")||nx.classList.contains("mq-ban"),nat=r.__w*fs/F0;r.classList.toggle("mq-c",r.classList.contains("mq-bis")||(nat<av*.7&&end)||nat<av*.4)});
 }
 function foot(){
  var f=$("mqFoot");if(!f)return;
  f.innerHTML=(BM&&BM!==PG)?'<button type="button" data-jump="1">🔖 বুকমার্ক করা পাতা '+bn(BM)+'-এ যান</button>':'১৫ লাইনের মুসহাফ · পাতা '+bn(PG)+(BM===PG?' · 🔖 বুকমার্ক করা':'');
 }
 function mount(n,L,dir){
  var st=$("mqStage");if(!st)return;
  var cur=st.querySelector(".mq-cur");
  [].slice.call(st.children).forEach(function(c){if(c!==cur){c.remove()}});
  if(cur&&cur.getAnimations)cur.getAnimations().forEach(function(a){a.cancel()});
  var sh=document.createElement("div");sh.className="mq-sheet mq-cur";sh.dataset.p=n;
  sh.innerHTML=L?sheetHTML(n,L):'<div class="am-load">পাতা পাওয়া যায়নি।</div>';
  st.appendChild(sh);fit(sh);
  if(cur){cur.classList.remove("mq-cur")}
  if(!cur||!dir||RM||!sh.animate){if(cur)cur.remove();return}
  var up=dir>0?cur:sh,under=dir>0?sh:cur;
  under.style.zIndex=1;up.style.zIndex=3;up.style.transformOrigin="100% 50%";
  var a=up.animate(dir>0?[{transform:"rotateY(0deg)",boxShadow:"0 0 0 rgba(0,0,0,0)"},{transform:"rotateY(90deg)",boxShadow:"-16px 0 30px rgba(0,0,0,.35)"}]:[{transform:"rotateY(90deg)",boxShadow:"-16px 0 30px rgba(0,0,0,.35)"},{transform:"rotateY(0deg)",boxShadow:"0 0 0 rgba(0,0,0,0)"}],{duration:420,easing:"ease-in-out",fill:"both"});
  var done=function(){if(cur.parentNode)cur.remove();sh.style.zIndex="";sh.style.transformOrigin="";if(sh.getAnimations)sh.getAnimations().forEach(function(x){x.cancel()})};
  a.onfinish=done;a.oncancel=function(){if(cur.parentNode)cur.remove()};
 }
 function show(n,dir){
  PG=n;try{localStorage.setItem("mq-pg",n)}catch(e){}try{history.replaceState(null,"","#mushaf/"+n)}catch(e){}
  var inp=$("mqP");if(inp)inp.value=n;foot();
  var tk=++TK,k=Math.floor((n-1)/30);
  Promise.all([chunk(k),FONT]).then(function(a){if(tk!==TK)return;mount(n,a[0][n],dir);
    if(n%30>20&&n<TOT)chunk(k+1).catch(function(){});if(n%30<=9&&k>0)chunk(k-1).catch(function(){})})
   .catch(function(){var st=$("mqStage");if(tk===TK&&st)st.innerHTML='<div class="mq-sheet mq-cur"><div class="am-load">লোড করা যায়নি। ইন্টারনেট চালু করে আবার চেষ্টা করুন।</div></div>'});
 }
 function go(n){n=Math.max(1,Math.min(TOT,n|0||1));if(n===PG)return;show(n,Math.abs(n-PG)===1?(n>PG?1:-1):0)}
 function draw(){
  if(!box)return;
  box.innerHTML='<h2 class="am-h">আরবি কুরআন</h2><div class="mq-nav"><button type="button" data-g="1" aria-label="পরের পাতা">‹ পরের</button><label>পাতা <input id="mqP" type="number" min="1" max="'+TOT+'" value="'+PG+'"> / '+bn(TOT)+'</label><button type="button" data-g="-1" aria-label="আগের পাতা">আগের ›</button></div><div class="mq-stage" id="mqStage"><div class="mq-sheet mq-cur"><div class="am-load">লোড হচ্ছে…</div></div></div><div class="mq-foot" id="mqFoot"></div>';
  show(PG,0);
 }
 function init(){
  box=$("drMushaf");if(!box||box.__w)return;box.__w=1;
  try{RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  FONT=(document.fonts&&document.fonts.load)?document.fonts.load('34px "IndoPak Waqf Lazim"',"ا").catch(function(){}):Promise.resolve();
  try{BM=+localStorage.getItem("mq-bm")||0}catch(e){}
  box.addEventListener("click",function(e){var t=e.target,b;
   if(!t.closest)return;
   if(b=t.closest("[data-g]")){go(PG+ +b.dataset.g)}
   else if(t.closest("[data-bm]")){BM=(BM===PG)?0:PG;try{localStorage.setItem("mq-bm",BM)}catch(x){}var r=box.querySelector(".mq-cur .mq-bm");if(r)r.classList.toggle("on",BM===PG);foot()}
   else if(t.closest("[data-jump]")){go(BM)}});
  box.addEventListener("change",function(e){if(e.target.id==="mqP")go(+e.target.value)});
  var sx=0,sy=0;
  box.addEventListener("touchstart",function(e){if(e.target.closest&&e.target.closest("input"))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  box.addEventListener("touchend",function(e){if(!sx)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=0;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(PG+(dx>0?1:-1))},{passive:true});
  document.addEventListener("keydown",function(e){if(!box||box.hidden||/INPUT|TEXTAREA/.test((e.target||{}).tagName||""))return;if(e.key==="ArrowLeft")go(PG+1);else if(e.key==="ArrowRight")go(PG-1)});
  var rz;window.addEventListener("resize",function(){clearTimeout(rz);rz=setTimeout(function(){if(box&&!box.hidden)fit(box.querySelector(".mq-cur"))},120)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(box&&!box.hidden)fit(box.querySelector(".mq-cur"))});
 }
 window.__drMushaf=function(sub){init();if(!box)return;var n=parseInt(sub,10);if(n)PG=Math.max(1,Math.min(TOT,n));else{try{PG=+localStorage.getItem("mq-pg")||PG}catch(e){}}draw()};
 var m=/^#mushaf(?:\/(\d+))?/.exec(location.hash||"");if(m)window.__drMushaf(m[1]);
})();
