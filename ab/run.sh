#!/usr/bin/env bash
# TEMP paired A/B: toggle ab/cft.patch off/on in the same job and time the eslint-plugin shard.
set -euo pipefail
shard=$1 cov=$2
state=off
run() {
  local want=$1 label=$2 log="/tmp/ab-$1-$2.log"
  if [ "$state" != "$want" ]; then
    if [ "$want" = on ]; then git apply ab/cft.patch; else git apply -R ab/cft.patch; fi
    state=$want
  fi
  rm -rf node_modules/.vite packages/*/node_modules/.vite
  local args=(--shard="$shard" --reporter=dot)
  [ "$cov" = cov ] && args+=(--coverage)
  local s=$(date +%s%N)
  (cd packages/eslint-plugin && pnpm exec vitest run "${args[@]}") > "$log" 2>&1 || { tail -80 "$log"; exit 1; }
  local e=$(date +%s%N)
  echo "AB $cov $shard $want $label: $(( (e - s) / 1000000 ))ms | $(sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -E '^ *Tests ' | tr -s ' ')"
}
run off warmup
run off r1; run on r1; run on r2; run off r2
