#!/usr/bin/env node
// ব্যবহার: node tools/treat-marking/apply.js   (marks/*.json যাচাই করে data/quran-meaning-cuts.json-এ মেলায়)
// মার্ক ফরম্যাট (marks/NNN.json): {"marks":[{"id":"2:102","w":[38],"tr":[37,51],"bn":[a,b] (ঐচ্ছিক, বাংলা অনুবাদের শব্দ-নম্বর ১-ভিত্তিক),"note":"কেন এই সীমা","topic":"বিচ্ছেদের জাদু"}]}
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..'),mp=path.join(R,'data','quran-meaning-cuts.json');
const WL=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(__dirname,'worklist.json'),'utf8')).map(v=>[v.id,v]));
const mc=JSON.parse(fs.readFileSync(mp,'utf8'));
const mdir=path.join(__dirname,'marks');let bad=0,add=0,upd=0;
for(const f of fs.readdirSync(mdir).filter(x=>x.endsWith('.json')).sort()){
 for(const m of JSON.parse(fs.readFileSync(path.join(mdir,f),'utf8')).marks||[]){
  const v=WL[m.id];const err=x=>{console.error('ভুল',f,m.id,x);bad++};
  if(!v){err('worklist-এ নেই');continue}
  if(!Array.isArray(m.w)||!m.w.length||!Array.isArray(m.tr)||m.tr.length!==2){err('w/tr ঠিক নেই');continue}
  const [lo,hi]=m.tr;
  if(!(lo>=1&&hi<=v.N&&lo<=hi)){err('tr সীমার বাইরে (N='+v.N+')');continue}
  if(!m.w.every(w=>w>=lo&&w<=hi)){err('মিলে যাওয়া শব্দ tr-এর বাইরে');continue}
  if(!m.w.every(w=>v.ws.some(x=>x.w===w))){err('w worklist-এর জোড়ায় নেই');continue}
  if(m.bn!==undefined&&!(Array.isArray(m.bn)&&m.bn.length===2&&m.bn[0]>=1&&m.bn[1]>=m.bn[0])){err('bn [শুরু,শেষ] (১-ভিত্তিক) ঠিক নেই');continue}
  const arr=mc[m.id]||(mc[m.id]=[]);
  /* পুরনো এন্ট্রি একাধিক w ঢাকলে (যেমন ২৪:৩১-এ w5+w7 একসাথে) এবং নতুন মার্ক তার একটি অংশই ঢাকলে — পুরনোটা থেকে ওই w বাদ দিয়ে আলাদা এন্ট্রি হয় */
  for(const c of arr.slice())if(c.w&&c.w.some(w=>m.w.includes(w))&&c.w.some(w=>!m.w.includes(w))){c.w=c.w.filter(w=>!m.w.includes(w))}
  const e=arr.find(c=>c.w&&c.w.some(w=>m.w.includes(w)));
  if(e){e.w=m.w.slice().sort((a,b)=>a-b);e.tr=[lo,hi];if(m.bn)e.bn=m.bn;if(m.note)e.note=m.note;if(m.topic&&!e.topic)e.topic=m.topic;upd++}
  else{arr.push(Object.assign({topic:m.topic||'',w:m.w.slice().sort((a,b)=>a-b),tr:[lo,hi]},m.bn?{bn:m.bn}:{},{note:m.note||''}));add++}
 }}
if(bad){console.error(bad+'টি ভুলের কারণে লেখা হয়নি');process.exit(1)}
const keys=Object.keys(mc).filter(k=>k!=='_doc').sort((a,b)=>{const[x,y]=a.split(':').map(Number),[p,q]=b.split(':').map(Number);return x-p||y-q});
const o={_doc:mc._doc};for(const k of keys)o[k]=mc[k];
fs.writeFileSync(mp,JSON.stringify(o,null,1).replace(/\n\s{3,}/g,m=>m)+'\n');
console.log('নতুন '+add+', হালনাগাদ '+upd+', মোট আয়াত-এন্ট্রি '+keys.length);
