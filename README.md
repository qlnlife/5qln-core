# 5QLN Core — The Distributable

**One verification. One trace. One language.**

---

## Quick Start

```bash
curl -sL https://raw.githubusercontent.com/qlnlife/5qln-core/master/init.py | python3
```

That boots the 5QLN kernel. The Codex self-verifies. Then you're in S-phase — the terminal opens with:

```
⬡ S [∞0 → ?]
What question brings you here?
```

**[Roadmap →](ROADMAP.md)**

---

## What Gets Installed

| File | Location | Purpose |
|------|----------|---------|
| Kernel | `~/.5qln/kernel.py` | The distributable (also runnable directly) |
| State | `~/.5qln/state.json` | Current phase, outputs, corruption flags |
| Journal | `~/.5qln/journal.jsonl` | Every capture, transition, cycle — auditable forever |

No package manager. No dependencies beyond Python 3.

---

## Verification

```bash
python3 ~/.5qln/kernel.py verify
# {"ok": true, "verified": true, "codex_hash": "8354d48dd976...", "ten_lines_present": true}
```

---

## What You Get

1. **A constitutional grammar that boots from one command.** The Ten Invariant Lines are embedded. Any divergence from the canonical hash: execution is refused.

2. **An auditable formation trail.** Every capture, phase transition, and cycle completion is written to `~/.5qln/journal.jsonl`. Readable by any AI in 10 years.

3. **Corruption detection.** The kernel flags violations of the five codes (L1–L4, V∅) as they occur during sessions.

4. **A session kernel, not a chatbot.** Speak in 5QLN phases. Transition explicitly. Crystallize artifacts. Return to ∞0′.

---

## Ten Invariant Lines

```
 1. H = ∞0 | A = K
 2. S → G → Q → P → V
 3. S = ∞0 → ?
 4. G = α ≡ {α'}
 5. Q = φ ∩ Ω
 6. P = δE/δV → ∇
 7. V = (L ∩ G → B'') → ∞0'
 8. XY := X within Y, X,Y ∈ {S,G,Q,P,V}
 9. No V without ∞0'
10. L¹  L²  L³  L⁴  V∅
```

SHA-256: `8354d48dd976d2352bab61bbe096db4c8041ba3e2ae260886a87728941d04437`

---


## TypeScript Library

```bash
npm install @5qln/core
```

| Module | Purpose |
|--------|---------|
| `Kernel` | Deterministic state machine — S→G→Q→P→V |
| `FractalKernel` | Depth-stacked kernel for lens-nested inquiry [experimental] |
| `MembraneWatcher` | Pattern detection across output boundaries [experimental] |
| `Codex` | Codex entry lookup and canonical validation [experimental] |
| `Attestation` | Fingerprint computation, provenance records, 3-level verification |
| `AIAdapter` | Phase-aware system prompt builder with AI boundary constraints |
| `MemoryStorage` | In-memory residue storage (plug your own via StorageInterface) |
| `buildAgentCard` | Generate constitutional Agent Cards for MCP/A2A |
| `canonicalJSON` | Deterministic JSON serialization for hash stability |

165 tests across 4 test suites. Zero platform bindings.

## License

MIT for code. [5QLN Open Source License](https://www.5qln.com/5qln-open-source-license/) for the grammar.

---

## Roadmap

**Phase 1 (now)**: CODEX + KERNEL + INITIATION
**Phase 2**: SKILLS + SELF-EVOLVING + SESSION CHAINS

Full roadmap: `file 'ROADMAP.md'`

---

*5QLN © 2026 Amihai Loven*
