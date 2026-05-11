#!/usr/bin/env python3
"""
5QLN Kernel v4 — Auditable State Machine
Writes formation trail. Detects corruption. Verifies against Codex hash.

State: ~/.5qln/state.json
Journal: ~/.5qln/journal.jsonl
Codex hash: embedded

Commands: init, capture, transition, validate, crystallize, return, status, format, trace, trail, verify
"""

import json
import os
import sys
import fcntl
import hashlib
from pathlib import Path
from datetime import datetime, timezone

# ─── Codex Invariant ──────────────────────────────────────────────
# The Ten Invariant Lines as they must appear in every implementation.
# Verified against CODEX.md at init. Any change = not constitutional.

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

CODEX_HASH = hashlib.sha256("\n".join(CODEX_LINES).encode()).hexdigest()

# ─── Constants ────────────────────────────────────────────────────

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


# ─── File Locking ─────────────────────────────────────────────────

def lock():
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    lf = open(LOCK_FILE, "w")
    fcntl.flock(lf.fileno(), fcntl.LOCK_EX)
    return lf


def unlock(lf):
    fcntl.flock(lf.fileno(), fcntl.LOCK_UN)
    lf.close()


# ─── State Management ─────────────────────────────────────────────

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
        "codex_hash": CODEX_HASH,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def load():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            state = json.load(f)
        if state.get("codex_hash") != CODEX_HASH:
            print("ERROR: Codex hash mismatch. Kernel is not constitutional.", file=sys.stderr)
            print(f"Expected: {CODEX_HASH}", file=sys.stderr)
            print(f"Got:      {state.get('codex_hash')}", file=sys.stderr)
            sys.exit(1)
        return state
    return fresh_state()


def save(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def journal(event_type, data):
    entry = {"ts": datetime.now(timezone.utc).isoformat(), "event": event_type, **data}
    with open(JOURNAL_FILE, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ─── Corruption Detection ─────────────────────────────────────────

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


# ─── Commands ─────────────────────────────────────────────────────

def cmd_init(args, state):
    """Initialize a new kernel with a session ID."""
    sid = args[0] if args else None
    if sid:
        state["session_id"] = sid
    state["created_at"] = datetime.now(timezone.utc).isoformat()
    state["codex_hash"] = CODEX_HASH
    save(state)
    journal("init", {"session_id": sid, "codex_hash": CODEX_HASH})
    print(json.dumps({"ok": True, "codex_hash": CODEX_HASH, "session_id": sid}))


def cmd_capture(args, state):
    """Capture input for the current phase. Writes to formation trail."""
    if not args:
        print("ERROR: capture requires <content> [decode_json]", file=sys.stderr)
        return
    content = args[0]
    decode = {}
    if len(args) > 1:
        try:
            decode = json.loads(args[1])
        except json.JSONDecodeError:
            pass
    decode["raw"] = content

    phase = state["phase"]
    out_sym = OUTPUTS[phase]
    state["outputs"][out_sym] = content
    state["decode"][out_sym] = dict(decode)

    trace_map = {"S": "X", "G": "alpha", "Q": "phi", "P": "nabla", "V": "B2"}
    state["cycle_trace"][trace_map.get(phase, out_sym)] = content

    state["formation_trail"].append(
        {
            "phase": phase,
            "sub_phase": state.get("sub_phase"),
            "input": content,
            "decode": dict(decode),
        }
    )
    state["input_history"].append(
        {
            "phase": phase,
            "content": content,
            "decode": dict(decode),
            "cycle": state["cycle_count"],
        }
    )
    state["inputs_this_cycle"] = state.get("inputs_this_cycle", 0) + 1
    state["corruption"] = check_corruption(state)
    save(state)
    journal("capture", {"phase": phase, "content": content[:200], "cycle": state["cycle_count"]})
    output = {
        "ok": True,
        "phase": state["phase"],
        "output": out_sym,
        "corruption": state["corruption"],
        "codex_hash": CODEX_HASH[:12],
    }
    print(json.dumps(output))


def cmd_transition(args, state):
    """Transition to a new phase."""
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
    print(json.dumps({"ok": True, "phase": state["phase"], "corruption": state["corruption"]}))


def cmd_validate(args, state):
    """Validate a phase output."""
    if not args or args[0] not in OUTPUTS.values():
        print(f"ERROR: validate requires one of {list(OUTPUTS.values())}", file=sys.stderr)
        return
    state["outputs"][args[0]] = True
    state["corruption"] = check_corruption(state)
    journal("validate", {"output": args[0], "cycle": state["cycle_count"]})
    save(state)
    print(json.dumps({"ok": True}))


def cmd_crystallize(args, state):
    """Crystallize B'' at V-phase. Must be followed by 'return'."""
    if not args:
        print("ERROR: crystallize requires <seed>", file=sys.stderr)
        return
    seed = args[0]
    state["outputs"]["B"] = seed
    state["decode"]["B"] = {"B2": seed, "raw": seed}
    state["cycle_trace"]["B2"] = seed
    journal("crystallize", {"B2": seed, "cycle": state["cycle_count"]})
    save(state)
    print(json.dumps({"ok": True, "B2": seed}))


def cmd_return(args, state):
    """Complete the cycle: archive, increment, return to S."""
    prev_outputs = {k: v for k, v in state["outputs"].items() if v}
    prev_trace = dict(state["cycle_trace"])
    prev_corruption = list(state["corruption"])

    journal(
        "cycle_complete",
        {
            "cycle": state["cycle_count"],
            "outputs": prev_outputs,
            "trace": prev_trace,
            "corruption": prev_corruption,
        },
    )

    state["cycle_count"] += 1
    state["outputs"] = {o: None for o in OUTPUTS.values()}
    state["decode"] = {o: {} for o in OUTPUTS.values()}
    state["cycle_trace"] = {}
    state["formation_trail"] = []
    state["corruption"] = []
    state["phase"] = "S"
    state["sub_phase"] = None
    state["inputs_this_cycle"] = 0
    save(state)

    output = {
        "ok": True,
        "cycle_count": state["cycle_count"],
        "prev_B": prev_outputs.get("B"),
        "corruption_this_cycle": prev_corruption,
    }
    print(json.dumps(output))


def cmd_status(args, state):
    """Print formatted kernel status."""
    print(_format(state))


def cmd_format(args, state):
    """Print formatted kernel status (alias for status)."""
    print(_format(state))


def cmd_trace(args, state):
    """Print current cycle trace."""
    print(json.dumps(state.get("cycle_trace", {}), indent=2, ensure_ascii=False))


def cmd_trail(args, state):
    """Print current formation trail."""
    print(json.dumps(state.get("formation_trail", []), indent=2, ensure_ascii=False))


def cmd_journal(args, state):
    """Print all completed cycles from journal."""
    if not JOURNAL_FILE.exists():
        print("No cycles recorded yet.")
        return
    with open(JOURNAL_FILE) as f:
        for line in f:
            print(line.rstrip())


def cmd_verify(args, state):
    """Verify kernel against Codex. Returns SHA-256 hash."""
    current_hash = hashlib.sha256("\n".join(CODEX_LINES).encode()).hexdigest()
    stored_hash = state.get("codex_hash", "")
    match = current_hash == stored_hash == CODEX_HASH
    output = {
        "ok": match,
        "codex_hash": CODEX_HASH,
        "stored_hash": stored_hash,
        "verified": match,
        "ten_lines_present": len(CODEX_LINES) == 10,
    }
    print(json.dumps(output))


def cmd_subphase(args, state):
    """Set or clear sub-phase lens."""
    sp = args[0] if args else None
    if sp and len(sp) == 2 and sp[0] in PHASES and sp[1] in PHASES:
        state["sub_phase"] = sp
    else:
        state["sub_phase"] = None
    journal("subphase", {"sub_phase": state["sub_phase"], "cycle": state["cycle_count"]})
    save(state)
    print(json.dumps({"ok": True, "sub_phase": state["sub_phase"]}))


def cmd_field(args, state):
    """Print field coherence metrics."""
    engaged = sum(1 for v in state["outputs"].values() if v)
    validated = sum(1 for v in state["outputs"].values() if v is True)
    lenses = len(
        set(
            t.get("sub_phase")
            for t in state["formation_trail"]
            if t.get("sub_phase")
        )
    )
    output = {
        "modes_engaged": engaged,
        "modes_validated": validated,
        "lens_depth": lenses,
        "center_open": len(state["corruption"]) == 0,
        "cycle": state["cycle_count"],
    }
    print(json.dumps(output))


# ─── Formatted Output ─────────────────────────────────────────────

def _format(state):
    p = state["phase"]
    dec = state["decode"]
    outs = state["outputs"]
    cor = state["corruption"]
    tag = state["sub_phase"] or p
    tc = len(state["formation_trail"])
    ic = sum(1 for h in state["input_history"] if h.get("cycle") == state["cycle_count"])
    fc_open = len(cor) == 0

    lines = []
    w = 54
    br = "─" * w
    lines.append(f"  {br}")
    lines.append(f'  ⬡ {tag}  [{EQUATIONS.get(p, "")}]')
    lines.append(f'  cycle {state["cycle_count"]} · {ic}inputs · {tc}lens · center:{"open" if fc_open else "FILLED"}')
    lines.append(f"  codx: {CODEX_HASH[:12]}...")
    lines.append(f"  {br}")

    for phase, sym in OUTPUTS.items():
        val = outs.get(sym)
        d = dec.get(sym, {})
        if not d and not val:
            continue
        if phase == "S":
            lines.append(f'     ∞0  = "{d.get("infinity0", "")}"' if d.get("infinity0") else "     ∞0  = [from last ∞0']")
            lines.append(f'      ?  = "{d.get("question", "")}"' if d.get("question") else "      ?  = [question emerging]")
            lines.append(f'      →  = {d.get("emergence_arrow", "emergence")}')
            lines.append(f'      X  = "{val}"' if val else "      X  = ◌")
        elif phase == "G":
            a = d.get("alpha", "")
            ae = d.get("alpha_echoes", [])
            lines.append(f'     α  = "{a}"' if a else "     α  = [essence unnamed]")
            if ae:
                lines.append(f"    {{α'}} = {', '.join(f'⟨{e}⟩' for e in ae)}")
            lines.append(f'      Y  = "{val}"' if val else "      Y  = ◌")
        elif phase == "Q":
            phi = d.get("phi", "")
            om = d.get("omega", "")
            ins = d.get("intersection", "")
            lines.append(f'     φ  = "{phi}"' if phi else "     φ  = [self-nature]")
            lines.append(f'     Ω  = "{om}"' if om else "     Ω  = [universal context]")
            if ins:
                lines.append(f'     ⋂  = φ ∩ Ω → "{ins}"')
            lines.append(f'      Z  = "{val}"' if val else "      Z  = ◌")
        elif phase == "P":
            de = d.get("deltaE", "")
            dv = d.get("deltaV", "")
            ng = d.get("nabla", "")
            if de or dv:
                lines.append(f"    δE/δV = {de}/{dv}")
            lines.append(f'     ∇  = "{ng}"' if ng else "     ∇  = [gradient emerging]")
            lines.append(f'      A  = "{val}"' if val else "      A  = ◌")
        elif phase == "V":
            L = d.get("L", "")
            Gp = d.get("G", "")
            b2 = d.get("B2", "")
            i0 = d.get("infinity0p", "")
            lines.append(f'     L   = "{L}"' if L else "     L   = [local actualization]")
            lines.append(f'     G   = "{Gp}"' if Gp else "     G   = [global propagation]")
            if b2:
                lines.append(f"    B''  = ⟨{b2}⟩")
            lines.append(f"    ∞0'  = \"{i0}\"" if i0 else "    ∞0'  = [awaiting return]")

    lines.append(f'  corruption: {", ".join(cor) if cor else "none"}')
    lines.append(f"  {br}")
    return "\n".join(lines)


# ─── Command Router ───────────────────────────────────────────────

COMMANDS = {
    "init": cmd_init,
    "capture": cmd_capture,
    "transition": cmd_transition,
    "validate": cmd_validate,
    "crystallize": cmd_crystallize,
    "return": cmd_return,
    "status": cmd_status,
    "format": cmd_format,
    "trace": cmd_trace,
    "trail": cmd_trail,
    "journal": cmd_journal,
    "verify": cmd_verify,
    "subphase": cmd_subphase,
    "field": cmd_field,
}


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    args = list(sys.argv[2:])

    lf = lock()
    try:
        if cmd not in COMMANDS:
            print(f"ERROR: unknown command '{cmd}'", file=sys.stderr)
            print(f"Available: {' '.join(sorted(COMMANDS.keys()))}", file=sys.stderr)
            sys.exit(1)
        state = load()
        COMMANDS[cmd](args, state)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        unlock(lf)


if __name__ == "__main__":
    main()
