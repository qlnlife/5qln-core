#!/usr/bin/env node
// 5QLN membrane-watcher CLI wrapper for the Claude Code plugin.
//
// Usage:
//   echo "text" | node .claude/scripts/audit.mjs [--phase S|G|Q|P|V] [--json]
//   node .claude/scripts/audit.mjs --text "..."  [--phase P] [--json]
//
// Exit: 0 on success (clean or flagged), 2 on usage/runtime error.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { appendAuditLog } from './log.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const distPath = resolve(repoRoot, 'dist', 'index.js');

let mod;
try {
  mod = await import(distPath);
} catch (e) {
  console.error(`[5qln] dist not found at ${distPath}.`);
  console.error(`[5qln] run: npm run build`);
  process.exit(2);
}
const { MembraneWatcher, PHASES } = mod;

const args = process.argv.slice(2);
let phase = 'P';
let json = false;
let text = null;
let noLog = false;
let source = 'audit';
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--phase') phase = args[++i];
  else if (a === '--json') json = true;
  else if (a === '--text') text = args[++i];
  else if (a === '--no-log') noLog = true;
  else if (a === '--source') source = args[++i];
  else if (a === '--help' || a === '-h') {
    console.log('Usage: audit.mjs [--phase S|G|Q|P|V] [--text "..."] [--json] [--no-log] [--source <tag>]');
    process.exit(0);
  }
}

if (!PHASES.includes(phase)) {
  console.error(`[5qln] invalid phase "${phase}". Expected one of ${PHASES.join(', ')}.`);
  process.exit(2);
}

if (text === null) {
  text = readFileSync(0, 'utf8');
}
if (!text.trim()) {
  console.error('[5qln] no text provided (stdin empty and no --text arg).');
  process.exit(2);
}

const result = new MembraneWatcher().audit(text, phase);

if (!noLog) {
  appendAuditLog({ source, phase, result, text });
}

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(result.summary);
if (!result.clean) {
  for (const f of result.flags) {
    console.log('');
    console.log(`  ${f.code} · ${f.name}  [${f.confidence}]`);
    console.log(`    matched : ${JSON.stringify(f.matchedText)}`);
    console.log(`    meaning : ${f.meaning}`);
    console.log(`    recovery: ${f.recovery}`);
  }
}
process.exit(0);
