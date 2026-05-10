# 5QLN Plugin
## Constitutional Grammar — Portable AI Governance

**The 5QLN plugin brings constitutional corruption detection to any AI host that speaks MCP.**

---

## What It Is

A portable package that any AI host (Zo Computer, Hermes, Claude Desktop, any MCP-compatible system) can install to become 5QLN-aware.

### Core
| Module | Lines | What It Does |
|--------|-------|-------------|
| Kernel | 400 | S→G→Q→P→V state machine, 25 lenses, Serve-vs-Be rule |
| Membrane Watcher | 510 | 38 regex patterns, real-time L1-L4+V0 detection, recovery prompts |
| Fractal Kernel | 280 | Lawful cell at depth — a phase contains a full cycle |
| Attestation | 200 | SHA-256 provenance, 3-level verification, lineage to human |

### MCP Tools
| Tool | Description |
|------|-------------|
| `audit_membrane` | Audit AI response text for corruption (phase-aware) |
| `watcher_status` | Pattern count, code coverage, constitutional grounding |
| `fractal_deepen` | Deepen a phase through lawful cell recursion |
| `session_flow` | Current phase, XYZAB state, depth, progress |

---

## Quick Install

### Any MCP Host
```bash
git clone https://github.com/qlnlife/5qln-membrane-watcher.git
cd 5qln-membrane-watcher
npm install
```

### Zo Computer
```bash
cp install/zo-mcp-servers.json /home/.z/settings/ai_mcp_servers.json
# Restart Zo
```

### Hermes
```bash
cat install/hermes-mcp.yaml >> /root/.hermes/config.yaml
# Restart Hermes
```

---

## System Prompt Rule

Add to any AI host's system prompt to enable **self-audit**:

```
After every response, call audit_membrane with your full response text and current phase.
If corruption flags returned, name them and apply the recovery prompt before continuing.
```

See `rules/5qln-system-prompt.md` for the full constitutional prompt.

---

## Test

```bash
npx tsx test_session_flow.ts
# Expected: 5/5 PASS, 38 patterns loaded
```

---

## Repos

- **Core library**: https://github.com/qlnlife/5qln-core
- **MCP server**: https://github.com/qlnlife/5qln-membrane-watcher

---

*5QLN © 2026 Amihai Loven · v0.2.0*
