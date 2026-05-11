#!/usr/bin/env python3
"""
5QLN Codex Hash Tool — generates and verifies SHA-256 of the Nine Invariant Lines.

Usage:
  python3 hash_codex.py              Print the canonical hash
  python3 hash_codex.py --source     Print the source lines that produce the hash
  python3 hash_codex.py --verify FILE  Verify FILE's Nine Lines match the hash
"""

import sys
import hashlib
from pathlib import Path

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

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--source":
        print("\n".join(CODEX_LINES))
    elif len(sys.argv) > 2 and sys.argv[1] == "--verify":
        target = Path(sys.argv[2])
        if not target.exists():
            print(f"ERROR: {target} not found")
            sys.exit(1)
        content = target.read_text()
        lines = [l.strip() for l in content.split("\n") if l.strip() and l.strip()[0].isdigit() and ". " in l[:10]]
        extracted = "\n".join(lines[:9])
        file_hash = hashlib.sha256(extracted.encode()).hexdigest()
        if file_hash == CODEX_HASH:
            print(f"✅ CONSTITUTIONAL — {target}")
            print(f"   Hash: {file_hash}")
        else:
            print(f"❌ CORRUPTED — {target}")
            print(f"   Expected: {CODEX_HASH}")
            print(f"   Got:      {file_hash}")
            sys.exit(1)
    else:
        print(CODEX_HASH)
