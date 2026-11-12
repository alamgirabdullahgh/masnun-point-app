#!/usr/bin/env node
// চূড়ান্ত যাচাই: সব marks/*.json একসাথে worklist.json ও কোরআন-ডেটার সাথে মেলানো।
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..');
const TRK=new Set([6,11,15,17,21,24,29,31,44,48,114]);
const ch={};const get=(k,s)=>ch[k+s]||(ch[k+s]=JSON.parse(fs.readFileSync(path.join(R,'data','quran-chunks',k,s+'.json'),'utf8')));
const wl=JSON.parse(fs.readFileSync(path.join(__dirname,'worklist.json'),'utf8'));
const mdir=path.join(__dirname,'marks');
const marks=[];
for(const f of fs.readdirSync(mdir).filter(x=>x.endsWith('.json')).sort())
  for(const m of JSON.parse(fs.readFileSync(path.join(mdir,f),'utf8')).marks||[]) marks.push({...m,_f:f});

const errs=[],warns=[];
const covered=new Map(); // "id|w" -> [files]
let longTr=0,noBn=0,relCount={ok:0,weak:0,off:0,other:0};
for(const m of marks){
  const[s,a]=m.id.split(':').map(Number);
  let ar,tr;
  try{ar=get('a',s)[a-1].split(' ');tr=(TRK.has(s)?get('c',s):get('b',s))[a-1].split(' ')}catch(e){errs.push(m._f+' '+m.id+': আয়াত পড়া যায়নি');continue}
  if(!Array.isArray(m.tr)||m.tr.length!==2||!(m.tr[0]>=1&&m.tr[1]>=m.tr[0]&&m.tr[1]<=ar.length))errs.push(m._f+' '+m.id+': tr সীমার বাইরে '+JSON.stringify(m.tr)+' /'+ar.length);
  if(!Array.isArray(m.bn)||m.bn.length!==2){noBn++;errs.push(m._f+' '+m.id+': bn নেই')}
  else if(!(m.bn[0]>=1&&m.bn[1]>=m.bn[0]&&m.bn[1]<=tr.length))errs.push(m._f+' '+m.id+': bn সীমার বাইরে '+JSON.stringify(m.bn)+' /'+tr.length);
  if(!Array.isArray(m.w)||!m.w.length)errs.push(m._f+' '+m.id+': w নেই');
  else for(const w of m.w){
    if(!(w>=m.tr[0]&&w<=m.tr[1]))errs.push(m._f+' '+m.id+': w='+w+' tr '+JSON.stringify(m.tr)+'-এর বাইরে');
    const k=m.id+'|'+w;(covered.get(k)||covered.set(k,[]).get(k)).push(m._f);
  }
  if(m.tr&&m.tr[1]-m.tr[0]+1>15){longTr++;warns.push(m._f+' '+m.id+': tr '+(m.tr[1]-m.tr[0]+1)+' শব্দ (>15)')}
  relCount[['ok','weak','off'].includes(m.rel)?m.rel:'other']++;
}
// worklist কভারেজ
let pairs=0,missing=0;
for(const it of wl)for(const x of it.ws){
  if(x.curated)continue; // আগে থেকেই হাতে করা
  pairs++;
  if(!covered.has(it.id+'|'+x.w)){missing++;errs.push('মার্ক নেই: '+it.id+' w'+x.w)}
}
// একই জোড়া একাধিক ব্যাচে
for(const[k,v]of covered)if(v.length>1)warns.push('সংশোধিত (পরের ফাইলের মার্কই চলে): '+k+' → '+v.join(','));
// ডেটা-ফাইলে আছে কিনা
const cuts=JSON.parse(fs.readFileSync(path.join(R,'data','quran-meaning-cuts.json'),'utf8'));
let notInData=0;
for(const m of marks){const e=cuts[m.id];if(!e){notInData++;errs.push('ডেটায় নেই: '+m.id)}}
console.log('marks:',marks.length,'| worklist বাকি-জোড়া (curated বাদে):',pairs,'| মার্কহীন:',missing);
console.log('rel:',JSON.stringify(relCount),'| >15 শব্দের tr:',longTr,'| bn ছাড়া:',noBn,'| ডেটায় নেই:',notInData);
console.log('ত্রুটি:',errs.length,'| সতর্কতা:',warns.length);
errs.slice(0,40).forEach(x=>console.log('  ✗',x));
warns.slice(0,25).forEach(x=>console.log('  !',x));
process.exit(errs.length?1:0);
