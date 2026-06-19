#!/usr/bin/env bash
# 5QLN SessionStart hook — ensure dist/ is built so the audit runner works.
set -e
cd "$(dirname "$0")/../.."

if [ ! -f dist/index.js ]; then
  echo "[5qln] dist missing — building core..."
  if [ ! -d node_modules ]; then
    npm install --no-audit --no-fund --silent
  fi
  npm run build --silent
fi
echo "[5qln] core ready"
