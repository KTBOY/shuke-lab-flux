#!/usr/bin/env bash
# 本地视觉验收脚本：用 Edge 无头模式把 dev server 渲染成 PNG，便于与参考图逐块比对。
# 用法: bash scripts/screenshot.sh [输出相对路径]
set -euo pipefail

OUT="${1:-.qoder/tmp/shot.png}"
URL="${URL:-http://localhost:5174/}"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
WIDTH="${WIDTH:-1260}"
HEIGHT="${HEIGHT:-830}"

mkdir -p "$(dirname "$OUT")"
OUT_WIN="$(cygpath -aw "$OUT")"
rm -f "$OUT"

"$EDGE" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size="${WIDTH},${HEIGHT}" \
  --virtual-time-budget=6000 \
  --screenshot="${OUT_WIN}" \
  "$URL" 2>&1 | grep -Ei 'bytes written|ERROR:.*screenshot' || true

[ -f "$OUT" ] && echo "saved: $OUT_WIN" || { echo "failed: $OUT_WIN" >&2; exit 1; }
