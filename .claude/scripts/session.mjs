#!/usr/bin/env node
// 5QLN reference card — prints phases, formation states, corruption codes.

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const distPath = resolve(repoRoot, 'dist', 'index.js');

let mod;
try {
  mod = await import(distPath);
} catch (e) {
  console.error(`[5qln] dist not found at ${distPath}. run: npm run build`);
  process.exit(2);
}
const {
  PHASES,
  PHASE_INFO,
  FORMATION_STATES,
  CORRUPTION_CODES,
  CORRUPTION_MEANING,
  CORRUPTION_RECOVERY,
  PHASE_PATH,
} = mod;

console.log(`5QLN formation reference`);
console.log(`========================`);
console.log(`path: ${PHASE_PATH}`);
console.log('');
console.log('Phases:');
for (const p of PHASES) {
  const info = PHASE_INFO?.[p];
  console.log(`  ${p}  ${info?.name ?? ''}${info?.purpose ? ` — ${info.purpose}` : ''}`);
}
console.log('');
console.log(`Formation states: ${FORMATION_STATES.join(' → ')}`);
console.log('');
console.log('Corruption codes:');
for (const c of CORRUPTION_CODES) {
  console.log(`  ${c}  — ${CORRUPTION_MEANING[c]}`);
  console.log(`        recovery: ${CORRUPTION_RECOVERY[c]}`);
}
