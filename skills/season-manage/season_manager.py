#!/usr/bin/env python3
"""
5QLN Season Manager — The Master Chain Librarian

Groups completed cycles into named seasons, handles branching (when one
cycle opens multiple return questions), and enables traversal of the
master chain across all seasons.

Depends on session_chain.py for context graph construction.

Usage:
  python3 season_manager.py list                  # List all seasons
  python3 season_manager.py show <season-id>      # Show season detail
  python3 season_manager.py close <season-id>     # Close a season
  python3 season_manager.py name <season-id> <name>  # Name a season
  python3 season_manager.py archive <season-id>   # Archive a season
  python3 season_manager.py branches              # Show open branches
  python3 season_manager.py master-chain          # Show full master chain
  python3 season_manager.py --json                # Output as JSON
  python3 season_manager.py --mermaid             # Output as Mermaid

Seasons are stored in ~/.5qln/seasons.json
"""

import json
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional

# Import session_chain (same directory or installed)
SCRIPT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SCRIPT_DIR / "session-chain"))

try:
    from session_chain import load_cycles, build_context_graph, CycleNode, ContextGraph
except ImportError:
    # Inline import from sibling
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "session_chain",
        SCRIPT_DIR / "session-chain" / "session_chain.py"
    )
    session_chain = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(session_chain)
    CycleNode = session_chain.CycleNode
    ContextGraph = session_chain.ContextGraph
    load_cycles = session_chain.load_cycles
    build_context_graph = session_chain.build_context_graph

# ─── Paths ────────────────────────────────────────────────────────

STATE_DIR = Path.home() / ".5qln"
SEASONS_FILE = STATE_DIR / "seasons.json"
DORMANCY_DAYS = 30  # Days without new cycles before a season goes dormant


# ─── Season Model ─────────────────────────────────────────────────

class Branch:
    def __init__(self, branch_id: str, parent_residue_id: str,
                 first_residue_id: str, spark_question: str,
                 season_id: str = "", status: str = "active", depth: int = 0):
        self.id = branch_id
        self.parent_residue_id = parent_residue_id
        self.first_residue_id = first_residue_id
        self.spark_question = spark_question
        self.season_id = season_id
        self.status = status
        self.depth = depth

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "parent_residue_id": self.parent_residue_id,
            "first_residue_id": self.first_residue_id,
            "spark_question": self.spark_question,
            "season_id": self.season_id,
            "status": self.status,
            "depth": self.depth,
        }


class BranchPoint:
    def __init__(self, bp_id: str, parent_node: CycleNode | None = None):
        self.id = bp_id
        if parent_node is not None:
            self.parent_cycle = parent_node.cycle_num
            self.parent_return_question = parent_node.return_question or ""
        else:
            self.parent_cycle = 0
            self.parent_return_question = ""
        self.branches: list[Branch] = []
        self.resolution: str = "open"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "parent_cycle": self.parent_cycle,
            "parent_return_question": self.parent_return_question,
            "branches": [b.to_dict() for b in self.branches],
            "resolution": self.resolution,
        }


class Season:
    def __init__(self, season_id: str, name: str = ""):
        self.id = season_id
        self.name = name
        self.description = ""
        self.root_cycle: int = 0
        self.cycle_indices: list[int] = []
        self.branch_points: list[BranchPoint] = []
        self.status: str = "active"
        self.opened_at: str = ""
        self.closed_at: str | None = None

    @property
    def total_cycles(self) -> int:
        return len(self.cycle_indices)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "root_cycle": self.root_cycle,
            "cycles": self.cycle_indices,
            "branch_points": [bp.to_dict() for bp in self.branch_points],
            "status": self.status,
            "opened_at": self.opened_at,
            "closed_at": self.closed_at,
            "total_cycles": self.total_cycles,
        }


class MasterChain:
    def __init__(self):
        self.seasons: list[Season] = []
        self.nodes: list[CycleNode] = []
        self.graph: Optional[ContextGraph] = None

    @property
    def active_season(self) -> Optional[Season]:
        for s in self.seasons:
            if s.status == "active":
                return s
        return None

    @property
    def dormant_seasons(self) -> list[Season]:
        return [s for s in self.seasons if s.status == "dormant"]

    @property
    def archived_seasons(self) -> list[Season]:
        return [s for s in self.seasons if s.status == "archived"]

    @property
    def lineage_depth(self) -> int:
        total = 0
        for s in self.seasons:
            total += s.total_cycles
        return total


# ─── Load / Save Seasons ─────────────────────────────────────────

def load_seasons() -> MasterChain:
    """Load seasons from disk, or build fresh from the context graph."""
    mc = MasterChain()

    if SEASONS_FILE.exists():
        with open(SEASONS_FILE) as f:
            data = json.load(f)
        for sdata in data.get("seasons", []):
            s = Season(sdata["id"], sdata.get("name", ""))
            s.description = sdata.get("description", "")
            s.root_cycle = sdata.get("root_cycle", 0)
            s.cycle_indices = sdata.get("cycles", [])
            s.status = sdata.get("status", "active")
            s.opened_at = sdata.get("opened_at", "")
            s.closed_at = sdata.get("closed_at")
            # Reconstruct branch points
            for bp_data in sdata.get("branch_points", []):
                bp = BranchPoint(bp_data["id"], None)  # parent_node restored lazily
                bp.parent_cycle = bp_data["parent_cycle"]
                bp.parent_return_question = bp_data.get("parent_return_question", "")
                bp.resolution = bp_data.get("resolution", "open")
                for b_data in bp_data.get("branches", []):
                    branch = Branch(
                        b_data["id"],
                        b_data["parent_residue_id"],
                        b_data["first_residue_id"],
                        b_data.get("spark_question", ""),
                        b_data.get("season_id", ""),
                        b_data.get("status", "active"),
                        b_data.get("depth", 0),
                    )
                    bp.branches.append(branch)
                s.branch_points.append(bp)
            mc.seasons.append(s)

    # Load actual cycle nodes from journal
    mc.nodes = load_cycles()
    mc.graph = build_context_graph(mc.nodes)

    # Auto-detect dormancy
    _update_dormancy(mc)

    return mc


def save_seasons(mc: MasterChain):
    """Save seasons to disk."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "seasons": [s.to_dict() for s in mc.seasons],
    }
    with open(SEASONS_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _update_dormancy(mc: MasterChain):
    """Mark seasons as dormant if no new cycles in DORMANCY_DAYS."""
    now = datetime.now(timezone.utc)
    for season in mc.seasons:
        if season.status != "active":
            continue
        # Check if most recent cycle in this season is older than threshold
        if season.cycle_indices and mc.nodes:
            last_idx = max(season.cycle_indices)
            if last_idx < len(mc.nodes):
                last_node = mc.nodes[last_idx]
                if last_node.timestamp:
                    try:
                        last_ts = datetime.fromisoformat(last_node.timestamp)
                        if (now - last_ts) > timedelta(days=DORMANCY_DAYS):
                            season.status = "dormant"
                    except ValueError:
                        pass


# ─── Auto-build Seasons ───────────────────────────────────────────

def auto_build_seasons(mc: MasterChain) -> MasterChain:
    """Build seasons from the context graph if none exist."""
    if mc.seasons:
        return mc

    if not mc.nodes:
        return mc

    # Walk roots to build seasons
    for root in mc.graph.roots:
        season_id = _season_id_from_root(root)
        season = Season(season_id)
        season.root_cycle = root.cycle_num
        season.opened_at = root.timestamp or datetime.now(timezone.utc).isoformat()
        season.status = "active"

        # Walk the chain from root
        _walk_chain_to_season(root, season, mc)

        if season.total_cycles > 0:
            mc.seasons.append(season)

    save_seasons(mc)
    return mc


def _season_id_from_root(node: CycleNode) -> str:
    """Generate a season ID from the root's alpha or X."""
    base = node.alpha or node.X or f"cycle-{node.cycle_num}"
    # Slugify
    slug = base.lower().strip()[:40]
    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in slug)
    slug = slug.strip("-")
    if not slug:
        slug = f"season-{node.cycle_num}"
    h = hashlib.sha256(str(node.cycle_num).encode()).hexdigest()[:8]
    return f"{slug}-{h}"


def _walk_chain_to_season(node: CycleNode, season: Season, mc: MasterChain):
    """Recursively add nodes to a season, detecting branch points."""
    season.cycle_indices.append(node.index)

    if node.is_branch_point:
        bp = BranchPoint(f"bp-{node.cycle_num}", node)
        for i, child in enumerate(node.children):
            branch_id = f"br-{node.cycle_num}-{i}"
            branch = Branch(
                branch_id=branch_id,
                parent_residue_id=f"cycle-{node.cycle_num}",
                first_residue_id=f"cycle-{child.cycle_num}",
                spark_question=child.X or "",
                season_id="",
                depth=1,
            )
            bp.branches.append(branch)

            # Create a new season for each branch
            child_season_id = _season_id_from_root(child)
            child_season = Season(child_season_id)
            child_season.root_cycle = child.cycle_num
            child_season.opened_at = child.timestamp or datetime.now(timezone.utc).isoformat()
            child_season.status = "active"
            branch.season_id = child_season_id

            _walk_chain_to_season(child, child_season, mc)
            if child_season.total_cycles > 0:
                mc.seasons.append(child_season)

        season.branch_points.append(bp)
        return

    # Single child — continue in same season
    for child in node.children:
        _walk_chain_to_season(child, season, mc)


# ─── Commands ─────────────────────────────────────────────────────

def cmd_list(mc: MasterChain):
    """List all seasons."""
    if not mc.seasons:
        print("No seasons found. Run 'auto-build' to create from journal.")
        return

    print("━━━ SEASONS ━━━")
    for s in mc.seasons:
        marker = ""
        if s.status == "active":
            marker = "●"
        elif s.status == "dormant":
            marker = "○"
        elif s.status == "closed":
            marker = "◉"
        elif s.status == "archived":
            marker = "⊗"

        name = s.name or s.id[:40]
        print(f"  {marker} [{s.id[:12]}...] {name}")
        print(f"     {s.total_cycles} cycles · {s.status} · root=C{s.root_cycle}")


def cmd_show(mc: MasterChain, season_id: str):
    """Show detailed season report."""
    season = None
    for s in mc.seasons:
        if s.id.startswith(season_id) or s.id == season_id:
            season = s
            break

    if not season:
        print(f"Season not found: {season_id}")
        return

    print(f"━━━ SEASON: {season.name or season.id[:40]} ━━━")
    print(f"ID:          {season.id}")
    print(f"Status:      {season.status}")
    print(f"Root cycle:  {season.root_cycle}")
    print(f"Total cycles: {season.total_cycles}")
    print(f"Opened:      {season.opened_at[:19] if season.opened_at else 'unknown'}")
    if season.closed_at:
        print(f"Closed:      {season.closed_at[:19]}")
    if season.description:
        print(f"\n{season.description}")
    print()

    # Show cycles
    print("── CYCLES ──")
    for idx in season.cycle_indices:
        if idx < len(mc.nodes):
            node = mc.nodes[idx]
            print(f"  {node.summary()}")
    print()

    # Show branch points
    if season.branch_points:
        print("── BRANCH POINTS ──")
        for bp in season.branch_points:
            print(f"  ┌─ BP at C{bp.parent_cycle}: ∞0' = \"{bp.parent_return_question[:60]}...\"")
            for branch in bp.branches:
                print(f"  │  ├─ {branch.id}: \"{branch.spark_question[:50]}\" → season {branch.season_id[:12]}...")
            print(f"  └─ Resolution: {bp.resolution}")

    # Last return question for next session
    if season.cycle_indices:
        last_idx = max(season.cycle_indices)
        if last_idx < len(mc.nodes):
            last = mc.nodes[last_idx]
            if last.return_question:
                print(f"\n∞0' (last): \"{last.return_question}\"")


def cmd_close(mc: MasterChain, season_id: str):
    """Close a season."""
    for s in mc.seasons:
        if s.id.startswith(season_id) or s.id == season_id:
            s.status = "closed"
            s.closed_at = datetime.now(timezone.utc).isoformat()
            save_seasons(mc)
            print(f"Season closed: {s.name or s.id[:40]}")
            return
    print(f"Season not found: {season_id}")


def cmd_name(mc: MasterChain, season_id: str, name: str):
    """Name a season."""
    for s in mc.seasons:
        if s.id.startswith(season_id) or s.id == season_id:
            s.name = name
            save_seasons(mc)
            print(f"Season named: \"{name}\"")
            return
    print(f"Season not found: {season_id}")


def cmd_archive(mc: MasterChain, season_id: str):
    """Archive a season."""
    for s in mc.seasons:
        if s.id.startswith(season_id) or s.id == season_id:
            s.status = "archived"
            save_seasons(mc)
            print(f"Season archived: {s.name or s.id[:40]}")
            return
    print(f"Season not found: {season_id}")


def cmd_branches(mc: MasterChain):
    """Show all open branches across all seasons."""
    open_branches = []
    for s in mc.seasons:
        for bp in s.branch_points:
            for branch in bp.branches:
                if branch.status == "active":
                    open_branches.append((s, bp, branch))

    if not open_branches:
        print("No open branches.")
        return

    print("━━━ OPEN BRANCHES ━━━")
    for s, bp, branch in open_branches:
        print(f"  Season: {s.name or s.id[:40]}")
        print(f"    Parent: C{bp.parent_cycle} ∞0': \"{bp.parent_return_question[:60]}...\"")
        print(f"    Branch: {branch.id} → \"{branch.spark_question[:60]}\"")
        print(f"    Target season: {branch.season_id[:12]}...")
        print()


def cmd_master_chain(mc: MasterChain):
    """Show the full master chain across all seasons."""
    print("━━━ MASTER CHAIN ━━━")
    print(f"Total seasons:  {len(mc.seasons)}")
    print(f"Active:         {mc.active_season.name if mc.active_season else 'none'}")
    print(f"Dormant:        {len(mc.dormant_seasons)}")
    print(f"Archived:       {len(mc.archived_seasons)}")
    print(f"Lineage depth:  {mc.lineage_depth}")
    print()

    # Chronological order
    ordered = sorted(mc.seasons, key=lambda s: s.opened_at if s.opened_at else "")
    for s in ordered:
        marker = {"active": "●", "dormant": "○", "closed": "◉", "archived": "⊗"}.get(s.status, "?")
        name = s.name or s.id[:40]
        print(f"  {marker} {name} ({s.total_cycles} cycles, {s.status})")


def cmd_auto_build(mc: MasterChain):
    """Auto-build seasons from the context graph."""
    mc = auto_build_seasons(mc)
    print(f"Built {len(mc.seasons)} season(s) from {len(mc.nodes)} cycle(s).")
    cmd_list(mc)


# ─── Main ─────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    mc = load_seasons()

    if not args:
        cmd_list(mc)
        return

    command = args[0]

    if command == "list":
        cmd_list(mc)

    elif command == "show" and len(args) >= 2:
        cmd_show(mc, args[1])

    elif command == "close" and len(args) >= 2:
        cmd_close(mc, args[1])

    elif command == "name" and len(args) >= 3:
        cmd_name(mc, args[1], " ".join(args[2:]))

    elif command == "archive" and len(args) >= 2:
        cmd_archive(mc, args[1])

    elif command == "branches":
        cmd_branches(mc)

    elif command == "master-chain":
        cmd_master_chain(mc)

    elif command == "auto-build":
        cmd_auto_build(mc)

    elif command == "--json":
        data = {
            "seasons": [s.to_dict() for s in mc.seasons],
            "lineage_depth": mc.lineage_depth,
        }
        print(json.dumps(data, indent=2, ensure_ascii=False))

    elif command == "--mermaid":
        # Use session_chain's mermaid formatter
        if mc.graph:
            print(session_chain.format_mermaid(mc.graph))

    else:
        print(__doc__)


if __name__ == "__main__":
    main()
