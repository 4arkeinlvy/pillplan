#!/usr/bin/env bash
# Takes the documentation screenshots from a running `npm run preview` (port 4173).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/tex/screenshots"
URL="${URL:-http://localhost:4173}"
CHROME="${CHROME:-google-chrome-stable}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
mkdir -p "$OUT"

shot() { # name width height path
  timeout 60 "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --user-data-dir="$PROFILE" --virtual-time-budget=5000 \
    --window-size="$2,$3" --screenshot="$OUT/$1.png" "$URL/$4" >/dev/null 2>&1
  echo "wrote docs/tex/screenshots/$1.png"
}

shot desktop 1440 1750 '?example'
shot phone 390 2600 '?example'
shot counseling 1280 900 '?counsel'
shot empty 1440 950 ''
timeout 60 "$CHROME" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
  --user-data-dir="$PROFILE" --virtual-time-budget=5000 \
  --print-to-pdf="$OUT/print.pdf" "$URL/?example" >/dev/null 2>&1
echo "wrote docs/tex/screenshots/print.pdf"
