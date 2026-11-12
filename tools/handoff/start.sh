#!/usr/bin/env bash
# নতুন চ্যাটে এক কমান্ডে কাজ ধরা:  GH_TOKEN=<টোকেন> bash <(curl -s ...) অথবা ক্লোনের পর  tools/handoff/start.sh
# হালকা ক্লোন (শুধু দরকারি ফোল্ডার, ইতিহাস ছাড়া) + অসমাপ্ত কাজ (wip) + ছবি + ছোট সারাংশ।
set -euo pipefail
REPO=${REPO:-alamgirabdullahgh/daily-ruqyah}; D=${D:-/home/claude/daily-ruqyah}
: "${GH_TOKEN:?GH_TOKEN দরকার}"
U="https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git"
if [ ! -d "$D/.git" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse "$U" "$D" 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/***/g'
  git -C "$D" sparse-checkout set --no-cone /tools/treat-marking/ /tools/handoff/ /data/quran-chunks/ /data/quran-meaning-cuts.json /app.js /sw.js
  git -C "$D" remote set-url origin "https://github.com/${REPO}.git"
fi
cd "$D"; git config user.name Claude; git config user.email noreply@anthropic.com
# অসমাপ্ত কাজ থাকলে তুলে নাও
if git ls-remote --exit-code --heads "$U" wip >/dev/null 2>&1; then
  git fetch -q --depth 1 "$U" wip 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/***/g'
  git diff --quiet HEAD FETCH_HEAD -- 2>/dev/null || { git checkout -q FETCH_HEAD -- . && echo "▶ অসমাপ্ত কাজ (wip) তোলা হয়েছে: $(git log -1 --format=%s FETCH_HEAD)"; }
fi
tools/handoff/handoff.sh fetch 2>/dev/null | sed 's/^/ছবি: /' || true
echo "── অবস্থা ──"; tail -n 6 tools/treat-marking/PROGRESS.md
[ -f tools/handoff/STATE.md ] && { echo "── শেষ থামার জায়গা ──"; cat tools/handoff/STATE.md; }
exit 0
