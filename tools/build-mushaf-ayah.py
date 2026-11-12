# প্রতি পাতার প্রথম শব্দ কোন সূরা:আয়াতের, তা ডেটার আয়াত-শেষ চিহ্ন গুনে বের করে data/quran-mushaf15-pa.json বানায়
import json,re,glob
CNT=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
assert len(CNT)==114 and sum(CNT)==6236,(len(CNT),sum(CNT))
L=re.compile(r'[\u0621-\u064A\u066E-\u06D3\u0671]')
P={}
for f in glob.glob('data/quran-mushaf15-*.json'):
    if f.endswith('-pa.json'):continue
    P.update({int(k):v for k,v in json.load(open(f)).items()})
s,a,out,bad=1,1,[0]*611,0
for p in range(1,611):
    out[p]=s*1000+a
    for ln in sorted(P[p],key=int):
        e=P[p][str(ln)]
        txt=e['t']
        parts=[txt]
        if e.get('s') and e['s']!=s:
            m=re.search(r'[\uf500-\uf5ff]',txt)
            if m and m.group(0)!='\uf500':
                cut=m.start()+1;parts=[txt[:cut],txt[cut:]]
                parts_first=True
            else: parts=['',txt]
        for i,part in enumerate(parts):
            if e.get('s') and e['s']!=s and (len(parts)==2 and i==1):
                if a!=1: bad+=1;print('banner mismatch p',p,'expected surah',s,'ayah',a)
                s,a=e['s'],1
            ws=[]
            for w in part.split():
                if ws and not L.search(w): ws[-1]+=' '+w
                else: ws.append(w)
            for w in ws:
                if '\u06df' in w.replace('\u06ec\u06df',''):
                    a+=1
                    if a>CNT[s-1]:
                        s,a=s+1,1
                        if s>114: s,a=114,1
print('mismatches',bad,'final',s,a)
json.dump(out,open('data/quran-mushaf15-pa.json','w'))
print(out[262],out[263],out[1],out[610],out[282],out[586])
