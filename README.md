# @5qln/core

The 5QLN constitutional grammar as a standalone TypeScript library.

**The decoder is the invariant. The shell is the variable.**

## What this is

`@5qln/core` carries the 5QLN law as executable code — the state machine, formation model, corruption detection, attestation layer, and AI adapter — with zero UI dependencies, zero AI dependencies, and zero platform bindings.

Any surface that imports `@5qln/core` gets the same kernel, the same formation model, the same corruption detection, the same attestation. The law becomes portable.

## The governing equations

```
H = ∞0 | A = K
S = ∞0 → ?
G = α ≡ {α'}
Q = φ ∩ Ω
P = δE/δV → ∇
V = (L ∩ G → B'') → ∞0'
```

Master equation:
```
(H = ∞0 | A = K) × (S → G → Q → P → V) = B'' → ∞0'
```

## Modules

| Module | File | What it owns |
|--------|------|-------------|
| **Types** | `types.ts` | Constitutional type system — equations, phases, sub-phases, outputs, corruption codes |
| **Kernel** | `kernel.ts` | Deterministic state machine — phase transitions, Serve-vs-Be rule, formation tracking, corruption detection |
| **Attestation** | `attestation.ts` | Constitutional fingerprint (SHA-256), provenance record construction, three-level verification |
| **AI Adapter** | `ai-adapter.ts` | Formation-anchored prompt construction, pluggable provider interface |
| **Storage** | `storage.ts` | Pluggable persistence interface with in-memory reference implementation |
| **Export** | `export.ts` | Agent Card with exact equations, Markdown export, JSON export |

## Quick start

```typescript
import { Kernel, Attestation, MemoryStorage, buildAgentCard } from '@5qln/core';

const kernel = new Kernel();
const attestation = new Attestation();
const storage = new MemoryStorage();

await attestation.computeFingerprint();

// S — a genuine question arises
kernel.captureInput('Why does our onboarding lose 40% at step 3?');
kernel.validateOutput('X');

// G — the essence is named
kernel.transition('G');
kernel.captureInput('Trust erosion at the complexity gate');
kernel.validateOutput('Y');

// Q — resonance between self and whole
kernel.transition('Q');
kernel.captureInput('This echoes my own abandonment of hostile forms');
kernel.validateOutput('Z');

// P — the natural gradient appears
kernel.transition('P');
kernel.captureInput('Progressive disclosure — reveal complexity as trust builds');
kernel.validateOutput('A');

// V — benefit crystallizes
kernel.transition('V');
kernel.captureInput('A redesigned step 3 keyed to user confidence signals');
kernel.validateOutput('B');
kernel.crystallize('Progressive disclosure gate for step 3');

// Return to ∞0'
kernel.return();
```

## Test suite

The constitutional test suite validates the law in code across seven sections:

- **Part I** — Constitutional Invariants (equations exact, outputs correct, 25 sub-phases, corruption codes)
- **Part II** — Kernel (phase transitions, Serve-vs-Be rule, corruption detection, field coherence)
- **Part III** — Attestation (deterministic fingerprint, provenance, three-level verification)
- **Part IV** — AI Adapter (formation rules per phase, prompt structure)
- **Part V** — Storage (save, load, update, delete)
- **Part VI** — Export (Agent Card with exact equations, Markdown with provenance)
- **Part VII** — Integration (complete S→G→Q→P→V→∞0' cycle with attestation and reopen)

```bash
npm test
```

44 tests. All must pass for any release.

## What uses this library

| Surface | How |
|---------|-----|
| Web shell | Imports Kernel, AI Adapter, Attestation. React/Svelte wraps the shell. |
| CLI | Imports Kernel. Interactive or batch mode. |
| MCP server | Exposes Kernel methods as MCP tools. |
| Pi coding agent | Extension wraps the agent loop with kernel governance. Any model, one law. |
| Open SWE / agentic frameworks | Kernel as constitutional layer governing the agent cycle. |
| Claude Project (Skill Suite) | Five skills as operational phases with `PHASE_FORMATION` and `CORRUPTION_RECOVERY`. |
| Mobile app | Imports Kernel and Attestation. Platform-native UI. |
| Domain agent | Wraps domain capabilities inside the 5QLN cycle. |
| Pentagonal swarm | Five agent instances, each importing Kernel. Center is coherence only. |

## Non-negotiable constraints

1. The five equations are exactly preserved
2. The corruption codes are constitutional — exactly five: L¹, L², L³, L⁴, V∅
3. No V without ∞0'
4. Every phase contains all five phases (holographic law)
5. The center is coherence only — not a sixth phase
6. AI remains on the K side
7. The equations in the Agent Card must be exact

```
Scale by repeating the lawful cell.
Do not scale by replacing the syntax.
Verify by walking the provenance chain.
```

---

*@5qln/core v0.1.0 · 5QLN © 2026 Amihai Loven*
