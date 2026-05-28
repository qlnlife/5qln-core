// ═══════════════════════════════════════════════════════════════
// @5qln/core — Fractal Engine Test Suite
//
// Tests language → phase routing → formation trail → membrane.
// ═══════════════════════════════════════════════════════════════

import { FractalEngine } from '../fractal-engine.js';

describe('Fractal Engine — language routing', () => {
  test('routes not-yet-named living question to S', () => {
    const engine = new FractalEngine();
    const route = engine.route(
      'I feel this product is not just a facilitation tool, but I cannot yet name what is alive underneath it.'
    );

    expect(route.phase).toBe('S');
    expect(route.confidence).toBe('high');
    expect(route.why).toContain('not-knowing');
  });

  test('routes essence and self-similar echoes to G', () => {
    const engine = new FractalEngine();
    const route = engine.route(
      'The same essence keeps echoing across the interface, the session, and the business model.'
    );

    expect(route.phase).toBe('G');
    expect(route.confidence).toBe('high');
    expect(route.why).toContain('essence');
  });

  test('routes felt click and resonance to Q', () => {
    const engine = new FractalEngine();
    const route = engine.route(
      'This framing lands in my body; there is a soft click of rightness.'
    );

    expect(route.phase).toBe('Q');
    expect(route.why).toContain('resonance');
  });

  test('routes friction and least-resistance movement to P', () => {
    const engine = new FractalEngine();
    const route = engine.route(
      'The next move is unclear, but the smallest effort with the most value seems to be testing the gradient.'
    );

    expect(route.phase).toBe('P');
    expect(route.why).toContain('movement');
  });

  test('routes artifact, propagation, and return question to V', () => {
    const engine = new FractalEngine();
    const route = engine.route(
      'The artifact is crystallized now; the value can propagate, and it opens a new return question.'
    );

    expect(route.phase).toBe('V');
    expect(route.confidence).toBe('high');
    expect(route.why).toContain('artifact');
  });
});

describe('Fractal Engine — formation trail', () => {
  test('processTurn creates phase-aware formation trail entry', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'I cannot yet name the question underneath this platform.',
      humanValidated: true,
    });

    expect(result.entry.phase).toBe('S');
    expect(result.entry.subPhase).toMatch(/^S/);
    expect(result.entry.outputSymbol).toBe('X');
    expect(result.entry.humanValidated).toBe(true);
    expect(result.cycleTrace.X).toContain('cannot yet name');
    expect(result.state.outputStates.X).toBe('VALIDATED');
    expect(engine.getFormationTrail()).toHaveLength(1);
  });

  test('supports human phase override', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'This has to be treated as value even if the words are ambiguous.',
      phaseOverride: 'V',
    });

    expect(result.route.phase).toBe('V');
    expect(result.route.why).toBe('human override');
    expect(result.entry.outputSymbol).toBe('B');
  });

  test('infers recursive sub-phase lens', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'The pattern echoes across scales and keeps the same essence.',
    });

    expect(result.route.phase).toBe('G');
    expect(result.subPhase.subPhase).toBe('GG');
    expect(result.entry.subPhase).toBe('GG');
  });
});

describe('Fractal Engine — membrane enforcement', () => {
  test('flags L2 when AI generates the spark', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'I do not know what the question is.',
      aiReflection: 'The real question here is how you should build the product.',
    });

    expect(result.entry.corruptionFlags).toContain('L2');
    expect(result.entry.recoveryPrompts).toContain('What pattern are you recognizing? The seeing is yours.');
  });

  test('flags L3 when AI claims access to ∞0', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'Does this resonate?',
      phaseOverride: 'Q',
      aiReflection: 'I sense the resonance building in the field.',
    });

    expect(result.entry.corruptionFlags).toContain('L3');
  });

  test('flags L4 when AI prescribes action as wisdom', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'Where is the natural gradient?',
      phaseOverride: 'P',
      aiReflection: 'You should trust the process and implement the obvious solution.',
    });

    expect(result.entry.corruptionFlags).toContain('L4');
  });

  test('flags V∅ when V response lacks return question', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'The artifact is ready and the value is clear.',
      phaseOverride: 'V',
      aiReflection: 'B″ is the published formation brief. The work is complete.',
    });

    expect(result.entry.corruptionFlags).toContain('V∅');
    expect(result.entry.membraneSummary).toContain('V∅');
  });

  test('bounded default V reflection includes return question', () => {
    const engine = new FractalEngine();
    const result = engine.processTurn({
      humanInput: 'The artifact is ready and the value can propagate.',
      phaseOverride: 'V',
    });

    expect(result.entry.corruptionFlags).not.toContain('V∅');
    expect(engine.hasReturnQuestion(result.entry.aiReflection)).toBe(true);
  });

  test('includes kernel transition corruption in trail flags', () => {
    const engine = new FractalEngine();
    engine.processTurn({
      humanInput: 'I cannot yet name what is alive underneath this.',
    });

    const result = engine.processTurn({
      humanInput: 'The artifact is ready.',
      phaseOverride: 'V',
      aiReflection: 'B″ is ready. What return question opens now?',
    });

    expect(result.entry.corruptionFlags).toContain('L1');
  });

  test('rejects sub-phase override outside current phase', () => {
    const engine = new FractalEngine();

    expect(() => engine.processTurn({
      humanInput: 'This is a value artifact.',
      phaseOverride: 'V',
      subPhaseOverride: 'GG',
    })).toThrow('Sub-phase GG does not belong to phase V.');
  });
});

describe('Fractal Engine — completion', () => {
  test('completeCycle crystallizes B″ and returns to a new S state', () => {
    const engine = new FractalEngine();
    engine.processTurn({
      humanInput: 'The artifact is ready and the value can propagate.',
      phaseOverride: 'V',
    });

    const state = engine.completeCycle(
      'B″ = a formation brief carrying the session essence',
      'What question does this artifact make possible now?'
    );

    expect(state.phase).toBe('S');
    expect(state.cycleCount).toBe(2);
    expect(state.outputStates.X).toBe('NONE');
    expect(state.activeCorruption).not.toContain('V∅');
  });

  test('completeCycle is only lawful from V', () => {
    const engine = new FractalEngine();

    expect(() => engine.completeCycle(
      'B″ = premature artifact',
      'What question opens now?'
    )).toThrow('Cycle completion is lawful only from V.');
  });
});
