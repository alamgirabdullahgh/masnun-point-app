#!/usr/bin/env bash
# ওয়ার্কস্পেস বদলালে স্ক্রিনশট বয়ে নেওয়ার ব্যবস্থা।
# ছবি main-এ যায় না — আলাদা `handoff-assets` ব্রাঞ্চে (কখনো merge হয় না)।
# ব্যবহার:
#   GH_TOKEN=... tools/handoff/handoff.sh save  <ছবি...>   # ছোট করে জমা (সীমা: ৮টি / ২ MB, পুরনো আপনাআপনি মোছে)
#   tools/handoff/handoff.sh fetch                          # নতুন ওয়ার্কস্পেসে ছবি নামায় → /tmp/handoff/
#   GH_TOKEN=... tools/handoff/handoff.sh clear             # কাজ শেষে সব মুছে দেয়
# টোকেন কোথাও লেখা হয় না; remote URL-ও বদলায় না।
set -euo pipefail
BR=handoff-assets; MAXN=8; MAXB=2000000
ROOT=$(git rev-parse --show-toplevel); URL=$(git -C "$ROOT" remote get-url origin | sed 's#https://[^@]*@#https://#')
AUTH() { echo "${URL/https:\/\//https://x-access-token:${GH_TOKEN:?GH_TOKEN দরকার}@}"; }
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
prep() { # ব্রাঞ্চ থাকলে নামাও, নইলে খালি orphan
  if git ls-remote --exit-code --heads "$URL" $BR >/dev/null 2>&1; then
    git clone -q --depth 1 -b $BR "$URL" "$W/r"
  else git init -q "$W/r"; git -C "$W/r" checkout -q --orphan $BR; fi
  git -C "$W/r" config user.name Claude; git -C "$W/r" config user.email noreply@anthropic.com
}
push() { git -C "$W/r" add -A; git -C "$W/r" commit -q --allow-empty -m "handoff $(date +%F-%H%M)" 
  git -C "$W/r" push -q --force "$(AUTH)" HEAD:$BR 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/***/g'; }
case "${1:-}" in
save) shift; prep; mkdir -p "$W/r/img"
  for f in "$@"; do python3 - "$f" "$W/r/img/$(date +%s)-$(basename "${f%.*}").jpg" <<'PY'
import sys; from PIL import Image
im=Image.open(sys.argv[1]).convert("RGB"); im.thumbnail((900,1900)); im.save(sys.argv[2],quality=55,optimize=True)
PY
  done
  # সীমা: নতুন ৮টি, মোট ≤ MAXB; পুরনো আগে যায়
  ls -1 "$W/r/img" | sort -r | awk -v n=$MAXN 'NR>n' | while read x; do rm -f "$W/r/img/$x"; done
  while [ "$(du -sb "$W/r/img" | cut -f1)" -gt $MAXB ] && [ "$(ls "$W/r/img" | wc -l)" -gt 1 ]; do rm -f "$W/r/img/$(ls -1 "$W/r/img" | sort | head -1)"; done
  push; echo "জমা: $(ls "$W/r/img" | wc -l)টি ছবি, $(du -sh "$W/r/img" | cut -f1)";;
fetch) rm -rf /tmp/handoff; git clone -q --depth 1 -b $BR "$URL" /tmp/handoff 2>/dev/null && ls /tmp/handoff/img || echo "কোনো জমা-ছবি নেই";;
clear) prep; rm -rf "$W/r/img"; push; echo "সব মোছা হয়েছে";;
*) sed -n '2,9p' "$0";;
esac
