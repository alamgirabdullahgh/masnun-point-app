#!/usr/bin/env node
// শুধু দেখায় (কোনো বিচার/ছাঁকনি নেই): data/quran-meaning-cuts.json-এর মার্ক সূরার ক্রমে, আরবি ও বাংলা শব্দ-নম্বর সহ।
// ব্যবহার: node tools/treat-marking/read.js 2:3 40
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..');
const B=JSON.parse(fs.readFileSync(path.join(R,'data','quran-meaning-cuts.json'),'utf8'));
const ch={};const get=(k,s)=>ch[k+s]||(ch[k+s]=JSON.parse(fs.readFileSync(path.join(R,'data','quran-chunks',k,s+'.json'),'utf8')));
const TRK=new Set([6,11,15,17,21,24,29,31,44,48,114]);
const keys=Object.keys(B).filter(k=>k!=='_doc').sort((a,b)=>{const[x,y]=a.split(':').map(Number),[p,q]=b.split(':').map(Number);return x-p||y-q});
const from=process.argv[2]||keys[0],n=+process.argv[3]||40;
let i=keys.indexOf(from);if(i<0){const[fs_,fa]=from.split(':').map(Number);i=keys.findIndex(k=>{const[x,y]=k.split(':').map(Number);return x>fs_||(x===fs_&&y>=fa)})}
let cnt=0;
for(;i<keys.length&&cnt<n;i++){const id=keys[i];const[s,a]=id.split(':').map(Number);
 const ar=get('a',s)[a-1].split(' ');const bn=(TRK.has(s)?get('c',s):get('b',s))[a-1].split(' ');
 console.log('════ '+id);
 console.log('আরবি: '+ar.map((x,j)=>(j+1)+'.'+x).join(' '));
 console.log('বাংলা: '+bn.map((x,j)=>(j+1)+'.'+x).join(' '));
 for(const m of B[id]){cnt++;const[lo,hi]=m.tr,b=m.bn;
  console.log('  ▶ ['+m.topic+'] w'+m.w.join(',')+'  আরবি['+lo+'-'+hi+']: '+ar.slice(lo-1,hi).join(' ')+'   ‖  বাংলা['+(b?b.join('-'):'—')+']: '+(b?bn.slice(b[0]-1,b[1]).join(' '):''));}
}
console.log('\n[পরের শুরু: '+(keys[i]||'শেষ')+']');
