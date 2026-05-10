// 5QLN audit log — shared append helper.
// Writes one JSON line per audit event to .5qln/log.jsonl at the repo root.
// Best-effort: logging failures never propagate to the caller.

import { mkdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export const LOG_DIR = resolve(repoRoot, '.5qln');
export const LOG_FILE = resolve(LOG_DIR, 'log.jsonl');

export function appendAuditLog({ source, phase, result, text, sessionId = null }) {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    const entry = {
      ts: new Date().toISOString(),
      session_id: sessionId,
      source,
      phase,
      clean: result.clean,
      flagCount: result.flags.length,
      flags: result.flags.map(f => ({
        code: f.code,
        name: f.name,
        matchedText: f.matchedText,
        confidence: f.confidence,
      })),
      textLen: text.length,
      textPreview: text.slice(0, 160).replace(/\s+/g, ' ').trim(),
      textHash: createHash('sha256').update(text).digest('hex').slice(0, 16),
    };
    appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch { /* best-effort */ }
}
