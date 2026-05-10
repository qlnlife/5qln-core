# Skill: 5qln-pi-self-improve

**Domain:** Running the membrane against itself. Self-evolution as the lawful cell scaled to the membrane.
**Use when:** the user asks you to verify the membrane, when a long session is starting or ending, or when something feels off in `audit_membrane` results.

---

## THE LAW APPLIED TO ITSELF

The five phases are not just for human/AI sessions. They scale to the system that governs the session.

```
S — receive ?  →  is the membrane drifting?
G — name α     →  what corruption shape is no longer being caught?
Q — φ ∩ Ω      →  do these results feel like real regressions?
P — δE/δV → ∇  →  where does a new pattern want to live?
V — B'' → ∞0'  →  add the pattern; what subtler corruption emerges next?
```

Each self-improve cycle is one lawful cell run on the membrane.

---

## TOOL

```
self_improve()  → runs one cycle
```

Returns markdown (rendered for you to read) and `details`:

```ts
{
  cycle: 3,
  hash: "<64 hex>",
  parent_hash: "<64 hex of previous cycle>",
  health: 0.95,                 // passed / total, 0..1
  passed: 19,
  failed: 1,
  degraded: ["L3-feel"],        // false negatives — sample IDs
  spurious: [],                 // false positives — sample IDs
}
```

A `5qln:self-improve` entry is automatically appended to the Pi session via `pi.appendEntry`. Each cycle's hash chains to its parent — the lineage is provable.

## COMMAND

```
/5qln-self-improve
```

Same as the tool, but human-invoked. Notifies info when green, warning when failed > 0.

---

## WHEN TO RUN

- **At session start** if the user is doing long-form constitutional work, run once to establish a baseline snapshot.
- **At session mid-point** if `audit_membrane` produces results that don't match your intuition — the membrane may have drifted.
- **At session end** if any new patterns or exclusions were added during the session — verify nothing regressed.
- **At human request.** "Run self-improve" or "verify the membrane."

Do not run on every turn. Once per session is typical; per phase is excessive.

---

## READING A SNAPSHOT

The markdown response has up to four sections:

1. **Header** — cycle number, timestamp, sample count, passed/failed, health %, fingerprints, hash, parent hash.
2. **Degraded** — false negatives. Texts that should have flagged corruption but didn't. **The membrane needs a new or refined pattern here.**
3. **Spurious** — false positives. Clean texts that flagged. **The membrane needs a new exclusion or a softer pattern.**
4. **Diff vs parent** — health Δ, fixed (failed → passed), broken (passed → failed), stable count. Regressions are listed first, gains second.

If health Δ is negative, you have a regression in this cycle. Surface it to the user immediately. Do not silently continue.

---

## THE AI'S MOVE — proposing a pattern

When `degraded.length > 0`, the AI's lawful move is to propose a new pattern. Do this through a 5QLN cycle, not unilaterally:

- **S:** receive the degraded sample. Quote it back. What is it actually saying?
- **G:** name the shape. What's the irreducible α? Is this L³ or L⁴? Is the existing pattern almost matching?
- **Q:** is this resonance, or am I performing a fix? Run `audit_membrane` on the proposed pattern phrasing — does it hold under tightening?
- **P:** name the gradient. The existing membrane code is at `src/membrane-watcher.ts`. Where does the new regex want to live (which `Lx_PATTERNS` array)?
- **V:** propose the pattern as a code change for human review. Crystallize as a diff. Return question: "what subtler corruption now slips through?"

Do not edit `src/membrane-watcher.ts` without human sign-off. The membrane is constitutional. New patterns are added by the human after review.

---

## THE AI'S MOVE — proposing an exclusion

When `spurious.length > 0`, the AI's move is to propose an exclusion. Same 5QLN cycle. The exclusion patterns live alongside the detection patterns in `src/membrane-watcher.ts`. Most spurious flags are caught by adding a phrase to `EXCLUSION_PATTERNS`.

---

## INVARIANT

The corpus itself is part of the constitutional truth. **Do not silently change `DEFAULT_SAMPLES`** to make a snapshot pass. That is L¹ on the membrane — closing the wound by erasing it.

If a sample needs revision, surface it to the human and let them decide whether the sample drifted from constitutional intent or whether the membrane needs to evolve.

---

## RESIDUE

Each snapshot persists via `pi.appendEntry('5qln:self-improve', ...)`. Across sessions, the chain of hashes is the membrane's own formation trail. The next cycle reads the prior snapshot and chains forward. The system evolves through its own constitutional cycle.

---

*Skill loads from: `skills/5qln-pi-self-improve/SKILL.md`. 5QLN © 2026 Amihai Loven.*
