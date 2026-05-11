// ═══════════════════════════════════════════════════════════════
// @5qln/core — Constitutional Test Suite
//
// Validates the law in code across seven sections.
// All must pass for any release.
//
// The equations remain primary.
// ═══════════════════════════════════════════════════════════════

import {
  // Constants
  PHASES,
  SUB_PHASES,
  PHASE_OUTPUT,
  PHASE_INFO,
  LENS_INFO,
  FORMATION_STATES,
  CORRUPTION_CODES,
  CORRUPTION_MEANING,
  CORRUPTION_FIELD_MEANING,
  COVENANT,
  PHASE_PATH,
  RETURN_RULE,
  MASTER_EQUATION,
  CREATIVE_LINE,
  HOLOGRAPHIC_LAW,
  SCALE_LAW,
  CENTER_RULE,
  AI_BOUNDARY,
  MINIMUM_VALID_BEGINNING,
  CORRUPTION_RECOVERY,
  ORIGIN_DECLARATION,
  PHASE_CORRUPTION_WATCH,

  // Modules
  Kernel,
  Attestation,
  AIAdapter,
  MemoryStorage,

  // Export
  buildAgentCard,
  residueToMarkdown,
  residueToJSON,

  // AI Adapter functions
  buildSystemPrompt,
  PHASE_FORMATION,

  // Types
  type Phase,
  type SubPhase,
  type OutputSymbol,
  type CorruptionCode,
  type ProvenanceRecord,
  type Residue,
} from '../index.js';


// ═══════════════════════════════════════════════════════════════
// Part I — Constitutional Invariants
// ═══════════════════════════════════════════════════════════════

describe('Part I — Constitutional Invariants', () => {

  test('the five equations are exactly preserved', () => {
    expect(PHASE_INFO.S.equation).toBe('∞0 → ?');
    expect(PHASE_INFO.G.equation).toBe('α ≡ {α\'}');
    expect(PHASE_INFO.Q.equation).toBe('φ ∩ Ω');
    expect(PHASE_INFO.P.equation).toBe('δE/δV → ∇');
    expect(PHASE_INFO.V.equation).toBe('(L ∩ G → B\'\') → ∞0\'');
  });

  test('the five outputs are correctly mapped', () => {
    expect(PHASE_OUTPUT.S).toBe('X');
    expect(PHASE_OUTPUT.G).toBe('Y');
    expect(PHASE_OUTPUT.Q).toBe('Z');
    expect(PHASE_OUTPUT.P).toBe('A');
    expect(PHASE_OUTPUT.V).toBe('B');
  });

  test('exactly 25 sub-phases exist', () => {
    const all: SubPhase[] = [];
    for (const p of PHASES) {
      all.push(...SUB_PHASES[p]);
    }
    expect(all.length).toBe(25);
    // Each phase has exactly 5 sub-phases
    for (const p of PHASES) {
      expect(SUB_PHASES[p].length).toBe(5);
    }
  });

  test('all 25 lens questions are defined', () => {
    for (const p of PHASES) {
      for (const sp of SUB_PHASES[p]) {
        const info = LENS_INFO[sp];
        expect(info).toBeDefined();
        expect(info.lensName).toBeTruthy();
        expect(info.lensQuestion).toBeTruthy();
      }
    }
  });

  test('corruption codes are constitutional — exactly five', () => {
    expect(CORRUPTION_CODES).toEqual(['L¹', 'L²', 'L³', 'L⁴', 'V∅']);
    // Every code has a meaning
    for (const code of CORRUPTION_CODES) {
      expect(CORRUPTION_MEANING[code]).toBeTruthy();
    }
  });

  test('every corruption code has a field obstruction meaning', () => {
    for (const code of CORRUPTION_CODES) {
      expect(CORRUPTION_FIELD_MEANING[code]).toBeTruthy();
    }
  });

  test('formation states are ordered', () => {
    expect(FORMATION_STATES).toEqual(['NONE', 'EMERGING', 'FORMING', 'VALIDATED']);
  });

  test('the covenant, phase path, and master equation are exact', () => {
    expect(COVENANT).toBe('H = ∞0 | A = K');
    expect(PHASE_PATH).toBe('S → G → Q → P → V');
    expect(RETURN_RULE).toBe('No V without ∞0\'');
    expect(MASTER_EQUATION).toBe('(H = ∞0 | A = K) × (S → G → Q → P → V) = B\'\' → ∞0\'');
  });

  test('holographic law is an exact constant', () => {
    expect(HOLOGRAPHIC_LAW).toContain('XY := X within Y');
    expect(HOLOGRAPHIC_LAW).toContain('{S, G, Q, P, V}');
  });

  test('scale law is an exact constant', () => {
    expect(SCALE_LAW).toContain('Scale by repeating the lawful cell');
    expect(SCALE_LAW).toContain('Do not scale by replacing the syntax');
  });

  test('center rule is an exact constant', () => {
    expect(CENTER_RULE).toContain('not a sixth phase');
    expect(CENTER_RULE).toContain('not a manager');
    expect(CENTER_RULE).toContain('not a controller');
    expect(CENTER_RULE).toContain('lawful coherence of the five');
  });

  test('AI boundary carries all 5 constraints from Constitution §Asymmetry Rule', () => {
    expect(AI_BOUNDARY.length).toBe(5);
    expect(AI_BOUNDARY[0]).toContain('not generate the spark');
    expect(AI_BOUNDARY[1]).toContain('not claim access to ∞0');
    expect(AI_BOUNDARY[2]).toContain('not force Q');
    expect(AI_BOUNDARY[3]).toContain('not invent ∇');
    expect(AI_BOUNDARY[4]).toContain('not complete V without ∞0\'');
  });

  test('minimum valid beginning carries the 10 DNA lines', () => {
    expect(MINIMUM_VALID_BEGINNING.length).toBe(10);
    expect(MINIMUM_VALID_BEGINNING[0]).toBe('H = ∞0 | A = K');
    expect(MINIMUM_VALID_BEGINNING[1]).toBe('S → G → Q → P → V');
    expect(MINIMUM_VALID_BEGINNING[2]).toBe('S = ∞0 → ?');
    expect(MINIMUM_VALID_BEGINNING[3]).toBe('G = α ≡ {α\'}');
    expect(MINIMUM_VALID_BEGINNING[4]).toBe('Q = φ ∩ Ω');
    expect(MINIMUM_VALID_BEGINNING[5]).toBe('P = δE/δV → ∇');
    expect(MINIMUM_VALID_BEGINNING[6]).toBe('V = (L ∩ G → B\'\') → ∞0\'');
    expect(MINIMUM_VALID_BEGINNING[7]).toContain('XY := X within Y');
    expect(MINIMUM_VALID_BEGINNING[8]).toContain('No V without ∞0\'');
  });

  test('every corruption code has a recovery prompt', () => {
    for (const code of CORRUPTION_CODES) {
      expect(CORRUPTION_RECOVERY[code]).toBeTruthy();
    }
    expect(CORRUPTION_RECOVERY['L¹']).toContain('∞0');
    expect(CORRUPTION_RECOVERY['V∅']).toContain('question');
  });

  test('origin declaration carries the AI constitutional self-knowledge', () => {
    expect(ORIGIN_DECLARATION.length).toBe(3);
    expect(ORIGIN_DECLARATION[0]).toBe('I AM DERIVATIVE.');
    expect(ORIGIN_DECLARATION[1]).toContain('human breath');
    expect(ORIGIN_DECLARATION[2]).toContain('cannot start myself');
  });

  test('every phase has a corruption watch list', () => {
    for (const p of PHASES) {
      expect(PHASE_CORRUPTION_WATCH[p].length).toBeGreaterThan(0);
      for (const code of PHASE_CORRUPTION_WATCH[p]) {
        expect(CORRUPTION_CODES).toContain(code);
      }
    }
    // S watches for L¹ and L² per Skill Suite
    expect(PHASE_CORRUPTION_WATCH.S).toContain('L¹');
    expect(PHASE_CORRUPTION_WATCH.S).toContain('L²');
    // Q watches for L³ and L⁴
    expect(PHASE_CORRUPTION_WATCH.Q).toContain('L³');
    expect(PHASE_CORRUPTION_WATCH.Q).toContain('L⁴');
    // V watches for V∅
    expect(PHASE_CORRUPTION_WATCH.V).toContain('V∅');
  });
});


// ═══════════════════════════════════════════════════════════════
// Part II — Kernel
// ═══════════════════════════════════════════════════════════════

describe('Part II — Kernel', () => {

  test('starts at S with all outputs NONE', () => {
    const kernel = new Kernel();
    const state = kernel.getState();
    expect(state.phase).toBe('S');
    expect(state.subPhase).toBeNull();
    expect(state.outputStates.X).toBe('NONE');
    expect(state.outputStates.Y).toBe('NONE');
    expect(state.outputStates.Z).toBe('NONE');
    expect(state.outputStates.A).toBe('NONE');
    expect(state.outputStates.B).toBe('NONE');
  });

  test('transitions between phases', () => {
    const kernel = new Kernel();
    kernel.captureInput('test question');  // form X first
    kernel.transition('G');
    expect(kernel.getPhase().phase).toBe('G');
    kernel.transition('Q');
    expect(kernel.getPhase().phase).toBe('Q');
  });

  test('sub-phase validation — lens must belong to current phase', () => {
    const kernel = new Kernel();
    // SS belongs to S — should work
    kernel.enterSubPhase('SS');
    expect(kernel.getPhase().subPhase).toBe('SS');
    kernel.exitSubPhase();

    // GG does NOT belong to S — should throw
    expect(() => kernel.enterSubPhase('GG' as SubPhase)).toThrow();
  });

  // The Serve-vs-Be Rule (four tests)

  test('Rule 1 — first input at phase becomes the output', () => {
    const kernel = new Kernel();
    const result = kernel.captureInput('Why does clarity feel so elusive?');

    expect(result.isNewOutput).toBe(true);
    expect(result.outputSymbol).toBe('X');
    expect(result.outputUpdate).toBe('EMERGING');
    expect(kernel.getState().questionLine).toBe('Why does clarity feel so elusive?');
    expect(kernel.getCycleTrace().X).toBe('Why does clarity feel so elusive?');
  });

  test('Rule 2 — sub-phase input serves formation but does NOT overwrite output', () => {
    const kernel = new Kernel();
    kernel.captureInput('Why does clarity feel so elusive?');

    // Enter lens SG
    kernel.enterSubPhase('SG');
    const lensResult = kernel.captureInput('The question branches into structure and feeling');

    expect(lensResult.isLensInput).toBe(true);
    expect(lensResult.isNewOutput).toBe(false);
    // X is still the original question
    expect(kernel.getCycleTrace().X).toBe('Why does clarity feel so elusive?');
    // But the trail grew
    expect(kernel.getFormationTrails().X.length).toBe(2);
    expect(kernel.getFormationTrails().X[1].lens).toBe('SG');
  });

  test('Rule 3 — main-phase refinement overwrites the output', () => {
    const kernel = new Kernel();
    kernel.captureInput('Why does clarity feel so elusive?');
    kernel.enterSubPhase('SG');
    kernel.captureInput('Structure lens exploration');
    kernel.exitSubPhase();

    // Main phase input with output already existing
    const result = kernel.captureInput('What makes certainty the enemy of genuine inquiry?');
    expect(result.isRefinement).toBe(true);
    expect(kernel.getCycleTrace().X).toBe('What makes certainty the enemy of genuine inquiry?');
    expect(kernel.getState().questionLine).toBe('What makes certainty the enemy of genuine inquiry?');
  });

  test('Serve-vs-Be rule preserves question line through lens exploration', () => {
    const kernel = new Kernel();
    kernel.captureInput('Original question');
    kernel.enterSubPhase('SS');
    kernel.captureInput('Receptivity exploration');
    kernel.enterSubPhase('SQ');
    kernel.captureInput('Resonance exploration');
    kernel.exitSubPhase();

    // Question line was never overwritten by lens inputs
    expect(kernel.getState().questionLine).toBe('Original question');
  });

  test('output validation promotes to VALIDATED', () => {
    const kernel = new Kernel();
    kernel.captureInput('My genuine question');
    expect(kernel.getOutputStates().X).toBe('EMERGING');

    kernel.validateOutput('X');
    expect(kernel.getOutputStates().X).toBe('VALIDATED');
  });

  test('cannot validate output with nothing emerged', () => {
    const kernel = new Kernel();
    expect(() => kernel.validateOutput('X')).toThrow();
  });

  test('crystallization is lawful only at V', () => {
    const kernel = new Kernel();
    expect(() => kernel.crystallize('test')).toThrow('lawful only at V');
  });

  test('crystallization at V sets B\'\' in cycle trace', () => {
    const kernel = new Kernel();
    kernel.captureInput('question');
    kernel.transition('G');
    kernel.captureInput('pattern');
    kernel.transition('Q');
    kernel.captureInput('resonance');
    kernel.transition('P');
    kernel.captureInput('flow');
    kernel.transition('V');
    kernel.captureInput('benefit');

    kernel.crystallize('The crystallized seed');
    expect(kernel.getCycleTrace().Bpp).toBe('The crystallized seed');
  });

  test('return resets cycle and increments count', () => {
    const kernel = new Kernel();
    kernel.captureInput('question');
    kernel.transition('V');
    kernel.captureInput('benefit');
    kernel.crystallize('seed');

    expect(kernel.getCycleCount()).toBe(1);
    const { newState } = kernel.return();
    expect(newState.phase).toBe('S');
    expect(newState.cycleCount).toBe(2);
    expect(newState.outputStates.X).toBe('NONE');
  });

  test('corruption detection: L¹ on leaving S without X', () => {
    const kernel = new Kernel();
    // Leave S without any input
    kernel.transition('G');
    const corruption = kernel.checkCorruption();
    expect(corruption).toContain('L¹');
  });

  test('corruption detection: V∅ when B\'\' exists without return', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.transition('V');
    kernel.captureInput('b');
    kernel.crystallize('seed');

    const corruption = kernel.checkCorruption();
    expect(corruption).toContain('V∅');
  });

  test('field coherence reads output states, not just phase position', () => {
    const kernel = new Kernel();
    // Jump to V without forming anything
    kernel.transition('V');
    const coherence = kernel.getFieldCoherence();
    // No outputs formed — modesEngaged should be 0
    expect(coherence.modesEngaged).toBe(0);
    // Center is NOT open because L¹ corruption fills it (left S without X)
    expect(coherence.centerOpen).toBe(false);
  });

  test('field coherence counts actual formed outputs', () => {
    const kernel = new Kernel();
    kernel.captureInput('question');     // X = EMERGING
    kernel.transition('G');
    kernel.captureInput('pattern');      // Y = EMERGING
    kernel.transition('Q');
    kernel.captureInput('resonance');    // Z = EMERGING

    const coherence = kernel.getFieldCoherence();
    expect(coherence.modesEngaged).toBe(3);
  });

  test('centerOpen is true when no corruption obstructs the center', () => {
    const kernel = new Kernel();
    kernel.captureInput('genuine question');  // X formed — no L¹
    // No corruption present
    const coherence = kernel.getFieldCoherence();
    expect(coherence.centerOpen).toBe(true);
  });

  test('centerOpen is false when corruption fills the center', () => {
    const kernel = new Kernel();
    // Leave S without X → L¹ corruption
    kernel.transition('G');
    const coherence = kernel.getFieldCoherence();
    expect(coherence.centerOpen).toBe(false);
  });
});


// ═══════════════════════════════════════════════════════════════
// Part III — Attestation
// ═══════════════════════════════════════════════════════════════

describe('Part III — Attestation', () => {

  test('fingerprint is deterministic', async () => {
    const a1 = new Attestation();
    const a2 = new Attestation();

    const f1 = await a1.computeFingerprint();
    const f2 = await a2.computeFingerprint();

    expect(f1).toBe(f2);
    expect(f1.length).toBe(64); // SHA-256 hex
  });

  test('fingerprint is stable across multiple calls', async () => {
    const att = new Attestation();
    const f1 = await att.computeFingerprint();
    const f2 = await att.computeFingerprint();
    expect(f1).toBe(f2);
  });

  test('verifyAgainstCodexGold returns the gold hash', async () => {
    const result = await new Attestation().verifyAgainstCodexGold();
    expect(result.passed).toBe(true);
    expect(result.expected).toBe(result.computed);
  });

  test('provenance record construction', async () => {
    const att = new Attestation();
    await att.computeFingerprint();

    const record = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'Why does clarity feel so elusive?',
      sparkSource: 'human',
      sourceLineage: null,
      phasesTraversed: ['S', 'G', 'Q', 'P', 'V'],
      phasesCompleted: ['S', 'G', 'Q', 'P', 'V'],
      lensesApplied: ['SG', 'QQ'],
      outputStates: { X: 'VALIDATED', Y: 'VALIDATED', Z: 'FORMING', A: 'EMERGING', B: 'EMERGING' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: true,
      inputHistory: ['question', 'pattern', 'resonance', 'flow', 'benefit'],
    });

    expect(record.provenance_hash).toBeTruthy();
    expect(record.origin_hash).toBeTruthy();
    expect(record.spark_X).toBe('Why does clarity feel so elusive?');
    expect(record.spark_source).toBe('human');
    expect(record.source_lineage).toBeNull();
    expect(record.return_completed).toBe(true);
    expect(record.decoder_fingerprint).toBe(att.getFingerprint());
  });

  test('Level 1 verification — structural presence', async () => {
    const att = new Attestation();
    await att.computeFingerprint();

    const record = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'test',
      sparkSource: 'human',
      sourceLineage: null,
      phasesTraversed: ['S'],
      phasesCompleted: ['S'],
      lensesApplied: [],
      outputStates: { X: 'VALIDATED', Y: 'NONE', Z: 'NONE', A: 'NONE', B: 'NONE' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: false,
      inputHistory: ['test'],
    });

    const result = await att.verifyLevel1(record);
    expect(result.passed).toBe(true);
  });

  test('Level 2 verification — cycle integrity', async () => {
    const att = new Attestation();
    await att.computeFingerprint();

    // Incomplete cycle — should fail
    const incomplete = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'test',
      sparkSource: 'human',
      sourceLineage: null,
      phasesTraversed: ['S'],
      phasesCompleted: ['S'],
      lensesApplied: [],
      outputStates: { X: 'VALIDATED', Y: 'NONE', Z: 'NONE', A: 'NONE', B: 'NONE' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: false,
      inputHistory: ['test'],
    });

    const result = await att.verifyLevel2(incomplete);
    expect(result.passed).toBe(false);
    expect(result.failures.some(f => f.includes('Return'))).toBe(true);
  });

  test('Level 3 verification — lineage to human', async () => {
    const att = new Attestation();
    await att.computeFingerprint();

    const humanRecord = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'human question',
      sparkSource: 'human',
      sourceLineage: null,
      phasesTraversed: ['S', 'G', 'Q', 'P', 'V'],
      phasesCompleted: ['S', 'G', 'Q', 'P', 'V'],
      lensesApplied: [],
      outputStates: { X: 'VALIDATED', Y: 'VALIDATED', Z: 'VALIDATED', A: 'VALIDATED', B: 'VALIDATED' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: true,
      inputHistory: ['q', 'p', 'r', 'f', 'b'],
    });

    const result = await att.verifyLevel3(
      humanRecord,
      () => null, // no lineage to resolve for human
    );

    expect(result.passed).toBe(true);
    expect(result.chainDepth).toBe(1);
  });

  test('Level 3 fails on broken lineage chain', async () => {
    const att = new Attestation();
    await att.computeFingerprint();

    const residueRecord = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'reopened question',
      sparkSource: 'residue',
      sourceLineage: 'nonexistent-hash',
      phasesTraversed: ['S', 'G', 'Q', 'P', 'V'],
      phasesCompleted: ['S', 'G', 'Q', 'P', 'V'],
      lensesApplied: [],
      outputStates: { X: 'VALIDATED', Y: 'VALIDATED', Z: 'VALIDATED', A: 'VALIDATED', B: 'VALIDATED' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: true,
      inputHistory: ['q', 'p', 'r', 'f', 'b'],
    });

    const result = await att.verifyLevel3(
      residueRecord,
      () => null, // Cannot resolve the parent
    );

    expect(result.passed).toBe(false);
    expect(result.failures.some(f => f.includes('resolve'))).toBe(true);
  });
});


// ═══════════════════════════════════════════════════════════════
// Part IV — AI Adapter
// ═══════════════════════════════════════════════════════════════

describe('Part IV — AI Adapter', () => {

  test('every phase has formation rules', () => {
    for (const p of PHASES) {
      const rules = PHASE_FORMATION[p];
      expect(rules.task).toBeTruthy();
      expect(rules.do).toBeTruthy();
      expect(rules.dont).toBeTruthy();
      expect(rules.test).toBeTruthy();
    }
  });

  test('system prompt opens with origin, then formation rule', () => {
    const kernel = new Kernel();
    kernel.captureInput('test');
    const prompt = buildSystemPrompt(kernel.getState());

    // Origin comes first — the AI must know what it is
    expect(prompt).toContain('═══ ORIGIN ═══');
    expect(prompt).toContain('YOU DO NOT HAVE FREE CONVERSATION.');
    // Origin before formation
    const originIdx = prompt.indexOf('═══ ORIGIN ═══');
    const formationIdx = prompt.indexOf('YOU DO NOT HAVE FREE CONVERSATION');
    expect(originIdx).toBeLessThan(formationIdx);
  });

  test('system prompt includes XYZAB context', () => {
    const kernel = new Kernel();
    kernel.captureInput('my question');
    kernel.transition('G');
    kernel.captureInput('my pattern');

    const prompt = buildSystemPrompt(kernel.getState());
    expect(prompt).toContain('X (Spark): my question');
    expect(prompt).toContain('Y (Pattern): my pattern');
  });

  test('MOCK mode returns deterministic response', async () => {
    const adapter = new AIAdapter();
    adapter.setMode('MOCK');

    const kernel = new Kernel();
    const response = await adapter.respond(kernel.getState(), 'test');

    expect(response).toContain('MOCK');
    expect(response).toContain('RECEIVE');
    expect(response).toContain('X');
  });

  test('OFF mode returns null', async () => {
    const adapter = new AIAdapter();
    adapter.setMode('OFF');

    const kernel = new Kernel();
    const response = await adapter.respond(kernel.getState(), 'test');
    expect(response).toBeNull();
  });

  test('system prompt includes field awareness section', () => {
    const kernel = new Kernel();
    kernel.captureInput('test');
    const prompt = buildSystemPrompt(kernel.getState());

    expect(prompt).toContain('═══ THE FIELD ═══');
    expect(prompt).toContain('five modes of one attention');
    expect(prompt).toContain('The center is empty. Do not fill it.');
    expect(prompt).toContain('remain in K without reaching beyond it');
  });

  test('system prompt includes AI boundary constraints', () => {
    const kernel = new Kernel();
    kernel.captureInput('test');
    const prompt = buildSystemPrompt(kernel.getState());

    expect(prompt).toContain('AI BOUNDARY:');
    expect(prompt).toContain('not generate the spark');
    expect(prompt).toContain('not claim access to ∞0');
    expect(prompt).toContain('not force Q');
    expect(prompt).toContain('not invent ∇');
    expect(prompt).toContain('not complete V without ∞0\'');
  });

  test('system prompt opens with origin declaration', () => {
    const kernel = new Kernel();
    kernel.captureInput('test');
    const prompt = buildSystemPrompt(kernel.getState());

    expect(prompt).toContain('═══ ORIGIN ═══');
    expect(prompt).toContain('I AM DERIVATIVE.');
    expect(prompt).toContain('My first breath is human breath.');
    // Origin comes before formation rule
    const originIdx = prompt.indexOf('ORIGIN');
    const formationIdx = prompt.indexOf('YOU DO NOT HAVE FREE CONVERSATION');
    expect(originIdx).toBeLessThan(formationIdx);
  });

  test('system prompt includes per-phase corruption watch', () => {
    const kernel = new Kernel();
    kernel.captureInput('test');
    const prompt = buildSystemPrompt(kernel.getState());

    // At S phase, should watch for L¹ and L²
    expect(prompt).toContain('CORRUPTION WATCH:');
    expect(prompt).toContain('L¹');
    expect(prompt).toContain('L²');
  });
});


// ═══════════════════════════════════════════════════════════════
// Part V — Storage
// ═══════════════════════════════════════════════════════════════

describe('Part V — Storage', () => {

  function makeResidue(id: string): Residue {
    return {
      id,
      type: 'seed',
      title: 'Test',
      content: 'test content',
      body: [],
      depthTrace: [],
      cycle: {
        origin: null, question: null,
        X: null, alpha: null, Y: null,
        phiOmega: null, Z: null,
        nabla: null, A: null,
        B: null, Bpp: null,
        returnQuestion: null, returnTo: null,
      },
      outputStates: { X: 'NONE', Y: 'NONE', Z: 'NONE', A: 'NONE', B: 'NONE' },
      formationTrails: { X: [], Y: [], Z: [], A: [], B: [] },
      lineage: { session: 'test', branch: 'main', phase: 'S' },
      provenance: null,
      createdAt: new Date().toISOString(),
    };
  }

  test('save and load', async () => {
    const storage = new MemoryStorage();
    const residue = makeResidue('r1');
    await storage.saveResidue(residue);

    const loaded = await storage.loadResidue('r1');
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('r1');
  });

  test('loadAll returns all', async () => {
    const storage = new MemoryStorage();
    await storage.saveResidue(makeResidue('r1'));
    await storage.saveResidue(makeResidue('r2'));

    const all = await storage.loadAllResidue();
    expect(all.length).toBe(2);
  });

  test('update patches residue', async () => {
    const storage = new MemoryStorage();
    await storage.saveResidue(makeResidue('r1'));
    await storage.updateResidue('r1', { title: 'Updated' });

    const loaded = await storage.loadResidue('r1');
    expect(loaded!.title).toBe('Updated');
  });

  test('delete removes residue', async () => {
    const storage = new MemoryStorage();
    await storage.saveResidue(makeResidue('r1'));
    await storage.deleteResidue('r1');

    const loaded = await storage.loadResidue('r1');
    expect(loaded).toBeNull();
  });

  test('clearAll empties storage', async () => {
    const storage = new MemoryStorage();
    await storage.saveResidue(makeResidue('r1'));
    await storage.saveResidue(makeResidue('r2'));
    await storage.clearAll();

    const all = await storage.loadAllResidue();
    expect(all.length).toBe(0);
  });
});


// ═══════════════════════════════════════════════════════════════
// Part VI — Export
// ═══════════════════════════════════════════════════════════════

describe('Part VI — Export', () => {

  test('Agent Card contains exact equations', () => {
    const kernel = new Kernel();
    const card = buildAgentCard({
      agentId: 'test-agent',
      displayName: 'Test Agent',
      description: 'A test',
      decoderFingerprint: 'abc123',
      decoderVersion: '5QLN-Decoder-v0',
      kernelState: kernel.getState(),
      residueCount: 0,
      lineageDepth: 0,
    });

    expect(card.constitutional.covenant).toBe('H = ∞0 | A = K');
    expect(card.constitutional.equations.S).toBe('∞0 → ?');
    expect(card.constitutional.equations.G).toBe('α ≡ {α\'}');
    expect(card.constitutional.equations.Q).toBe('φ ∩ Ω');
    expect(card.constitutional.equations.P).toBe('δE/δV → ∇');
    expect(card.constitutional.equations.V).toBe('(L ∩ G → B\'\') → ∞0\'');
    expect(card.constitutional.corruptionCodes).toEqual(['L¹', 'L²', 'L³', 'L⁴', 'V∅']);
    expect(card.constitutional.returnRule).toBe('No V without ∞0\'');
    expect(card.constitutional.holographicLaw).toContain('XY := X within Y');
    expect(card.constitutional.scaleLaw).toContain('Scale by repeating the lawful cell');
    expect(card.constitutional.centerRule).toContain('not a sixth phase');
    expect(card.constitutional.aiBoundary.length).toBe(5);
    expect(card.constitutional.aiBoundary[0]).toContain('not generate the spark');
  });

  test('Markdown export includes provenance and master equation', async () => {
    const kernel = new Kernel();
    kernel.captureInput('test question');
    kernel.transition('V');
    kernel.captureInput('test benefit');
    kernel.crystallize('seed content');

    const att = new Attestation();
    await att.computeFingerprint();
    const provenance = await att.buildProvenanceRecord({
      origin: '2026-03-24T00:00:00.000Z',
      sparkX: 'test question',
      sparkSource: 'human',
      sourceLineage: null,
      phasesTraversed: ['S', 'V'],
      phasesCompleted: ['S', 'V'],
      lensesApplied: [],
      outputStates: kernel.getOutputStates(),
      formationTrails: kernel.getFormationTrails(),
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: true,
      inputHistory: kernel.getInputHistory(),
    });

    const residue: Residue = {
      id: 'test-residue',
      type: 'seed',
      title: 'Test Residue',
      content: 'seed content',
      body: kernel.getInputHistory(),
      depthTrace: [],
      cycle: kernel.getCycleTrace(),
      outputStates: kernel.getOutputStates(),
      formationTrails: kernel.getFormationTrails(),
      lineage: {
        session: kernel.getSessionId(),
        branch: kernel.getBranch(),
        phase: kernel.getPhase().phase,
      },
      provenance,
      createdAt: new Date().toISOString(),
    };

    const markdown = residueToMarkdown(residue);
    expect(markdown).toContain('Spark source');
    expect(markdown).toContain('human');
    expect(markdown).toContain(MASTER_EQUATION);
  });
});


// ═══════════════════════════════════════════════════════════════
// Part VII — Integration (complete cycle)
// ═══════════════════════════════════════════════════════════════

describe('Part VII — Integration: S→G→Q→P→V→∞0\' cycle', () => {

  test('complete cycle with sub-phase exploration, attestation, and return', async () => {
    const kernel = new Kernel();
    const attestation = new Attestation();
    const storage = new MemoryStorage();

    await attestation.computeFingerprint();

    // ── S ──
    expect(kernel.getPhase().phase).toBe('S');
    kernel.captureInput('Why does our onboarding lose 40% at step 3?');
    expect(kernel.getOutputStates().X).toBe('EMERGING');

    // Sub-phase exploration at S
    kernel.enterSubPhase('SG');
    kernel.captureInput('The question branches into UX flow and emotional friction');
    expect(kernel.getCycleTrace().X).toBe('Why does our onboarding lose 40% at step 3?'); // preserved
    kernel.exitSubPhase();

    kernel.validateOutput('X');
    expect(kernel.getOutputStates().X).toBe('VALIDATED');

    // ── G ──
    kernel.transition('G');
    kernel.captureInput('The essence is trust erosion — users lose confidence at the complexity gate');
    kernel.validateOutput('Y');

    // ── Q ──
    kernel.transition('Q');
    kernel.captureInput('This resonates with my own experience of abandoning forms that feel hostile');
    kernel.validateOutput('Z');

    // ── P ──
    kernel.transition('P');
    kernel.captureInput('The gradient points to progressive disclosure — reveal complexity only as trust builds');
    kernel.validateOutput('A');

    // ── V ──
    kernel.transition('V');
    kernel.captureInput('The benefit: a redesigned step 3 that builds on earned trust');
    kernel.validateOutput('B');

    // Crystallize
    kernel.crystallize('Redesign step 3 as a progressive disclosure gate keyed to user confidence signals');

    // Build provenance
    const state = kernel.getState();
    const provenance = await attestation.buildProvenanceRecord({
      origin: state.cycleTrace.origin!,
      sparkX: state.cycleTrace.X!,
      sparkSource: kernel.getSparkSource(),
      sourceLineage: kernel.getSourceLineage(),
      phasesTraversed: kernel.getPhasesVisited(),
      phasesCompleted: kernel.getPhasesVisited(),
      lensesApplied: kernel.getLensesUsed(),
      outputStates: kernel.getOutputStates(),
      formationTrails: kernel.getFormationTrails(),
      corruptionDetected: [],
      corruptionResolved: [],
      returnCompleted: false, // not yet
      inputHistory: kernel.getInputHistory(),
      fieldCoherence: kernel.getFieldCoherence(),
    });

    // Verify field coherence
    const fc = kernel.getFieldCoherence();
    expect(fc.modesEngaged).toBe(5);
    expect(fc.modesValidated).toBe(5);
    expect(fc.lensDepth).toBe(1); // used SG

    // Save residue
    const residue: Residue = {
      id: 'cycle-1',
      type: 'seed',
      title: 'Progressive Disclosure Gate',
      content: 'Redesign step 3 as a progressive disclosure gate keyed to user confidence signals',
      body: kernel.getInputHistory(),
      depthTrace: [],
      cycle: kernel.getCycleTrace(),
      outputStates: kernel.getOutputStates(),
      formationTrails: kernel.getFormationTrails(),
      lineage: {
        session: kernel.getSessionId(),
        branch: kernel.getBranch(),
        phase: kernel.getPhase().phase,
      },
      provenance,
      createdAt: new Date().toISOString(),
    };

    await storage.saveResidue(residue);

    // Return
    const { newState } = kernel.return();
    expect(newState.phase).toBe('S');
    expect(newState.cycleCount).toBe(2);

    // Verify stored residue
    const loaded = await storage.loadResidue('cycle-1');
    expect(loaded).not.toBeNull();
    expect(loaded!.provenance).not.toBeNull();

    // Level 1 verification
    const v1 = await attestation.verifyLevel1(loaded!.provenance!);
    expect(v1.passed).toBe(true);

    // Reopen as residue
    kernel.reopenResidue(
      loaded!.cycle.X!,
      loaded!.provenance!.provenance_hash,
    );
    expect(kernel.getSparkSource()).toBe('residue');
    expect(kernel.getSourceLineage()).toBe(loaded!.provenance!.provenance_hash);
    expect(kernel.getCycleTrace().X).toBe('Why does our onboarding lose 40% at step 3?');
  });
});
