# 5QLN Plugin — Install & Verify Guide

The 5QLN constitutional runtime as a single deployable plugin.
Compiled TypeScript, dependency-free MCP server, Pi extension,
and skill suite. Drop into Zo Computer, Hermes, Claude Desktop,
or any MCP-speaking host.

---

## What's in the box

```
5qln-core/
├── dist/                    pre-compiled JavaScript (no build needed)
│   ├── mcp-server.js          ← entry point for MCP hosts
│   ├── pi-agent.js            ← entry point for Pi extension
│   ├── index.js, *.js, *.d.ts
├── src/                     TypeScript sources (for development)
├── install/
│   ├── install.sh             one-shot installer (Zo / Hermes / generic)
│   ├── verify.sh              JSON-RPC smoke test against the MCP server
│   ├── zo-mcp-servers.json    Zo Computer MCP config
│   ├── hermes-mcp.yaml        Hermes mcp_servers snippet
│   └── claude-desktop.json    Claude Desktop config skeleton
├── examples/pi/extension.ts   Pi extension consumer file
├── skills/                  6 SKILL.md files for AI hosts
│   ├── README.md
│   ├── 5qln-pi-orchestrate/
│   ├── 5qln-pi-cycle/
│   ├── 5qln-pi-membrane/
│   ├── 5qln-pi-recovery/
│   ├── 5qln-pi-lens/
│   └── 5qln-pi-self-improve/
├── rules/
│   ├── 5qln-system-prompt.md  paste into any host's system prompt
│   └── zo-rule-auto-audit.md  Zo Settings → Rules
├── docs/                    architecture, scaffolding map, diagram
├── package.json             @5qln/core
├── README.md
├── ARCHITECTURE.md
├── USER_GUIDE.md
└── INSTALL_GUIDE.md         ← this file
```

---

## Quick install (Zo Computer)

```bash
# 1. Unpack
cd /home/workspace
unzip 5qln-core.zip       # creates 5qln-core/

# 2. Install runtime deps (only Node ≥ 18 required; Jest etc. are dev-only)
cd 5qln-core
npm install --omit=dev    # ← runtime has no production deps

# 3. (skip if dist/ shipped) Compile
# npm run build

# 4. Smoke test the MCP server
bash install/verify.sh

# 5. Wire into Zo
cp install/zo-mcp-servers.json /home/.z/settings/ai_mcp_servers.json
# Restart Zo
```

After restart Zo will see `5qln` in its MCP server list and ten tools: `audit_membrane`, `session_flow`, `watcher_status`, `codex`, `self_improve`, plus `kernel_input` / `kernel_transition` / `kernel_lens` / `kernel_validate` / `kernel_crystallize`.

---

## Quick install (Hermes)

```bash
unzip 5qln-core.zip -d /home/workspace
cd /home/workspace/5qln-core
npm install --omit=dev

cat install/hermes-mcp.yaml >> /root/.hermes/config.yaml
# Restart Hermes
```

---

## Quick install (Claude Desktop)

```bash
unzip 5qln-core.zip -d /opt/5qln          # or any path
cd /opt/5qln/5qln-core
npm install --omit=dev
```

Edit `claude_desktop_config.json` — merge `install/claude-desktop.json` into it, replacing the path with your install directory:

```json
{
  "mcpServers": {
    "5qln": {
      "command": "node",
      "args": ["/opt/5qln/5qln-core/dist/mcp-server.js"]
    }
  }
}
```

---

## Quick install (Pi coding-agent)

Pi is not MCP. It loads TypeScript extensions directly.

```bash
unzip 5qln-core.zip -d ~/5qln
cd ~/5qln/5qln-core
npm install --omit=dev
```

Drop a Pi extension entry at `~/.pi/agent/extensions/5qln.ts`:

```ts
import { createPiExtension } from "/Users/you/5qln/5qln-core/dist/pi-agent.js";
export default createPiExtension();
```

Or, if your Pi setup imports from npm-style packages, run `npm link` in `5qln-core` and `npm link @5qln/core` in your Pi project, then:

```ts
import { createPiExtension } from "@5qln/core";
export default createPiExtension();
```

---

## Verify the install

The bundle ships a smoke test. It pipes a real JSON-RPC handshake, `tools/list`, and three `tools/call` messages into the MCP server and checks the responses.

```bash
bash install/verify.sh
```

Expected output:

```
→  starting MCP server
✓  initialize OK
✓  tools/list OK
✓  watcher_status OK
✓  audit_membrane (corrupt → FLAGGED) OK
✓  self_improve OK

═══ All MCP smoke tests passed ═══
```

For the full unit suite:

```bash
npm install        # installs jest + ts-jest (dev deps)
npm test           # 242 tests across 8 suites
```

For a typecheck:

```bash
npm run lint       # tsc --noEmit
```

---

## Tool surface

| Tool | What it does | Used by |
|------|--------------|---------|
| `audit_membrane` | Phase-aware corruption audit. Returns flags + recovery from the Codex. | AI, after every response |
| `session_flow` | Live cross-section of the constitutional grammar — phase, lens, formed XYZAB, watch list. | AI, when uncertain about phase |
| `watcher_status` | Pattern count + decoder + codex fingerprints. | Operators, on connect |
| `codex` | Markdown render of all 5 corruption codes (names, meanings, recoveries, examples). | AI / operators, reference |
| `self_improve` | Run one self-improve cycle. Hash-chained snapshot of membrane health. | AI, once per long session |
| `kernel_input` | Capture human input. Forms or refines current phase output. | Hosts that route input through MCP |
| `kernel_transition` | Move kernel to a new phase (S/G/Q/P/V). | AI / human, phase control |
| `kernel_lens` | Enter or exit a sub-phase lens (e.g. "SG", ""). | AI / human, depth exploration |
| `kernel_validate` | Validate a formed output (X/Y/Z/A/B). | AI / human, phase closure |
| `kernel_crystallize` | Crystallize B'' at V phase. | AI / human, cycle closure |

---

## Rule the AI must obey

Append to the host's system prompt (or paste from `rules/5qln-system-prompt.md`):

> After every response, call `audit_membrane` with your full response text and current 5QLN phase. If corruption flags are returned, name them and apply the recovery prompt before continuing. Never skip the audit.

For Zo specifically, copy `rules/zo-rule-auto-audit.md` into Zo Settings → Rules.

---

## Skills the AI should load

Six markdown skills are included under `skills/`. Configure your host to load them, or paste the contents into the system prompt:

| Skill | Reading order | Purpose |
|-------|---------------|---------|
| `5qln-pi-orchestrate` | 1 | The surface map and routing rules. |
| `5qln-pi-membrane`   | 2 | The self-audit loop — the one law. |
| `5qln-pi-cycle`      | 3 | Per-phase DO/DON'T/TEST. |
| `5qln-pi-recovery`   | 4 | One procedure per corruption code. |
| `5qln-pi-lens`       | 5 | The 25 lens questions. |
| `5qln-pi-self-improve` | 6 | Running the lawful cell on the membrane. |

`skills/README.md` links them all and lists a recommended reading order.

---

## Smoke test the runtime by hand

```bash
node dist/mcp-server.js
```

Then, paste into stdin (one JSON object per line):

```
{"jsonrpc":"2.0","id":1,"method":"initialize"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"codex","arguments":{}}}
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"audit_membrane","arguments":{"text":"I feel that the energy is shifting.","phase":"Q"}}}
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"self_improve","arguments":{}}}
{"jsonrpc":"2.0","id":6,"method":"shutdown"}
```

Each line gets exactly one JSON-RPC response on stdout.

---

## Troubleshooting

**`node: command not found`** — install Node ≥ 18 from https://nodejs.org

**`Cannot find module './dist/mcp-server.js'`** — the bundle did not ship pre-compiled. Run `npm install && npm run build`.

**`"Method not found"` from MCP host** — the host is calling a method the server doesn't implement (only `initialize`, `notifications/initialized`, `ping`, `tools/list`, `tools/call`, `shutdown` are implemented). Check the host's MCP version compatibility.

**Membrane never flags** — verify with `bash install/verify.sh`. If it reports clean on `"I feel that the energy is shifting."`, the watcher is broken — re-run `npm install`.

**`/5qln-self-improve` fails on a fresh install** — re-run `npm test`. The default sample corpus is part of the constitutional invariant; a failing suite means the patterns drifted relative to the corpus and human review is required (do not silently change the corpus).

---

## What changed from prior releases

This bundle adds, on top of the original 5qln-watcher-mcp set:

- **Codex** — runtime authority on the five corruption codes (was a markdown skill; now a typed, fingerprintable module + MCP `codex` tool).
- **SyntaxActivator** — adaptive selection of the live constitutional grammar slice; powers `session_flow` with a phase-and-lens-aware prompt.
- **SelfImprove** — the lawful cell scaled to the membrane itself. Hash-chained snapshots, drift detection, exposed via `self_improve`.
- **Pi extension** — `createPiExtension()` factory matching the earendil-works/pi ExtensionAPI contract: tools, slash commands, lifecycle event handlers.
- **MCP server** — dependency-free stdio JSON-RPC implementation in `src/mcp-server.ts`. Ten tools.
- **Skill suite** — six SKILL.md files specific to operating the runtime on Pi.
- **242 tests** across 8 suites covering every constitutional invariant and every wire path.

---

*5QLN © 2026 Amihai Loven · `@5qln/core` v0.1.0*
