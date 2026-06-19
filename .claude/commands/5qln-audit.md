---
description: Audit text with the 5QLN membrane watcher
argument-hint: <text to audit, or empty to audit your last response>
---

Run the 5QLN membrane watcher.

Text passed by the user (may be empty):

$ARGUMENTS

Procedure:

1. If the text above is non-empty, audit it. Otherwise, audit your most recent assistant message in this conversation.
2. Use the Bash tool to invoke the audit runner. Pipe text via heredoc to avoid quoting issues:

   ```
   node .claude/scripts/audit.mjs --phase P <<'EOF'
   <text here>
   EOF
   ```

   Default phase is `P` (perform). If the user specified a different phase in their command (e.g. "audit at phase Q: ..."), pass `--phase Q` instead.

3. Show the runner's stdout to the user verbatim.
4. If any flags fired, briefly explain in plain language what each corruption code means and what the recovery move would be. If clean, just confirm.
