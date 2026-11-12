#!/usr/bin/env node
// ব্যবহার: node tools/treat-marking/check.js [ফাইল-নাম-অংশ]   — marks-এর প্রতিটির আরবি অংশ + অ্যাপ যে বাংলা অংশ মার্ক করবে (bnPortion-এর হুবহু একই হিসাব) দেখায়, যাতে আরবি-বাংলা অমিল ধরা যায়।
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..');
const TRK=new Set([6,11,15,17,21,24,29,31,44,48,114]);
const ch={};const get=(k,s)=>ch[k+s]||(ch[k+s]=JSON.parse(fs.readFileSync(path.join(R,'data','quran-chunks',k,s+'.json'),'utf8')));
function bnPortion(al,PR,N,nb){let b=1e9,e=-1;for(const it of String(al||"").split(",")){const p=it.split(":");const w=+p[0];if(!p[1]||w<PR[0]||w>PR[1])continue;const r=p[1].split("-").map(Number);if(r.length!==2||!(r[1]>=r[0]))continue;b=Math.min(b,r[0]);e=Math.max(e,r[1])}
 if(e<0)return null;if(PR[0]<=1)b=0;if(PR[1]>=N)e=nb-1;e=Math.min(e,nb-1);return b<=e?[b,e]:null}
const mdir=path.join(__dirname,'marks'),flt=process.argv[2]||'';
for(const f of fs.readdirSync(mdir).filter(x=>x.endsWith('.json')&&x.includes(flt)).sort())for(const m of JSON.parse(fs.readFileSync(path.join(mdir,f),'utf8')).marks||[]){
 const[s,a]=m.id.split(':').map(Number),ar=get('a',s)[a-1].split(' '),N=ar.length,tr=(TRK.has(s)?get('c',s):get('b',s))[a-1],bw=tr.split(' ');
 const pr=m.bn?[m.bn[0]-1,Math.min(m.bn[1],bw.length)-1]:bnPortion(get('m',s)[a-1],m.tr,N,bw.length);
 console.log(m.id+' w'+m.w+' ['+m.tr+'/'+N+'] AR: '+ar.slice(m.tr[0]-1,m.tr[1]).join(' '));
 console.log('     BN: '+(pr?(m.bn?'[হাতে] ':'[স্বয়ংক্রিয়] ')+bw.slice(pr[0],pr[1]+1).join(' ')+'   {'+(pr[0]+1)+'-'+(pr[1]+1)+'/'+bw.length+'}':'(সারিবদ্ধ নেই — অ্যাপ পুরো/আন্দাজ ব্যবহার করবে)'));
}
