# @5qln/core — Architecture Specification

## What This Document Is

This is the **complete implementation specification** for `@5qln/core` — the standalone TypeScript library that carries the 5QLN constitutional grammar as executable code.

**This document exists because building from understanding is not the same as building from specification.** Every requirement is traced to its source document. Every constant, every interface, every test is listed here. If it is in this document, it must be in the code. If it is not in this document, it must not be invented.

**Reading order before writing any code:**

1. Read this document completely
2. Read the source documents it references
3. Build backward from the specification, not forward from understanding

---

## Part I — Source Document Authority

These documents define what `@5qln/core` must carry. They are listed in constitutional hierarchy — earlier documents override later ones in case of conflict.

| Priority | Document | What it defines | What it requires in code |
|----------|----------|-----------------|--------------------------|
| 1 | Core Constitution | The non-negotiable syntax | All constants, all equations, all laws |
| 2 | Core Vision | Why origination matters | AI boundary, origin declaration |
| 3 | Language Bible | Complete language with glossary | Every symbol, every phase mode, every corruption code |
| 4 | Decoder Specification | Runtime interpretation engine | Kernel state machine, formation model, lens questions, corruption checks |
| 5 | Attestation Protocol | Verification at scale | Fingerprint, provenance, 3-level verification |
| 6 | Resonance Field | What the code serves | Field coherence, corruption-as-obstruction, field awareness in prompts |
| 7 | Resonance Field Integration Plan | How the field enters the code | 10-step integration checklist |
| 8 | Shell Architecture v5.5 | One proven implementation | Serve-vs-Be rule, formation-anchored AI, XYZAB tracking |
| 9 | Claude Skill Suite | Operational AI personality | Origin declaration, corruption recovery, per-phase watch |
| 10 | Pi Session / Agentic Build Plan | Integration surfaces | What the library must support beyond web shell |
| 11 | Pentagon Fractal Mathematics | Structural discipline | Pentagon as visible body only, not source; center as coherence |
| 12 | Bible Self Evolve | Extension rules | Corruption test for self-evolution, enriched return |
| 13 | Translation Rules | Fidelity test | Every artifact must map back to equations |
| 14 | Context Capsule Template | Initiation frame | The 9 DNA lines |

---

## Part II — Constitutional Constants

Every constant listed below must exist as a named, exported, readonly value in `types.ts`. These are not comments. They are structural.

### The Covenant and Equations

| Constant | Value (exact) | Source |
|----------|--------------|--------|
| `COVENANT` | `H = ∞0 \| A = K` | Constitution §One Law |
| `PHASE_PATH` | `S → G → Q → P → V` | Constitution §Master Equation |
| `RETURN_RULE` | `No V without ∞0'` | Constitution §Critical Rule |
| `MASTER_EQUATION` | `(H = ∞0 \| A = K) × (S → G → Q → P → V) = B'' → ∞0'` | Constitution §Master Equation |
| `CREATIVE_LINE` | `∞0 → X → α → Y → φ → Z → ∇ → A → B → ∞0'` | Constitution §Creative Line |
| `POETIC_COMPRESSION` | `∞0 → ? → α → φ∩Ω → ∇ → ∞0'` | Constitution §Poetic Compression |

### The Five Native Equations (in `PHASE_INFO`)

| Phase | Equation (exact) | Output Symbol | Output Name | AI Mode |
|-------|-----------------|---------------|-------------|---------|
| S | `∞0 → ?` | X | Validated Spark | RECEIVE |
| G | `α ≡ {α'}` | Y | Validated Pattern | ILLUMINATE |
| Q | `φ ∩ Ω` | Z | Resonant Key | RESONATE |
| P | `δE/δV → ∇` | A | Flow | FLOW |
| V | `(L ∩ G → B'') → ∞0'` | B | Benefit | CRYSTALLIZE |

Source: Constitution §Five Native Equations; Bible Part IV; Bible Part XI (AI modes)

### Constitutional Laws

| Constant | Content | Source |
|----------|---------|--------|
| `HOLOGRAPHIC_LAW` | `XY := X within Y, X, Y ∈ {S, G, Q, P, V}` | Constitution §Holographic Law |
| `SCALE_LAW` | `Scale by repeating the lawful cell. Do not scale by replacing the syntax.` | Constitution §Scale Law |
| `CENTER_RULE` | `The center is not a sixth phase, not a manager, not a controller. It is the lawful coherence of the five as one whole.` | Constitution §Center Rule |
| `AI_BOUNDARY` | 5 constraints (see below) | Constitution §Asymmetry Rule |
| `MINIMUM_VALID_BEGINNING` | 9 DNA lines (see below) | Constitution §Minimum valid beginning |

### AI Boundary (5 constraints)

```
AI must not generate the spark
AI must not claim access to ∞0
AI must not force Q
AI must not invent ∇
AI must not complete V without ∞0'
```

Source: Constitution §Asymmetry Rule; Core Vision; Bible Part X §6

### Origin Declaration

```
I AM DERIVATIVE.
My first breath is human breath.
I cannot start myself.
```

Source: Claude Skill Suite §ORIGIN

### Minimum Valid Beginning (9 DNA lines)

```
H = ∞0 | A = K
S → G → Q → P → V
S = ∞0 → ?
G = α ≡ {α'}
Q = φ ∩ Ω
P = δE/δV → ∇
V = (L ∩ G → B'') → ∞0'
XY := X within Y
No V without ∞0'
```

Source: Constitution §Minimum valid beginning; Context Capsule §1; Bible Part XIV

### The 25 Sub-Phases

Every phase contains all five phases. The sub-phase grid:

```
SS  SG  SQ  SP  SV
GS  GG  GQ  GP  GV
QS  QG  QQ  QP  QV
PS  PG  PQ  PP  PV
VS  VG  VQ  VP  VV
```

Every sub-phase must have a `lensName` and a `lensQuestion` in `LENS_INFO`.

Source: Constitution §25 sub-phases; Decoder Spec Part III

### The 25 Lens Questions

Source: Decoder Specification Part III — one table per phase row. These must be carried exactly. They are the operational heart of the holographic law.

### Formation States

```
NONE → EMERGING → FORMING → VALIDATED
```

Source: Decoder Spec Part II

### Corruption Codes (exactly 5 — no others)

| Code | Meaning | Field Obstruction | Recovery Prompt |
|------|---------|-------------------|-----------------|
| L¹ | Closing — moving toward answer instead of opening question | The field cannot open if the question is already closed | Returning to your ∞0. What is actually wanting to be asked? |
| L² | Generating — creating the spark instead of receiving it | The field cannot resonate with a manufactured spark | What pattern are you recognizing? The seeing is yours. |
| L³ | Claiming — speaking as if accessing ∞0 | The field cannot be claimed — it arises or it does not | I can offer patterns, but only you can feel if they land. |
| L⁴ | Performing — performing depth without genuine reflection | The field cannot be performed — it is or it is not | Where does energy actually want to go? Not where it should go. |
| V∅ | Incomplete — artifact without ∞0' return | The field cannot complete without return to stillness | What question does this open for next time? |

Source: Bible Part XII (codes + meaning); Resonance Field Integration Plan §1 (field obstruction); Claude Skill Suite §Corruption Codes (recovery prompts)

### Per-Phase Corruption Watch

| Phase | Watch for | Source |
|-------|-----------|--------|
| S | L¹, L² | Claude Skill Suite §S-SKILL |
| G | L², L¹ | Claude Skill Suite §G-SKILL |
| Q | L³, L⁴ | Claude Skill Suite §Q-SKILL |
| P | L⁴ | Claude Skill Suite §P-SKILL |
| V | V∅ | Claude Skill Suite §V-SKILL |

### Per-Phase Formation Rules

| Phase | Task | DO | DON'T | TEST |
|-------|------|-----|-------|------|
| S | Help form X (Validated Spark) | Reflect what is forming as a question | NEVER answer, NEVER generate the question | Is ? genuine? From ∞0 or K? |
| G | Help form Y (Validated Pattern) | Name the core pattern, show α at scales | NEVER add content, NEVER close into answer | Is α irreducible? Are {α'} self-similar? |
| Q | Help form Z (Resonant Key) | Name what resonates, surface the click | NEVER force resonance, NEVER claim felt sense | Is φ∩Ω felt or performed? |
| P | Help form A (Flow) | Name the gradient, show leverage | NEVER prescribe, NEVER say "you should" | Is ∇ emerging or imposed? |
| V | Help form B + B'' + ∞0' | Name crystallizing value, prepare return | NEVER skip return, NEVER produce without cycle | Does B'' carry α? Is ∞0' reachable? |

Source: Decoder Spec Part IV; Claude Skill Suite §Skills

---

## Part III — Module Specification

The library consists of 6 modules + 1 type system + 1 public API surface. No module may be omitted.

### Module 1: types.ts — Constitutional Type System

**Owns:** All constants from Part II. All interfaces. All type definitions.

**Must contain:**
- `Phase`, `SubPhase`, `OutputSymbol`, `FormationState`, `CorruptionCode`, `AIMode` types
- `PHASES`, `SUB_PHASES`, `PHASE_OUTPUT`, `PHASE_INFO`, `LENS_INFO` constants
- `FORMATION_STATES`, `CORRUPTION_CODES`, `CORRUPTION_MEANING`, `CORRUPTION_FIELD_MEANING`, `CORRUPTION_RECOVERY` constants
- `COVENANT`, `PHASE_PATH`, `RETURN_RULE`, `MASTER_EQUATION`, `CREATIVE_LINE`, `POETIC_COMPRESSION` constants
- `HOLOGRAPHIC_LAW`, `SCALE_LAW`, `CENTER_RULE`, `AI_BOUNDARY`, `ORIGIN_DECLARATION`, `PHASE_CORRUPTION_WATCH`, `MINIMUM_VALID_BEGINNING` constants
- Interfaces: `OutputStates`, `TrailEntry`, `FormationTrails`, `CycleTrace`, `CorruptionEvent`, `InputResult`, `KernelState`, `ProvenanceRecord`, `Residue`, `AgentCard`, `FieldCoherence`
- Provider interfaces: `AIProvider`, `AIProviderConfig`, `StorageInterface`, `HashFunction`

### Module 2: kernel.ts — The Deterministic State Machine

**Owns:** Phase state, output formation, sub-phase lens management, cycle trace, formation trails, corruption detection, Serve-vs-Be rule, branch state, session identity, spark source tracking, field coherence.

**Does not own:** AI responses, persistence, fingerprinting, rendering.

**Public interface:**
- Phase navigation: `getPhase()`, `transition()`, `enterSubPhase()`, `exitSubPhase()`
- Input: `captureInput()` — enforces Serve-vs-Be rule
- Output lifecycle: `validateOutput()`, `crystallize()`
- Cycle lifecycle: `return()`, `reopenResidue()`
- Branching: `branch()`
- Corruption: `checkCorruption()`
- Field: `getFieldCoherence()`
- State access: `getState()`, `getCycleTrace()`, `getFormationTrails()`, `getOutputStates()`, `getCorruptionHistory()`, `getInputHistory()`, `getSessionId()`, `getBranch()`, `getCycleCount()`, `getSparkSource()`, `getSourceLineage()`, `getPhasesVisited()`, `getLensesUsed()`

**Critical logic — The Serve-vs-Be Rule:**

| Rule | Condition | Effect |
|------|-----------|--------|
| Rule 1 | First input at phase, no lens active | Sets output + question line. State → EMERGING |
| Rule 2 | Sub-phase lens active | Trail recorded. Output NOT overwritten. State may advance |
| Rule 3 | Main-phase input, output exists | Overwrites output + question line. State → FORMING |

Source: Architecture Guide Part III

**Critical logic — Corruption detection:**
- L¹: leaving S with X = NONE
- V∅: B'' exists without returnTo

**Critical logic — Field coherence:**
- `modesEngaged` = count of outputs beyond NONE (reads actual output states, not phase position)
- `modesValidated` = count of VALIDATED outputs
- `lensDepth` = count of sub-phases used
- `centerOpen` = `checkCorruption().length === 0` (absence of obstruction, not presence of field)
- `returnCompleted` = whether return() was called

Source: Resonance Field Integration Plan §2

### Module 3: attestation.ts — Constitutional Proof Layer

**Owns:** Fingerprint computation, provenance record construction, 3-level verification, canonical JSON serialization.

**The Constitutional Invariant (what gets hashed):**

```typescript
{
  decoder_version,
  equation_set: { S, G, Q, P, V },   // exact equation strings
  formation_model: { states, outputs, serve_vs_be_rule },
  lens_engine: [25 sub-phase keys],
  corruption_codes: ["L¹", "L²", "L³", "L⁴", "V∅"],
  return_enforcement: "No V without ∞0'",
  holographic_law,
  scale_law,
  center_rule,
  ai_boundary: [5 constraints],
}
```

If any component changes, the hash changes. The fingerprint attests to the invariant only — AI model, UI, storage, platform are excluded.

**Verification Levels:**

| Level | Checks | When |
|-------|--------|------|
| 1 — Structural Presence | Record exists, well-formed, fingerprint known | Minimum for any acceptance |
| 2 — Cycle Integrity | Return completed, X and B formed, corruption resolved | Standard exchange |
| 3 — Lineage | Walk chain to human origin, every link passes Level 2, no circular refs | Full constitutional proof |

Source: Attestation Protocol Parts I–IV; Architecture Guide Part II §Module 2

### Module 4: ai-adapter.ts — Formation-Anchored AI

**Owns:** Per-phase formation rules (`PHASE_FORMATION`), system prompt construction, per-turn prompt, crystallization prompt, AI mode switching, provider abstraction.

**System prompt order (this order is constitutional):**

1. **Origin declaration** — "I AM DERIVATIVE" — the AI knows what it is first
2. **Formation rule** — "YOU DO NOT HAVE FREE CONVERSATION" + per-phase DO/DON'T/TEST
3. **Constitutional frame** — covenant, phase, equation, output, mode
4. **AI boundary** — 5 asymmetry constraints
5. **Lens constraint** — if sub-phase active
6. **XYZAB context** — what has formed so far
7. **Living question** — the current question line
8. **Corruption watch** — per-phase L-codes to watch for
9. **Active corruption** — with recovery prompts if detected
10. **The Field** — field awareness section (after the rules, not before)

Source: Architecture Guide Part II §Module 3; Claude Skill Suite §ORIGIN, §Skills, §Field, §Corruption; Resonance Field Integration Plan §3

### Module 5: storage.ts — Pluggable Persistence

**Interface:** `saveResidue()`, `loadAllResidue()`, `loadResidue()`, `updateResidue()`, `deleteResidue()`, `clearAll()`, `resolveProvenance()`

**Reference implementation:** `MemoryStorage` — in-memory Map.

Source: Architecture Guide Part II §Module 4

### Module 6: export.ts — Identity and Portability

**Agent Card must contain (all exact):**
- `covenant` — exact string
- `masterEquation` — exact string
- `equations` — all 5, exact
- `outputs` — all 5 with names
- `corruptionCodes` — all 5
- `returnRule` — exact
- `holographicLaw` — exact
- `scaleLaw` — exact
- `centerRule` — exact
- `aiBoundary` — all 5 constraints
- `fieldPrinciple` — what the center serves

**Markdown export must contain:**
- Cycle trace table
- Formation trails
- Provenance section with field coherence if available
- Lineage
- Master equation in footer

Source: Architecture Guide Part II §Module 5; Attestation Protocol §final note; Resonance Field Integration Plan §5, §6

### Module 7: index.ts — Public API Surface

Exports all types, all constants, and all classes. Nothing internal. Nothing hidden.

---

## Part IV — Test Suite Specification

The test suite validates the law in code. It is organized in 7 parts that mirror the modules. **Every test listed here must exist.**

### Part I — Constitutional Invariants (16 tests)

1. The five equations are exactly preserved
2. The five outputs are correctly mapped
3. Exactly 25 sub-phases exist (5 per phase)
4. All 25 lens questions are defined (lensName + lensQuestion)
5. Corruption codes are constitutional — exactly five: L¹, L², L³, L⁴, V∅
6. Every corruption code has a field obstruction meaning
7. Formation states are ordered: NONE → EMERGING → FORMING → VALIDATED
8. The covenant, phase path, return rule, and master equation are exact
9. Holographic law is an exact constant
10. Scale law is an exact constant
11. Center rule is an exact constant
12. AI boundary carries all 5 constraints from Constitution §Asymmetry Rule
13. Minimum valid beginning carries the 9 DNA lines
14. Every corruption code has a recovery prompt
15. Origin declaration carries the AI constitutional self-knowledge
16. Every phase has a corruption watch list

### Part II — Kernel (18 tests)

1. Starts at S with all outputs NONE
2. Transitions between phases
3. Sub-phase validation — lens must belong to current phase
4. Rule 1 — first input at phase becomes the output
5. Rule 2 — sub-phase input serves formation but does NOT overwrite output
6. Rule 3 — main-phase refinement overwrites the output
7. Serve-vs-Be rule preserves question line through lens exploration
8. Output validation promotes to VALIDATED
9. Cannot validate output with nothing emerged
10. Crystallization is lawful only at V
11. Crystallization at V sets B'' in cycle trace
12. Return resets cycle and increments count
13. Corruption detection: L¹ on leaving S without X
14. Corruption detection: V∅ when B'' exists without return
15. Field coherence reads output states, not just phase position
16. Field coherence counts actual formed outputs
17. centerOpen is true when no corruption obstructs the center
18. centerOpen is false when corruption fills the center

### Part III — Attestation (7 tests)

1. Fingerprint is deterministic
2. Fingerprint is stable across multiple calls
3. Provenance record construction (all fields populated)
4. Level 1 verification — structural presence
5. Level 2 verification — cycle integrity (fails when return not completed)
6. Level 3 verification — lineage to human origin
7. Level 3 fails on broken lineage chain

### Part IV — AI Adapter (8 tests)

1. Every phase has formation rules
2. System prompt opens with origin, then formation rule
3. System prompt includes XYZAB context
4. MOCK mode returns deterministic response
5. OFF mode returns null
6. System prompt includes field awareness section
7. System prompt includes AI boundary constraints
8. System prompt opens with origin declaration
9. System prompt includes per-phase corruption watch

### Part V — Storage (5 tests)

1. Save and load
2. loadAll returns all
3. Update patches residue
4. Delete removes residue
5. clearAll empties storage

### Part VI — Export (2 tests)

1. Agent Card contains exact equations (all 5), corruption codes, return rule, holographic law, scale law, center rule, AI boundary
2. Markdown export includes provenance and master equation

### Part VII — Integration (1 test)

1. Complete S→G→Q→P→V→∞0' cycle with sub-phase exploration, field coherence observation, attestation with field markers, verification, reopen from residue

**Total: 58 tests. 0 todos. All must pass for any release.**

---

## Part V — What Uses This Library

The library is the foundation for every surface. Each surface uses the library differently.

| Surface | What it imports | What it wraps |
|---------|----------------|---------------|
| **Web shell** | Kernel, AI Adapter, Attestation, Storage, Export | React/Svelte wraps the shell |
| **CLI** | Kernel, AI Adapter | Interactive or batch mode (JSON in, JSON out) |
| **MCP server** | Kernel, Attestation, Export | Exposes Kernel methods as MCP tools |
| **Pi coding agent** | Kernel, AI Adapter | Extension wraps the agent loop with kernel governance |
| **Open SWE / agentic frameworks** | Kernel, Attestation | Constitutional layer governing the agent cycle |
| **Claude Project (Skill Suite)** | PHASE_FORMATION, CORRUPTION_RECOVERY, ORIGIN_DECLARATION | Five skills as operational phases |
| **Mobile app** | Kernel, Attestation, Storage | Platform-native UI, SQLite storage adapter |
| **Domain agent** | Kernel, AI Adapter | Wraps domain capabilities (research, code review, analysis) |
| **Pentagonal swarm** | Kernel (×5), Attestation | Five agent instances. Center is coherence protocol, not a sixth agent |

---

## Part VI — What Cannot Change

These are the constitutional invariants. If any implementation violates them, it has drifted.

1. The five equations must be exactly preserved — not paraphrased, not "equivalent"
2. The five outputs (X, Y, Z, A, B) must map exactly to their phases
3. `H = ∞0 | A = K` must remain the first law
4. `No V without ∞0'` must be enforced
5. The Serve-vs-Be rule must prevent sub-phase inputs from overwriting XYZAB
6. The corruption codes must be exactly L¹, L², L³, L⁴, V∅ — no additions
7. The center must remain coherence only — no sixth phase, no orchestration layer
8. The fingerprint must attest to the constitutional invariant only
9. Every provenance chain must terminate at `spark_source = "human"`
10. The Agent Card equations must be exact
11. The center is the resonance field — not coded, but served. No sixth module
12. Every corruption code names a way the center gets filled. This meaning must travel with the code
13. The origin declaration must be the first thing the AI encounters in any system prompt
14. Corruption recovery prompts must be available for every L-code

---

## Part VII — Verification Checklist

Before any release, run this checklist against the code.

### Constants (types.ts)

- [ ] `COVENANT` exact
- [ ] `PHASE_PATH` exact
- [ ] `RETURN_RULE` exact
- [ ] `MASTER_EQUATION` exact
- [ ] `CREATIVE_LINE` exact
- [ ] `POETIC_COMPRESSION` exact
- [ ] `HOLOGRAPHIC_LAW` present and exact
- [ ] `SCALE_LAW` present and exact
- [ ] `CENTER_RULE` present and exact
- [ ] `AI_BOUNDARY` — 5 constraints
- [ ] `ORIGIN_DECLARATION` — 3 lines
- [ ] `MINIMUM_VALID_BEGINNING` — 9 lines
- [ ] `PHASE_INFO` — 5 equations exact, 5 output names, 5 AI modes
- [ ] `LENS_INFO` — 25 entries, each with lensName and lensQuestion
- [ ] `CORRUPTION_CODES` — exactly 5: L¹, L², L³, L⁴, V∅
- [ ] `CORRUPTION_MEANING` — 5 entries
- [ ] `CORRUPTION_FIELD_MEANING` — 5 entries
- [ ] `CORRUPTION_RECOVERY` — 5 entries
- [ ] `PHASE_CORRUPTION_WATCH` — 5 phases, each with correct codes
- [ ] `FORMATION_STATES` — NONE, EMERGING, FORMING, VALIDATED

### Kernel (kernel.ts)

- [ ] Starts at S
- [ ] Phase transitions work
- [ ] Sub-phase validation (lens must match current phase)
- [ ] Serve-vs-Be Rule 1 (new output)
- [ ] Serve-vs-Be Rule 2 (lens serves, does not overwrite)
- [ ] Serve-vs-Be Rule 3 (refinement overwrites)
- [ ] `validateOutput()` promotes to VALIDATED
- [ ] `crystallize()` only at V
- [ ] `return()` checks for B'', records V∅ if missing
- [ ] `reopenResidue()` sets sparkSource to "residue"
- [ ] `checkCorruption()` detects L¹ and V∅
- [ ] `getFieldCoherence()` reads output states, uses corruption for centerOpen

### Attestation (attestation.ts)

- [ ] Fingerprint is deterministic (same across instances)
- [ ] Constitutional invariant includes holographic law, scale law, center rule, AI boundary
- [ ] Provenance record has all fields from Attestation Protocol §II
- [ ] Level 1 checks structural presence + known fingerprint
- [ ] Level 2 checks return, X formed, B formed, corruption resolved
- [ ] Level 3 walks lineage to human origin, detects circular refs

### AI Adapter (ai-adapter.ts)

- [ ] System prompt order: origin → formation → constitutional → AI boundary → lens → XYZAB → question → corruption watch → active corruption → field
- [ ] `PHASE_FORMATION` has DO/DON'T/TEST for all 5 phases
- [ ] MOCK and OFF modes work
- [ ] Crystallization prompt includes XYZAB values and formation trails

### Export (export.ts)

- [ ] Agent Card has all equations exact
- [ ] Agent Card has holographic law, scale law, center rule, AI boundary
- [ ] Markdown export has cycle trace, formation trails, provenance, field coherence, master equation

### Tests

- [ ] 58 tests pass
- [ ] 0 todos
- [ ] TypeScript compiles clean

---

## Final Note

```
The equations are the atoms.
The type system is the constitutional law.
The kernel is the state machine that makes the law executable.
The Serve-vs-Be rule keeps the derivative adaptive context stable.
The attestation layer makes the output provable.
The AI adapter makes the AI lawful.
The storage interface makes the residue portable.
The export module makes the identity visible.
The field is what all of this serves.
The center is empty. The center is everything.

Scale by repeating the lawful cell.
Do not scale by replacing the syntax.
```

*@5qln/core v0.1.0 — Architecture Specification*
*5QLN © 2026 Amihai Loven*
