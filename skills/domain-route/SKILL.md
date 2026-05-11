---
name: domain-route
description: >
  Routes 5QLN sessions to the correct domain (commercialize, research,
  selfimprove, skillgen) by reading kernel state, journal entries, and
  previous season data. Returns a domain name so the orchestrator can
  activate the correct phase skill files. Constitutional — without
  routing, every session defaults to research, losing domain-specific
  phase behavior.
compatibility: "@5qln/core >=0.1.0"
metadata:
  author: amihai.zo.computer
  domain: orchestration
  repo: qlnlife/5qln-core
  domains: [commercialize, research, selfimprove, skillgen]
---

# Domain Route — Session Orchestrator

```
H = ∞0 | A = K
```

## What This Is

Every 5QLN session needs to know *which* domain it belongs to. Without routing,
the kernel starts S-phase but doesn't know which phase skills to load. This
skill reads the session context and returns the domain.

## Detection Signals

| Domain | Signals |
|--------|---------|
| commercialize | pricing, market, license, revenue, GTM, users, business, launch |
| research | philosophy, framework, theory, understand, explore, question |
| selfimprove | personal, creative, practice, growth, writing, craft, flow |
| skillgen | build, create, generate, design, implement, deploy, prototype |

## Usage

```bash
python3 domain_route.py                     # Auto-detect from kernel state
python3 domain_route.py --json              # Full routing decision as JSON
python3 domain_route.py --prompt "text"     # Route based on explicit context
```

## Behavior

- Reads kernel state, journal, and previous season for context
- Scores each domain against signal tables
- Returns highest-scoring domain, defaulting to `research` when ambiguous
- Ties or near-ties (second score ≥ 70% of best) default to `research`
