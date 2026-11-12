#!/usr/bin/env bash
# কাজের মাঝে/থামার আগে চালাও: অসমাপ্ত বদলগুলো `wip` ব্রাঞ্চে জমা (main অক্ষত)। ব্যবহার: GH_TOKEN=... tools/handoff/wip.sh "কোথায় থামলাম"
set -euo pipefail; : "${GH_TOKEN:?}"
R=$(git rev-parse --show-toplevel); cd "$R"
printf '%s\n(%s)\n' "${1:-থামা}" "$(date '+%F %H:%M')" > tools/handoff/STATE.md
U=$(git remote get-url origin | sed "s#https://#https://x-access-token:${GH_TOKEN}@#")
git add -A; git stash -q --include-untracked 2>/dev/null || true; git stash apply -q 2>/dev/null || true
T=$(git write-tree 2>/dev/null); C=$(git commit-tree "$T" -p HEAD -m "wip: ${1:-থামা}")
git push -q --force "$U" "$C":refs/heads/wip 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/***/g'; echo "wip জমা: ${1:-থামা}"
