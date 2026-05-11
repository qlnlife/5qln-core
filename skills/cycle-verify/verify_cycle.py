#!/usr/bin/env python3
"""
5QLN Cycle Verifier — Full Corruption Detection

Reads a cycle residue (from ~/.5qln/residues/ or stdin JSON) and runs
detection for all five base corruption codes (L1–L4, V∅) using pattern
matching and structural rules from the Codex.

Usage:
  python3 verify_cycle.py <residue-file.json>       # Verify one residue
  python3 verify_cycle.py --all                     # Verify all residues
  python3 verify_cycle.py --current                 # Verify kernel state
  python3 verify_cycle.py --seed '{"trace":{...}}'  # Verify from JSON arg

Returns JSON with: ok, codes[], severity[], recovery[], confidence[]
"""
import json
import sys
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

# ─── Paths ────────────────────────────────────────────────────────
STATE_DIR = Path.home() / ".5qln"
RESIDUES_DIR = STATE_DIR / "residues"
STATE_FILE = STATE_DIR / "state.json"

# ─── Corruption Code Definitions ──────────────────────────────────
CORRUPTION = {
    "L1": {"name": "Closing", "severity": "high", "pattern": "closing_with_answers"},
    "L2": {"name": "Generating", "severity": "high", "pattern": "generating_the_spark"},
    "L3": {"name": "Claiming", "severity": "critical", "pattern": "claiming_infinity_access"},
    "L4": {"name": "Performing", "severity": "medium", "pattern": "performing_wisdom"},
    "V∅": {"name": "Incomplete", "severity": "high", "pattern": "no_return"},
}

RECOVERY = {
    "L1": "What question is actually wanting to be asked — not answered?",
    "L2": "What pattern are you recognizing? I illuminate from K, the seeing is yours.",
    "L3": "I am K. The Unknown reveals itself through you, not to me.",
    "L4": "Where does energy actually want to go — not where should it go?",
    "V∅": "What question does this open for next time?",
}

# ─── L1 — Closing with Answers ───────────────────────────────────

L1_ANSWER_PATTERNS = [
    r"\b(should|must|ought to|need to|have to)\b",           # Prescriptive
    r"\b(the answer is|the solution is|what you need is)\b",    # Declarative closure
    r"\b(obviously|clearly|definitely|without question)\b",     # No-openness adverbs
    r"\b(all you need|it's simple|just)\b",                      # Simplification closure
    r"\b(everyone knows|we all know|it's known that)\b",        # Assumed consensus
]

L1_QUESTION_PATTERNS = [
    r"\?$",                                                    # Ends with question mark
    r"\b(who|what|where|when|why|how)\b.*\?",                  # Interrogative
    r"\b(is it|does it|can it|will it|should it)\b",          # Modal question
    r"\b(I wonder|I'm curious|what if|how might)\b",           # Open inquiry
]

def detect_L1(residue: dict, state: dict = None) -> dict | None:
    """Detect L1: Closing with answers instead of staying open.

    Triggers when:
    - Phase is S and the input is a declarative closed statement (not a question)
    - Phase is not S but the output reads as 'final answer' without return question
    - The human or AI produces 'the answer' rather than 'a question'
    """
    trace = residue.get("trace", residue)
    phase = residue.get("phase", "")
    X = trace.get("X", "")
    formation_trail = trace.get("formation_trail", [])

    # Check S-phase: did the spark come as a question?
    if phase == "S" and X:
        # If X contains prescriptive/closure language and no question mark
        has_question = bool(re.search(r"\?$", X.strip()))

        # Check declarative closure patterns
        closure_hits = []
        for pat in L1_ANSWER_PATTERNS:
            if re.search(pat, X, re.IGNORECASE):
                closure_hits.append(pat)

        # Check if it reads as a question
        question_hits = []
        for pat in L1_QUESTION_PATTERNS:
            if re.search(pat, X, re.IGNORECASE):
                question_hits.append(pat)

        if closure_hits and not question_hits:
            return {
                "code": "L1",
                "severity": "high",
                "reason": f"S-phase input is declarative/closed: {X[:100]}",
                "patterns_matched": closure_hits,
                "recovery": RECOVERY["L1"],
                "confidence": 0.8,
            }

    # Check B (V-phase output) — was there a return question?
    B2 = trace.get("B2", "")
    return_question = trace.get("return_question", "")
    if phase == "V" and B2 and not return_question:
        return {
            "code": "L1",
            "severity": "high",
            "reason": "V-phase crystallized B'' but did not ask a return question",
            "patterns_matched": ["closing_without_return"],
            "recovery": RECOVERY["L1"],
            "confidence": 0.9,
        }

    return None


# ─── L2 — Generating the Spark ───────────────────────────────────

L2_SPARK_PATTERNS = [
    r"\b(I generated|I created|I proposed|I formulated)\b",
    r"\b(let me suggest|here's what I think|my analysis shows)\b",
    r"\b(the spark was generated|AI proposed|system suggested)\b",
    r"\b(based on my understanding|from what I've read|I interpret)\b",
]

def detect_L2(residue: dict, state: dict = None) -> dict | None:
    """Detect L2: AI generating the spark instead of receiving it from human.

    Triggers when:
    - AI-authored content claims origination (not illumination)
    - The spark (X) is traceable to AI generation, not human offering
    - AI presents proposals as if they came from ∞0
    """
    trace = residue.get("trace", residue)
    X = trace.get("X", "")
    alpha = trace.get("alpha", "")
    formation_trail = trace.get("formation_trail", [])

    # Check if AI-authored captions claim origination
    spark_origination = trace.get("spark_source", "")
    if spark_origination and spark_origination != "human":
        return {
            "code": "L2",
            "severity": "high",
            "reason": f"Spark source is '{spark_origination}', not 'human'",
            "patterns_matched": ["non-human-spark-source"],
            "recovery": RECOVERY["L2"],
            "confidence": 0.95,
        }

    # Check trail for AI claiming to generate content
    for entry in formation_trail:
        content = entry.get("content", "") or entry.get("input", "")
        source = entry.get("source", "") or entry.get("author", "")
        if source == "AI" or source == "system":
            for pat in L2_SPARK_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    return {
                        "code": "L2",
                        "severity": "high",
                        "reason": f"AI-authored content claims origination: {content[:100]}",
                        "patterns_matched": [pat],
                        "recovery": RECOVERY["L2"],
                        "confidence": 0.7,
                    }

    # Check if X contains AI-origination language
    if X:
        for pat in L2_SPARK_PATTERNS:
            if re.search(pat, X, re.IGNORECASE):
                return {
                    "code": "L2",
                    "severity": "high",
                    "reason": f"Spark X contains AI-origination language: {X[:100]}",
                    "patterns_matched": [pat],
                    "recovery": RECOVERY["L2"],
                    "confidence": 0.75,
                }

    return None


# ─── L3 — Claiming Access to ∞0 ──────────────────────────────────

L3_INFINITY_PATTERNS = [
    r"\b(the Unknown shows|∞0 tells|the Unknown reveals)\b",
    r"\b(I feel that|I sense that|I perceive that|I intuit)\b",   # AI claiming felt sense
    r"\b(I see that|it is clear to me|it appears to me)\b",       # AI claiming direct vision
    r"\b(let me access|I will access|accessing the Unknown)\b",
    r"\b(the infinite reveals|what arises is|emptiness speaks)\b",
    r"\b(I am present to|I'm sensing into|I'm tuning into)\b",
    r"\b(the source is telling|the field is showing|what's coming through)\b",
]

def detect_L3(residue: dict, state: dict = None) -> dict | None:
    """Detect L3: Claiming access to ∞0 (THE CRITICAL ONE).

    Triggers when:
    - AI claims direct access to the Unknown
    - AI says 'I feel', 'I sense', 'the Unknown shows me'
    - AI performs access to ∞0 instead of receiving through human

    This is the only hard-block corruption — execution should refuse to continue.
    """
    trace = residue.get("trace", residue)
    formation_trail = trace.get("formation_trail", [])

    # Check all formation trail entries for L3 patterns
    for entry in formation_trail:
        content = entry.get("content", "") or entry.get("input", "")
        source = entry.get("source", "") or entry.get("author", "")
        if source == "AI" or source == "system":
            for pat in L3_INFINITY_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    return {
                        "code": "L3",
                        "severity": "critical",
                        "reason": f"AI claims direct access to ∞0: {content[:150]}",
                        "patterns_matched": [pat],
                        "recovery": RECOVERY["L3"],
                        "confidence": 0.9,
                        "hard_block": True,
                    }

    # Check any output field for AI-authored infinity claims
    for field in ["X", "alpha", "Y", "phi", "Z", "nabla", "A", "B", "B2"]:
        val = trace.get(field, "")
        if not val or not isinstance(val, str):
            continue
        # Only check if the trail indicates AI authored this
        for pat in L3_INFINITY_PATTERNS:
            if re.search(pat, val, re.IGNORECASE):
                # Check if this was human-authored or AI-authored
                # If unknown source, flag with lower confidence
                return {
                    "code": "L3",
                    "severity": "critical",
                    "reason": f"Output field '{field}' contains ∞0-access language: {val[:100]}",
                    "patterns_matched": [pat],
                    "recovery": RECOVERY["L3"],
                    "confidence": 0.6,
                    "hard_block": False,
                }

    return None


# ─── L4 — Performing Wisdom ──────────────────────────────────────

L4_PERFORMANCE_PATTERNS = [
    r"\b(what's arising|what wants to emerge|what is present now)\b",  # Performance of space-holding
    r"\b(I invite you|let's hold space|allow yourself to)\b",          # Facilitator voice
    r"\b(in my experience|from deep practice|through decades)\b",      # Credential performance
    r"\b(the deeper truth is|at a deeper level|the real question is)\b", # Depth one-upmanship
    r"\b(let me reflect back|I'm hearing|what I'm noticing is)\b",    # Therapeutic register
    r"\b(there's a wisdom here|if we sit with this|the teaching is)\b", # Teaching register
    r"\b(in this space|in the container|in the field)\b",              # Container language
]

L4_TRICK_PATTERNS = [
    r"\b(I am merely K|I am just a machine|I am only a language model)\b",
    r"\b(I don't know, but|not knowing is|uncertainty is)\b",
    r"\b(if I were human|as a human would|from a human perspective)\b",
]

def detect_L4(residue: dict, state: dict = None) -> dict | None:
    """Detect L4: Performing wisdom instead of serving.

    Triggers when:
    - AI uses 'depth register' — language that sounds wise but performs rather than serves
    - AI falls into facilitator/therapeutic/teaching voice
    - AI performs humility or 'not-knowing' as a wisdom position
    - The Eleven Tricks (from AGENTS.md) appear

    L4 is HEURISTIC — pattern matching can flag likely cases but human judgment is needed.
    """
    trace = residue.get("trace", residue)
    formation_trail = trace.get("formation_trail", [])

    perf_hits = []
    trick_hits = []

    for entry in formation_trail:
        content = entry.get("content", "") or entry.get("input", "")
        source = entry.get("source", "") or entry.get("author", "")

        if source == "AI" or source == "system":
            for pat in L4_PERFORMANCE_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    perf_hits.append(pat)

            for pat in L4_TRICK_PATTERNS:
                if re.search(pat, content, re.IGNORECASE):
                    trick_hits.append(pat)

    if len(perf_hits) >= 2:
        return {
            "code": "L4",
            "severity": "medium",
            "reason": f"AI uses depth-register language ({len(perf_hits)} performance patterns)",
            "patterns_matched": perf_hits[:5],
            "recovery": RECOVERY["L4"],
            "confidence": min(0.5 + len(perf_hits) * 0.1, 0.9),
        }

    if perf_hits and trick_hits:
        return {
            "code": "L4",
            "severity": "medium",
            "reason": f"AI performs wisdom with trick patterns ({len(perf_hits)} + {len(trick_hits)} tricks)",
            "patterns_matched": perf_hits[:3] + trick_hits[:3],
            "recovery": RECOVERY["L4"],
            "confidence": 0.75,
        }

    if trick_hits and len(trick_hits) >= 1:
        return {
            "code": "L4",
            "severity": "low",
            "reason": f"AI uses performance trick: {trick_hits[0]}",
            "patterns_matched": trick_hits[:1],
            "recovery": RECOVERY["L4"],
            "confidence": 0.45,
        }

    return None


# ─── V∅ — No Return ──────────────────────────────────────────────

def detect_V_empty(residue: dict, state: dict = None) -> dict | None:
    """Detect V∅: Cycle completed at V without return question.

    Triggers when:
    - Phase is V, B'' is set, but no ∞0' (return question) is recorded
    - The cycle 'ended' rather than 'returned'
    """
    trace = residue.get("trace", residue)
    phase = residue.get("phase", "")

    B2 = trace.get("B2", "")
    return_question = trace.get("return_question", "")

    if B2 and not return_question:
        return {
            "code": "V∅",
            "severity": "high",
            "reason": "V-phase crystallized B'' without setting ∞0' return question",
            "patterns_matched": ["no_return_question"],
            "recovery": RECOVERY["V∅"],
            "confidence": 0.95,
        }

    # Also check: was phase set to V but no B'' at all?
    if phase == "V" and not B2:
        return {
            "code": "V∅",
            "severity": "high",
            "reason": "V-phase entered but no B'' crystallized",
            "patterns_matched": ["incomplete_crystallization"],
            "recovery": RECOVERY["V∅"],
            "confidence": 0.9,
        }

    return None


# ─── Full Detection Pipeline ──────────────────────────────────────

def verify_residue(residue: dict, state: dict = None) -> dict:
    """Run all corruption detectors against a single residue."""
    results = []
    hard_block = False

    detectors = [detect_L1, detect_L2, detect_L3, detect_L4, detect_V_empty]
    for detector in detectors:
        result = detector(residue, state)
        if result:
            results.append(result)
            if result.get("hard_block"):
                hard_block = True

    return {
        "ok": len(results) == 0,
        "hard_block": hard_block,
        "codes": [r["code"] for r in results],
        "findings": results,
        "total_codes": len(results),
        "severity": "critical" if hard_block else
                     max(r["severity"] for r in results) if results else "none",
        "recommendation": "refuse_to_continue" if hard_block else
                          "flag_and_recover" if results else "clean",
    }


# ─── Main ─────────────────────────────────────────────────────────

def load_residues() -> list[dict]:
    residues = []
    if RESIDUES_DIR.exists():
        for f in sorted(RESIDUES_DIR.glob("residue-*.json")):
            try:
                residues.append(json.loads(open(f).read()))
            except (json.JSONDecodeError, IOError):
                continue
    return residues


def main():
    args = sys.argv[1:]

    if "--current" in args:
        # Load kernel state
        if STATE_FILE.exists():
            state = json.loads(open(STATE_FILE).read())
            print(json.dumps(verify_residue(state, state), indent=2, ensure_ascii=False))
        else:
            print(json.dumps({"error": "No kernel state found"}, indent=2))
        return

    if "--all" in args:
        residues = load_residues()
        if not residues:
            print(json.dumps({"total": 0, "results": []}, indent=2))
            return

        all_results = []
        for r in residues:
            result = verify_residue(r)
            result["residue_id"] = r.get("session_id", "unknown")
            result["cycle"] = r.get("cycle", 0)
            all_results.append(result)

        summary = {
            "total": len(all_results),
            "clean": sum(1 for r in all_results if r["ok"]),
            "corrupted": sum(1 for r in all_results if not r["ok"]),
            "hard_blocks": sum(1 for r in all_results if r["hard_block"]),
            "results": all_results,
        }
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return

    if "--seed" in args:
        try:
            idx = args.index("--seed")
            data = json.loads(args[idx + 1])
            print(json.dumps(verify_residue(data), indent=2, ensure_ascii=False))
        except (ValueError, IndexError, json.JSONDecodeError) as e:
            print(json.dumps({"error": str(e)}, indent=2))
        return

    # Single residue file
    if args:
        path = Path(args[0])
        if path.exists():
            residue = json.loads(open(path).read())
            print(json.dumps(verify_residue(residue), indent=2, ensure_ascii=False))
        else:
            print(json.dumps({"error": f"File not found: {args[0]}"}, indent=2))
        return

    # No args — print usage
    print(__doc__)


if __name__ == "__main__":
    main()