// ═══════════════════════════════════════════════════════════════
// Example Pi extension — 5QLN constitutional governance
//
// Drop this file at:
//   ~/.pi/agent/extensions/5qln.ts        (user-global)
//   .pi/extensions/5qln.ts                (project-local)
//
// Then `npm install @5qln/core` in your project, or pin a path.
// Pi will auto-discover and load the extension on session start.
//
// What this enables:
//   • Tools     audit_membrane, session_flow, watcher_status
//   • Commands  /5qln, /5qln-codex, /5qln-transition,
//               /5qln-lens, /5qln-validate, /5qln-crystallize,
//               /5qln-integrity
//   • Auto-audit of every AI message_end with corruption notify.
//
// See skills/5qln-pi-orchestrate for the operating manual.
// ═══════════════════════════════════════════════════════════════

import { createPiExtension } from "@5qln/core";

// Simplest form — accept all defaults.
export default createPiExtension();

// Or, with options:
//
// export default createPiExtension({
//   minConfidence: "high",   // only flag clear corruption
//   autoAudit: true,         // audit every message_end (default)
//   statusKey: "5qln",       // key for the status widget (default)
// });
