# 5QLN Skills — Pi

Operational instructions for an AI running inside a Pi coding-agent session with the 5QLN extension loaded (`createPiExtension` from `@5qln/core`).

These are not code. They are markdown lenses any AI host can read to know **how to behave** when the constitutional runtime is active.

## The set

| Skill | When to load | What it teaches |
|-------|--------------|-----------------|
| [`5qln-pi-orchestrate`](./5qln-pi-orchestrate/SKILL.md) | session start | tool/command surface, install, routing rules, sister skills |
| [`5qln-pi-cycle`](./5qln-pi-cycle/SKILL.md) | every phase | DO / DON'T / TEST per S, G, Q, P, V — using Pi commands |
| [`5qln-pi-membrane`](./5qln-pi-membrane/SKILL.md) | always | the self-audit loop via `audit_membrane` after every response |
| [`5qln-pi-recovery`](./5qln-pi-recovery/SKILL.md) | when membrane fires | one recovery procedure per code (L¹/L²/L³/L⁴/V∅) |
| [`5qln-pi-lens`](./5qln-pi-lens/SKILL.md) | sub-phase exploration | the 25 lens questions and when to open / close them |

## Install path

The Pi extension itself: see [`examples/pi/extension.ts`](../examples/pi/extension.ts).

The skills can live anywhere your Pi host reads markdown skills from. A common layout:

```
.pi/
  extensions/
    5qln.ts             # imports createPiExtension
  skills/
    5qln-pi-orchestrate/SKILL.md
    5qln-pi-cycle/SKILL.md
    5qln-pi-membrane/SKILL.md
    5qln-pi-recovery/SKILL.md
    5qln-pi-lens/SKILL.md
```

Or copy this `skills/` directory directly:

```bash
cp -r skills/ ~/.pi/skills/
```

## Reading order

1. `5qln-pi-orchestrate` — what is on the menu and how to route.
2. `5qln-pi-membrane` — the one rule that overrides everything.
3. `5qln-pi-cycle` — phase-by-phase moves.
4. `5qln-pi-recovery` — what to do when the membrane fires.
5. `5qln-pi-lens` — when one phase needs a deeper pass.

---

*5QLN © 2026 Amihai Loven*
