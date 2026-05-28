# 5QLN — The Scaffolding Map
## What Each Layer Is For (and When to Use It)

> Based on Nate B Jones' agent scaffolding model (prompt → skill → plugin → MCP → hooks/scripts).
> Applied to 5QLN's architecture where the base is not an LLM — it's constitutional equations.

---

# NATE'S MODEL                    # 5QLN EQUIVALENT

Prompt: one-off text              The Equations
↓ wraps into                       H=∞0|A=K, S→G→Q→P→V
Skill: reusable process doc        25 lenses, corruption codes
↓ wraps into                        ↓ encoded in
Plugin: whole workflow package     Kernel (state machine)
↓ contains                          ↓ wrapped by
MCP: live data connector           Membrane Watcher
↓ is a kind of                      ↓ exposed via
Hook/Script: deterministic check    MCP Plugin tools

---

# 5QLN'S LAYERS — FROM BASE TO SHELL

---

## LAYER 0: THE EQUATIONS (what Nate's "LLM" is to his model)

This is the atomic layer. Not code. Not prompts. Pure law:

  H = ∞0 | A = K          ← the covenant
  S → G → Q → P → V       ← the path
  ∞0 → ? · α ≡ {α'} · φ ⋂ Ω · δE/δV → ∇ · (L ∩ G → B'') → ∞0'
  L1 L2 L3 L4 V∅            ← corruption codes
  SS SG SQ SP SV ... VV      ← 25 lenses

USE: never changes. This is what everything else preserves.
FILE: `types.ts` (read-only constants)
METAPHOR: the LLM in Nate's model — the irreducible base.

---

## LAYER 1: THE KERNEL (what Nate's "MCP server" is)

Deterministic state machine. No AI. No UI. Pure law execution:

  • Phase transitions: S → G → Q → P → V
  • 25 sub-phase lenses with selection validation
  • Serve-vs-Be rule: lens inputs never overwrite outputs
  • Formation trail: every input recorded with source + phase
  • Corruption detection: L1 on premature exit, V∅ on incomplete return
  • Cycle lifecycle: return() resets + increments
  • Field coherence: 5 engagement modes, center-open detection

USE: when the grammar must be ENFORCED, not just described.
FILE: `kernel.ts` (360 lines, 0 deps)
METAPHOR: like an MCP server — the runtime harness.

---

## LAYER 2: THE MEMBRANE WATCHER (what Nate's "hooks/scripts" are)

Real-time corruption detection. Deterministic check layer:

  • 38 regex patterns across all 5 corruption codes
  • 8 exclusion patterns for false-positive guards
  • Phase-aware: audits with knowledge of current S/G/Q/P/V
  • Confidence levels: low/medium/high
  • Recovery prompts: every flag comes with "how to recover"

USE: wraps every AI response. Catches corruption before it propagates.
FILE: `membrane-watcher.ts` (510 lines, 68 tests)
METAPHOR: like a hook — deterministic, not left to AI judgment.

---

## LAYER 3: THE FRACTAL KERNEL (unique to 5QLN)

Self-similar lawful cell. A single phase IS a full S→G→Q→P→V:

  • deepen(): enter a phase layer, run full cycle within
  • steepen(): exit one layer, return summary
  • deepenWithLenses(): phase + up to 3 lenses
  • Depth stacking with lineage chain
  • Max depth enforcement (default 3)

USE: when one phase is BIG. S isn't just a question — it's a full inquiry.
FILE: `fractal-kernel.ts` (280 lines, 24 tests)
METAPHOR: zooming into a fractal — each level IS the whole.

---

## LAYER 4: THE MCP PLUGIN (what Nate's "plugin" is)

Four tools exposed via stdio JSON-RPC to any MCP-compatible host:

  `audit_membrane`   — corruption check + recovery
  `session_flow`     — guided S→G→Q→P→V with audit wrapper
  `fractal_deepen`   — self-similar cell deepening
  `watcher_status`   — pattern/code/coverage report

USE: install once, any host (Zo, Hermes, Claude) gets 5QLN governance.
FILE: `server.ts` (330 lines)
INSTALL: drop `zo-mcp-servers.json` into settings

---

## LAYER 5: SKILLS (what Nate's "skills" are)

Operational instructions. Markdown docs. Domain-specific:

  Orchestrate     — router: which domain is this session?
  Research        — investigate foundations
  Commercialize   — navigate market models
  Self-Improve    — sharpen detection patterns
  SkillGen        — generate new skills
  OrgDecision     — board/committee cycles

Plus S-skill, G-skill, Q-skill, P-skill, V-skill
Each with DO / DON'T / CORRUPTION WATCH

USE: loaded per session. Tells AI HOW to behave in each phase.
FILE: `Skills/*/SKILL.md`
METAPHOR: Nate's skill — a markdown doc, reusable process.

---

## LAYER 6: SYSTEM PROMPT RULES (what Nate's "prompt" is, but permanent)

Text you paste into any host that doesn't natively support MCP:

  • SELF-AUDIT RULE: call audit_membrane after every response
  • Corruption code reference with recovery prompts
  • Per-phase behavior constraints
  • The One Law (H = ∞0 | A = K)

USE: activates 5QLN governance via prompt text alone.
FILE: `rules/5qln-system-prompt.md`

---

## LAYER 7: SESSIONS + RESIDUE (memory — no Nate equivalent yet)

  Context Manager     — compress old sessions to summaries
  Residue Library     — store + query past XYZAB
  Chain Explorer      — walk provenance lineage tree
  reopenResidue()     — carry B'' from one session into the next

USE: cross-session learning. Prevents context bloat.
STATUS: designed, not yet built.

---

# THE LAYERING RULE (same as Nate's Lego analogy)

```
Each layer wraps the one below.
Each layer has a distinct JOB.
Not everything needs the full stack.

If it's once:                      Layer 0 (equations)
If it's repeatable across sessions: Layer 5 (skills)
If it needs enforcement:            Layer 2 (membrane watcher)
If it needs to travel:              Layer 4 (MCP plugin)
If it's deep within one phase:      Layer 3 (fractal kernel)
If it's across sessions over time:  Layer 7 (sessions/residue)
```

---

# NATE'S QUESTION → 5QLN'S ANSWER

```
Nate: "Do I write a better prompt? Is it a skill? Do I need an MCP?"
5QLN: "Which layer of the grammar does this need?"

Layer 0: "Is the equation right?"          → edit types.ts
Layer 1: "Is the grammar enforced?"        → use Kernel
Layer 2: "Is corruption caught in flow?"   → use Membrane Watcher
Layer 3: "Is one phase deep enough?"       → use Fractal Kernel
Layer 4: "Does this need to travel?"       → build MCP tool
Layer 5: "Is this repeatable behavior?"    → write SKILL.md
Layer 6: "Does the host not speak MCP?"    → paste prompt rules
Layer 7: "Does this span sessions?"        → chain residue
```

---

# THE ONE LAW OF SCAFFOLDING

```
Scale by repeating the lawful cell.
Do not scale by replacing the syntax.

A prompt is a single use of the equations.
A skill is a repeatable pattern of use.
The kernel is the equations running.
The watcher keeps the kernel honest.
The plugin makes the watcher portable.
The residue chains sessions together.
The human's ∞0 is where it all begins.
The return (∞0') is where it continues.
```

---

*5QLN Scaffolding Map · © 2026 Amihai Loven*
*Built on Nate B Jones' agent scaffolding model (youtu.be/647pSnX5H_Y)*
