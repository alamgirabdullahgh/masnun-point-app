#!/usr/bin/env bash
# এজেন্ট-বাস: Claude/Gemini/Grok সবাই একই কাজের তালিকা পড়ে-লেখে (GitHub ব্রাঞ্চ `agent-bus`, main অক্ষত)।
# ব্যবহার (GH_TOKEN দরকার):
#   bus.sh init | status | add "কাজ" | next <এজেন্ট> | progress <id> <০-১০০> "নোট" | done <id> "নোট" | limit <এজেন্ট> "নোট"
set -euo pipefail; : "${GH_TOKEN:?GH_TOKEN দরকার}"
REPO=${REPO:-alamgirabdullahgh/daily-ruqyah}; BR=agent-bus
U="https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git"; cmd=${1:-status}; shift || true
mask(){ sed 's/github_pat_[A-Za-z0-9_]*/***/g'; }
for try in 1 2 3 4 5; do
  W=$(mktemp -d)
  if git ls-remote --exit-code --heads "$U" $BR >/dev/null 2>&1; then git clone -q --depth 1 -b $BR "$U" "$W/r" 2>&1 | mask >&2
  else git init -q "$W/r"; git -C "$W/r" checkout -q --orphan $BR; echo '{"tasks":[],"agents":{},"events":[]}' > "$W/r/bus.json"; fi
  python3 - "$W/r/bus.json" "$cmd" "$@" <<'PY'
import sys,json,time,os,shutil
f,cmd,*a=sys.argv[1:]; d=json.load(open(f)); now=time.strftime('%Y-%m-%d %H:%M'); ch=True
def ev(m): d['events'].append({'t':now,'msg':m}); d['events']=d['events'][-60:]
def T(i): return next(t for t in d['tasks'] if t['id']==int(i))
def rmf(t):
    for x in t.get('files',[]):
        try: os.remove(os.path.join(os.path.dirname(f),x['path']))
        except Exception: pass
def ag(n,**k): d['agents'].setdefault(n,{}).update(k,seen=now)
if cmd=='init': pass
elif cmd=='add':
    i=max([t['id'] for t in d['tasks']]+[d.get('seq',0),0])+1; d['seq']=i
    d['tasks'].append(dict(id=i,text=a[0],status='queued',agent='',progress=0,note='',created=now,updated=now)); ev(f'নতুন কাজ #{i}: {a[0][:60]}'); print(i)
elif cmd=='next':
    n=a[0]; t=next((t for t in d['tasks'] if t['status']=='queued' and (t.get('target') in ('',None,n) or d['agents'].get(t.get('target'),{}).get('state')=='limit')),None)
    if not t: ag(n,state='idle',task=0); print('কোনো কাজ নেই'); 
    else:
        if t['agent'] and t['agent']!=n: ev(f"এজেন্ট বদল: {t['agent']} → {n} (কাজ #{t['id']})")
        else: ev(f"{n} কাজ #{t['id']} শুরু করল")
        t.update(status='running',agent=n,updated=now); ag(n,state='working',task=t['id'])
        print(f"#{t['id']}: {t['text']}\nআগের নোট: {t['note'] or '—'}\nঅগ্রগতি: {t['progress']}%")
        for x in t.get('files',[]):
            src=os.path.join(os.path.dirname(f),x['path']); os.makedirs('/tmp/agent-files',exist_ok=True); dst='/tmp/agent-files/'+os.path.basename(x['path']).split('-',2)[-1]
            if os.path.exists(src): shutil.copy(src,dst); print(f"📎 ফাইল ({x.get('type','')}, {x.get('size',0)} বাইট, আসল নাম: {x['name']}): {dst}")
elif cmd=='progress':
    t=T(a[0]); t.update(progress=int(a[1]),note=a[2] if len(a)>2 else t['note'],updated=now); ag(t['agent'] or '?',state='working',task=t['id']); print('ok')
elif cmd=='done':
    t=T(a[0]); t.update(status='done',progress=100,note=a[1] if len(a)>1 else t['note'],updated=now); ag(t['agent'] or '?',state='idle',task=0); ev(f"কাজ #{t['id']} শেষ ({t['agent']})"); rmf(t); print('ok')
elif cmd=='limit':
    n=a[0]; note=a[1] if len(a)>1 else ''
    for t in d['tasks']:
        if t['status']=='running' and t['agent']==n: t.update(status='queued',note=(note or 'লিমিট শেষ')+' — wip থেকে চালিয়ে যাও',updated=now); ev(f'{n}-এর লিমিট শেষ → কাজ #{t["id"]} সারিতে ফিরল')
    ag(n,state='limit',task=0); print('ok')
elif cmd=='status':
    ch=False
    for n,v in d['agents'].items(): print(f"এজেন্ট {n}: {v.get('state')} (কাজ #{v.get('task',0)})")
    for t in d['tasks']: print(f"#{t['id']} [{t['status']}] {t['agent'] or '-'} {t['progress']}% — {t['text'][:70]} | {t['note'][:70]}")
else: print('অজানা কমান্ড'); ch=False
if ch: json.dump(d,open(f,'w'),ensure_ascii=False,indent=1)
PY
  cd "$W/r"; git config user.name "Agent"; git config user.email noreply@anthropic.com
  if [ -n "$(git status --porcelain)" ]; then git add -A; git commit -q -m "bus: $cmd"
    git push -q "$U" HEAD:$BR 2>&1 | mask >&2 && break || { sleep 1; cd /; rm -rf "$W"; continue; }
  else break; fi
done
cd /; rm -rf "$W"
