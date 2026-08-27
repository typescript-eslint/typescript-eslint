#!/usr/bin/env bash
# Test runner for the no-misused-promises index signature enhancement.
#
# Usage:
#   ./test.sh [--output_path <junit.xml>] <base|new>
#
# base  — run existing no-misused-promises tests as a regression check.
# new   — run the new index-signature tests; these fail before the solution
#          and pass after it.

set -uo pipefail

cd /app

OUTPUT_PATH=""
if [ "${1:-}" = "--output_path" ]; then
  OUTPUT_PATH="$2"
  shift 2
fi

MODE="${1:-new}"

REPORTER_ARGS=""
if [ -n "$OUTPUT_PATH" ]; then
  REPORTER_ARGS="--reporter=junit --outputFile=$OUTPUT_PATH"
fi

STATUS=0

case "$MODE" in
  base)
    # Run the existing no-misused-promises tests as regression check.
    npx vitest run \
      --no-file-parallelism \
      $REPORTER_ARGS \
      packages/eslint-plugin/tests/rules/no-misused-promises.test.ts \
      2>&1
    STATUS=$?
    ;;
  new)
    # Run only the new index-signature tests.
    npx vitest run \
      --no-file-parallelism \
      $REPORTER_ARGS \
      packages/eslint-plugin/tests/rules/no-misused-promises-index-signatures.test.ts \
      2>&1
    STATUS=$?
    ;;
  *)
    echo "unknown mode: $MODE (expected base or new)" >&2
    exit 2
    ;;
esac

exit "$STATUS"
