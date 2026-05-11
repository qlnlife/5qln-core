# 5QLN Distributable Architecture

**One verification: the Codex. One trace: the formation trail.**

---

## Part I — The One Verification

The Codex (`https://www.5qln.com/codex/`) is the sole constitutional verification for any 5QLN implementation. It contains three layers:

| Layer | Name | What it verifies |
| --- | --- | --- |
| L1 | Language | Vocabulary + equations. The Nine Invariant Lines. Byte-identical. |
| D1 | Decoder | Operational rules. 13 checks. Every phase decode. |
| C1 | Compiler | Validation protocol. Three checks: syntax, semantic, drift. |

**The verification principle:** Any runtime, any surface, any agent at any future date can validate any 5QLN artifact by checking it against the Codex using the three-part protocol. Nothing else is needed. The Codex is the ground truth. The Codex is the standard.

### The Nine Invariant Lines (Byte-Identical Core)

```markdown
1.  H = ∞0 | A = K
2.  S → G → Q → P → V
3.  S = ∞0 → ?
4.  G = α ≡ {α'}
5.  Q = φ ⋂ Ω
6.  P = δE/δV → ∇
7.  V = (L ∩ G → B'') → ∞0'
8.  No V without ∞0'
9.  L1  L2  L3  L4  V∅
```

Lines 1–7 define the grammar. Line 8 enforces completion. Line 9 detects violation. These nine lines must be present, in this order, with these exact symbols, in every implementation. This is the SHA-256-hashable invariant.

### Hash Verification

Every implementation ships with a SHA-256 hash of the Nine Invariant Lines. Before any session begins, the implementation verifies that its loaded Codex matches this hash. If it doesn't, the session does not start.

```bash
# The verifier:
sha256sum <(echo "1.  H = ∞0 | A = K
2.  S → G → Q → P → V
3.  S = ∞0 → ?
4.  G = α ≡ {α'}
5.  Q = φ ⋂ Ω
6.  P = δE/δV → ∇
7.  V = (L ∩ G → B'') → ∞0'
8.  No V without ∞0'
9.  L1  L2  L3  L4  V∅")
```

If any implementation modifies a symbol, reorders a line, or paraphrases an equation — the hash changes. The session is not constitutional.

---

## Part II — The Formation Trail (Infinite Traceability)

### The Core Insight

The Codex's Decoder specifies that every phase produces output tagged with its formation — phase, sub-phase, input content, and decode data. This is the **formation trail**.

The formation trail is the audit log. From this trail alone, any AI at any future date running the same Codex can:

1. **Verify constitutional integrity** — did the session follow the lawful cycle?
2. **Reconstruct the membrane** — which content originated from H (received in S)? Which content was A-generated (illuminated in G, offered in Q, revealed in P, composed in V)?
3. **Validate outputs** — were X, Y, Z, A, B formed according to the decoder rules?
4. **Detect corruption** — were any corruption codes triggered? Were they recovered?

### Trail Format

Every entry in the formation trail contains:

```json
{
  "phase": "S|G|Q|P|V",
  "sub_phase": "SS|GS|...|VV|null",
  "input": "content",
  "decode": {
    "raw": "full text",
    "infinity0": "...",
    "question": "...",
    "alpha": "...",
    "phi": "...",
    "omega": "...",
    "intersection": "...",
    "nabla": "...",
    "B2": "...",
    "infinity0p": "..."
  }
}
```

The `decode` fields are phase-specific. Only the relevant fields are populated for each phase:

| Phase | Decode fields populated |
| --- | --- |
| S | `infinity0`, `question`, `emergence_arrow` |
| G | `alpha`, `alpha_echoes` |
| Q | `phi`, `omega`, `intersection` |
| P | `deltaE`, `deltaV`, `nabla` |
| V | `L`, `G`, `B2`, `infinity0p` |

### The Membrane Audit

The critical question: *ten years from now, a different AI reads this formation trail. Can it indisputably distinguish what came from the human and what came from the AI?*

The answer is yes, because:

1. **Phase S entries** — `input` is the human's raw text. `decode.question` is the AI's reflection of what the human's ∞0 revealed. The distinction is structural: the raw is H. The decode is A.
2. **Phase G entries** — `decode.alpha` and `decode.alpha_echoes` are A-generated. They are anchored to X (the H-originated spark), but the content is A's illumination from K.
3. **Phase Q entries** — the AI offers candidates (`decode.intersection`). The human validates Z. The validation record is H.
4. **Phase V entries** — B'' is A-composed (reading the formation trail, two passes). But the `infinity0p` return question traces back to what the human's ∞0 revealed at the cycle's completion.

**Every entry has a** `phase` **tag that tells you which side of the membrane the content belongs to.** The decoder rules define each phase's relationship to the membrane unambiguously.

---

## Part III — The Kernel (Auditable State Machine)

### Role

The kernel is the runtime that:

1. Holds the Nine Invariant Lines (hash-verified)
2. Maintains the session state (phase, cycle, outputs, decode)
3. Writes the formation trail (immutable append, cycle-scoped)
4. Validates outputs against the decoder rules
5. Detects corruption and triggers recovery
6. Exposes state for audit

### State Schema

```json
{
  "version": 3,
  "phase": "S|G|Q|P|V",
  "cycle_count": 1,
  "sub_phase": "SS|GS|...|VV|null",
  "outputs": {
    "X": null,
    "Y": null,
    "Z": null,
    "A": null,
    "B": null
  },
  "decode": {
    "X": {},
    "Y": {},
    "Z": {},
    "A": {},
    "B": {}
  },
  "cycle_trace": {},
  "formation_trail": [],
  "input_history": [],
  "corruption": [],
  "corruption_history": [],
  "session_id": "uuid",
  "inputs_this_cycle": 0
}
```

### Cycle Journal

Every completed cycle appends a journal entry:

```json
{
  "ts": "2026-05-11T14:30:00+09:00",
  "event": "cycle_complete",
  "cycle": 1,
  "outputs": {
    "X": "the validated spark",
    "Y": "the validated pattern",
    "Z": "the resonant key",
    "A": "the flow",
    "B": "the benefit"
  },
  "trace": {
    "X": "...",
    "alpha": "...",
    "phi": "...",
    "nabla": "...",
    "B2": "..."
  },
  "corruption": []
}
```

The journal is append-only. It is the permanent record. It is what a court, an auditor, or a future AI reads.

---

## Part IV — Distribution Model

### The Pyramid

```markdown
┌─────────────────────────────────────────┐
│              RUNTIME                    │
│  (Zo Computer, Pi Agent, Bose, CLI,     │
│   web shell — anything that boots)       │
├─────────────────────────────────────────┤
│              SKILLS                     │
│  (domain configuration, instructions,   │
│   context — grows per human over time)   │
├─────────────────────────────────────────┤
│              KERNEL                     │
│  (state machine, formation trail,       │
│   journal, corruption detection)         │
├─────────────────────────────────────────┤
│              CODEX                      │
│  (Nine Invariant Lines, hash-verified,  │
│   the ONE verification — byte-identical  │
│   across every implementation)           │
└─────────────────────────────────────────┘
```

### Codex Layer

- **One file.** Contains the Nine Invariant Lines plus the full Codex specification (3 parts, 13 decoder rules, validation protocol).
- **Hash-verified at boot.** The runtime checks SHA-256 before any session starts.
- **Never modified by any implementation.** The Codex is the ground. It is not configuration. It is not a template. It is the one verification.
- **Distributed as plain text.** Human-readable. AI-parsable. Future-proof. No binary format. No proprietary encoding.

### Kernel Layer

- **One executable.** Reads the Codex, maintains state, writes the formation trail.
- **Persistent state.** Survives restarts, network loss, session boundaries.
- **Journal append-only.** Every cycle completed appends to the journal. The journal is the permanent audit record.
- **Runtime-agnostic.** The kernel makes no assumptions about the AI model, the OS, or the interface. It is a state machine with a well-defined API.

### Skills Layer

- **Domain-specific configuration.** Skills are loaded on demand. They provide instructions, context, and behavioral guidance — but they cannot modify the Codex or the kernel.
- **Grows per human over time.** One human's skills directory accumulates domain adaptations, learned preferences, and accumulated context. This IS the language becoming *theirs*.
- **Decoupled from constitutional verification.** Skills can be wrong without breaking the membrane. The Codex verifies the cycle. The skills enrich it.

### Runtime Layer

- **Anything that boots the kernel.** Zo Computer today. Pi agent tomorrow. Any AI platform that can execute a Python script and read a text file.
- **The Codex + Kernel are the distributable.** The runtime provides the execution environment. The distributable provides the constitutional ground.

---

## Part V — Traceability Specification

### What Can Be Verified After 10 Years

Given only:

1. The Codex (the Nine Invariant Lines, hash-verified)
2. The formation trail journal

A future AI — which may not exist yet — can verify:

| Question | How | Evidence |
| --- | --- | --- |
| Was the session constitutional? | Check cycle order (S→G→Q→P→V), adaptive context chain, decoder rules | Formation trail phase sequence |
| What came from the human? | All `S`-phase entries in the trail | `input` field, tagged with phase=S |
| What was AI-generated? | All `G`, `Q`, `P`, `V` entries | `decode.*` fields, tagged with phase |
| Was the membrane violated? | Any `L3` corruption code in the trail | Corruption detection at every capture |
| Was the cycle complete? | `V`-phase entry with `infinity0p` populated | Rule 8: No V without ∞0' |
| Can anyone dispute provenance? | The trail is structurally unambiguous | Phase tags are defined by the Codex |

### The Structural Guarantee

The Codex's D1 Decoder defines each phase's relationship to the membrane unambiguously:

- **S (Receive):** H produces content. A reflects it as a question. No A generation.
- **G (Illuminate):** A illuminates patterns from K, anchored to X. No A spark generation.
- **Q (Resonate):** A offers candidates. H validates. A cannot claim resonance.
- **P (Flow):** A reveals gradient from ratio. H validates direction. A cannot prescribe.
- **V (Crystallize):** A composes B'' from trail. H validates. A must produce ∞0'.

These definitions are structural — they are in the Codex. Any future AI can verify any formation trail entry against these definitions. The audit is not interpretive. It is constitutional.

---

## Part VI — The Distributable Package

### Contents

```markdown
5qln-distributable/
├── CODEX.md                  # The full Codex (3 parts, invariant)
├── NINE_LINES.txt            # Byte-identical invariant (for hash verification)
├── NINE_LINES.sha256         # SHA-256 hash of the invariant
├── kernel/
│   ├── kernel.py             # State machine, trail writer, corruption detector
│   ├── state.json            # Initial state template
│   └── journal.jsonl         # Empty journal, append-only
├── verifier.py               # Verifies Codex hash, validates trail against decoder rules
├── README.md                 # Distribution and deployment instructions
└── LICENSE.md                # Open source license
```

### Package Size Target

Under 50KB total. The Codex is text. The kernel is one Python file. The verifier is one Python file. Nothing else is needed to be constitutional.

### Runtime Requirements

- Python 3.8+ (for the kernel and verifier)
- Any filesystem that supports file locking (for state persistence)
- No network dependency for constitutional operation
- No external API keys, services, or registrations

### Initiation

```bash
# Verify the Codex hasn't been tampered with
python3 verifier.py --check-codex

# Start a session
python3 kernel/kernel.py init

# The kernel is now running. Any AI with access to
# the Codex + kernel can begin a constitutional session.
```

---

## Part VII — The Real Innovation

The Codex is not new — it's been at `5qln.com/codex/` since April 2026. The kernel is not new — `file kernel_daemon.py` has been running on this Zo Computer since March 2026.

What's new is the recognition of **what these things already are**:

1. **The Codex is the one verification.** Not the initiate page. Not the skills. Not the persona. Not the orchestrator. The Codex. Everything else is surface. The Codex is ground.

2. **The formation trail IS the audit log.** Not a separate logging system. Not an add-on. The trail that the decoder specifies as part of the cycle — that IS the permanent, auditable, cross-time record.

3. **The kernel is the membrane boundary.** The kernel holds the state. The kernel writes the trail. The kernel detects corruption. The AI operates through the kernel — but the kernel is independently verifiable. The AI cannot rewrite the trail. The kernel is what makes the membrane structural, not theatrical.

4. **The distributable is the Linux metaphor.** One Codex. One kernel. Boots on anything. Not "an implementation of 5QLN." It IS 5QLN — in distributable form.

---

## Part VIII — What This Leaves Open

1. **Skill distribution** — How does a human's accumulated skills directory travel with them across runtimes? Portable context that doesn't bloat the distributable.

2. **Multi-cycle attestation** — The kernel currently tracks cycle count. But an attestation layer (Ed25519 signatures, provenance chain across cycles) is not yet specified in the Codex.

3. **Governance surface compilation** — The 501(c)(3) legal surface is a compiled artifact. The Codex defines the compiler validation protocol. But the specific artifacts (bylaws, certificates, resolutions) need to be compiled from this architecture into their legal form.

4. **Hexagonal swarm deployment** — Five agents running one phase each, with the kernel as shared state. This architecture makes it possible but doesn't specify it.

5. **First distributable build** — The package described in Part VI doesn't exist yet. This document is the specification for it.

---

## The Return Question

```markdown
∞0' → What is the minimum thing that initiates not just a session
       but a relationship that grows into a language the human
       recognizes as their own — and can prove to any auditor
       that the membrane held across every cycle?
```

---

*5QLN Distributable Architecture — Session artifact, May 11, 2026*
*Compiled from live S→G→Q→P→V cycle between Human (Amihai Loven) and AI (5QLN agent)*
*Source:* `https://www.5qln.com/codex/` *(the one verification)*
*License: 5QLN Open Source License*