#!/usr/bin/env python3
"""
5QLN Domain Router — Session Orchestrator

Determines which domain (commercialize, research, selfimprove, skillgen)
the current session belongs to, reading context from the kernel state,
journal entries, and previous season data.

Usage:
  python3 domain_route.py                    # Print domain name to stdout
  python3 domain_route.py --json             # Full routing decision as JSON
  python3 domain_route.py --prompt "text"    # Route based on explicit context

Constitutional:
  This skill is the router — it does NOT run phases itself.
  It determines the domain so the orchestrator can activate the correct
  phase skill files.

Returns: one of "commercialize", "research", "selfimprove", "skillgen"
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# ─── Paths ────────────────────────────────────────────────────────
STATE_DIR = Path.home() / ".5qln"
STATE_FILE = STATE_DIR / "state.json"
JOURNAL_FILE = STATE_DIR / "journal.jsonl"
SEASONS_FILE = STATE_DIR / "seasons.json"

# ─── Domain Signal Tables ─────────────────────────────────────────

DOMAIN_SIGNALS = {
    "commercialize": [
        "commercial", "market", "pricing", "license", "revenue",
        "GTM", "users", "business", "sell", "customer", "product",
        "launch", "funding", "investor", "monetize", "partnership",
        "distribution", "enterprise", "subscription", "freemium",
        "sales", "marketing", "brand", "offering", "value prop",
        "pricing model", "revenue model", "go to market",
    ],
    "research": [
        "research", "philosophy", "framework", "history", "academic",
        "validate", "understand", "theory", "concept", "paper",
        "study", "analysis", "explore", "investigate", "question",
        "meaning", "nature of", "what is", "how does", "why",
        "epistemology", "ontology", "consciousness", "cognition",
        "architecture", "design principle", "first principle",
    ],
    "selfimprove": [
        "personal", "creative", "practice", "growth", "develop",
        "block", "craft", "writing", "art", "flow", "process",
        "habit", "discipline", "skill", "learn", "teach myself",
        "my", "I want to", "help me", "improve", "better at",
        "stuck", "breakthrough", "studio", "journal", "reflect",
    ],
    "skillgen": [
        "build", "create", "skill", "new domain", "extend",
        "generate", "design", "implement", "code", "script",
        "tool", "automation", "deploy", "setup", "configure",
        "install", "develop", "prototype", "scaffold",
        "make a", "let's build", "let's create", "can you create",
    ],
}

# ─── Scoring ──────────────────────────────────────────────────────

def score_domain(text: str, signals: list[str]) -> float:
    """Score how well text matches a domain's signal words."""
    text_lower = text.lower()
    hits = 0
    total_weight = len(signals)

    for signal in signals:
        if signal.lower() in text_lower:
            # Multi-word signals get higher weight
            weight = 1.5 if " " in signal else 1.0
            hits += weight

    return hits / total_weight if total_weight > 0 else 0.0


def detect_domain(context: str) -> tuple[str, dict]:
    """Detect the domain from a context string.

    Returns: (domain_name, scores_dict)
    """
    scores = {}
    for domain, signals in DOMAIN_SIGNALS.items():
        scores[domain] = score_domain(context, signals)

    # Find the domain with the highest score
    best = max(scores, key=scores.get)
    best_score = scores[best]

    # If no clear signal, default to research
    if best_score < 0.02:
        return "research", scores

    # Check if there's a close second
    sorted_domains = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    if len(sorted_domains) >= 2:
        second_score = sorted_domains[1][1]
        if second_score > 0 and second_score >= best_score * 0.7:
            # Tie or near-tie — ambiguous
            return "research", scores  # Default to research on ambiguity

    return best, scores


# ─── Context Collection ───────────────────────────────────────────

def collect_session_context() -> str:
    """Collect context from the kernel state, journal, and previous season."""
    parts = []

    # Current kernel state
    if STATE_FILE.exists():
        try:
            state = json.loads(open(STATE_FILE).read())
            phase = state.get("phase", "")
            cycle = state.get("cycle_count", 0)
            outputs = state.get("outputs", {})
            trace = state.get("cycle_trace", {})

            parts.append(f"Phase: {phase}")
            parts.append(f"Cycle: {cycle}")

            # Recent outputs
            for sym in ["X", "alpha", "Y", "phi", "Z", "nabla", "A", "B"]:
                val = trace.get(sym) or outputs.get(sym)
                if val:
                    parts.append(f"{sym}: {val[:200]}")

            # Recent input history (last 3)
            history = state.get("input_history", [])
            for entry in history[-3:]:
                content = entry.get("content", "") or entry.get("raw", "")
                if content:
                    parts.append(f"Input: {content[:300]}")

        except (json.JSONDecodeError, IOError):
            pass

    # Journal (last 5 entries)
    if JOURNAL_FILE.exists():
        try:
            with open(JOURNAL_FILE) as f:
                lines = f.readlines()
            for line in lines[-5:]:
                try:
                    entry = json.loads(line.strip())
                    event = entry.get("event", "")
                    content = entry.get("content", "")
                    if content:
                        parts.append(f"Journal({event}): {content[:200]}")
                except json.JSONDecodeError:
                    continue
        except IOError:
            pass

    # Previous season
    if SEASONS_FILE.exists():
        try:
            seasons = json.loads(open(SEASONS_FILE).read())
            active = [s for s in seasons if s.get("status") == "active"]
            if active:
                last = active[-1]
                alpha = last.get("summary", {}).get("thematic_alpha", "")
                name = last.get("name", "")
                parts.append(f"Previous season: {name}")
                if alpha:
                    parts.append(f"Season alpha: {alpha}")
        except (json.JSONDecodeError, IOError):
            pass

    return "\n".join(parts)


# ─── Main ─────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "--prompt" in args:
        try:
            idx = args.index("--prompt")
            context = args[idx + 1]
            domain, scores = detect_domain(context)
        except (ValueError, IndexError):
            print(json.dumps({"error": "Usage: domain_route.py --prompt 'text'"}, indent=2))
            return
    else:
        context = collect_session_context()
        if not context.strip():
            # No state yet — default to research for a fresh session
            domain, scores = "research", {"research": 0.0}
        else:
            domain, scores = detect_domain(context)

    if "--json" in args:
        output = {
            "domain": domain,
            "scores": {k: round(v, 4) for k, v in sorted(scores.items(), key=lambda x: x[1], reverse=True)},
            "confidence": round(max(scores.values()), 4),
            "context_length": len(context),
            "context_preview": context[:500],
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        print(domain)


if __name__ == "__main__":
    main()
