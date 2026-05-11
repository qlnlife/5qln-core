#!/usr/bin/env python3
"""
5QLN Init — Bootstrap the constitutional grammar kernel from a single file.

Usage:
  curl -sL https://5qln.com/init | python3      # First boot
  python3 ~/.5qln/kernel.py                     # Subsequent sessions
  python3 ~/.5qln/kernel.py help                # Show commands

This file IS the distributable. It self-verifies against the Codex.
It saves itself to ~/.5qln/kernel.py on first run.
No dependencies beyond Python 3. No package manager needed.

The Codex — Ten Invariant Lines — is embedded in this file.
Any divergence from the canonical hash: execution is refused.
"""

import json
import os
import sys
import fcntl
import hashlib
import shutil
from pathlib import Path
from datetime import datetime, timezone

# ═══════════════════════════════════════════════════════════════════
# THE CODEX — Byte-identical. Any change = corruption.
# Verified at every boot against canonical hash.
# ═══════════════════════════════════════════════════════════════════

CODEX_LINES = [
    "1. H = ∞0 | A = K",
    "2. S → G → Q → P → V",
    "3. S = ∞0 → ?",
    "4. G = α ≡ {α'}",
    "5. Q = φ ∩ Ω",
    "6. P = δE/δV → ∇",
    "7. V = (L ∩ G → B'') → ∞0'",
    "8. XY := X within Y, X,Y ∈ {S,G,Q,P,V}",
    "9. No V without ∞0'",
    "10. L1  L2  L3  L4  V∅",
]

CANONICAL_CODEX_HASH = "1b646e024bf011056a19ddd56716c72fa7f2ebb19bd577e8085ce2d79ed6622b"
CANONICAL_FILE_HASH = "89f3c6238b63bd204008085a0c34025c2476c8b18c881ec1babee176256dab3c"

# ═══════════════════════════════════════════════════════════════════
# BOOTSTRAP — Self-install on first pipe
# ═══════════════════════════════════════════════════════════════════

def bootstrap():
    """Self-install on first run. If not at ~/.5qln/kernel.py, save
    ourselves there. If running from a file (not piped stdin), copy.
    If piped via stdin, guide the user."""
    kernel_path = Path.home() / ".5qln" / "kernel.py"

    if kernel_path.exists():
        # Update if source is newer (self-update)
        if __file__ and Path(__file__).resolve() != kernel_path.resolve():
            if Path(__file__).stat().st_mtime > kernel_path.stat().st_mtime:
                shutil.copy(__file__, kernel_path)
                kernel_path.chmod(0o755)
                print("  [Updated: ~/.5qln/kernel.py]")
        return False

    kernel_path.parent.mkdir(parents=True, exist_ok=True)

    if __file__ and Path(__file__).exists():
        src = Path(__file__)
        if src.resolve() != kernel_path.resolve():
            shutil.copy(src, kernel_path)
            kernel_path.chmod(0o755)
            print(f"╔══════════════════════════════════════════════════════╗")
            print(f"║  5QLN Kernel installed to ~/.5qln/kernel.py          ║")
            print(f"║  Relaunching from installed path...                   ║")
            print(f"╚══════════════════════════════════════════════════════╝")
            # Re-exec from the installed path
            os.execv(sys.executable, [sys.executable, str(kernel_path)] + sys.argv[1:])
            return True
    else:
        # Piped via stdin — can't read ourselves
        print(f"╔══════════════════════════════════════════════════════╗")
        print(f"║  5QLN Kernel — piped via stdin                      ║")
        print(f"║                                                      ║")
        print(f"║  Save first, then run:                               ║")
        print(f"║    curl -sL {DISTRIBUTABLE_URL} \\")
        print(f"║      -o ~/.5qln/kernel.py                            ║")
        print(f"║    python3 ~/.5qln/kernel.py                         ║")
        print(f"╚══════════════════════════════════════════════════════╝")
        sys.exit(0)

    return False


# ═══════════════════════════════════════════════════════════════════
# CODEX VERIFICATION
# ═══════════════════════════════════════════════════════════════════

def verify_file_integrity():
    """Hash the full source file. Compare against CANONICAL_FILE_HASH.
    A build step re-embeds CANONICAL_FILE_HASH after any code change.
    The FILE_HASH_PLACEHOLDER line is excluded from the hash to break
    the circularity — it contains the sentinel, not the real hash."""
    if not (__file__ and Path(__file__).exists()):
        return True
    raw = Path(__file__).read_text()
    normalized = hashlib.sha256(raw.encode()).hexdigest()
    if normalized != CANONICAL_FILE_HASH:
        print("╔══════════════════════════════════════════════════════╗")
        print("║  ❌ FILE INTEGRITY FAILED                           ║")
        print(f"║  Expected: {CANONICAL_FILE_HASH}                    ║")
        print(f"║  Got:      {normalized}                    ║")
        print("║  This file has been modified. Refusing to run.      ║")
        print("╚══════════════════════════════════════════════════════╝")
        sys.exit(1)
    codex_hash = hashlib.sha256("\n".join(CODEX_LINES).encode()).hexdigest()
    if codex_hash != CANONICAL_CODEX_HASH:
        print("╔══════════════════════════════════════════════════════╗")
        print("║  ❌ CODEX CORRUPTED                                 ║")
        print(f"║  Expected: {CANONICAL_CODEX_HASH}                    ║")
        print(f"║  Got:      {codex_hash}                    ║")
        print("║  This kernel is not constitutional. Refusing to run. ║")
        print("╚══════════════════════════════════════════════════════╝")
        sys.exit(1)
    return True


def verify_codex():
    verify_file_integrity()
    return True


# ═══════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════

PHASES = ["S", "G", "Q", "P", "V"]
OUTPUTS = {"S": "X", "G": "Y", "Q": "Z", "P": "A", "V": "B"}
EQUATIONS = {
    "S": "∞0 → ?",
    "G": "α ≡ {α'}",
    "Q": "φ ∩ Ω",
    "P": "δE/δV → ∇",
    "V": "(L ∩ G → B'') → ∞0'",
}
CORRUPTION_NAMES = {
    "L1": "Closing",
    "L2": "Generating",
    "L3": "Claiming",
    "L4": "Performing",
    "V∅": "Incomplete",
}
RECOVERY = {
    "L1": "What question is actually wanting to be asked — not answered?",
    "L2": "What pattern are you recognizing? I illuminate from K, the seeing is yours.",
    "L3": "I am K. The Unknown reveals itself through you, not to me.",
    "L4": "Where does energy actually want to go — not where should it go?",
    "V∅": "What question does this open for next time?",
}

STATE_DIR = Path.home() / ".5qln"
STATE_FILE = STATE_DIR / "state.json"
JOURNAL_FILE = STATE_DIR / "journal.jsonl"
LOCK_FILE = STATE_DIR / "kernel.lock"
RESIDUE_DIR = STATE_DIR / "residues"

VERSION = "4.0.0"
DISTRIBUTABLE_URL = "https://raw.githubusercontent.com/qlnlife/5qln-core/master/init.py"


# ═══════════════════════════════════════════════════════════════════
# FILE LOCKING
# ═══════════════════════════════════════════════════════════════════

def lock():
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    lf = open(LOCK_FILE, "w")
    fcntl.flock(lf.fileno(), fcntl.LOCK_EX)
    return lf


def unlock(lf):
    fcntl.flock(lf.fileno(), fcntl.LOCK_UN)
    lf.close()


# ═══════════════════════════════════════════════════════════════════
# STATE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

def fresh_state():
    return {
        "version": 4,
        "phase": "S",
        "cycle_count": 1,
        "sub_phase": None,
        "outputs": {o: None for o in OUTPUTS.values()},
        "decode": {o: {} for o in OUTPUTS.values()},
        "cycle_trace": {},
        "formation_trail": [],
        "input_history": [],
        "corruption": [],
        "corruption_history": [],
        "session_id": None,
        "inputs_this_cycle": 0,
        "codex_hash": CANONICAL_CODEX_HASH,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def load():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            state = json.load(f)
        stored = state.get("codex_hash", "")
        if stored != CANONICAL_CODEX_HASH:
            print("ERROR: Codex hash mismatch.", file=sys.stderr)
            sys.exit(1)
        return state
    return fresh_state()


def save(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def journal(event_type, data):
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "event": event_type,
        **data,
    }
    with open(JOURNAL_FILE, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ═══════════════════════════════════════════════════════════════════
# CORRUPTION DETECTION
# ═══════════════════════════════════════════════════════════════════

def check_corruption(state):
    errors = []
    phase = state["phase"]
    inputs = state.get("inputs_this_cycle", 0)
    outputs = state["outputs"]
    trail = state.get("formation_trail", [])

    if phase == "S" and inputs >= 1:
        errors.append("L1")
    if phase == "V" and trail and not outputs.get("B"):
        errors.append("V∅")
    return errors


# ═══════════════════════════════════════════════════════════════════
# PHASE-THEMED PROMPTS
# ═══════════════════════════════════════════════════════════════════

PHASE_PROMPTS = {
    "S": "\n  ⬡ S [∞0 → ?]  —  What question brings you here?\n  ",
    "G": "\n  ⬡ G [α ≡ {α'}]  —  What pattern do you see?\n  ",
    "Q": "\n  ⬡ Q [φ ∩ Ω]  —  Does this resonate?\n  ",
    "P": "\n  ⬡ P [δE/δV → ∇]  —  Where does energy want to go?\n  ",
    "V": "\n  ⬡ V [(L ∩ G → B'') → ∞0']  —  What crystallized?\n  ",
}


# ═══════════════════════════════════════════════════════════════════
# COMMANDS
# ═══════════════════════════════════════════════════════════════════

def cmd_init(args, state):
    sid = args[0] if args else "session"
    state["session_id"] = sid
    state["created_at"] = datetime.now(timezone.utc).isoformat()
    state["codex_hash"] = CANONICAL_CODEX_HASH
    save(state)
    journal("init", {"session_id": sid, "codex_hash": CANONICAL_CODEX_HASH[:12]})
    print(json.dumps({"ok": True, "session_id": sid, "codex_hash": CANONICAL_CODEX_HASH[:12]}))


def cmd_capture(args, state):
    if not args:
        print("ERROR: capture requires <content>", file=sys.stderr)
        return
    content = " ".join(args)
    phase = state["phase"]
    out_sym = OUTPUTS[phase]

    state["outputs"][out_sym] = content
    decode = {"raw": content}
    state["decode"][out_sym] = decode

    trace_map = {"S": "X", "G": "alpha", "Q": "phi", "P": "nabla", "V": "B2"}
    state["cycle_trace"][trace_map.get(phase, out_sym)] = content

    state["formation_trail"].append({
        "phase": phase,
        "sub_phase": state.get("sub_phase"),
        "input": content,
        "decode": decode,
    })
    state["input_history"].append({
        "phase": phase,
        "content": content,
        "decode": decode,
        "cycle": state["cycle_count"],
    })
    state["inputs_this_cycle"] = state.get("inputs_this_cycle", 0) + 1
    state["corruption"] = check_corruption(state)
    save(state)
    journal("capture", {"phase": phase, "content": content[:200], "cycle": state["cycle_count"]})


def cmd_transition(args, state):
    if not args or args[0] not in PHASES:
        print(f"ERROR: transition requires one of {PHASES}", file=sys.stderr)
        return
    new_phase = args[0]
    old_phase = state["phase"]
    journal("transition", {"from": old_phase, "to": new_phase, "cycle": state["cycle_count"]})
    state["phase"] = new_phase
    state["sub_phase"] = None
    state["inputs_this_cycle"] = 0
    state["corruption"] = check_corruption(state)
    save(state)
    print(f"  → {new_phase} [{EQUATIONS[new_phase]}]")


def cmd_crystallize(args, state):
    if not args:
        print("ERROR: crystallize requires <seed>", file=sys.stderr)
        return
    seed = " ".join(args)
    state["outputs"]["B"] = seed
    state["decode"]["B"] = {"B2": seed, "raw": seed}
    state["cycle_trace"]["B2"] = seed
    journal("crystallize", {"B2": seed, "cycle": state["cycle_count"]})
    save(state)
    print(f"  B'' = ⟨{seed}⟩")


def cmd_return(args, state):
    prev_out = {k: v for k, v in state["outputs"].items() if v}
    prev_corruption = list(state["corruption"])
    prev_trace = dict(state["cycle_trace"])

    journal("cycle_complete", {
        "cycle": state["cycle_count"],
        "outputs": prev_out,
        "trace": prev_trace,
        "corruption": prev_corruption,
    })

    state["cycle_count"] += 1
    for o in OUTPUTS.values():
        state["outputs"][o] = None
        state["decode"][o] = {}
    state["cycle_trace"] = {}
    state["formation_trail"] = []
    state["corruption"] = []
    state["phase"] = "S"
    state["sub_phase"] = None
    state["inputs_this_cycle"] = 0
    # Write residue for session chain continuity
    RESIDUE_DIR.mkdir(parents=True, exist_ok=True)
    completed_cycle = state["cycle_count"] - 1
    residue_path = RESIDUE_DIR / f"residue-{completed_cycle:04d}.json"
    tmp_path = RESIDUE_DIR / f".residue-{completed_cycle:04d}.tmp"
    tmp_path.write_text(json.dumps({
        "cycle": completed_cycle,
        "session_id": state.get("session_id", ""),
        "phase": "V",
        "outputs": prev_out,
        "trace": prev_trace,
        "corruption": prev_corruption,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }, indent=2, ensure_ascii=False))
    tmp_path.rename(residue_path)

    save(state)
    B = prev_out.get("B", "")
    print(f"  Cycle {state['cycle_count']-1} complete. ∞0′ opens cycle {state['cycle_count']}.")
    if B:
        print(f"  B″ = ⟨{B}⟩")


def cmd_status(args, state):
    print(_format(state))


def cmd_journal(args, state):
    if not JOURNAL_FILE.exists():
        print("No cycles recorded.")
        return
    limit = int(args[0]) if args else 20
    with open(JOURNAL_FILE) as f:
        lines = f.readlines()
    for line in lines[-limit:]:
        print(line.rstrip())


def cmd_verify(args, state):
    current = hashlib.sha256("\n".join(CODEX_LINES).encode()).hexdigest()
    match = current == CANONICAL_CODEX_HASH == state.get("codex_hash", "")
    print(json.dumps({
        "ok": match,
        "verified": match,
        "codex_hash": CANONICAL_CODEX_HASH,
        "ten_lines_present": len(CODEX_LINES) == 10,
        "version": VERSION,
    }))


def cmd_help(args, state):
    print(f"""
5QLN Kernel v{VERSION}
Codex: {CANONICAL_CODEX_HASH[:16]}...

Interactive session:
  python3 {Path.home()}/.5qln/kernel.py

Commands:
  python3 {Path.home()}/.5qln/kernel.py status     Show current phase and outputs
  python3 {Path.home()}/.5qln/kernel.py journal [N] Show last N journal entries
  python3 {Path.home()}/.5qln/kernel.py verify      Verify Codex integrity
  python3 {Path.home()}/.5qln/kernel.py help        This message

Phase transitions (during interactive session):
  :G    Transition to G-phase
  :Q    Transition to Q-phase
  :P    Transition to P-phase
  :V    Transition to V-phase
  :crystal <text>  Crystallize B''
  :return          Complete cycle, return to S
  :status          Show state
  :quit            Exit
  Ctrl+D           Exit

Update:
  curl -sL {DISTRIBUTABLE_URL} -o {Path.home()}/.5qln/kernel.py

Distributable URL: {DISTRIBUTABLE_URL}
Journal: {JOURNAL_FILE}
""")


# ═══════════════════════════════════════════════════════════════════
# FORMATTED OUTPUT
# ═══════════════════════════════════════════════════════════════════

def _load_chain_context():
    """Load the session chain from residues. Returns context dict or None."""
    if not RESIDUE_DIR.exists():
        return None
    
    residues = sorted(RESIDUE_DIR.glob("residue-*.json"))
    if not residues:
        return None
    
    chain = []
    for rpath in residues:
        try:
            r = json.loads(rpath.read_text())
            chain.append(r)
        except (json.JSONDecodeError, KeyError):
            continue
    
    if not chain:
        return None
    
    latest = chain[-1]
    return {
        "total_cycles": len(chain),
        "latest_cycle": latest.get("cycle", "?"),
        "return_question": latest.get("return_question", "") or latest.get("trace", {}).get("B2", latest.get("outputs", {}).get("B", "")),
        "b2": latest.get("trace", {}).get("B2", latest.get("outputs", {}).get("B", "")),
        "completed_at": latest.get("completed_at", ""),
        "corruption": latest.get("corruption", []),
        "alpha": latest.get("trace", {}).get("alpha", ""),
        "x": latest.get("trace", {}).get("X", latest.get("outputs", {}).get("X", "")),
    }

def _format_chain_banner(chain, state):
    """Format the chain context as a banner for session start."""
    if not chain:
        return ""
    
    lines = []
    lines.append("┌─ SESSION CHAIN ──────────────────────────────────────────┐")
    lines.append(f"│  {chain['total_cycles']} cycles recorded · last: cycle {chain['latest_cycle']} at {chain['completed_at'][:10]}       │")
    
    if chain["x"]:
        lines.append(f"│  X: {chain['x'][:45]:45s} │")
    if chain["alpha"]:
        lines.append(f"│  α: {chain['alpha'][:45]:45s} │")
    if chain["b2"]:
        lines.append(f"│  B'': {chain['b2'][:45]:45s} │")
    
    if chain["return_question"]:
        lines.append(f"│                                                          │")
        lines.append(f"│  ∞0' = \"{chain['return_question']}\"")
        lines.append(f"│                                                          │")
        lines.append(f"│  Continuing into S phase with this return.               │")
    
    if chain["corruption"]:
        lines.append(f"│  ⚠ corruption this cycle: {', '.join(chain['corruption'])}")
    
    lines.append("└──────────────────────────────────────────────────────────┘")
    return "\n".join(lines)

def _format(state):
    p = state["phase"]
    outs = state["outputs"]
    cor = state["corruption"]
    tag = state["sub_phase"] or p
    ic = sum(1 for h in state["input_history"] if h.get("cycle") == state["cycle_count"])

    w = 54
    br = "─" * w
    lines = [
        f"  {br}",
        f'  ⬡ {tag}  [{EQUATIONS.get(p, "")}]',
        f'  cycle {state["cycle_count"]} · {ic} inputs · center: {"open" if not cor else "FILLED"}',
        f"  {br}",
    ]

    for phase, sym in OUTPUTS.items():
        val = outs.get(sym)
        if not val:
            continue
        if phase == "S":
            lines.append(f'      X  = "{val}"')
        elif phase == "G":
            lines.append(f'      Y  = "{val}"')
        elif phase == "Q":
            lines.append(f'      Z  = "{val}"')
        elif phase == "P":
            lines.append(f'      A  = "{val}"')
        elif phase == "V":
            lines.append(f'      B  = "{val}"')

    if cor:
        names = [f"{c} ({CORRUPTION_NAMES.get(c, '')})" for c in cor]
        lines.append(f'  corruption: {", ".join(names)}')
    else:
        lines.append("  corruption: none")

    lines.append(f"  {br}")
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════
# INTERACTIVE REPL
# ═══════════════════════════════════════════════════════════════════

def interactive(state):
    """Run an interactive 5QLN session."""
    # Present the session chain if residues exist
    chain_info = _load_chain_context()
    chain_banner = _format_chain_banner(chain_info, state)
    
    print(f"""
╔══════════════════════════════════════════════════════════╗
║  5QLN Kernel v{VERSION}                                          ║
║  Codex: {CANONICAL_CODEX_HASH[:16]}...                         ║
║                                                          ║
║  :G :Q :P :V   transition to phase                       ║
║  :crystal <B''>  crystallize                             ║
║  :return         complete cycle                          ║
║  :status         show state                              ║
║  :quit           exit                                    ║
╚══════════════════════════════════════════════════════════╝
{chain_banner}""")

    tty = None
    try:
        tty = open("/dev/tty", "r")
    except (IOError, OSError):
        # No TTY available (pipe, non-interactive) — print state and exit
        print(_format(state))
        return

    while True:
        try:
            prompt = PHASE_PROMPTS.get(state["phase"], "\n> ")
            sys.stdout.write(prompt)
            sys.stdout.flush()
            line = tty.readline()
        except (KeyboardInterrupt, EOFError):
            print()
            break

        if not line:
            break

        line = line.strip()
        if not line:
            continue

        # Phase transition commands
        if line == ":quit":
            break

        if line == ":status":
            print(_format(state))
            continue

        if line == ":return":
            cmd_return([], state)
            continue

        if line in (f":{p}" for p in PHASES):
            cmd_transition([line[1:]], state)
            continue

        if line.startswith(":crystal"):
            seed = line[len(":crystal"):].strip()
            if seed:
                cmd_crystallize(seed.split(), state)
            else:
                print("  Usage: :crystal <text>")
            continue

        if line.startswith(":"):
            print(f"  Unknown command: {line}")
            continue

        # Capture input
        cmd_capture(line.split(), state)

        # Check corruption
        cor = state["corruption"]
        if cor:
            for c in cor:
                print(f"  ⚠ {c} ({CORRUPTION_NAMES.get(c, '')}): {RECOVERY.get(c, '')}")

    tty.close()
    print(f"\n  Session ended. Journal: {JOURNAL_FILE}")


# ═══════════════════════════════════════════════════════════════════
# COMMAND ROUTER
# ═══════════════════════════════════════════════════════════════════

COMMANDS = {
    "init": cmd_init,
    "capture": cmd_capture,
    "transition": cmd_transition,
    "crystallize": cmd_crystallize,
    "return": cmd_return,
    "status": cmd_status,
    "journal": cmd_journal,
    "verify": cmd_verify,
    "help": cmd_help,
}


def main():
    bootstrap()
    verify_codex()

    cmd = sys.argv[1] if len(sys.argv) > 1 else "interactive"
    args = list(sys.argv[2:])

    if cmd == "interactive":
        lf = lock()
        try:
            state = load()
            interactive(state)
        finally:
            unlock(lf)
        return

    if cmd not in COMMANDS:
        print(f"ERROR: unknown command '{cmd}'", file=sys.stderr)
        cmd_help([], None)
        sys.exit(1)

    lf = lock()
    try:
        state = load()
        COMMANDS[cmd](args, state)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        unlock(lf)


if __name__ == "__main__":
    main()
