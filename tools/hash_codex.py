#!/usr/bin/env python3
"""
5QLN Codex Hash Tool — generates and verifies SHA-256 of the Ten Invariant Lines.

Usage:
  python3 hash_codex.py              Print the canonical hash
  python3 hash_codex.py --source     Print the source lines that produce the hash
  python3 hash_codex.py --verify FILE  Verify FILE's lines match the hash
"""

import sys
import hashlib
from pathlib import Path

CODEX_LINES = (
    "1. H = ∞0 | A = K\n"
    "2. S → G → Q → P → V\n"
    "3. S = ∞0 → ?\n"
    "4. G = α ≡ {α'}\n"
    "5. Q = φ ∩ Ω\n"
    "6. P = δE/δV → ∇\n"
    "7. V = (L ∩ G → B'') → ∞0'\n"
    "8. XY := X within Y, X,Y ∈ {S,G,Q,P,V}\n"
    "9. No V without ∞0'\n"
    "10. L1  L2  L3  L4  V∅"
)

CANONICAL_HASH = hashlib.sha256(CODEX_LINES.encode()).hexdigest()


def extract_lines(text: str) -> str:
    lines = []
    for l in text.split("\n"):
        s = l.strip()
        if s and s[0].isdigit() and ". " in s[:10]:
            lines.append(s)
    return "\n".join(lines[:10])


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--source":
        print(CODEX_LINES)
    elif len(sys.argv) > 2 and sys.argv[1] == "--verify":
        target = Path(sys.argv[2])
        if not target.exists():
            print(f"ERROR: {target} not found")
            sys.exit(1)
        content = target.read_text()
        extracted = extract_lines(content)
        file_hash = hashlib.sha256(extracted.encode()).hexdigest()
        if file_hash == CANONICAL_HASH:
            print(f"CONSTITUTIONAL — {target}")
            print(f"  Hash: {file_hash}")
        else:
            print(f"CORRUPTED — {target}")
            print(f"  Expected: {CANONICAL_HASH}")
            print(f"  Got:      {file_hash}")
            sys.exit(1)
    else:
        print(CANONICAL_HASH)
