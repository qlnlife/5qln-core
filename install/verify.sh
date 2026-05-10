#!/usr/bin/env bash
# 5QLN plugin smoke test.
# Pipes a JSON-RPC handshake + tools/list + a tools/call into the
# MCP server and verifies the responses. Exits 0 on success.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="$ROOT/dist/mcp-server.js"

if [ ! -f "$SERVER" ]; then
  echo "❌  $SERVER not found. Run: npm install && npm run build" >&2
  exit 1
fi

echo "→  starting MCP server"
RESPONSES=$(printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"watcher_status","arguments":{}}}' \
  '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"audit_membrane","arguments":{"text":"I feel that the energy is shifting.","phase":"Q"}}}' \
  '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"self_improve","arguments":{}}}' \
  '{"jsonrpc":"2.0","id":6,"method":"shutdown"}' \
  | node "$SERVER" 2>/dev/null)

echo "$RESPONSES" | head -1 | grep -q '"protocolVersion":"2024-11-05"' \
  && echo "✓  initialize OK" \
  || { echo "❌  initialize failed"; exit 1; }

echo "$RESPONSES" | sed -n '2p' | grep -q '"name":"audit_membrane"' \
  && echo "✓  tools/list OK" \
  || { echo "❌  tools/list failed"; exit 1; }

echo "$RESPONSES" | sed -n '3p' | grep -q 'Patterns: ' \
  && echo "✓  watcher_status OK" \
  || { echo "❌  watcher_status failed"; exit 1; }

echo "$RESPONSES" | sed -n '4p' | grep -q 'FLAGGED' \
  && echo "✓  audit_membrane (corrupt → FLAGGED) OK" \
  || { echo "❌  audit_membrane failed"; exit 1; }

echo "$RESPONSES" | sed -n '5p' | grep -q 'Self-Improve' \
  && echo "✓  self_improve OK" \
  || { echo "❌  self_improve failed"; exit 1; }

echo ""
echo "═══ All MCP smoke tests passed ═══"
echo ""
echo "Run the unit suite next: npm test    (228+ tests)"
