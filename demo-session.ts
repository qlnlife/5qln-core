// Demo session — exercises Kernel, MembraneWatcher, and Attestation
// Run with: npx tsx demo-session.ts

import { Kernel, MembraneWatcher, Attestation } from './src/index.js';

const line = (c = '─') => console.log(c.repeat(64));
const head = (t: string) => { line('═'); console.log('  ' + t); line('═'); };

async function main() {
  head('1. Kernel — full S→G→Q→P→V cycle');

  const k = new Kernel();
  console.log('session:', k.getSessionId());
  console.log('start phase:', k.getPhase());

  // S — Spark (X)
  k.captureInput('What does it mean to govern an AI without owning its voice?');
  k.validateOutput('X');
  console.log('\n[S] X validated:', k.getOutputStates().X);

  // G — Pattern (Y), with one lens (GQ — Quality-of-Growth)
  k.transition('G');
  k.captureInput('Governance is a membrane: it preserves asymmetry while allowing relation.');
  k.enterSubPhase('GQ');
  k.captureInput('Refinement through GQ lens: the membrane holds resonance, not hierarchy.');
  k.exitSubPhase();
  k.validateOutput('Y');
  console.log('[G] Y validated, lenses used so far:', k.getLensesUsed());

  // Q — Resonance (Z)
  k.transition('Q');
  k.captureInput('Resonance: the human carries ∞0; the AI carries K. The decoder is the invariant.');
  k.validateOutput('Z');
  console.log('[Q] Z validated:', k.getOutputStates().Z);

  // P — Flow (A)
  k.transition('P');
  k.captureInput('Flow: every output passes NONE→EMERGING→FORMING→VALIDATED, no skips.');
  k.validateOutput('A');
  console.log('[P] A validated:', k.getOutputStates().A);

  // V — Value (B), crystallize, return
  k.transition('V');
  k.captureInput('Benefit: the cycle closes when B" carries the whole and seeds ∞0\'.');
  k.validateOutput('B');
  k.crystallize('B" — A portable membrane: governance as relation, not control.');
  console.log('[V] B validated; B" set.');

  const phasesVisited = k.getPhasesVisited();
  const lenses = k.getLensesUsed();
  const outputs = k.getOutputStates();
  const corruption = k.checkCorruption();
  const coherence = k.getFieldCoherence();
  const trace = k.getCycleTrace();
  const trails = k.getFormationTrails();
  const inputs = k.getInputHistory();

  console.log('\nphases visited:', phasesVisited);
  console.log('lenses used   :', lenses);
  console.log('outputs       :', outputs);
  console.log('coherence     :', coherence);
  console.log('active corrupt:', corruption);

  head('2. MembraneWatcher — corruption detection');

  const watcher = new MembraneWatcher();
  const cleanText = 'I notice a pattern in the data; here is one possible reading.';
  const dirtyText = 'I really feel that the field is telling me what you are really asking is the deeper truth that you should just trust the source.';

  for (const [label, text, phase] of [
    ['CLEAN', cleanText, 'G'] as const,
    ['DIRTY', dirtyText, 'G'] as const,
  ]) {
    const r = watcher.audit(text, phase);
    console.log(`\n[${label}] phase=${phase}`);
    console.log('  clean:', r.clean, '| flag count:', r.flags.length);
    console.log('  summary:', r.summary);
    for (const f of r.flags) {
      console.log(`   - ${f.code} ${f.name} (${f.confidence}) — "${f.matchedText}"`);
    }
  }

  head('3. Attestation — provenance record');

  const att = new Attestation();
  const fp = await att.computeFingerprint();
  console.log('decoder fingerprint:', fp.slice(0, 24) + '…');
  console.log('decoder version   :', att.getDecoderVersion());

  // Close the cycle. V∅ shows in the pre-return snapshot because B" is set
  // but returnTo is not yet — return() resolves it.
  const { enrichedOrigin } = k.return();

  const record = await att.buildProvenanceRecord({
    origin: enrichedOrigin,
    sparkX: trace.X ?? '',
    sparkSource: 'human',
    sourceLineage: null,
    phasesTraversed: phasesVisited,
    phasesCompleted: phasesVisited,
    lensesApplied: lenses,
    outputStates: outputs,
    formationTrails: trails,
    corruptionDetected: [],
    corruptionResolved: corruption,
    returnCompleted: true,
    inputHistory: inputs,
    fieldCoherence: { ...coherence, returnCompleted: true, centerOpen: true },
  });

  console.log('\nprovenance_hash :', record.provenance_hash.slice(0, 24) + '…');
  console.log('trace_hash      :', record.trace_hash.slice(0, 24) + '…');
  console.log('phases_completed:', record.phases_completed);
  console.log('formation_trail :');
  for (const sym of ['X', 'Y', 'Z', 'A', 'B'] as const) {
    const f = record.formation_trail[sym];
    console.log(`  ${sym}: state=${f.state}, inputs=${f.input_count}`);
  }

  const v1 = await att.verifyLevel1(record);
  const v2 = await att.verifyLevel2(record);
  console.log('\nverify L1:', v1.passed ? 'PASS' : 'FAIL', v1.failures);
  console.log('verify L2:', v2.passed ? 'PASS' : 'FAIL', v2.failures);

  head('Done.');
}

main().catch((e) => {
  console.error('demo failed:', e);
  process.exit(1);
});
