#!/usr/bin/env bash
# 5QLN Plugin — Universal Installer
# Run from inside the unpacked 5qln-core/ directory.
# Detects host (Zo / Hermes / generic) and wires the MCP server.

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[0;33m'; NC='\033[0m'

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${CYAN}═══ 5QLN Plugin Installer ═══${NC}"
echo "Install root: ${ROOT}"
echo ""

# ── Node check ──────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js >= 18 required. Install from https://nodejs.org${NC}"
  exit 1
fi
NODE_MAJOR=$(node -e 'process.stdout.write(String(process.versions.node.split(".")[0]))')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}Node $NODE_MAJOR found; need >= 18.${NC}"
  exit 1
fi
echo -e "Node: $(node -v)"

# ── Detect host ─────────────────────────────────────────────
HOST="generic"
if [ -d /home/.z ]; then HOST="zo"; fi
if [ -d /root/.hermes ]; then HOST="hermes"; fi
echo -e "Detected host: ${GREEN}${HOST}${NC}"
echo ""

# ── Install runtime deps (optional — runtime is dep-free) ───
if [ ! -d "$ROOT/node_modules" ] && [ -f "$ROOT/package.json" ]; then
  echo "Installing dev dependencies (for tests + typecheck)..."
  (cd "$ROOT" && npm install --silent 2>&1 | tail -1) || true
fi

# ── Build if dist/ missing ──────────────────────────────────
if [ ! -f "$ROOT/dist/mcp-server.js" ]; then
  echo "Compiling TypeScript..."
  (cd "$ROOT" && npm run build) || {
    echo -e "${RED}Build failed.${NC}"
    exit 1
  }
fi
echo -e "${GREEN}✓ dist/mcp-server.js ready${NC}"

# ── Smoke test ──────────────────────────────────────────────
echo ""
echo "Running smoke test..."
if bash "$ROOT/install/verify.sh"; then
  echo -e "${GREEN}✓ MCP server passes smoke test${NC}"
else
  echo -e "${RED}✗ Smoke test failed. Aborting host wiring.${NC}"
  exit 1
fi

# ── Host-specific setup ─────────────────────────────────────
echo ""
case "$HOST" in
  zo)
    ZO_CONFIG=/home/.z/settings/ai_mcp_servers.json
    echo -e "${CYAN}═══ Zo Computer wiring ═══${NC}"
    if [ -f "$ZO_CONFIG" ]; then
      echo -e "${YELLOW}MCP config exists at $ZO_CONFIG${NC}"
      echo "Inspect it before overwriting. To replace:"
      echo "  cp '$ROOT/install/zo-mcp-servers.json' '$ZO_CONFIG'"
    else
      cp "$ROOT/install/zo-mcp-servers.json" "$ZO_CONFIG"
      # Patch path to the actual install root
      node -e "
        const fs = require('fs');
        const c = JSON.parse(fs.readFileSync('$ZO_CONFIG','utf8'));
        c[0].args = ['$ROOT/dist/mcp-server.js'];
        fs.writeFileSync('$ZO_CONFIG', JSON.stringify(c,null,2));
      "
      echo -e "${GREEN}✓ Wrote $ZO_CONFIG${NC}"
    fi
    echo ""
    echo "Next: restart Zo. The 5qln server will appear with 10 tools."
    echo "Optional: copy rules/zo-rule-auto-audit.md into Zo Settings → Rules."
    ;;
  hermes)
    HERMES_CONFIG=/root/.hermes/config.yaml
    echo -e "${CYAN}═══ Hermes wiring ═══${NC}"
    echo "Append to $HERMES_CONFIG:"
    echo ""
    sed "s|/home/workspace/5qln-core|$ROOT|g" "$ROOT/install/hermes-mcp.yaml"
    echo ""
    echo "Then restart Hermes."
    ;;
  generic)
    echo -e "${CYAN}═══ Generic MCP wiring ═══${NC}"
    echo "Point your MCP host at:"
    echo "  command: node"
    echo "  args:    [\"$ROOT/dist/mcp-server.js\"]"
    ;;
esac

echo ""
echo -e "${GREEN}═══ Install complete ═══${NC}"
echo ""
echo "Tools available: audit_membrane, session_flow, watcher_status,"
echo "                 codex, self_improve, kernel_input, kernel_transition,"
echo "                 kernel_lens, kernel_validate, kernel_crystallize"
echo ""
echo "Skills:          $ROOT/skills/    (6 SKILL.md files)"
echo "Pi extension:    $ROOT/examples/pi/extension.ts"
echo "Full guide:      $ROOT/INSTALL_GUIDE.md"
