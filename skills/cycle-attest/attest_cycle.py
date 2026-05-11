#!/usr/bin/env python3
"""
5QLN Cycle Attestation — Seal Ceremony

Generates Ed25519 keys, produces seal-ready hashes of cycle residues,
and verifies signatures. THE CONDUCTOR HOLDS THE KEY — this skill
never holds the private key and never auto-signs.

Usage:
  python3 attest_cycle.py keygen           Generate keypair (~/.5qln/id_ed25519)
  python3 attest_cycle.py seal <residue>   Show seal-ready hash (human signs separately)
  python3 attest_cycle.py verify <residue> <signature> <pubkey>
  python3 attest_cycle.py check <residue>  Check if residue has valid attestation

Constitutional principle:
  WE SIGN not to bind. WE SIGN to acknowledge. WHAT IS ALREADY TRUE.
"""

import json
import sys
import os
import hashlib
import base64
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# ─── Paths ────────────────────────────────────────────────────────
STATE_DIR = Path.home() / ".5qln"
RESIDUES_DIR = STATE_DIR / "residues"
KEY_DIR = STATE_DIR / "keys"
PRIVKEY_FILE = KEY_DIR / "id_ed25519"
PUBKEY_FILE = KEY_DIR / "id_ed25519.pub"

# ─── Try cryptography, fall back to hashlib-only mode ─────────────
try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.hazmat.primitives import serialization
    from cryptography.exceptions import InvalidSignature
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False


# ─── Seal-Ready Hash ──────────────────────────────────────────────

def seal_hash(residue: dict) -> str:
    """Produce the seal-ready hash of a residue.

    Hashes: cycle_num, outputs, B2, return_question, timestamp.
    Deliberately excludes: formation_trail details (privacy), corruption (mutable).
    """
    canonical = {
        "cycle": residue.get("cycle", 0),
        "session_id": residue.get("session_id", ""),
        "phase": residue.get("phase", ""),
        "outputs": residue.get("outputs", {}),
        "B2": residue.get("trace", {}).get("B2", ""),
        "return_question": residue.get("trace", {}).get("return_question", ""),
        "timestamp": residue.get("ts", ""),
    }
    payload = json.dumps(canonical, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode()).hexdigest()

def seal_payload(residue: dict) -> bytes:
    """Produce the canonical seal payload bytes (what gets signed)."""
    return seal_hash(residue).encode()


# ─── Key Management ───────────────────────────────────────────────

def cmd_keygen() -> dict:
    """Generate an Ed25519 keypair and save to ~/.5qln/keys/."""
    if not HAS_CRYPTO:
        return {
            "ok": False,
            "error": "cryptography package not installed. Install: pip install cryptography",
            "fallback": "hash-only mode available — hashes can be verified manually",
        }

    KEY_DIR.mkdir(parents=True, exist_ok=True)

    if PRIVKEY_FILE.exists():
        return {
            "ok": False,
            "error": "Key already exists. Remove ~/.5qln/keys/ to regenerate.",
            "key_exists": True,
        }

    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()

    # Save private key (pem)
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    PRIVKEY_FILE.write_bytes(priv_pem)
    PRIVKEY_FILE.chmod(0o600)  # Owner only

    # Save public key (pem)
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    PUBKEY_FILE.write_bytes(pub_pem)

    # Extract raw public key bytes for display
    pub_raw = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    pub_b64 = base64.b64encode(pub_raw).decode()

    return {
        "ok": True,
        "public_key_b64": pub_b64,
        "key_dir": str(KEY_DIR),
        "note": "Private key saved to ~/.5qln/keys/id_ed25519 (owner-only). NEVER share this file.",
    }


def load_private_key():
    """Load the private key. Returns None if not found or crypto unavailable."""
    if not HAS_CRYPTO or not PRIVKEY_FILE.exists():
        return None
    pem_data = PRIVKEY_FILE.read_bytes()
    return serialization.load_pem_private_key(pem_data, password=None)


def load_public_key():
    """Load the public key. Returns None if not found or crypto unavailable."""
    if not HAS_CRYPTO or not PUBKEY_FILE.exists():
        return None
    pem_data = PUBKEY_FILE.read_bytes()
    return serialization.load_pem_public_key(pem_data)


def get_public_key_b64() -> Optional[str]:
    """Get the base64-encoded raw public key bytes."""
    pk = load_public_key()
    if not pk:
        return None
    raw = pk.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return base64.b64encode(raw).decode()


# ─── Signing ───────────────────────────────────────────────────────

def cmd_sign(residue: dict) -> dict:
    """Sign a residue. REQUIRES the HUMAN to provide the key passphrase.

    This function loads the private key and signs. It should only be called
    when the human explicitly requests signing. The skill never auto-signs.
    """
    if not HAS_CRYPTO:
        return {"ok": False, "error": "cryptography not installed"}

    pk = load_private_key()
    if not pk:
        return {"ok": False, "error": "No private key found. Run keygen first."}

    payload = seal_payload(residue)
    signature = pk.sign(payload)
    sig_b64 = base64.b64encode(signature).decode()

    return {
        "ok": True,
        "signature_b64": sig_b64,
        "seal_hash": seal_hash(residue),
        "cycle": residue.get("cycle", 0),
    }


def cmd_seal_ready(residue: dict) -> dict:
    """Show the seal-ready state without signing. The human decides."""
    public_key = get_public_key_b64()

    return {
        "ok": True,
        "seal_hash": seal_hash(residue),
        "cycle": residue.get("cycle", 0),
        "session_id": residue.get("session_id", ""),
        "B2": residue.get("trace", {}).get("B2", ""),
        "return_question": residue.get("trace", {}).get("return_question", ""),
        "has_key": PRIVKEY_FILE.exists(),
        "public_key_b64": public_key,
        "ready_to_sign": PRIVKEY_FILE.exists(),
        "action_required": "To sign, run: python3 attest_cycle.py sign <residue-file>",
    }


# ─── Verification ─────────────────────────────────────────────────

def cmd_verify(residue: dict, signature_b64: str, pubkey_b64: str) -> dict:
    """Verify a signature against a residue using a public key."""
    if not HAS_CRYPTO:
        return {"ok": False, "error": "cryptography not installed"}

    try:
        pubkey_bytes = base64.b64decode(pubkey_b64)
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(pubkey_bytes)
        signature = base64.b64decode(signature_b64)
        payload = seal_payload(residue)

        public_key.verify(signature, payload)
        return {
            "ok": True,
            "verified": True,
            "seal_hash": seal_hash(residue),
            "cycle": residue.get("cycle", 0),
        }
    except InvalidSignature:
        return {"ok": False, "verified": False, "error": "Signature does not match residue"}
    except Exception as e:
        return {"ok": False, "verified": False, "error": str(e)}


def cmd_check(residue: dict) -> dict:
    """Check if the residue has a valid attestation signature embedded."""
    attestation = residue.get("attestation", {})
    if not attestation:
        return {"ok": False, "attested": False, "reason": "No attestation field"}

    sig = attestation.get("signature_b64", "")
    pubkey = attestation.get("public_key_b64", "")

    if not sig or not pubkey:
        return {"ok": False, "attested": False, "reason": "Incomplete attestation"}

    result = cmd_verify(residue, sig, pubkey)

    return {
        "attested": result.get("verified", False),
        "seal_hash": attestation.get("seal_hash", ""),
        "attested_by": attestation.get("conductor", ""),
        "attested_at": attestation.get("timestamp", ""),
        "detail": result,
    }


# ─── Main ─────────────────────────────────────────────────────────

def load_residue(path: str) -> dict:
    p = Path(path)
    if p.exists():
        return json.loads(open(p).read())

    # Try residues directory
    p = RESIDUES_DIR / path
    if p.exists():
        return json.loads(open(p).read())

    # Try JSON literal
    try:
        return json.loads(path)
    except (json.JSONDecodeError, ValueError):
        pass

    return {}


def main():
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        return

    command = args[0]

    if command == "keygen":
        print(json.dumps(cmd_keygen(), indent=2, ensure_ascii=False))

    elif command == "seal":
        if len(args) < 2:
            print(json.dumps({"error": "Usage: attest_cycle.py seal <residue-path-or-json>"}, indent=2))
            return
        residue = load_residue(args[1])
        if not residue:
            print(json.dumps({"error": f"Cannot load residue: {args[1]}"}, indent=2))
            return
        print(json.dumps(cmd_seal_ready(residue), indent=2, ensure_ascii=False))

    elif command == "sign":
        if len(args) < 2:
            print(json.dumps({"error": "Usage: attest_cycle.py sign <residue-path-or-json>"}, indent=2))
            return
        residue = load_residue(args[1])
        if not residue:
            print(json.dumps({"error": f"Cannot load residue: {args[1]}"}, indent=2))
            return
        result = cmd_sign(residue)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        if result.get("ok") and not args[2:]:
            # Attach signature to residue
            sig = result["signature_b64"]
            pubkey = get_public_key_b64()
            residue["attestation"] = {
                "seal_hash": result["seal_hash"],
                "signature_b64": sig,
                "public_key_b64": pubkey,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "method": "Ed25519",
            }
            # Save attested residue
            out_path = Path(args[1])
            if out_path.exists():
                json.dump(residue, open(out_path, "w"), indent=2, ensure_ascii=False)
                print(f"\nAttestation embedded in {args[1]}")

    elif command == "verify":
        if len(args) < 4:
            print(json.dumps({"error": "Usage: attest_cycle.py verify <residue> <signature_b64> <pubkey_b64>"}, indent=2))
            return
        residue = load_residue(args[1])
        if not residue:
            print(json.dumps({"error": f"Cannot load residue: {args[1]}"}, indent=2))
            return
        print(json.dumps(cmd_verify(residue, args[2], args[3]), indent=2, ensure_ascii=False))

    elif command == "check":
        if len(args) < 2:
            print(json.dumps({"error": "Usage: attest_cycle.py check <residue-path>"}, indent=2))
            return
        residue = load_residue(args[1])
        if not residue:
            print(json.dumps({"error": f"Cannot load residue: {args[1]}"}, indent=2))
            return
        print(json.dumps(cmd_check(residue), indent=2, ensure_ascii=False))

    else:
        print(json.dumps({"error": f"Unknown command: {command}. Try: keygen, seal, sign, verify, check"}, indent=2))


if __name__ == "__main__":
    main()
