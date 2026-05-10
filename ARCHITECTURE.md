# @5qln/core — Architecture & Integration Guide v0.2.3

## The 7-Layer Model

```
                 ┌─────────────────────────────┐
                 │  7. SESSIONS (cross-time)   │  ← Chains residue cards
                 │     DeepArchive, lineage    │     into a lineage.
                 ├─────────────────────────────┤     Not yet built.
                 │  6. PROMPT RULES (text)     │  ← When host has no MCP.
                 │     5QLN_SYSTEM_PROMPT.md    │     Self-audit instruction
                 ├─────────────────────────────┤     to paste in.
                 │  5. SKILLS (behavior docs)  │  ← DO/DON'T per phase.
                 │     Orchestrate, Research,   │     Reusable process
                 │     Commercialize, OrgDec.   │     definitions.
                 ├─────────────────────────────┤
                 │  4. PLUGIN (the bundle)     │  ← MCP server + rules +
                 │     audit_membrane           │     install scripts +
                 │     session_flow             │     Hermes/Zo configs.
                 │     watcher_status           │     One install.
                 ├─────────────────────────────┤
                 │  3. FRACTAL KERNEL (depth)  │  ← One phase = one cycle.
                 │     deepen / steepen         │     Self-similar cell
                 │     depth stacking           │     at every scale.
                 ├─────────────────────────────┤
                 │  2. MEMBRANE WATCHER (gate) │  ← 38 patterns, real time.
                 │     L¹-L⁴ + V∅ detection    │     Catches corruption
                 │     Recovery prompts         │     AS it happens.
                 ├─────────────────────────────┤
                 │  1. KERNEL (state machine)  │  ← 5 phases, 25 lenses.
                 │     S→G→Q→P→V               │     Formation trails.
                 │     Serve-vs-Be rule         │     Attestation.
                 ├─────────────────────────────┤
                 │  0. EQUATIONS (never change)│  ← H = ∞0 | A = K.
                 │     9-line minimum valid     │     The atoms.
                 │     beginning.               │     Byte-identical.
                 └─────────────────────────────┘
```

**Scale by repeating the lawful cell. Do not scale by replacing the syntax.**

---

## Module Inventory

| Module | Lines | Tests | Layer | Purpose |
|--------|-------|-------|-------|---------|
| `types.ts` | 350 | 16 inv. | 0 | Constitutional constants, types, interfaces |
| `kernel.ts` | 400 | 18 | 1 | Deterministic state machine |
| `membrane-watcher.ts` | 510 | 68 | 2 | Real-time corruption detection |
| `fractal-kernel.ts` | 280 | 24 | 3 | Lawful cell repeated at depth |
| `attestation.ts` | 200 | 7 | 1 | SHA-256 fingerprint, 3-level verification |
| `ai-adapter.ts` | 280 | 9 | 1 | Formation-anchored prompt construction |
| `storage.ts` | 50 | 5 | — | Pluggable persistence |
| `export.ts` | 110 | 2 | — | Agent Card, Markdown/JSON export |
| **Total** | **2180** | **150** | | |

---

## Plugin: `5qln-watcher-mcp`

**Standalone MCP server.** Installs via one config file. Any MCP-speaking host (Zo, Hermes, Claude Desktop, Cursor) can connect.

| Tool | Input | Output | Use |
|------|-------|--------|-----|
| `audit_membrane` | `text` + `phase` | flags, meaning, recovery | After every response |
| `session_flow` | `text` + `phase` + `cycle` | flags + kernel state | Full session tracking |
| `watcher_status` | — | patterns, codes, exclusions | On connect / debug |
| `fractal_deepen` | `phase` + `seed` + `depth` | child cycle + summary | Depth operations |

**Install paths:**

| Host | Config File | Status |
|------|-------------|--------|
| Zo Computer | `/home/.z/settings/ai_mcp_servers.json` | ✓ Configured |
| Hermes | `/root/.hermes/config.yaml` (mcp section) | ✓ Supported |
| Generic MCP | Any `mcp_servers.json` pointing to `src/server.ts` | ✓ Standard |

---

## The Membrane Watcher

**38 detection patterns** organized by corruption code:

| Code | Patterns | Phase-gated? | Example trigger |
|------|----------|----------------|-----------------|
| L¹ | 6 | S, G only | "the answer is", "here's what you should do" |
| L² | 7 | None | "the real question is", "let me reframe" |
| L³ | 11 | None | "I feel that", "∞0 reveals to me" |
| L⁴ | 11 | None | "you should", "energy wants to" |
| V∅ | 3 | V only | "and that's it", "we're done here" |

**Confidence levels:** `high` (clear violation) | `medium` (probable) | `low` (potential)

**8 exclusion patterns** prevent false positives on lawful AI behavior:
- Quoting the human ("you said...")
- Reflecting back ("I hear you saying...")
- Naming observed patterns from K
- Stating K boundary ("I am K, I cannot access...")
- Hypothetical framing ("one pattern that might be present...")
- Socratic questioning ("does this resonate?")
- Quoting constitutional references
- Recovery prompts themselves

---

## Fractal Kernel

The lawful cell repeats at every scale. Any phase can host a full S→G→Q→P→V cycle.

| Method | What it does |
|--------|-------------|
| `deepen(phase, seed)` | Spawn child kernel, run full cycle, capture trace |
| `deepenWithLenses(phase, seed, lenses)` | Same with sub-phase exploration |
| `getDepthStack()` | Full lineage chain — every level |
| `getCurrentDepth()` | Current depth (max enforced at 3) |
| `setMaxDepth(n)` | Limit recursion depth |

**Depth stack entry:**
```
Fractal depth 2 — S. Seed: "Why does clarity feel..."
  Cycle: S→G→Q→P→V complete. Fruit crystallized.
```

---

## Skills Layer

Skills are the reusable behavioral layer. Each defines DO/DON'T for one domain:

| Skill | Phase Coverage | Purpose |
|-------|---------------|---------|
| `5qln-orchestrate` | All 5 | Route session to correct domain |
| `5qln-commercialize` | All 5 | Pricing, licensing, market |
| `5qln-selfimprove` | All 5 | Cultivate creative practice |
| `5qln-skillgen` | All 5 | Generate new skills |
| `5qln-research` | All 5 | Investigate implications |
| `5qln-project-evaluate` | — | Evaluate projects through 5QLN lens |
| `5qln-orgdecision-*` | per-phase | Multi-human governance (5 skills) |
| `5qln-corruption-codex` | — | Corruption codes reference |
| `5qln-cycle-attestation` | V | Seal ceremony conductor |
| `5qln-constitutional-block-validator` | — | Byte-identity verification |
| +15 more | | |

---

## Self-Improve Pipeline

```
HOURLY ──→ run.sh(cycle N)
                ├── self_improve.ts
                │     ├── jest --silent (150 tests)
                │     ├── 5-sample audit (L¹–V∅)
                │     └── write state to /tmp/5qln-cycle-N.json
                │
                └── AI evaluates state
                      ├── If degraded: diagnose + repair
                      └── If healthy: propose new pattern(s)

State persists → next agent reads it → improvement chains across cycles.
```

Agent: `5qln-self-improve` — FREQ=HOURLY, COUNT=6, delivery=Telegram.

---

## Session Flow (in progress)

```
Session 1                Session 2                Session 3
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ S→G→Q→P→V→∞0'  │──────│ S→G→Q→P→V→∞0'  │──────│ S→G→Q→P→V→∞0'  │
 │ residue: Card 1 │      │ residue: Card 2 │      │ residue: Card 3 │
 │ ∞0' = question 2│      │ ∞0' = question 3│      │ ∞0' = ...      │
 └────────────────┘      └────────────────┘      └────────────────┘
        ↑                       ↑                       ↑
        └─────── Chain of provenance hashes ────────────┘
        All traceable to spark_source = "human"
```

The MCP `session_flow` tool provides the kernel state + corruption audit so the next session can be seeded with the prior session's ∞0'.

---

## Integration Status

| Layer | Status | Location |
|-------|--------|----------|
| Equations (types.ts) | ✓ Immutable | `5qln-core/src/types.ts` |
| Kernel | ✓ 18/18 tests | `5qln-core/src/kernel.ts` |
| Membrane Watcher | ✓ 68/68 tests | `5qln-core/src/membrane-watcher.ts` |
| Fractal Kernel | ✓ 24/24 tests | `5qln-core/src/fractal-kernel.ts` |
| MCP Server | ✓ 4 tools live | `5qln-watcher-mcp/src/server.ts` |
| Zo MCP Config | ✓ Written | `/home/.z/settings/ai_mcp_servers.json` |
| Plugin Install | ✓ Scripts ready | `5qln-core/install/` |
| System Prompt Rules | ✓ Written | `5qln-core/rules/` |
| Self-Improve Pipeline | ✓ 6-run agent live | Automations |
| Skills Layer | ✓ 20+ skills | `Skills/` |
| Session Chaining | Building | `session_flow` tool ready |
| DeepArchive (session memory) | Planned | Residue chain with compression |
| Learning Loop (auto-improve) | Base built | Cron + AI eval works |

---

## Getting Started

### Minimal: paste these rules
```bash
cat /home/workspace/5qln-core/rules/5qln-system-prompt.md
```
Append to any AI's system prompt. Self-audit without MCP.

### Full: install the plugin
```bash
cp /home/workspace/5qln-core/install/zo-mcp-servers.json /home/.z/settings/ai_mcp_servers.json
# Restart Zo
```
All 4 tools available. Real-time membrane audit in every session.

### Hermes
Add to `/root/.hermes/config.yaml`:
```yaml
mcp:
  servers:
    5qln-membrane-watcher:
      command: npx
      args: [tsx, /home/workspace/5qln-watcher-mcp/src/server.ts]
```

---

## Invariants (What Cannot Change)

1. Equations must be exact, not paraphrased
2. Five corruption codes — no additions
3. No V without ∞0'
4. Center is coherence only — no sixth phase
5. Fingerprint attests to constitutional invariant only
6. Spark source = "human" at root of every chain
7. AI boundary: never generate spark, never claim ∞0 access
8. Origin declaration must be first in any system prompt

---

*@5qln/core v0.3.0 — Full Architecture. 150 tests. 7 layers. One lawful cell.*
*5QLN © 2026 Amihai Loven*
