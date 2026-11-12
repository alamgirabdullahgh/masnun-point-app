/* রুকইয়াহ দৈনিক রুটিন + রোগীর করণীয় + বিষয়ভিত্তিক বিজ্ঞাপন-স্লাইড (data/routine.json, patient-guide.json, ads.json) */
(function(){
 var BD="০১২৩৪৫৬৭৮৯",R=null,P=null,AD=null,box=null,TAB="routine",DIS="jinn",LV=2,SN={1:"ফাতিহা",2:"বাকারা",7:"আ'রাফ",10:"ইউনুস",13:"রা'দ",20:"ত্ব-হা",37:"সাফফাত",59:"হাশর",67:"মুলক",68:"কালাম",112:"ইখলাস",113:"ফালাক",114:"নাস"};
 var bn=function(n){return String(n).replace(/\d/g,function(d){return BD[d]})};
 var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
 var j=function(u){return fetch(new URL(u,location.href).href).then(function(r){if(!r.ok)throw 0;return r.json()})};
 function load(){return Promise.all([R||j("data/routine.json?v=2"),P||j("data/patient-guide.json?v=1"),AD||j("data/ads.json?v=1").catch(function(){return{items:[]}})]).then(function(x){R=x[0];P=x[1];AD=x[2]})}
 function refLabel(r){return "সূরা "+(SN[r[0]]||bn(r[0]))+" "+bn(r[0])+":"+bn(r[1])+(r[2]?"-"+bn(r[2]):"")}
 function item(x){
  var h='<div class="rt-it"><div class="am-tags"><span class="am-g">'+esc(x.g)+'</span></div><div class="rt-t">'+esc(x.t)+'</div>';
  if(x.ar)h+='<div class="am-ar" dir="rtl" lang="ar">'+esc(x.ar)+'</div>';
  if(x.how)h+='<ol class="am-how">'+x.how.map(function(s){return'<li>'+esc(s)+'</li>'}).join("")+'</ol>';
  if(x.note)h+='<div class="am-note">ℹ️ '+esc(x.note)+'</div>';
  if(x.refs)h+='<div class="am-refs">'+x.refs.map(function(r){return'<details class="am-ref" data-r="'+r.join(",")+'"><summary>'+esc(refLabel(r))+'</summary><div class="am-v">লোড হচ্ছে…</div></details>'}).join("")+'</div>';
  return h+'</div>';
 }
 function fillRef(d){
  var v=d.querySelector(".am-v");if(!v||d.__done)return;d.__done=1;
  var r=d.dataset.r.split(",").map(Number),s=r[0],a=r[1],b=r[2]||a,C=window.__drChunk;
  if(!C){v.textContent="আয়াতের ডেটা এখন পাওয়া যাচ্ছে না।";d.__done=0;return}
  Promise.all([C("a",s),C("b",s)]).then(function(x){var h="";for(var i=a;i<=b;i++){var ar=x[0][i-1],t=x[1][i-1];if(ar==null)continue;
   h+='<div class="am-ay"><div class="am-ay-ar" dir="rtl" lang="ar">'+esc(ar)+' <span class="am-n">﴿'+bn(i)+'﴾</span></div>'+(t?'<div class="am-ay-bn">'+esc(t)+'</div>':'')+'</div>'}
   v.innerHTML=h||"আয়াত পাওয়া যায়নি।"}).catch(function(){v.textContent="আয়াত লোড করা যায়নি।";d.__done=0});
 }
 function ads(topic){
  var l=(AD&&AD.items||[]).filter(function(a){return a.topics.indexOf(topic)>=0});if(!l.length)return"";
  return'<div class="ad-wrap"><div class="ad-lbl">বিজ্ঞাপন · এই বিষয়ের সাথে সম্পর্কিত</div><div class="ad-strip">'+l.map(function(a){
   var im=a.img?'<img src="'+esc(a.img)+'" alt="" loading="lazy">':'<div class="ad-ic">'+esc(a.icon||"🛒")+'</div>';
   var bt=a.url?'<a class="ad-b" href="'+esc(a.url)+'" target="_blank" rel="sponsored noopener">দেখুন</a>':'<span class="ad-b off">শীঘ্রই আসছে</span>';
   return'<div class="ad-card">'+im+'<b>'+esc(a.title)+'</b><p>'+esc(a.desc)+'</p>'+bt+'</div>'}).join("")+'</div></div>';
 }
 window.__drAds=function(topic){return load().then(function(){return ads(topic)})};
 function routineHTML(){
  var d=R.dis.filter(function(x){return x.id===DIS})[0]||R.dis[0],h='';
  h+='<div class="rt-sel"><label>রোগ/সমস্যা<select id="rtD">'+R.dis.map(function(x){return'<option value="'+x.id+'"'+(x.id===DIS?" selected":"")+'>'+x.icon+" "+esc(x.name)+'</option>'}).join("")+'</select></label>';
  h+='<div class="rt-lv">'+R.levels.map(function(l){return'<button type="button" class="am-tab'+(l.id===LV?" on":"")+'" data-l="'+l.id+'">'+esc(l.name)+'</button>'}).join("")+'</div><div class="rt-ld">'+esc(R.levels[LV-1].d)+'</div></div>';
  if(d.note)h+='<div class="am-note">ℹ️ '+esc(d.note)+'</div>';
  R.slots.forEach(function(s){
   var all=s.items.concat((d.add&&d.add[s.id])||[]).filter(function(x){return x.lv<=LV});if(!all.length)return;
   h+='<section class="rt-slot"><div class="rt-time">'+esc(s.time)+'</div><h3>'+esc(s.title)+'</h3>'+all.map(item).join("")+'</section>'});
  return h+ads(DIS);
 }
 function patientHTML(){return P.cats.map(function(c){return'<article class="am-it"><h3>'+c.icon+" "+esc(c.title)+'</h3><ul class="rt-ul">'+c.items.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ul></article>'}).join("")}
 function draw(){
  if(!box||!R)return;
  var tabs='<div class="am-tabs"><button type="button" class="am-tab'+(TAB==="routine"?" on":"")+'" data-t="routine"><i>🗓</i>দৈনিক রুটিন</button><button type="button" class="am-tab'+(TAB==="patient"?" on":"")+'" data-t="patient"><i>🧭</i>রোগীর করণীয়</button></div>';
  box.innerHTML='<h2 class="am-h">রুকইয়াহ আমলের রুটিন</h2><p class="am-intro">'+esc(R.intro)+'</p><div class="am-warn">⚕ খসড়া: প্রকাশের আগে একজন আলেম দিয়ে যাচাই করিয়ে নিন। রুকইয়াহ ডাক্তারি চিকিৎসার বিকল্প নয়; গুরুতর বা হঠাৎ উপসর্গে আগে ডাক্তার দেখান।</div>'+tabs+(TAB==="routine"?routineHTML():patientHTML());
 }
 function init(){
  box=document.getElementById("drRoutine");if(!box||box.__w)return;box.__w=1;
  box.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-t],[data-l]");if(!t)return;if(t.dataset.t){TAB=t.dataset.t;draw();window.scrollTo(0,0)}else{LV=+t.dataset.l;draw()}});
  box.addEventListener("change",function(e){if(e.target.id==="rtD"){DIS=e.target.value;draw()}});
  box.addEventListener("toggle",function(e){var d=e.target;if(d.classList&&d.classList.contains("am-ref")&&d.open)fillRef(d)},true);
 }
 window.__drRoutine=function(sub){init();if(!box)return;if(sub==="patient"||sub==="routine")TAB=sub;
  if(R){draw();return}box.innerHTML='<div class="am-load">লোড হচ্ছে…</div>';
  load().then(draw).catch(function(){box.innerHTML='<div class="am-load">লোড করা যায়নি। ইন্টারনেট চালু করে আবার চেষ্টা করুন।</div>'})};
 var m=/^#routine(?:\/([a-z]+))?/.exec(location.hash||"");if(m)window.__drRoutine(m[1]);
})();
