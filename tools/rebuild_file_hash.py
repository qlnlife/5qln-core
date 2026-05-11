#!/usr/bin/env python3
"""Pre-commit: recompute CANONICAL_FILE_HASH in init.py so integrity always matches."""
import hashlib, re, sys

for path in sys.argv[1:]:
    src = open(path).read()
    if 'CANONICAL_FILE_HASH' not in src:
        continue
    m = re.search(r'CANONICAL_FILE_HASH\s*=\s*"([0-9a-f]{64})"', src)
    if not m:
        print(f'WARN: {path}: CANONICAL_FILE_HASH not parsable, skipping')
        continue
    old_hash = m.group(1)
    normalized = src.replace(old_hash, '0' * 64)
    new_hash = hashlib.sha256(normalized.encode()).hexdigest()
    if old_hash == new_hash:
        print(f'OK: {path} ({new_hash[:16]}...)')
    else:
        fixed = src.replace(old_hash, new_hash)
        open(path, 'w').write(fixed)
        print(f'FIXED: {path} {old_hash[:16]}... -> {new_hash[:16]}...')
