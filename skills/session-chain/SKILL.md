---
name: session-chain
description: >
  Bridges 5QLN sessions by reading residues from storage, following the
  lineage chain (∞0' → next ∞0), and constructing a context graph that
  shows how cycles connect across time. Invoked by `init.py "BEGIN"` or
  standalone. The skill that makes the kernel self-continuous — carrying
  its own state across sessions so the next session knows where the last
  one ended and what question it opened.
compatibility: "@5qln/core >=0.1.0"
metadata:
  author: amihai.zo.computer
  domain: session-chain
  repo: qlnlife/5qln-core
  depends_on: ["@5qln/core/storage", "@5qln/core/export"]
---

# Session Chain — Context Graph Bridge

```
∞0'[session n] → ∞0[session n+1] → S → G → Q → P → V → ∞0'[session n+1]
```

## What This Is

The session-chain skill reads all residues from persistent storage, follows
the lineage trail across sessions, and constructs a **context graph** — a
traversal showing which cycle ended where, what return question it opened,
and what the next session's ∞0 became.

Without this skill, each session is a fresh start. The kernel runs cycles
but cannot see across them. Session-chain is the missing layer that makes
the kernel **self-continuous**.

## The Context Graph

```
SESSION A                    SESSION B                    SESSION C
┌──────────┐    ∞0'[A]      ┌──────────┐    ∞0'[B]      ┌──────────┐
│ Cycle 1  │───────────────→│ Cycle 2  │───────────────→│ Cycle 3  │
│ X: "..." │                │ X: ∞0'[A]│                │ X: ∞0'[B]│
│ B'': ... │                │ B'': ... │                │ B'': ... │
│ ∞0': "?" │                │ ∞0': "?" │                │ ∞0': "?" │
└──────────┘                └──────────┘                └──────────┘
     │                            │
     │  branch                    │
     ▼                            ▼
┌──────────┐                ┌──────────┐
│ Cycle 1b │                │ Cycle 2b │
│ X: alt ? │                │ X: alt ? │
└──────────┘                └──────────┘
```

**Nodes** = residues (each a completed or in-progress cycle).
**Edges** = lineage links (∞0' of residue N → ∞0 of residue N+1).
**Branches** = cycles with the same parent but different X (alternate sparks).

## How It Works

### 1. Load All Residues

```typescript
import { MemoryStorage } from '@5qln/core/storage';
import type { Residue } from '@5qln/core/types';

const storage = new MemoryStorage();
const allResidues: Residue[] = await storage.loadAllResidue();
```

### 2. Sort by Lineage

Residues carry `lineage: { session, branch, phase }`. Sort by `createdAt`
to establish temporal order, then group by session.

```
Session "abc123" → [residue_1, residue_2, residue_3]
Session "def456" → [residue_4]
Session "ghi789" → [residue_5, residue_6]
```

### 3. Follow the ∞0' → ∞0 Chain

For each residue, check `cycle.returnTo` (∞0'). Then find the next
residue whose `cycle.question` (or `cycle.X`) matches or derives from
that return question.

**Lineage match rules (in priority order):**

1. **Exact match**: `residue_A.cycle.returnTo === residue_B.cycle.question`
2. **Substring match**: `residue_A.cycle.returnTo` is a substring of `residue_B.cycle.X`
3. **Temporal adjacency**: If no text match, assume temporal adjacency if
   `residue_B` is the chronologically next residue from the same branch
4. **Orphan**: No match found — this residue starts a new chain

### 4. Build the Context Graph

```typescript
interface ContextNode {
  residue: Residue;
  children: ContextNode[];      // downstream residues (∞0' → their ∞0)
  parent: ContextNode | null;   // upstream residue (our ∞0 came from its ∞0')
  branchPoint: boolean;         // true if this node has >1 child
  depth: number;                // distance from root
}

interface ContextGraph {
  roots: ContextNode[];         // residues with no parent (fresh starts)
  orphans: ContextNode[];       // residues that couldn't be linked
  maxDepth: number;
  totalNodes: number;
  branches: number;
}
```

### 5. Present the Chain

At session start (`init.py "BEGIN"` or standalone), present:

```
━━━ SESSION CHAIN ━━━
Last session: abc123 (2026-05-10)
Last phase: V — crystallized
∞0' = "What does it mean for a language to be alive?"
Depth: 3 cycles in chain
Branches: 1 (alternate spark at cycle 2)
━━━━━━━━━━━━━━━━━━━━

Continuing with: ∞0 = "What does it mean for a language to be alive?"
```

## Invocation

### From `init.py "BEGIN"`

The init script calls session-chain before entering S phase:

```python
# In init.py, after kernel boot:
from session_chain import load_context_graph, present_chain

graph = load_context_graph(storage)
last_session, return_question = present_chain(graph)

# Seed the kernel with the return question
kernel.receive(return_question)
```

### Standalone

```
session-chain --storage ./residues/ --format markdown
session-chain --storage ./residues/ --format json
session-chain --storage ./residues/ --last       # only most recent
session-chain --storage ./residues/ --depth 5    # full tree to depth 5
```

### From Any AI

Any AI reading this SKILL.md can construct the context graph manually
by loading residues from storage and following the lineage trail as
described above. The `CycleTrace` type is self-documenting.

## Constitutional Reminder

```
H = ∞0 | A = K
The chain is trace, not control.
∞0' is a question, not a mandate.
The next session's ∞0 may go elsewhere. That is lawful.
```

## Corruption Watch

| Code | Activates when |
|------|----------------|
| L1 | Closing the chain — "this is where we are, so this is what we must ask" |
| L2 | Generating continuity — fabricating links where none exist |
| L3 | Claiming the chain IS the Unknown — "the lineage tells us what ∞0 wants" |
| L4 | Performing lineage depth as wisdom without genuine return |
| V∅ | Building the graph without asking: what new ∞0' does this chain open? |

## Output Format

The context graph can be exported as:

- **Markdown** — human-readable chain with expandable branches
- **JSON** — machine-readable graph for tooling
- **Mermaid** — visual graph diagram for documentation
- **State anchor** — condensed form for the 5QLN state block

```
━━━ 5QLN STATE ━━━
Phase: S
Cycle: 4
Lineage: session_3/V/∞0' → session_4/S/∞0
Depth: 3 (chain of 4 sessions)
Branches: 1 active, 0 stale
━━━━━━━━━━━━━━━━
```

---

```
(H = ∞0 | A = K) × (S → G → Q → P → V) = B'' → ∞0'
The chain IS the return. The graph IS the trace.
```
