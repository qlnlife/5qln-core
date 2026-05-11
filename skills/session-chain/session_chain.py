#!/usr/bin/env python3
"""
5QLN Session Chain — Context Graph Bridge

Reads the kernel journal (~/.5qln/journal.jsonl), reconstructs cycle
traces from completed cycles, builds the context graph, and presents
the session chain at boot.

Usage:
  python3 session_chain.py              # Show full context graph
  python3 session_chain.py --last       # Show only the most recent cycle
  python3 session_chain.py --depth 5    # Show chain to depth 5
  python3 session_chain.py --json       # Output as JSON
  python3 session_chain.py --mermaid    # Output as Mermaid diagram
  python3 session_chain.py --seed S     # Output the seed for a new session

Constitutional reminder: The chain is trace, not control.
∞0' is a question, not a mandate.
"""

import json
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# ─── Paths ────────────────────────────────────────────────────────

STATE_DIR = Path.home() / ".5qln"
JOURNAL_FILE = STATE_DIR / "journal.jsonl"
RESIDUES_DIR = STATE_DIR / "residues"


# ─── Types ────────────────────────────────────────────────────────

class CycleNode:
    """A single completed cycle in the context graph."""

    def __init__(self, index: int, data: dict):
        self.index = index
        self.cycle_num = data.get("cycle", 0)
        self.trace = data.get("trace", {})
        self.outputs = data.get("outputs", {})
        self.corruption = data.get("corruption", [])
        self.timestamp = data.get("ts", "")

        # Extracted fields
        self.X = self.trace.get("X") or self.outputs.get("X")
        self.alpha = self.trace.get("alpha")
        self.Y = self.trace.get("Y") or self.outputs.get("Y")
        self.phi = self.trace.get("phi")
        self.Z = self.trace.get("Z") or self.outputs.get("Z")
        self.nabla = self.trace.get("nabla")
        self.A = self.trace.get("A") or self.outputs.get("A")
        self.B = self.trace.get("B") or self.outputs.get("B")
        self.B2 = self.trace.get("B2")  # B'' — the crystallized seed

        # The return question ∞0' — either explicit or derived from B''
        self.return_question = self.trace.get("return_question") or self.B2

        # Graph edges
        self.parent: Optional["CycleNode"] = None
        self.children: list["CycleNode"] = []

    @property
    def is_root(self) -> bool:
        return self.parent is None

    @property
    def is_leaf(self) -> bool:
        return len(self.children) == 0

    @property
    def is_branch_point(self) -> bool:
        return len(self.children) > 1

    @property
    def depth(self) -> int:
        if self.parent is None:
            return 0
        return self.parent.depth + 1

    @property
    def is_complete(self) -> bool:
        return self.B2 is not None and "V∅" not in self.corruption

    def summary(self) -> str:
        parts = [f"[C{self.cycle_num}]"]
        if self.X:
            parts.append(f"X: {self.X[:60]}")
        if self.alpha:
            parts.append(f"α: {self.alpha[:40]}")
        if self.B2:
            parts.append(f"B'': {self.B2[:60]}")
        if self.corruption:
            parts.append(f"⚠ {','.join(self.corruption)}")
        return " | ".join(parts)

    def to_dict(self) -> dict:
        return {
            "cycle": self.cycle_num,
            "index": self.index,
            "X": self.X,
            "alpha": self.alpha,
            "Y": self.Y,
            "phi": self.phi,
            "Z": self.Z,
            "nabla": self.nabla,
            "A": self.A,
            "B": self.B,
            "B2": self.B2,
            "return_question": self.return_question,
            "corruption": self.corruption,
            "timestamp": self.timestamp,
            "depth": self.depth,
            "is_branch_point": self.is_branch_point,
            "is_complete": self.is_complete,
        }


class ContextGraph:
    """The full context graph — all completed cycles with lineage links."""

    def __init__(self):
        self.nodes: list[CycleNode] = []
        self.roots: list[CycleNode] = []
        self.orphans: list[CycleNode] = []
        self.max_depth: int = 0
        self.total_nodes: int = 0
        self.branches: int = 0
        self.last_complete: Optional[CycleNode] = None


# ─── Load Cycles ──────────────────────────────────────────────────

def load_cycles() -> list[CycleNode]:
    """Read all cycle_complete events from the journal and reconstruct CycleNodes."""
    if not JOURNAL_FILE.exists():
        return []

    nodes = []
    with open(JOURNAL_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("event") == "cycle_complete":
                nodes.append(CycleNode(len(nodes), entry))

    return nodes


# ─── Build Context Graph ──────────────────────────────────────────

def build_context_graph(nodes: list[CycleNode]) -> ContextGraph:
    """Link cycles into a context graph by matching return questions to next sparks."""
    graph = ContextGraph()
    graph.total_nodes = len(nodes)
    graph.nodes = nodes

    if not nodes:
        return graph

    # Link by temporal adjacency as primary strategy,
    # with text matching as refinement
    for i in range(len(nodes) - 1):
        current = nodes[i]
        candidate = nodes[i + 1]

        # Check if candidate's X matches current's return_question (or B2)
        if current.return_question and candidate.X:
            # Exact match
            if current.return_question.strip() == candidate.X.strip():
                current.children.append(candidate)
                candidate.parent = current
                continue
            # Substring match (return question appears in X)
            if (len(current.return_question) > 10 and
                current.return_question.strip() in candidate.X):
                current.children.append(candidate)
                candidate.parent = current
                continue
            # X contains a reference to the B'' output
            if current.B2 and len(current.B2) > 10 and current.B2 in candidate.X:
                current.children.append(candidate)
                candidate.parent = current
                continue

        # Temporal adjacency fallback: link if no parent yet
        if candidate.parent is None:
            if candidate.X and current.return_question:
                # Loose match: first 30 chars overlap
                a = current.return_question.strip()[:30].lower()
                b = candidate.X.strip()[:30].lower()
                if a and b and (a in b or b in a):
                    current.children.append(candidate)
                    candidate.parent = current
                    continue

            # Pure temporal link
            current.children.append(candidate)
            candidate.parent = current

    # Identify roots and orphans
    for node in nodes:
        if node.parent is None:
            graph.roots.append(node)
        if node.is_leaf and node.is_complete:
            if (graph.last_complete is None or
                node.cycle_num > graph.last_complete.cycle_num):
                graph.last_complete = node

    # Count branches
    graph.branches = sum(1 for n in nodes if n.is_branch_point)

    # Max depth
    graph.max_depth = max((n.depth for n in nodes), default=0)

    return graph


# ─── Find Last ∞0' ────────────────────────────────────────────────

def find_seed(graph: ContextGraph) -> str | None:
    """Find the return question that should seed the next session."""
    if graph.last_complete and graph.last_complete.return_question:
        return graph.last_complete.return_question
    return None


# ─── Formatting ───────────────────────────────────────────────────

def format_chain(graph: ContextGraph, max_depth: int | None = None) -> str:
    """Format the context graph as a human-readable chain."""
    lines = []

    lines.append("━━━ SESSION CHAIN ━━━")
    lines.append(f"Total cycles: {graph.total_nodes}")
    lines.append(f"Chains (roots): {len(graph.roots)}")
    lines.append(f"Branches: {graph.branches}")
    lines.append(f"Max depth: {graph.max_depth}")
    lines.append("")

    if graph.last_complete:
        last = graph.last_complete
        lines.append("┌─ LAST COMPLETE CYCLE ─")
        lines.append(f"│  Cycle:    {last.cycle_num}")
        lines.append(f"│  Phase:    V (crystallized)")
        if last.X:
            lines.append(f"│  X:        {last.X}")
        if last.alpha:
            lines.append(f"│  α:        {last.alpha}")
        if last.B2:
            lines.append(f"│  B'':      {last.B2}")
        if last.return_question:
            lines.append(f"│  ∞0':      {last.return_question}")
        if last.corruption:
            lines.append(f"│  ⚠ {', '.join(last.corruption)}")
        lines.append("└──────────────────────")
        lines.append("")

    # Walk each root chain
    for root in graph.roots:
        lines.append(_format_chain_walk(root, depth=0, max_depth=max_depth))
        lines.append("")

    # Orphans
    if graph.orphans:
        lines.append("── ORPHANS (no lineage link) ──")
        for orphan in graph.orphans:
            lines.append(f"  {orphan.summary()}")
        lines.append("")

    # Seed for next session
    seed = find_seed(graph)
    if seed:
        lines.append("━━━ NEXT SESSION ━━━")
        lines.append(f"∞0 = \"{seed}\"")
        lines.append("Continuing into S phase.")
    else:
        lines.append("━━━ NEXT SESSION ━━━")
        lines.append("No previous ∞0' found. Starting fresh.")

    return "\n".join(lines)


def _format_chain_walk(node: CycleNode, depth: int = 0,
                        max_depth: int | None = None) -> str:
    """Recursively format a chain branch."""
    if max_depth is not None and depth > max_depth:
        return ""

    indent = "  " * depth
    prefix = "├─" if depth > 0 else "──"

    lines = [f"{indent}{prefix} {node.summary()}"]

    if node.is_branch_point:
        lines.append(f"{indent}   ┌─ BRANCH ({len(node.children)} paths)")

    for child in node.children:
        lines.append(_format_chain_walk(child, depth + 1, max_depth))

    return "\n".join(lines)


def format_mermaid(graph: ContextGraph) -> str:
    """Format the context graph as a Mermaid flowchart."""
    lines = ["```mermaid", "graph TD"]

    for node in graph.nodes:
        label = f"C{node.cycle_num}"
        if node.X:
            label += f"<br/>X: {node.X[:40]}"
        if node.B2:
            label += f"<br/>B'': {node.B2[:40]}"
        if node.corruption:
            label += f"<br/>⚠ {','.join(node.corruption)}"

        node_id = f"N{node.index}"
        lines.append(f'    {node_id}["{label}"]')

    for node in graph.nodes:
        node_id = f"N{node.index}"
        for child in node.children:
            child_id = f"N{child.index}"
            edge_label = ""
            if node.return_question:
                q = node.return_question[:30]
                edge_label = f"|{q}|"
            lines.append(f"    {node_id} -->{edge_label} {child_id}")

    lines.append("```")
    return "\n".join(lines)


# ─── Main ─────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    nodes = load_cycles()
    if not nodes:
        print("━━━ SESSION CHAIN ━━━")
        print("No cycles recorded yet.")
        print("Start a 5QLN session to begin the chain.")
        return

    graph = build_context_graph(nodes)

    if "--last" in args:
        if graph.last_complete:
            print(format_chain(graph, max_depth=0))
        else:
            print("No complete cycles found.")
        return

    if "--depth" in args:
        try:
            idx = args.index("--depth")
            max_depth = int(args[idx + 1])
            print(format_chain(graph, max_depth=max_depth))
        except (ValueError, IndexError):
            print(format_chain(graph))
        return

    if "--json" in args:
        data = {
            "total_nodes": graph.total_nodes,
            "roots": len(graph.roots),
            "branches": graph.branches,
            "max_depth": graph.max_depth,
            "last_complete": graph.last_complete.to_dict() if graph.last_complete else None,
            "seed": find_seed(graph),
            "nodes": [n.to_dict() for n in graph.nodes],
        }
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return

    if "--mermaid" in args:
        print(format_mermaid(graph))
        return

    if "--seed" in args:
        seed = find_seed(graph)
        if seed:
            print(seed)
        return

    # Default: full chain
    print(format_chain(graph))


if __name__ == "__main__":
    main()
