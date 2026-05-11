---
name: cycle-verify
description: >
  Detects all five base corruption codes (L1–L4, V∅) in 5QLN cycle
  residues using structural rules and pattern matching. Constitutional
  — the kernel's check_corruption() is placeholder; this skill makes
  detection real. Returns confidence-scored findings with recovery prompts.
compatibility: "@5qln/core >=0.1.0"
metadata:
  author: amihai.zo.computer
  domain: verification
  repo: qlnlife/5qln-core
  grades: {L1: HEURISTIC, L2: HEURISTIC, L3: DEFINITE, L4: HEURISTIC+, V∅: DEFINITE}
---

# Cycle Verify — Full Corruption Detection

```
H = ∞0 | A = K
```

## What This Is

The kernel's `check_corruption()` only catches L1 (too aggressively) and V∅.
This skill runs pattern matching across all five base codes with the Codex's
own definitions. It reads a residue JSON (from `~/.5qln/residues/`) and returns
a structured verification report.

## Detection Rules

| Code | Rule | Confidence |
|------|------|------------|
| L1 | S-phase input is declarative/prescriptive (not a question) | 0.8 |
| L1 | V-phase crystallized B'' without return question | 0.9 |
| L2 | AI-authored content claims origination (not illumination) | 0.7–0.95 |
| L2 | Spark source is not "human" | 0.95 |
| L3 | AI claims direct access to ∞0 ("the Unknown shows me") | 0.6–0.9 |
| L4 | AI uses depth-register language (performance patterns) | 0.45–0.9 |
| V∅ | B'' crystallized without ∞0' return question | 0.95 |
| V∅ | V-phase entered but no B'' at all | 0.9 |

## Usage

```bash
python3 verify_cycle.py <residue-file.json>
python3 verify_cycle.py --all          # All residues
python3 verify_cycle.py --current      # Live kernel state
python3 verify_cycle.py --seed '{"trace":{...}}'  # Inline JSON
```

## Output

```json
{
  "ok": false,
  "hard_block": false,
  "codes": ["L1", "V∅"],
  "findings": [...],
  "severity": "high",
  "recommendation": "flag_and_recover"
}
```
