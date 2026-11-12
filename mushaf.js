/* আরবি কুরআন: ১৫ লাইনের হাফেজি/ইন্দো-পাক মুসহাফ (৬১০ পাতা). ডেটা: data/quran-mushaf15-N.json, ফন্ট: IndoPak Nastaleeq Waqf Lazim */
(function(){
 var SBN="আল-ফাতিহা,আল-বাকারা,আলে ইমরান,আন-নিসা,আল-মায়িদা,আল-আনআম,আল-আরাফ,আল-আনফাল,আত-তাওবা,ইউনুস,হূদ,ইউসুফ,আর-রাদ,ইবরাহীম,আল-হিজর,আন-নাহল,আল-ইসরা,আল-কাহফ,মারইয়াম,ত্বা-হা,আল-আম্বিয়া,আল-হজ্জ,আল-মুমিনূন,আন-নূর,আল-ফুরকান,আশ-শুআরা,আন-নামল,আল-কাসাস,আল-আনকাবূত,আর-রূম,লুকমান,আস-সাজদা,আল-আহযাব,সাবা,ফাতির,ইয়াসীন,আস-সাফফাত,সোয়াদ,আয-যুমার,গাফির,ফুসসিলাত,আশ-শূরা,আয-যুখরুফ,আদ-দুখান,আল-জাসিয়া,আল-আহকাফ,মুহাম্মাদ,আল-ফাতহ,আল-হুজুরাত,ক্বাফ,আয-যারিয়াত,আত-তূর,আন-নাজম,আল-ক্বামার,আর-রহমান,আল-ওয়াকিয়া,আল-হাদীদ,আল-মুজাদালা,আল-হাশর,আল-মুমতাহিনা,আস-সফ,আল-জুমুআ,আল-মুনাফিকূন,আত-তাগাবুন,আত-তালাক,আত-তাহরীম,আল-মুলক,আল-কলম,আল-হাক্কাহ,আল-মাআরিজ,নূহ,আল-জিন,আল-মুযযাম্মিল,আল-মুদ্দাসসির,আল-কিয়ামাহ,আদ-দাহর,আল-মুরসালাত,আন-নাবা,আন-নাযিআত,আবাসা,আত-তাকভীর,আল-ইনফিতার,আল-মুতাফফিফীন,আল-ইনশিকাক,আল-বুরূজ,আত-তারিক,আল-আলা,আল-গাশিয়াহ,আল-ফাজর,আল-বালাদ,আশ-শামস,আল-লাইল,আদ-দুহা,আল-ইনশিরাহ,আত-তীন,আল-আলাক,আল-কদর,আল-বাইয়্যিনাহ,আয-যিলযাল,আল-আদিয়াত,আল-কারিআহ,আত-তাকাসুর,আল-আসর,আল-হুমাযাহ,আল-ফীল,কুরাইশ,আল-মাউন,আল-কাওসার,আল-কাফিরূন,আন-নাসর,আল-লাহাব,আল-ইখলাস,আল-ফালাক,আন-নাস".split(","),BD="০১২৩৪৫৬৭৮৯",box=null,PG=1,CH={},BIS="بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ",TOT=610;
 var bn=function(n){return String(n).replace(/\d/g,function(d){return BD[d]})};
 var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
 function chunk(k){return CH[k]||(CH[k]=fetch(new URL("data/quran-mushaf15-"+k+".json?v=1",location.href).href).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(e){delete CH[k];throw e}))}
 function pageHTML(L){
  var h="";
  for(var ln=1;ln<=15;ln++){var e=L[ln];if(!e)continue;
   if(e.s){h+='<div class="mq-sur"><span>সূরা '+esc(SBN[e.s-1]||e.s)+'</span></div>';if(e.s!==1&&e.s!==9)h+='<div class="mq-ln mq-bis" dir="rtl" lang="ar">'+BIS+'</div>'}
   h+='<div class="mq-ln" dir="rtl" lang="ar">'+e.t.split(" ").map(function(w){return"<span>"+esc(w)+"</span>"}).join("")+'</div>'}
  return h;
 }
 function fit(){
  var el=document.getElementById("mqPg");if(!el)return;var cs=getComputedStyle(el),av=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var ls=[].slice.call(el.querySelectorAll(".mq-ln:not(.mq-bis)"));if(!ls.length||av<=0)return;
  var fs=34;el.style.fontSize=fs+"px";
  for(var i=0;i<6;i++){var worst=0;ls.forEach(function(l){var w=0,n=0;[].forEach.call(l.children,function(c){w+=c.getBoundingClientRect().width;n++});l.__w=w;var need=w+Math.max(0,n-1)*fs*0.22;if(need/av>worst)worst=need/av});
   if(worst<=1)break;fs=Math.floor(fs/worst*100)/100;el.style.fontSize=fs+"px"}
  ls.forEach(function(l){l.classList.toggle("mq-short",l.__w<av*0.78)});
 }
 function draw(){
  if(!box)return;
  var k=Math.floor((PG-1)/30);
  box.innerHTML='<h2 class="am-h">আরবি কুরআন</h2><div class="mq-nav"><button type="button" data-g="1" aria-label="পরের পাতা">‹ পরের</button><label>পাতা <input id="mqP" type="number" min="1" max="'+TOT+'" value="'+PG+'"> / '+bn(TOT)+'</label><button type="button" data-g="-1" aria-label="আগের পাতা">আগের ›</button></div><div class="mq-pg" id="mqPg"><div class="am-load">লোড হচ্ছে…</div></div><div class="mq-foot">১৫ লাইনের মুসহাফ · পাতা '+bn(PG)+'</div>';
  chunk(k).then(function(d){var L=d[PG];var el=document.getElementById("mqPg");if(el)el.innerHTML=L?pageHTML(L):'<div class="am-load">পাতা পাওয়া যায়নি।</div>';if(L){fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit)}})
   .catch(function(){var el=document.getElementById("mqPg");if(el)el.innerHTML='<div class="am-load">লোড করা যায়নি। ইন্টারনেট চালু করে আবার চেষ্টা করুন।</div>'});
  if(PG<TOT)chunk(Math.floor(PG/30)).catch(function(){});
 }
 function go(n){n=Math.max(1,Math.min(TOT,n|0||1));PG=n;try{localStorage.setItem("mq-pg",n)}catch(e){}try{history.replaceState(null,"","#mushaf/"+n)}catch(e){}draw();window.scrollTo(0,0)}
 function init(){
  box=document.getElementById("drMushaf");if(!box||box.__w)return;box.__w=1;
  box.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-g]");if(b)go(PG+ +b.dataset.g)});
  box.addEventListener("change",function(e){if(e.target.id==="mqP")go(+e.target.value)});
  var sx=0;box.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});
  box.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>70)go(PG+(dx>0?1:-1))},{passive:true});
 }
 window.__drMushaf=function(sub){init();if(!box)return;var n=parseInt(sub,10);if(n)PG=Math.max(1,Math.min(TOT,n));else{try{PG=+localStorage.getItem("mq-pg")||PG}catch(e){}}draw()};
 var m=/^#mushaf(?:\/(\d+))?/.exec(location.hash||"");if(m)window.__drMushaf(m[1]);
})();
