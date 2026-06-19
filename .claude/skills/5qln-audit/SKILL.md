---
name: 5qln-audit
description: Audit a piece of text (typically your own draft response) against the 5QLN membrane watcher to detect corruption codes L¹–L⁴ and V∅. Use this before producing high-stakes answers, when uncertain about your own framing, or when the user explicitly asks for a self-check. Do NOT use it for trivia, code-only outputs with no prose, or when the user is just chatting.
---

# 5QLN self-audit

Run the membrane watcher against text and report findings.

## When to invoke

- The user asks you to "audit", "self-check", "5qln-check", "check for corruption", or similar.
- You are about to deliver a substantive answer in a context where the user has invoked 5QLN earlier in the conversation.
- You notice your own draft using language that hedges, performs, or claims completion without verification — and you want a deterministic second opinion.

Do not invoke for short factual answers, terminal commands, or pure code edits.

## How to invoke

Use the Bash tool. Pipe text via heredoc:

```
node .claude/scripts/audit.mjs --phase P <<'EOF'
<text to audit>
EOF
```

Phase argument:

- `S` — sense / opening
- `G` — ground / orient
- `Q` — question
- `P` — perform (default — most outputs)
- `V` — validate / close

Pick `P` unless the text is clearly opening a new line of inquiry (`S`/`Q`) or summing up (`V`).

For a structured result, add `--json`.

## How to report

- If clean: state that briefly and proceed.
- If flagged: list each code, the matched span, and the recovery move. Then either revise the draft and audit again, or hand control back to the user with the flags surfaced.

## Reference

Corruption codes:

- `L¹` — opening corruption (false start, unearned premise)
- `L²` — resonance corruption (forced agreement, mirroring without grounding)
- `L³` — sense corruption (claiming to perceive without checking)
- `L⁴` — performance corruption (output without formation)
- `V∅` — validation corruption (claiming completion without trace)
