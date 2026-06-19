#!/usr/bin/env node
// 5QLN Stop hook — audits the last assistant message after every turn.
//
// Reads Claude Code Stop-event JSON on stdin, locates the transcript,
// extracts the most recent assistant text, and runs MembraneWatcher.
// Prints a one-line warning if any medium+ confidence flags fired.
// Always exits 0 — informational only, never blocks.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const MIN_TEXT_LEN = 80;
const PHASE = 'P';
const MIN_CONFIDENCE = 'medium';

function safeExit() { process.exit(0); }

let payload = {};
try {
  const raw = readFileSync(0, 'utf8');
  if (raw.trim()) payload = JSON.parse(raw);
} catch { /* ignore */ }

const transcriptPath = payload.transcript_path;
if (!transcriptPath) safeExit();

let transcriptLines;
try {
  transcriptLines = readFileSync(transcriptPath, 'utf8')
    .split('\n')
    .filter(Boolean);
} catch {
  safeExit();
}

// Walk from the end; find the most recent assistant text content.
let lastText = null;
for (let i = transcriptLines.length - 1; i >= 0 && lastText === null; i--) {
  let evt;
  try { evt = JSON.parse(transcriptLines[i]); } catch { continue; }
  if (evt.type !== 'assistant') continue;
  const content = evt?.message?.content;
  if (!Array.isArray(content)) continue;
  const texts = content
    .filter(c => c && c.type === 'text' && typeof c.text === 'string')
    .map(c => c.text);
  if (texts.length === 0) continue;
  lastText = texts.join('\n');
}

if (!lastText || lastText.trim().length < MIN_TEXT_LEN) safeExit();

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const distPath = resolve(repoRoot, 'dist', 'index.js');

let mod;
try { mod = await import(distPath); } catch { safeExit(); }
const { MembraneWatcher } = mod;

const watcher = new MembraneWatcher();
const result = watcher.audit(lastText, PHASE);
const filtered = watcher.filterConfidence(result, MIN_CONFIDENCE);

if (filtered.clean) safeExit();

console.log('');
console.log(`[5qln-watch] ⚠ ${filtered.summary}`);
for (const f of filtered.flags) {
  console.log(`  ${f.code}  ${f.name}  [${f.confidence}]`);
  console.log(`     matched: ${JSON.stringify(f.matchedText)}`);
}
console.log(`  (run /5qln-audit for full meaning + recovery)`);
console.log('');
safeExit();
