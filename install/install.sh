#!/usr/bin/env bash
# 5QLN Plugin — Universal Install
# Works on Zo Computer, Hermes, or any Node.js >= 18 machine
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}═══ 5QLN Plugin Installer ═══${NC}"
echo ""

# Detect host
HOST="unknown"
if [ -d /home/.z ]; then HOST="zo"; fi
if [ -d /root/.hermes ]; then HOST="hermes"; fi
echo -e "Detected host: ${GREEN}${HOST}${NC}"

# Node check
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js required. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "Node: $(node -v)"

# Install location
INSTALL_DIR="${1:-/home/workspace/5qln-watcher-mcp}"
echo -e "Installing to: ${INSTALL_DIR}"

# Clone or copy
if [ -d "$INSTALL_DIR" ]; then
  echo "Directory exists, updating..."
  cd "$INSTALL_DIR"
  git pull origin master 2>/dev/null || echo "Not a git repo, skipping pull"
else
  echo "Cloning from GitHub..."
  git clone https://github.com/qlnlife/5qln-membrane-watcher.git "$INSTALL_DIR" 2>/dev/null || {
    echo "Clone failed, installing from local..."
    cp -r /home/workspace/5qln-watcher-mcp "$INSTALL_DIR"
  }
fi

cd "$INSTALL_DIR"
npm install --silent 2>&1 | tail -1

# Verify
if npx tsx src/server.ts --help 2>/dev/null || true; then
  echo -e "${GREEN}✓ MCP server ready${NC}"
else
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Host-specific setup
case "$HOST" in
  zo)
    echo ""
    echo -e "${CYAN}═══ Zo Computer Setup ═══${NC}"
    echo "Add to MCP servers:"
    echo "  Settings → AI → scroll to MCP Servers"
    echo "  Or edit: /home/.z/settings/ai_mcp_servers.json"
    echo ""
    echo "Already configured? $(test -f /home/.z/settings/ai_mcp_servers.json && echo 'YES' || echo 'NO — run: cp install/zo-mcp-servers.json /home/.z/settings/ai_mcp_servers.json')"
    ;;
  hermes)
    echo ""
    echo -e "${CYAN}═══ Hermes Setup ═══${NC}"
    echo "Add to Hermes config:"
    echo "  Edit /root/.hermes/config.yaml → mcp_servers section"
    echo "  Or run: cp install/hermes-mcp.yaml.append >> /root/.hermes/config.yaml"
    ;;
esac

echo ""
echo -e "${GREEN}═══ Install complete ═══${NC}"
echo "MCP tools available: audit_membrane, watcher_status, fractal_deepen, session_flow"
