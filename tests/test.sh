#!/usr/bin/env bash
# test.sh — Run the in-browser test suite headless, the same way locally and in CI.
#
#   bash tests/test.sh            # forbidden-API scan + tests.html over HTTP
#
# Serves the repo over HTTP (three source-reading tests need it), loads tests.html in headless
# Chrome (or Edge), and fails unless the runner reports a pass. Override the browser with
# CHROME=/path/to/browser and the port with PORT=nnnn.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Forbidden-API source scan"
if grep -rnE "eval\(|new Function|innerHTML\s*=|fetch\(|XMLHttpRequest" js | grep -v "js/graphics/icons.js"; then
  echo "::error::Forbidden API found (see README §5 'Safe rendering')"
  exit 1
fi
echo "ok"

if [ -z "${CHROME:-}" ]; then
  for candidate in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
    "$(command -v google-chrome || true)" "$(command -v chromium || true)" "$(command -v microsoft-edge || true)"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then CHROME=$candidate; break; fi
  done
fi
if [ -z "${CHROME:-}" ]; then echo "::error::No Chrome, Chromium or Edge found (set CHROME=...)"; exit 1; fi

PORT=${PORT:-8123}
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
disown "$SERVER" 2>/dev/null || true # no "Terminated" line when the trap stops it
PROFILE=$(mktemp -d)
RESULT=$(mktemp)
trap 'kill "$SERVER" 2>/dev/null || true; rm -rf "$PROFILE" "$RESULT"' EXIT
sleep 2

echo "== In-browser test suite (tests.html, headless, over HTTP)"
"$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run --user-data-dir="$PROFILE" \
  --window-size=1920,1080 --virtual-time-budget=900000 \
  --dump-dom "http://127.0.0.1:$PORT/tests.html" > "$RESULT" 2>/dev/null

summary=$(grep -oE 'class="summary[^"]*">[^<]*' "$RESULT" || true)
echo "$summary"
grep -oE '<li class="fail">[^<]*' "$RESULT" | sed 's/<li class="fail">/FAILED: /' || true
echo "$summary" | grep -q 'is-pass' || { echo "::error::Beredskap tests failed or did not finish"; exit 1; }
