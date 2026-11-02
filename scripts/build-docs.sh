#!/usr/bin/env bash
# Builds docs/pdf/PillPlan-PRD.pdf and docs/pdf/PillPlan-Technical.pdf with Tectonic.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/docs/tex"
mkdir -p build ../pdf
run() {
  if command -v tectonic >/dev/null; then tectonic "$@"; else nix-shell -p tectonic --run "tectonic $*"; fi
}
run -X compile --keep-logs --outdir build prd.tex
run -X compile --keep-logs --outdir build technical.tex
cp build/prd.pdf ../pdf/PillPlan-PRD.pdf
cp build/technical.pdf ../pdf/PillPlan-Technical.pdf
echo "wrote docs/pdf/PillPlan-PRD.pdf and docs/pdf/PillPlan-Technical.pdf"
