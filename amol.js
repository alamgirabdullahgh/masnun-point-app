/* আমল ও চিকিৎসা-নির্দেশিকা — data/amol-guide.json থেকে পাতা আঁকে। আয়াত দেখায় অ্যাপের নিজস্ব কুরআন-ডেটা (__drChunk) থেকে। */
(function(){
 var SN={1:"ফাতিহা",2:"বাকারা",3:"আলে ইমরান",6:"আন'আম",7:"আ'রাফ",8:"আনফাল",10:"ইউনুস",11:"হূদ",12:"ইউসুফ",13:"রা'দ",15:"হিজর",16:"নাহল",18:"কাহফ",20:"ত্ব-হা",21:"আম্বিয়া",24:"নূর",25:"ফুরকান",27:"নামল",28:"কাসাস",29:"আনকাবুত",30:"রূম",31:"লুকমান",33:"আহযাব",35:"ফাতির",36:"ইয়াসীন",37:"সাফফাত",39:"যুমার",41:"ফুসসিলাত",43:"যুখরুফ",44:"দুখান",50:"ক্বাফ",54:"কামার",59:"হাশর",67:"মুলক",68:"কালাম",71:"নূহ",72:"জিন",85:"বুরূজ",94:"ইনশিরাহ",95:"তীন",99:"যিলযাল",105:"ফীল",112:"ইখলাস",113:"ফালাক",114:"নাস"};
 var BD="০১২৩৪৫৬৭৮৯",DATA=null,ST={},CAT="daily",COND="",GRP="",ITEM=-1,Q="",box=null,loading=null;
 var bn=function(n){return String(n).replace(/\d/g,function(d){return BD[d]})};
 var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
 var GC={"সহীহ হাদিস":"h","কুরআন":"q"};
 function load(){
  if(DATA)return Promise.resolve(DATA);
  if(loading)return loading;
  var u=function(p){return new URL(p,location.href).href};
  loading=Promise.all([fetch(u("data/amol-guide.json?v=8")).then(function(r){if(!r.ok)throw 0;return r.json()}),fetch(u("data/amol-struct.json?v=2")).then(function(r){return r.ok?r.json():{conds:{}}}).catch(function(){return{conds:{}}})]).then(function(x){DATA=x[0];ST=(x[1]&&x[1].conds)||{};return DATA}).catch(function(e){loading=null;throw e});
  return loading;
 }
 function refLabel(r){var n=SN[r[0]]||("সূরা "+bn(r[0]));return "সূরা "+n+" "+bn(r[0])+":"+bn(r[1])+(r[2]?"-"+bn(r[2]):"")}

 /* স্ক্যান থেকে আসা লেখায় প্রতি লাইনের শেষে জোর-নতুনলাইন আছে; বাক্যের মাঝের ভাঙা লাইন জুড়ে, তালিকা/শিরোনাম/অনুচ্ছেদ রেখে সাজাই */
 function fmtTx(t){
  var raw=String(t==null?"":t).replace(/\r/g,"").split("\n"),out=[],cur=null,gap=false;
  var END=/[।?!:;)\]”"'॥]\s*$/,LIST=/^\s*([0-9০-৯]+\s*[.)।\-–:]|[-–—•*●▪◦]\s|সূরা\s)/;
  raw.forEach(function(l){
   l=l.replace(/\s+/g," ").trim();
   if(!l){if(cur!==null){out.push({s:cur,g:false});cur=null}gap=true;return}
   if(cur===null){cur=l;if(gap&&out.length)out[out.length-1].g=true;gap=false;return}
   if(!END.test(cur)&&cur.length>=25&&!LIST.test(l)){cur+=" "+l}
   else{out.push({s:cur,g:gap});cur=l;gap=false}
  });
  if(cur!==null)out.push({s:cur,g:gap});
  return out.map(function(x,i){return'<p'+(i&&x.g?' class="gp"':'')+'>'+esc(x.s)+'</p>'}).join("");
 }

 function stepsHtml(a){return a.map(function(s){return'<div class="am-st">'+(s.h?'<h4>'+esc(s.h)+'</h4>':'')+(s.p||[]).map(function(x){return'<p>'+esc(x)+'</p>'}).join("")+(s.ul?'<ul>'+s.ul.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ul>':'')+(s.ol?'<ol'+(s.start>1?' start="'+s.start+'"':'')+'>'+s.ol.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ol>':'')+'</div>'}).join("")}
 function refsHtml(rs){return'<div class="am-refs">'+rs.map(function(r){return'<details class="am-ref" data-r="'+r.join(",")+'"><summary>'+esc(refLabel(r))+'</summary><div class="am-v">লোড হচ্ছে…</div></details>'}).join("")+'</div>'}
 function card(it){
  var h='<article class="am-it" data-t="'+esc(it.t.toLowerCase())+'">';
  h+='<h3>'+esc(it.t)+'</h3><div class="am-tags"><span class="am-g am-g-'+(GC[it.g]||"s")+'">'+esc(it.g)+'</span>';
  if(it.src)h+='<span class="am-src">'+esc(it.src)+'</span>';
  h+='</div>';
  if(it.steps)h+=stepsHtml(it.steps);
  else if(it.pages)h+=it.pages.map(function(p,i){return'<div class="am-tx">'+fmtTx(p)+'</div>'}).join("");
  if(it.why)h+='<p class="am-why">'+esc(it.why)+'</p>';
  if(it.ar)h+='<div class="am-ar" dir="rtl" lang="ar">'+esc(it.ar)+'</div>';
  if(it.how&&it.how.length)h+='<ol class="am-how">'+it.how.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ol>';
  if(it.note)h+='<div class="am-note">ℹ️ '+esc(it.note)+'</div>';
  if(it.refs&&it.refs.length){
   h+='<div class="am-refs">'+it.refs.map(function(r,i){return'<details class="am-ref" data-r="'+r.join(",")+'"><summary>'+esc(refLabel(r))+'</summary><div class="am-v">লোড হচ্ছে…</div></details>'}).join("")+'</div>';
  }
  if(it.bk)h+='<div class="am-bk">📚 বই: '+esc(it.bk)+'</div>';
  return h+'</article>';
 }
 function fillRef(d){
  var v=d.querySelector(".am-v");if(!v||d.__done)return;d.__done=1;
  var r=d.dataset.r.split(",").map(Number),s=r[0],a=r[1],b=r[2]||a;
  var C=window.__drChunk;
  if(!C){v.textContent="আয়াতের ডেটা এখন পাওয়া যাচ্ছে না।";d.__done=0;return}
  Promise.all([C("a",s),C("b",s)]).then(function(x){
   var h="";for(var i=a;i<=b;i++){var ar=x[0][i-1],t=x[1][i-1];if(ar==null)continue;
    h+='<div class="am-ay"><div class="am-ay-ar" dir="rtl" lang="ar">'+esc(ar)+' <span class="am-n">﴿'+bn(i)+'﴾</span></div>'+(t?'<div class="am-ay-bn">'+esc(t)+'</div>':'')+'</div>'}
   v.innerHTML=h||"আয়াত পাওয়া যায়নি।";
  }).catch(function(){v.textContent="আয়াত লোড করা যায়নি। ইন্টারনেট চালু করে আবার চেষ্টা করুন।";d.__done=0});
 }
 function bookOf(cid){return cid.indexOf("b2")===0?"যাদুগ্রস্ত উম্মতের গাইড":"চালান কাটার গোপন বিদ্যা"}
 function itemOf(r){return DATA.cats.filter(function(c){return c.id===r[0]})[0].items[r[1]]}
 function draw(){
  if(!box||!DATA)return;
  var cd=COND?DATA.conds.filter(function(x){return x.id===COND})[0]:null;
  if(!cd){
   var vis=DATA.conds.filter(function(c){return !GRP||c.items.some(function(r){return(r[0].indexOf("b2")===0?"jadu":"jin")===GRP})});
   box.innerHTML='<h2 class="am-h">'+(GRP==="jadu"?"জাদু — ট্রিটমেন্ট":GRP==="jin"?"জিন — ট্রিটমেন্ট":"ট্রিটমেন্ট")+'</h2><div class="am-cl">'+vis.map(function(c){return'<button type="button" class="am-cond" data-k="'+c.id+'"><i>'+c.icon+'</i><span>'+esc(c.title)+'</span><b>›</b></button>'}).join("")+'</div>';
   return;
  }
  var sc=ST[cd.id];
  if(sc&&sc.treat){
   var ox=cd.items.map(function(r){return card(itemOf(r))}).join("");
   box.innerHTML='<button type="button" class="am-back" data-to="a">← সব রোগ/সমস্যা</button><h2 class="am-h"><i>'+cd.icon+'</i> '+esc(cd.title)+'</h2><div class="am-lk">'+(sc.resp?'<a href="#diag/'+(cd.items[0][0].indexOf("b2")===0?"jadu":"jin")+'">রেসপন্স</a>':'')+'</div><h3 class="am-sh">ট্রিটমেন্ট</h3>'+stepsHtml(sc.treat)+(sc.refs&&sc.refs.length?refsHtml(sc.refs):'')+(sc.mud?'<details class="am-orig"><summary>মুদাব্বিরের (চিকিৎসকের) জন্য নির্দেশ — রোগীর প্রয়োজন নেই</summary>'+stepsHtml(sc.mud)+'</details>':'')+'<details class="am-orig"><summary>বইয়ের মূল লেখা (অপরিবর্তিত)</summary>'+ox+'</details>';
   return;
  }
  if(cd.items.length===1&&ITEM<0)ITEM=0;
  if(ITEM>=0&&cd.items[ITEM]){
   var r=cd.items[ITEM],h=card(itemOf(r)).replace(/<div class="am-tags">.*?<\/div>/,'<div class="am-bk0">'+esc(bookOf(r[0]))+'</div>');
   box.innerHTML='<button type="button" class="am-back" data-to="'+(cd.items.length>1?'c':'a')+'">← '+(cd.items.length>1?esc(cd.title):'সব রোগ/সমস্যা')+'</button>'+h;
   return;
  }
  box.innerHTML='<button type="button" class="am-back" data-to="a">← সব রোগ/সমস্যা</button><h2 class="am-h"><i>'+cd.icon+'</i> '+esc(cd.title)+'</h2><div class="am-cl">'+cd.items.map(function(r,i){var it=itemOf(r);return'<button type="button" class="am-cond" data-i="'+i+'"><span>'+esc(it.t)+'<small>'+esc(bookOf(r[0]))+'</small></span><b>›</b></button>'}).join("")+'</div>';
 }
 function filter(){
  var q=Q.trim().toLowerCase(),b=document.getElementById("amBody");if(!b)return;
  var n=0;b.querySelectorAll(".am-it").forEach(function(a){var ok=!q||(a.__t||(a.__t=a.textContent.toLowerCase())).indexOf(q)>=0;a.style.display=ok?"":"none";if(ok)n++});
  b.querySelectorAll(".am-sec").forEach(function(s){s.style.display=s.querySelector(".am-it:not([style*=\"none\"])")?"":"none"});b.querySelectorAll(".am-gsec").forEach(function(s){s.style.display=s.querySelector(".am-sec:not([style*=\"none\"])")?"":"none"});
  var e=b.querySelector(".am-empty");if(!n&&q){if(!e){e=document.createElement("div");e.className="am-empty";e.textContent="এই ট্যাবে কিছু পাওয়া যায়নি। অন্য ট্যাবে দেখুন।";b.appendChild(e)}}else if(e)e.remove();
 }

 /* ডায়াগনোসিস পাতায় রোগ অনুযায়ী লক্ষণ/রেসপন্স: kind = "sym" | "resp"; g = "jadu" | "jin" | "" */
 window.__drAmolSec=function(kind,host,g){
  if(!host)return;
  load().then(function(){
   var cs=DATA.conds.filter(function(c){var sc=ST[c.id];if(!sc||!sc[kind])return false;if(!g)return true;var ids=c.items.map(function(r){return r[0].indexOf("b2")===0?"jadu":"jin"});return ids.indexOf(g)>=0});
   if(!cs.length){host.innerHTML="";return}
   host.innerHTML='<h3 class="am-sh">রোগ/সমস্যা অনুযায়ী '+(kind==="sym"?"লক্ষণ":"রেসপন্স")+'</h3>'+cs.map(function(c){return'<details class="am-sd"><summary><i>'+c.icon+'</i> '+esc(c.title)+'</summary>'+stepsHtml(ST[c.id][kind])+'<a class="am-go" href="#amol/'+c.id+'">এই রোগের ট্রিটমেন্ট →</a></details>'}).join("");
  }).catch(function(){});
 };
 function secMount(){
  var m=/^#diag(?:\/([a-z]+))?/.exec(location.hash||"");if(!m)return;
  var kind="resp",g=m[1]==="jadu"||m[1]==="jin"?m[1]:"",page=document.getElementById("drHome");if(!page)return;
  var id="amSec_resp",h=document.getElementById(id);
  if(!h){h=document.createElement("div");h.id=id;h.className="am-sec2";var t=page.querySelector("#drHomeT,h2");if(t&&t.parentNode===page)t.insertAdjacentElement("afterend",h);else page.insertBefore(h,page.firstChild)}
  window.__drAmolSec(kind,h,g);
 }
 window.addEventListener("hashchange",function(){setTimeout(secMount,250)});setTimeout(secMount,600);
 function init(){
  box=document.getElementById("drAmol");if(!box||box.__w)return;box.__w=1;
  box.addEventListener("click",function(e){var nz=e.target.closest&&e.target.closest(".am-nazar");if(nz){e.preventDefault();location.hash="#search";setTimeout(function(){window.__drOpenTopic&&window.__drOpenTopic("বদনজর")},90);return}var cb=e.target.closest&&e.target.closest(".am-cond");if(cb){if(cb.dataset.k){COND=cb.dataset.k;ITEM=-1}else ITEM=+cb.dataset.i;draw();window.scrollTo(0,0);return}var bk=e.target.closest&&e.target.closest(".am-back");if(bk){if(bk.dataset.to==="a")COND="";ITEM=-1;draw();window.scrollTo(0,0)}});
  box.addEventListener("toggle",function(e){var d=e.target;if(d.classList&&d.classList.contains("am-ref")&&d.open)fillRef(d)},true);
  box.addEventListener("input",function(e){if(e.target.id==="amQ"){Q=e.target.value;filter()}});
 }
 window.__drAmol=function(sub){
  init();if(!box)return;
  COND=(sub&&/^c-/.test(sub))?sub:"";GRP=/^b2/.test(sub||"")?"jadu":/^b1/.test(sub||"")?"jin":(COND?GRP:"");ITEM=-1;
  if(DATA){draw();return}
  box.innerHTML='<div class="am-load">লোড হচ্ছে…</div>';
  load().then(draw).catch(function(){box.innerHTML='<div class="am-load">তথ্য লোড করা যায়নি। ইন্টারনেট চালু করে আবার খুলুন।</div>'});
 };
 /* সরাসরি #amol লিংকে/রিলোডে app.js আগে চলে যায়; তাই স্ক্রিপ্ট লোড হলে নিজেই আঁকি */
 var m=/^#amol(?:\/([a-z]+))?/.exec(location.hash||"");if(m)window.__drAmol(m[1]);
})();
