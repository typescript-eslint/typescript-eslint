#!/usr/bin/env bash
# TEMP paired A/B: alternate a patch off/on in the same job and time the test run.
set -euo pipefail
exp=$1 pre=$2 pkg=$3 build=$4
rebuild() { [ "$build" = - ] || pnpm exec tsc -b "packages/$build/tsconfig.build.json"; }
for p in $pre; do git apply "ab/$p.patch"; done
rebuild
state=off
run() {
  local want=$1 i=$2 log="/tmp/ab-$1-$2.log"
  if [ "$state" != "$want" ]; then
    if [ "$want" = on ]; then git apply "ab/$exp.patch"; else git apply -R "ab/$exp.patch"; fi
    rebuild; state=$want
  fi
  # Cold Vitest cache every run, like CI (a warm cache reorders files).
  rm -rf node_modules/.vite packages/*/node_modules/.vite
  local s=$(date +%s%N)
  (cd "packages/$pkg" && pnpm exec vitest run --coverage --reporter=dot) > "$log" 2>&1 || { tail -100 "$log"; exit 1; }
  local e=$(date +%s%N)
  echo "AB $exp $want round $i: $(( (e - s) / 1000000 ))ms | $(sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -E '^ *Tests ' | tr -s ' ')"
}
run off 1; run on 1; run on 2; run off 2
