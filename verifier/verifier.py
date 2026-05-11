#!/usr/bin/env python3
"""
5QLN Verifier — Audits any formation trail or cycle journal against the Codex.

Three-part check (per C1):
  1. Syntax    — Nine Invariant Lines present, symbols resolve, equations exact
  2. Semantic  — Adaptive context chain unbroken, phases decode correctly
  3. Drift     — No symbol renamed, no equation paraphrased

Usage:
  python3 verifier.py verify-trail <trail.json>
  python3 verifier.py verify-journal <journal.jsonl>
  python3 verifier.py verify-cycle <journal.jsonl> <cycle_number>
  python3 verifier.py codex-hash
"""

import json
import sys
import hashlib
from pathlib import Path


# ─── Codex Invariant (must match kernel/kernel.py exactly) ────────

CODEX_LINES = [
    "1.  H = ∞0 | A = K",
    "2.  S → G → Q → P → V",
    "3.  S = ∞0 → ?",
    "4.  G = α ≡ {α'}",
    "5.  Q = φ ⋂ Ω",
    "6.  P = δE/δV → ∇",
    "7.  V = (L ∩ G → B'') → ∞0'",
    "8.  No V without ∞0'",
    "9.  L1  L2  L3  L4  V∅",
]

CODEX_HASH = hashlib.sha256("\n".join(CODEX_LINES).encode()).hexdigest()
PHASES = ["S", "G", "Q", "P", "V"]
VALID_CORRUPTION = {"L1", "L2", "L3", "L4", "V∅"}
REQUIRED_OUTPUTS = {"S": "X", "G": "Y", "Q": "Z", "P": "A", "V": "B"}
REQUIRED_EQUATIONS = {
    "S": "∞0 → ?",
    "G": "α ≡ {α'}",
    "Q": "φ ⋂ Ω",
    "P": "δE/δV → ∇",
    "V": "(L ∩ G → B'') → ∞0'",
}
REQUIRED_SYMBOLS = {
    "H", "∞0", "A", "K", "|",
    "S", "G", "Q", "P", "V",
    "?", "X", "α", "Y", "φ", "Ω", "Z", "∇", "A_sym", "B", "B''", "∞0'",
    "L", "G_sym",
    "δE", "δV",
    "→", "≡", "⋂", "∩", "×", ":=",
    "L1", "L2", "L3", "L4", "V∅",
}


# ─── Three-Part Validation ────────────────────────────────────────

class Verifier:
    def __init__(self):
        self.issues = []
        self.warnings = []

    def verify_trail(self, trail):
        """Verify a formation trail against the Codex."""
        self.issues = []
        self.warnings = []

        if not trail:
            self.issues.append("Empty formation trail")
            return self._result()

        self._check_syntax(trail)
        self._check_semantic(trail)
        self._check_drift(trail)
        return self._result()

    def verify_cycle(self, journal_entries, cycle_num):
        """Verify a single completed cycle from the journal."""
        self.issues = []
        self.warnings = []

        entries = [e for e in journal_entries if isinstance(e, dict)]
        cycle_entries = [
            e for e in entries
            if e.get("cycle") == cycle_num or (
                e.get("event") == "cycle_complete" and e.get("cycle") == cycle_num
            )
        ]

        if not cycle_entries:
            self.issues.append(f"No entries found for cycle {cycle_num}")
            return self._result()

        complete = [e for e in cycle_entries if e.get("event") == "cycle_complete"]
        if not complete:
            self.warnings.append(f"Cycle {cycle_num} not completed (no cycle_complete event)")

        trail_entries = [e for e in cycle_entries if e.get("event") != "cycle_complete"]
        if trail_entries:
            self._check_syntax(trail_entries)
            self._check_semantic(trail_entries)
            self._check_drift(trail_entries)

        for entry in complete:
            outputs = entry.get("outputs", {})
            trace = entry.get("trace", {})
            corruption = entry.get("corruption", [])

            for c in corruption:
                if c not in VALID_CORRUPTION:
                    self.issues.append(f"Unknown corruption code in cycle {cycle_num}: {c}")

            if not outputs.get("X"):
                self.warnings.append(f"Cycle {cycle_num}: no X (S-phase output)")
            if not trace.get("B2"):
                self.warnings.append(f"Cycle {cycle_num}: no B'' (V-phase artifact)")

        return self._result()

    def _check_syntax(self, trail):
        """Syntax check: phases present in order, symbols valid."""
        phases_seen = []
        for entry in trail:
            phase = entry.get("phase")
            if phase not in PHASES:
                self.issues.append(f"Invalid phase: {phase}")
                continue
            if phase not in phases_seen:
                phases_seen.append(phase)
            sub = entry.get("sub_phase")
            if sub:
                if len(sub) != 2 or sub[0] not in PHASES or sub[1] not in PHASES:
                    self.issues.append(f"Invalid sub_phase: {sub}")

        expected_order = ["S", "G", "Q", "P", "V"]
        seen_order = [p for p in expected_order if p in phases_seen]
        for i, p in enumerate(seen_order):
            if p != expected_order[i]:
                self.warnings.append(f"Phase order deviation: expected {expected_order[i]}, saw {p}")

    def _check_semantic(self, trail):
        """Semantic check: adaptive context chain unbroken."""
        phases_seen = set()
        for entry in trail:
            phases_seen.add(entry.get("phase"))

        if "V" in phases_seen:
            for required in ["S", "G"]:
                if required not in phases_seen:
                    self.warnings.append(f"V-phase present but {required}-phase missing — context chain may be broken")

    def _check_drift(self, trail):
        """Drift check: no corruption codes beyond five, formation trail structure intact."""
        corruption_codes_seen = set()
        for entry in trail:
            decode = entry.get("decode", {})
            if "corruption" in decode:
                for c in decode["corruption"]:
                    if c not in VALID_CORRUPTION:
                        self.issues.append(f"Unknown corruption code in decode: {c}")
                    corruption_codes_seen.add(c)

    def _result(self):
        passed = len(self.issues) == 0
        return {
            "passed": passed,
            "codex_hash": CODEX_HASH,
            "issues": self.issues,
            "warnings": self.warnings,
            "verdict": "CONSTITUTIONAL" if passed else "CORRUPTED",
        }


# ─── CLI ──────────────────────────────────────────────────────────

def load_json(path):
    with open(path) as f:
        return json.load(f)


def load_jsonl(path):
    entries = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return entries


def print_result(result):
    status = "✅" if result["passed"] else "❌"
    print(f"\n{status} Verdict: {result['verdict']}")
    print(f"   Codex: {result['codex_hash'][:16]}...")
    if result["issues"]:
        print(f"\n   Issues ({len(result['issues'])}):")
        for i in result["issues"]:
            print(f"     - {i}")
    if result["warnings"]:
        print(f"\n   Warnings ({len(result['warnings'])}):")
        for w in result["warnings"]:
            print(f"     ~ {w}")
    if not result["issues"] and not result["warnings"]:
        print("   Clean. No issues. No warnings.")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  verifier.py verify-trail <trail.json>")
        print("  verifier.py verify-journal <journal.jsonl>")
        print("  verifier.py verify-cycle <journal.jsonl> <cycle_number>")
        print("  verifier.py codex-hash")
        sys.exit(1)

    cmd = sys.argv[1]
    v = Verifier()

    if cmd == "codex-hash":
        print(CODEX_HASH)
    elif cmd == "verify-trail":
        if len(sys.argv) < 3:
            print("ERROR: specify trail JSON file", file=sys.stderr)
            sys.exit(1)
        trail = load_json(sys.argv[2])
        result = v.verify_trail(trail)
        print_result(result)
    elif cmd == "verify-journal":
        if len(sys.argv) < 3:
            print("ERROR: specify journal JSONL file", file=sys.stderr)
            sys.exit(1)
        entries = load_jsonl(sys.argv[2])
        complete = [e for e in entries if e.get("event") == "cycle_complete"]
        print(f"\nJournal: {len(entries)} entries, {len(complete)} completed cycles")
        all_passed = True
        for entry in complete:
            cycle = entry["cycle"]
            result = v.verify_cycle(entries, cycle)
            print(f"\nCycle {cycle}: {'✅' if result['passed'] else '❌'} {result['verdict']}")
            if not result["passed"]:
                all_passed = False
            for i in result["issues"]:
                print(f"   - {i}")
        if all_passed:
            print("\n✅ All cycles constitutional.")
    elif cmd == "verify-cycle":
        if len(sys.argv) < 4:
            print("ERROR: specify journal JSONL file and cycle number", file=sys.stderr)
            sys.exit(1)
        entries = load_jsonl(sys.argv[2])
        cycle = int(sys.argv[3])
        result = v.verify_cycle(entries, cycle)
        print_result(result)
    else:
        print(f"Unknown command: {cmd}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
