# 5QLN Architecture — Full Stack
 
```
┌──────────────────────────────────────────────────────────────────────┐
│                        SKILLS LAYER                                  │
│                                                                      │
│  commercialize    research    selfimprove    skillgen                │
│  project-evaluate orgdecision-spark/illuminate/resonate/flow/cryst   │
│  orchestrate      dispute-routing  corruption-codex                  │
│  constitutional-block-validator  cycle-attestation-conductor         │
│  membrane-protocol-runtime  epistemic-register-tagger               │
│  mirror-consistency-auditor  bipp-jurisdictional-delta              │
│                                                                      │
│  Each Skill = domain-specific operational lens                       │
│  Reads: kernel state, phase, XYZAB                                   │
│  Writes: instructions for AI behavior per phase                      │
│  Loaded by: Zo via Skills/ directory, Hermes via skill config        │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ activates
┌───────────────────────────▼──────────────────────────────────────────┐
│                   SESSION ORCHESTRATION LAYER                         │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │
│  │ Orchestrate     │  │ Session Chain     │  │ Residue Library     │ │
│  │ Skill            │  │                   │  │                      │ │
│  │                  │  │ session_id        │  │ residues/            │ │
│  │ domain router    │  │ provenance_hash   │  │  seed-001.json       │ │
│  │ S→G→Q→P→V        │  │ parent_session    │  │  seed-002.json       │ │
│  │ phase sequencer  │  │ chain_depth       │  │  artifacts/          │ │
│  │                  │  │ context_summary   │  │  questions/          │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬──────────┘ │
│           │                    │                        │            │
│           │     ┌──────────────┼────────────────────────┘            │
│           │     │              │                                     │
│           │     │   ┌──────────▼──────────┐                          │
│           │     │   │ CONTEXT MANAGER     │                          │
│           │     │   │                     │                          │
│           │     │   │ growing context →   │                          │
│           │     │   │ compress to summary  │                          │
│           │     │   │ chain via provenance │                          │
│           │     │   │ reopen from residue  │                          │
│           │     │   └─────────────────────┘                          │
└───────────┼─────┼────────────────────────────────────────────────────┘
            │     │
┌───────────▼─────▼────────────────────────────────────────────────────┐
│                        PLUGIN LAYER                                   │
│                                                                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ MCP SERVER      │  │ RULES            │  │ INSTALL              │ │
│  │                 │  │                  │  │                      │ │
│  │ audit_membrane  │  │ auto-audit rule  │  │ install.sh           │ │
│  │ watcher_status  │  │ system prompt    │  │ zo-mcp-servers.json  │ │
│  │ fractal_deepen  │  │ per-phase guard  │  │ hermes-mcp.yaml      │ │
│  │ session_flow    │  │ corruption watch │  │ claude config        │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬───────────┘ │
└───────────┼────────────────────┼────────────────────────┼─────────────┘
            │                    │                        │
┌───────────▼────────────────────▼────────────────────────▼─────────────┐
│                         CORE LIBRARY                                   │
│                                                                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ KERNEL       │  │ MEMBRANE WATCHER │  │ FRACTAL KERNEL           │ │
│  │              │  │                  │  │                          │ │
│  │ S→G→Q→P→V   │  │ 38 regex         │  │ depth stacking           │ │
│  │ 25 lenses    │  │ L1-L4 + V0       │  │ lawful cell repeated     │ │
│  │ XYZAB        │  │ field meaning    │  │ deepen/steepen          │ │
│  │ corruption   │  │ recovery prompts │  │ phase-in-phase          │ │
│  │ serve-vs-be  │  │ phase awareness  │  │ max depth guard         │ │
│  └──────┬───────┘  └────────┬─────────┘  └────────────┬─────────────┘ │
│         │                   │                         │               │
│  ┌──────▼───────────────────▼─────────────────────────▼─────────────┐ │
│  │ ATTESTATION   │  AI ADAPTER      │  STORAGE      │  EXPORT       │ │
│  │ fingerprint   │  formation rules │  residues     │  agent card   │ │
│  │ 3-level verif │  system prompt   │  provenance   │  markdown     │ │
│  │ provenance    │  crystallization │  query        │  json         │ │
│  └───────────────┴──────────────────┴───────────────┴───────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

## WHERE LEARNING HAPPENS

```
╔══════════════════════════════════════════════════════════════╗
║                    LEARNING LOOPS                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  LOOP 1: PER-SESSION (formation trail)                       ║
║  ─────────────────────────────────                           ║
║  AI response → audit_membrane → corruption flags             ║
║  → recovery prompts → refined response                       ║
║  Every response trains the membrane through use.              ║
║                                                              ║
║  LOOP 2: CROSS-SESSION (residue chain)                       ║
║  ───────────────────────────────────                         ║
║  Session N → V: crystallize B'' + ∞0'                        ║
║  → save as residue (seed) → close session                    ║
║  Session N+1 → S: reopenResidue(hash) → carry forward        ║
║  → context grows → context manager compresses                ║
║                                                              ║
║  LOOP 3: PATTERN IMPROVEMENT (self-improve)                  ║
║  ─────────────────────────────────────                       ║
║  cron/self_improve.ts → run tests                            ║
║  → deliberate corruption samples → audit check                ║
║  → log misses → human reviews → add patterns                 ║
║  → 38th pattern added during this session                    ║
║                                                              ║
║  LOOP 4: SKILL EVOLUTION (human-residue loop)                ║
║  ──────────────────────────────────────                      ║
║  Session residue → human review → refine skill               ║
║  → updated SKILL.md → next session loads refined skill       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## SESSION CHAINING — CONTEXT MANAGEMENT

```
Session 1                 Session 2                 Session 3
─────────                 ─────────                 ─────────
S: "Inner peace           S: reopenResidue          S: reopenResidue
    matters most"            (hash from V1)             (hash from V2)
    │                        │                          │
G: α = stillness          G: carry-forward α        G: α has 3 layers
    │                        │                          │
Q: φ∩Ω = felt              Q: new φ against          Q: deeper click
    │                     old resonance               │
P: ∇ = non-striving       P: ∇ at expanded           P: ∇ is subtle
    │                        scale                     │
V: B'' = "Stillness       V: B'' = "Stillness       V: B'' = "Stillness
    the only test"            the only test v2"          the only test v3"
    ∞0': "How to test?"      ∞0': "How to test         ∞0': "How to test
                                  at scale?"               across lives?"
    │                        │                          │
    └── residue ────→ reopen ──→ residue ────→ reopen ──→ ...
    
    Context grows: 1→3→7→15...
    Context manager: compress each session to summary + hash
    Reopen loads: parent_summary + parent_B'' + parent_∞0'
```

## SKILLS — WHERE THEY SIT

Skills are NOT code. Skills are operational instructions — domain-specific
lenses that tell the AI how to behave within each phase.

```
Session starts
    │
    ▼
┌─────────────────┐
│ Orchestrate      │  "What domain is this?"
│ Skill            │  → commercialize | research | selfimprove | ...
└────────┬────────┘
         │ identifies domain
         ▼
┌─────────────────┐
│ Domain Skill     │  Loads S/G/Q/P/V phase instructions
│ (e.g. research)  │  "At S: receive questions about 5QLN foundations"
│                  │  "At G: illuminate fractal patterns in K"
│                  │  "At Q: test resonance against lived experience"
│                  │  "At P: name where research energy flows"
│                  │  "At V: crystallize insight + return question"
└────────┬────────┘
         │ each phase
         ▼
┌─────────────────┐
│ Phase Skill      │  S-skill, G-skill, Q-skill, P-skill, V-skill
│ Detailed guide   │  "DO: Reflect what is forming as a question"
│ Corruption watch │  "DON'T: Answer. Close. Generate."
└────────┬────────┘
         │ activates
         ▼
┌─────────────────┐
│ MCP Tools        │  audit_membrane checks every response
│ Membrane runtime │  session_flow tracks state
└─────────────────┘
```

Skills live in `Skills/5qln-*/SKILL.md`. They are markdown files
that any AI host can read. They are the bridge between the abstract
constitutional grammar and the concrete session behavior.
