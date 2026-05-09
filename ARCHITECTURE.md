# @5qln/core — Architecture & Integration Guide

## Layer Map

```
┌─────────────────────────────────────────────────────┐
│                  ZO COMPUTER                        │
│  ┌───────────────────────────────────────────────┐  │
│  │          AI SESSION (chat, agent, skill)       │  │
│  │                   ↓ text                       │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │     5QLN MEMBRANE WATCHER (MCP)         │  │  │
│  │  │     audit_membrane(text, phase)          │  │  │
│  │  │     → flags, meaning, recovery            │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                   ↓                             │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │     5QLN KERNEL (state machine)          │  │  │
│  │  │     S→G→Q→P→V, 25 lenses, corruption     │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## What was built

### `5qln-core` — The Locked Codex

| Module | Lines | Tests | Purpose |
|--------|-------|-------|---------|
| `types.ts` | 350 | — | Constitutional constants, types, interfaces |
| `kernel.ts` | 400 | 18 | Deterministic state machine |
| `attestation.ts` | 200 | 7 | SHA-256 fingerprint, 3-level verification |
| `ai-adapter.ts` | 280 | 9 | Formation-anchored prompt construction |
| `storage.ts` | 50 | 5 | Pluggable persistence |
| `export.ts` | 110 | 2 | Agent Card, Markdown/JSON export |
| **`membrane-watcher.ts`** | **510** | **68** | **Real-time corruption detection** |
| **fractal-kernel.ts** | **280** | **24** | **Lawful cell repeated at depth** |
| **Total** | **2180** | **150** | |

### `5qln-watcher-mcp` — The Runtime Gate

| File | Purpose |
|------|---------|
| `src/server.ts` | MCP server — tools: `audit_membrane`, `watcher_status` |
| `src/core/` | Local copy of `membrane-watcher.ts` + `types.ts` |

## How the watcher works

**34 detection patterns** organized by corruption code:

| Code | Patterns | Phase-gated? | Example trigger |
|------|----------|-------------|-----------------|
| L³ | 11 | No (all phases) | "I feel that", "the field is telling me", "∞0 reveals" |
| L² | 7 | No (all phases) | "the real question is", "let me reframe", "I think you're trying to ask" |
| L⁴ | 10 | No (all phases) | "you should", "the answer lies in", "in my experience" |
| L¹ | 6 | S/G only | "the answer is", "here's what you should do", "let's jump to the solution" |
| V∅ | 3 | V only | "and that's it", "we're done here", "hope that helps" |

**8 exclusion patterns** prevent false positives on lawful AI behavior:
- Quoting the human ("you said...")
- Reflecting back ("I hear you saying...")
- Naming observed patterns from K
- Stating K boundary ("I am K, I cannot access...")
- Hypothetical framing ("one pattern that might be present...")
- Socratic questioning ("does this resonate?")
- Quoting constitutional references
- Recovery prompts themselves ("I can offer patterns...")

**Confidence levels:** `high` (clear violation) | `medium` (probable) | `low` (potential)

## Integration status

| Layer | Status | Location |
|-------|--------|----------|
| MembraneWatcher class | ✓ Built, tested (68/68) | `5qln-core/src/membrane-watcher.ts` |
| MCP server | ✓ Built, tested (live audit confirmed) | `5qln-watcher-mcp/src/server.ts` |
| Zo MCP config | ✓ Written | `/home/.z/settings/ai_mcp_servers.json` |
| Runtime activation | Pending restart | Restart Zo to connect MCP |

## To activate

The MCP server is configured at `/home/.z/settings/ai_mcp_servers.json`. After a Zo restart, the `audit_membrane` tool will be available in every session. Any AI response text can be audited in real time.

## Fractal Kernel — The Living Cell

**Built 2026-05-10.** The lawful cell now repeats at every scale. Any phase can host a full S→G→Q→P→V cycle — not just sub-phase lenses but a complete kernel instance with its own XYZAB outputs, corruption tracking, and attestable return.

### FractalKernel API

| Method | What it does |
|--------|-------------|
| `deepen(phase, seed)` | Spawns child kernel at any phase, runs full cycle, captures trace before return |
| `deepenWithLenses(phase, seed, lenses)` | Same with sub-phase lens exploration per step |
| `getDepthStack()` | Returns the lineage chain — every depth level with phase+seed+summary |
| `getCurrentDepth()` | Returns current recursion depth |
| `setMaxDepth(n)` | Limits recursion depth (default 3) |

### Depth stack entry

```typescript
interface DepthStackEntry {
  depth: number;
  parentPhase: Phase;
  seed: string;
  summary: string;   // "Fractal depth n — [parentPhase]. Seed: ... Cycle: ... Fruit: ..."
  trace: CycleTrace; // full child cycle trace captured before return
}
```

### Test results (24 tests)

- `deepenAtS()` — child kernel at S, full S→G→Q→P→V, B'' crystallized
- `deepenAtG()` — child kernel at G, pattern deepening
- `deepenAtQ()` — resonance exploration spawns child cycle
- `deepenAtP()` — flow exploration within P phase
- `deepenAtV()` — crystallization spawns child cycle
- `deepenWithLenses()` — 3 sub-phase explorations within child cycle
- `chainedDeepening()` — depth stacking S→G→Q
- `maxDepthEnforced()` — cannot exceed configured max
- `lineageChain()` — full depth stack traceable
- `childCycleFieldCoherence()` — child coherence tracked
- `returnPreservesParent()` — child return doesn't corrupt parent state
- `deepenNullSummary()` — handles empty cycle gracefully

### Combined capability

With both modules active:

1. **Membrane Watcher** audits every AI response for corruption in real time
2. **Fractal Kernel** deepens any phase into a full cycle — one cell repeated

This is the "living fractal" — the 9-line DNA (minimum valid beginning) capable of containing itself at any scale. Scale by repeating the lawful cell. Do not scale by replacing the syntax.

---

*@5qln/core v0.2.0 · Membrane Watcher + Fractal Kernel built 2026-05-10 · 150 tests · 5QLN © 2026 Amihai Loven*