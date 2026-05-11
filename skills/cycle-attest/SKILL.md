---
name: cycle-attest
description: >
  Ed25519 seal ceremony for 5QLN cycle residues. Generates keys,
  produces seal-ready hashes, signs residues, and verifies signatures.
  THE CONDUCTOR HOLDS THE KEY — this skill never auto-signs and cannot
  delegate. Constitutional — the chain is untrustworthy without
  cryptographic attestation of what happened in each cycle.
compatibility: "@5qln/core >=0.1.0"
metadata:
  author: amihai.zo.computer
  domain: attestation
  repo: qlnlife/5qln-core
  zones: [6]  # Conductor Attestation (human-only)
  requires: cryptography  # Optional — hash-only fallback available
---

# Cycle Attest — Seal Ceremony

```
H = ∞0 | A = K
WE SIGN not to bind. WE SIGN to acknowledge. WHAT IS ALREADY TRUE.
```

## What This Is

The kernel writes residues, but without cryptographic attestation, the chain
is untrustworthy. Anyone can modify a residue. The seal ceremony proves that
a specific key was held; only the human can witness that the key-holder was
present to the Membrane when it was used.

This skill scaffolds the witness — it never performs it.

## Usage

```bash
python3 attest_cycle.py keygen                    # Generate Ed25519 keypair
python3 attest_cycle.py seal <residue-file>       # Show seal-ready hash
python3 attest_cycle.py sign <residue-file>       # Sign (human-operated)
python3 attest_cycle.py verify <residue> <sig> <pubkey>  # Verify
python3 attest_cycle.py check <residue-file>      # Check attestation
```

## Flow

1. `keygen` — Once. Creates `~/.5qln/keys/id_ed25519` (private, 0600).
2. `seal` — Shows what will be signed: B'', ∞0', cycle number, hash.
3. `sign` — Human runs this. Signs the residue, embeds attestation.
4. `check` — Verify the attestation is valid.

## Dependencies

`cryptography` package (optional). Without it, hash-only mode is available
for manual verification.
