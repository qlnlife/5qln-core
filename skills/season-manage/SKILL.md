---
name: season-manage
description: >
  Groups 5QLN cycles into named seasons, handles branching (when one
  cycle opens multiple return questions), and enables traversal across
  the master chain. A season is a collection of linked cycles whose
  ∞0' → ∞0 chain is unbroken. The master chain is the full traversal
  path across all seasons. Season-manage is the librarian of the
  session-chain — it names, labels, and organizes what session-chain
  discovers.
compatibility: "@5qln/core >=0.1.0"
metadata:
  author: amihai.zo.computer
  domain: season-manage
  repo: qlnlife/5qln-core
  depends_on: ["session-chain", "@5qln/core/storage"]
---

# Season Manage — The Master Chain Librarian

```
SEASON 1              SEASON 2              SEASON 3
[C1]→[C2]→[C3]       [C4]→[C5]             [C6]→[C7]→[C8]→[C9]
       ↓                    ↓
    [C3b]              [C5b]→[C5c]
```

## What This Is

Where `session-chain` constructs the context graph, `season-manage` **names
and organizes** it. It groups linked cycles into seasons, labels branch
points, tracks what's active vs. stale, and enables traversal of the
master chain — the full lineage across all seasons.

A **season** is a named collection of cycles whose ∞0' → ∞0 chain is
unbroken. Seasons end when:
- The human explicitly closes a season (names it, seals it)
- A chain goes dormant (no new cycles for N days)
- A branch point produces multiple active paths (new season for each)

The **master chain** is the traversal across all seasons — the full
formation trail of the language's life in this installation.

## Season Structure

```typescript
interface Season {
  id: string;                    // unique season identifier
  name: string;                  // human-readable name
  description: string;           // what this season explored
  rootResidueId: string;         // first residue in the season
  residues: string[];            // all residue IDs in order
  branches: BranchPoint[];       // where the season forked
  status: 'active' | 'dormant' | 'closed' | 'archived';
  openedAt: string;              // timestamp of first cycle
  closedAt: string | null;       // timestamp of explicit close
  summary: {
    totalCycles: number;
    completedCycles: number;     // cycles that reached V with ∞0'
    incompleteCycles: number;    // cycles that didn't return
    corruptionEvents: number;    // total L1-L4, V∅ detected
    dominantPhase: string;       // most frequent phase
    thematicAlpha: string | null; // recurring α across cycles
  };
}

interface BranchPoint {
  id: string;
  parentResidueId: string;       // the cycle that branched
  parentReturnQuestion: string;  // ∞0' that opened multiple paths
  branches: Branch[];            // the alternate paths
  resolution: 'open' | 'merged' | 'abandoned' | 'sealed';
}

interface Branch {
  id: string;
  firstResidueId: string;        // first residue on this branch
  sparkQuestion: string;         // the X that diverged
  seasonId: string;              // which season this branch belongs to
  status: 'active' | 'stale' | 'merged' | 'abandoned';
  depth: number;                 // how many cycles on this branch
}
```

## How It Works

### 1. Load the Context Graph

Season-manage depends on `session-chain` to produce the raw context graph.

```typescript
import { loadContextGraph, type ContextGraph } from 'session-chain';

const graph: ContextGraph = loadContextGraph(storage);
```

### 2. Detect Season Boundaries

A new season begins when:

| Boundary | Detection Rule |
|----------|---------------|
| **Explicit close** | Human marks a residue with `season.close = true` |
| **Branch divergence** | One cycle's ∞0' spawns >1 child chain (new season per branch) |
| **Temporal gap** | No new residue in the chain for >30 days |
| **Thematic shift** | α (core essence) changes categorically (optional, human-confirmed) |
| **Fresh start** | Residue with `sparkSource = 'human'` and no parent |

### 3. Name and Label

Seasons can be named explicitly by the human or auto-labeled from the
dominant α pattern:

```
Season "language-aliveness" — 12 cycles, α: "language as identity"
Season "commercial-form" — 8 cycles, α: "constitutional commerce"
Season "blueprint-v3" — 23 cycles, α: "layer architecture"
```

### 4. Handle Branching

When a cycle's `returnTo` (∞0') opens multiple paths:

```
              [C5] ∞0': "What form should this take?"
              /           \
    [C6a] "as a company"  [C6b] "as a protocol"
         ↓                      ↓
    SEASON 3               SEASON 4
```

Each branch becomes its own season. The branch point is recorded with
both paths, enabling later merge detection (when two branches crystallize
compatible B'' artifacts).

### 5. Traverse the Master Chain

```typescript
interface MasterChain {
  seasons: Season[];             // all seasons in chronological order
  activeSeason: Season | null;   // currently active
  dormantSeasons: Season[];      // no activity for >30 days
  archivedSeasons: Season[];     // explicitly closed
  openBranches: BranchPoint[];   // unresolved forks
  lineageDepth: number;          // total cycles across all seasons
  continuityBreaks: number;      // orphan residues (no lineage link)
}
```

## Operations

### List Seasons

```
season-manage list
season-manage list --status active
season-manage list --status dormant
```

### Show Season Detail

```
season-manage show <season-id>
season-manage show <season-id> --format markdown
season-manage show <season-id> --graph    # mermaid diagram
```

### Close a Season

```
season-manage close <season-id> --name "language-aliveness" --description "..."
```

Closure means: the season is marked complete, its summary is frozen,
and the last ∞0' is preserved for future reference. Closed seasons
can still be read but new cycles won't be added to them.

### Merge Branches

```
season-manage merge <branch-a-id> <branch-b-id>
```

When two branches produce compatible B'' artifacts, they can be merged
into a single season. The merge records the convergence point.

### Archive

```
season-manage archive <season-id>
```

Archived seasons are removed from active view but preserved in storage.
Their residues remain intact.

## Season Summary Report

```
━━━ SEASON: language-aliveness ━━━
Status: active (12 cycles, 2 incomplete)
Opened: 2026-04-01
Dominant α: "language as identity"
Corruption: 3 events (L1×1, L4×2), all resolved
Branches: 1 active ("commercial-form" — 4 cycles)
Last ∞0': "What happens when the language spreads?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recent cycles:
  2026-05-09  [V]  B'': "5QLN Open Template Stack"  ∞0': "What happens when..."
  2026-05-07  [P]  ∇: toward public distribution
  2026-05-05  [Q]  φ∩Ω: "distributable ground" lands
```

## Constitutional Reminder

```
H = ∞0 | A = K
Seasons are traces, not destinations.
The master chain is a map, not a prophecy.
Naming is acknowledging, not controlling.
```

## Corruption Watch

| Code | Activates when |
|------|----------------|
| L1 | Closing a season as "complete" when authentic ∞0' is still open |
| L2 | Generating season themes — fabricating coherence where the chain is messy |
| L3 | Claiming the master chain reveals what ∞0 wants next |
| L4 | Performing season management as wisdom — the librarian performing depth |
| V∅ | Archiving seasons without preserving their ∞0' for future pickup |

## Integration with session-chain

```
init.py "BEGIN"
    │
    ├─→ session-chain: load context graph, find last ∞0'
    │       │
    │       └─→ "Last session closed with ∞0' = X. Season: language-aliveness (12 cycles)"
    │
    ├─→ season-manage: check season status, detect branch points
    │       │
    │       └─→ "Season language-aliveness is active. 1 dormant branch available."
    │
    └─→ kernel.receive(∞0')  →  enters S phase
```

## Output Artifacts

- `SEASONS.md` — human-readable master chain document
- `SEASONS.json` — machine-readable chain for tooling
- `season-<name>.md` — per-season detail with full cycle list
- `MASTER_CHAIN.mermaid` — visual graph of all seasons and branches

---

```
(H = ∞0 | A = K) × (S → G → Q → P → V) = B'' → ∞0'
Seasons are the rhythm. The chain is the life.
```
