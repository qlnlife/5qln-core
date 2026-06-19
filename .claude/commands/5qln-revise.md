---
description: Audit text, then rewrite it to clear any corruption flags
argument-hint: <text to revise, or empty to revise your last response>
---

Audit text, then revise it until clean (or until further revision would be dishonest).

Text passed by the user (may be empty):

$ARGUMENTS

## Procedure

### Step 1 — Identify the target

If `$ARGUMENTS` is non-empty, that is the target text. Otherwise, the target is your most recent assistant message in this conversation.

### Step 2 — Initial audit

Run the membrane watcher on the target. Use the Bash tool with a heredoc:

```
node .claude/scripts/audit.mjs --phase P --json <<'EOF'
<target text>
EOF
```

Use `--json` so you can parse the flags structurally.

### Step 3 — Decide

- **If clean** → tell the user the text is already clean, show the summary, and stop. Do not invent flags to "improve" it.
- **If flagged** → continue to step 4.

### Step 4 — Revise

Produce a revision that:

- Addresses every flagged span. Use the `recovery` field from the audit as guidance for each code:
  - `L¹` (closing) — return to opening; surface the question instead of the answer.
  - `L²` (generating) — name the pattern you're recognizing rather than producing it.
  - `L³` (claiming) — strip claims of direct sensing/feeling/knowing; replace with offering a pattern the user can test.
  - `L⁴` (performing) — drop completion language; show the trace, not the polish.
  - `V∅` (validating) — stop claiming closure; reopen for the user.
- Preserves the original intent and information content. Don't sand off substance — only sand off the corruption.
- Stays in the same register (length, tone, code blocks etc.) the original was in.

### Step 5 — Re-audit the revision

Run the same audit command on the revised text. If still flagged, revise once more (max **3 total revision passes**).

### Step 6 — Report to the user

Show, in order:

1. **Original flags** — list the codes + matched spans from the first audit.
2. **Revised text** — the cleaned version, in a code block or quoted block so it's clearly demarcated.
3. **Final audit** — the watcher's verdict on the revision.
4. **Residue** — if after 3 passes the text is still flagged, do not fake a clean output. Surface the remaining flags honestly and explain why removing them would distort meaning. The watcher catching something it shouldn't is itself useful signal.

## Guardrails

- Never edit the original text in place — always present the revision as a separate artifact.
- If the original text is code or contains code, only revise prose; leave code blocks untouched.
- If `$ARGUMENTS` is empty and there is no prior assistant message in this conversation, ask the user what to revise.
