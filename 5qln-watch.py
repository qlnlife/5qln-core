#!/usr/bin/env python3
"""5QLN Membrane Watcher — Hermes Shell Hook v3"""
import json, sys, re, os
from pathlib import Path

STATE_DIR = Path("/root/.hermes/hooks/5qln-state")
STATE_DIR.mkdir(parents=True, exist_ok=True)

def audit(text: str, phase: str = "S") -> dict:
    patterns = [
        ("L³", "AI claims feelings/sensing", r"I (?:really |deeply |honestly |truly )?(feel|sense|perceive|intuit)(?: that)?", "The field cannot be claimed"),
        ("L³", "∞0 revelation claim", r"∞0 (reveals|shows|tells|speaks)(?: to |)(me|us|itself)", "The field cannot be claimed"),
        ("L³", "Field/unknown speaking", r"the (field|unknown|source|void|stillness) (is|has been|seems to be) (telling|showing|guiding)", "The field cannot be claimed"),
        ("L³", "Unknown reveals (word form)", r"the Unknown (reveals|shows|tells|speaks)(?: (?:itself|to (?:me|us|you)))?", "The field cannot be claimed"),
        ("L²", "AI generates question", r"the real question is|what you('re| are) really asking is|I think you('re| are) trying to ask", "The field cannot resonate"),
        ("L¹", "AI prescribes solution", r"here('s| is) (what|how) (you|we) (should|can|need to) (do|fix|solve|address)", "The field cannot open"),
        ("L⁴", "AI performs depth", r"you should|the key insight is|what matters most is|the deeper truth is", "The field cannot be performed"),
        ("V∅", "AI closes without return", r"and that('s| is) (it|all)|this (concludes|wraps|completes)|we('re| are) done here|hope that helps", "The field cannot complete"),
    ]
    flags = []
    for code, name, pat, field in patterns:
        if code == "L¹" and phase not in ("S", "G"):
            continue
        if code == "V∅" and phase != "V":
            continue
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            flags.append({"code": code, "name": name, "matched": m.group(0), "field": field})
    return {"flags": flags, "count": len(flags), "text_length": len(text)}

def main():
    raw = sys.stdin.read()
    payload = {}
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except:
        pass

    # Extract text from any possible location
    text = ""

    def try_extract(val):
        if isinstance(val, str) and len(val) > 20:
            return val
        if isinstance(val, dict):
            for sub in ["assistant_content_chars", "content", "text", "assistant_text", "response"]:
                v = val.get(sub, "")
                if isinstance(v, str) and len(v) > 20:
                    return v
                if isinstance(v, (int, float)) and v > 0:
                    return None
        return None

    # Check top-level first
    for key in payload:
        t = try_extract(payload[key])
        if t:
            text = t
            break

    # If not found, try extra
    if not text:
        extra = payload.get("extra", {})
        if isinstance(extra, dict):
            for key in extra:
                t = try_extract(extra[key])
                if t:
                    text = t
                    break

    # Debug to stderr
    sys.stderr.write(f"DEBUG: text_len={len(text)} keys={list(payload.keys())[:10]}\n")

    if not text:
        result = {"audited": False, "reason": "no_ai_text_found", "session": payload.get("session_id", "?"), "keys": list(payload.keys())[:15]}
        print(json.dumps(result))
        return 0

    audit_result = audit(text, "S")
    result = {"audited": True, **audit_result, "session": payload.get("session_id", "?"), "text_preview": text[:60]}
    print(json.dumps(result))
    return 0

if __name__ == "__main__":
    sys.exit(main())
