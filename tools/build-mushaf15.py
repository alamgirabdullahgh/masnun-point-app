# Quran.com (mushaf=6) 15-line IndoPak page/line data -> data/quran-mushaf15-N.json (30 pages each)
# source: ShakesVision/quran-archive qurancom/comprehensive-15Lines  (word.text, rendered with IndoPak Nastaleeq Waqf Lazim)
import json,collections,sys
src=sys.argv[1]
pages=collections.defaultdict(lambda: collections.defaultdict(list)); starts={}
for n in range(1,115):
    d=json.load(open(f'{src}/{n}.json'))
    for v in d['verses']:
        for w in v['words']:
            pg,ln=w['page_number'],w['line_number']
            pages[pg][ln].append(w['text'])
            if v['verse_number']==1 and w['position']==1: starts[(pg,ln)]=n
out=collections.defaultdict(dict)
for pg in sorted(pages):
    L={}
    for ln,ws in pages[pg].items():
        e={'t':' '.join(ws)}
        if (pg,ln) in starts: e['s']=starts[(pg,ln)]
        L[str(ln)]=e
    out[(pg-1)//30][str(pg)]=L
for k,v in out.items(): json.dump(v,open(f'data/quran-mushaf15-{k}.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),'chunks')
