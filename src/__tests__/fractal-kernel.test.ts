// ═══════════════════════════════════════════════════════════════
// @5qln/core — Fractal Kernel Test Suite
//
// Tests the lawful cell repeated at every scale.
// A phase IS a full S→G→Q→P→V cycle.
// ═══════════════════════════════════════════════════════════════

import { FractalKernel } from '../fractal-kernel.js';

describe('Fractal Kernel — Lawful Cell at Every Scale', () => {

  // ─── Depth Recursion Basics ────────────────────────────────

  test('deepen runs a full cycle within a phase', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('G', 'trust erosion at complexity gate');

    expect(result.parentPhase).toBe('G');
    expect(result.depthLevel).toBe(1);
    expect(result.crystallizedFruit).toBeTruthy();
    expect(result.crystallizedFruit).toContain('FRACTAL FRUIT');
    expect(result.fieldCoherence.modesEngaged).toBe(5);
    expect(result.fieldCoherence.modesValidated).toBe(5);
    expect(result.summary).toContain('Fractal depth 1');
    expect(result.summary).toContain('cycle complete'); // because we didn't call return()
  });

  test('deepen produces different fruit for different phases', () => {
    const fk1 = new FractalKernel();
    const fk2 = new FractalKernel();
    const r1 = fk1.deepen('S', 'why does clarity feel elusive?');
    const r2 = fk2.deepen('V', 'why does clarity feel elusive?');

    // Both produce fruit but with different phase context
    expect(r1.crystallizedFruit).not.toBe(r2.crystallizedFruit);
    expect(r1.crystallizedFruit).toContain('from S');
    expect(r2.crystallizedFruit).toContain('from V');
  });

  test('deepen records child cycle trace with all XYZAB', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('P', 'energy gradient test');

    const trace = result.childCycle;
    expect(trace.X).toBeTruthy(); // S: seed received
    expect(trace.Y).toBeTruthy(); // G: pattern illuminated
    expect(trace.Z).toBeTruthy(); // Q: resonance tested
    expect(trace.A).toBeTruthy(); // P: gradient named
    expect(trace.B).toBeTruthy(); // V: benefit crystallized
    expect(trace.Bpp).toBeTruthy(); // B'': fractal fruit
  });

  // ─── Depth Stack ────────────────────────────────────────────

  test('depth stack records each deepening', () => {
    const fk = new FractalKernel();
    fk.deepen('G', 'seed one');
    fk.deepen('V', 'seed two');

    const stack = fk.getDepthStack();
    expect(stack.length).toBe(2);
    expect(stack[0].phase).toBe('G');
    expect(stack[0].depth).toBe(1);
    expect(stack[1].phase).toBe('V');
    expect(stack[1].depth).toBe(2);
  });

  test('depth stack entries have fruit and trace', () => {
    const fk = new FractalKernel();
    fk.deepen('Q', 'resonance exploration');

    const entry = fk.getDepthStack()[0];
    expect(entry.fruit).toBeTruthy();
    expect(entry.fruit).toContain('FRACTAL FRUIT');
    expect(entry.trace.X).toBeTruthy();
    expect(entry.trace.Bpp).toBeTruthy();
  });

  // ─── Max Depth ──────────────────────────────────────────────

  test('deepen enforces max depth', () => {
    const fk = new FractalKernel();
    fk.setMaxDepth(2);

    // First deepen: depth 1 — works
    const r1 = fk.deepen('G', 'seed');
    expect(r1.crystallizedFruit).toBeTruthy();

    // Second deepen: depth 2 — works
    const r2 = fk.deepen('V', 'seed');
    expect(r2.crystallizedFruit).toBeTruthy();

    // Third deepen: depth 3 — exceeds max, returns null fruit
    const r3 = fk.deepen('Q', 'seed');
    expect(r3.crystallizedFruit).toBeNull();
    expect(r3.summary).toContain('Cannot deepen further');
    expect(r3.depthLevel).toBe(3);
  });

  test('default max depth is 3', () => {
    const fk = new FractalKernel();
    fk.deepen('G', 'a');
    fk.deepen('V', 'b');
    fk.deepen('Q', 'c');
    const r4 = fk.deepen('P', 'd');
    expect(r4.crystallizedFruit).toBeNull();
  });

  // ─── onStep Callback ────────────────────────────────────────

  test('onStep callback called for all 5 phases', () => {
    const fk = new FractalKernel();
    const steps: { phase: string; depth: number }[] = [];

    fk.deepen('G', 'observation', (step) => {
      steps.push({ phase: step.phase, depth: step.depth });
    });

    expect(steps.length).toBe(5);
    expect(steps.map(s => s.phase)).toEqual(['S', 'G', 'Q', 'P', 'V']);
    expect(steps.every(s => s.depth === 1)).toBe(true);
  });

  test('onStep receives phase-appropriate output', () => {
    const fk = new FractalKernel();
    const outputs: Record<string, string> = {};

    fk.deepen('G', 'trust erosion test', (step) => {
      outputs[step.phase] = step.output;
    });

    // S gets the seed
    expect(outputs['S']).toContain('trust erosion test');
    // G gets illumination with pattern language
    expect(outputs['G']).toContain('α');
    // Q gets resonance testing
    expect(outputs['Q']).toContain('φ∩Ω');
    // P gets energy gradient
    expect(outputs['P']).toContain('∇');
    // V gets crystallized fruit
    expect(outputs['V']).toContain('FRACTAL FRUIT');
  });

  // ─── Deepen with Lenses ────────────────────────────────────

  test('deepenWithLenses uses sub-phase exploration', () => {
    const fk = new FractalKernel();
    const result = fk.deepenWithLenses('G', 'pattern recursion');

    expect(result.crystallizedFruit).toBeTruthy();
    expect(result.fieldCoherence.lensDepth).toBe(5); // all 5 sub-phases explored
    expect(result.fieldCoherence.modesEngaged).toBe(5);
  });

  test('deepenWithLenses records lens usage in child trace', () => {
    const fk = new FractalKernel();
    const result = fk.deepenWithLenses('V', 'completion pattern');

    // The child cycle used all 5 sub-phase lenses
    expect(result.fieldCoherence.lensDepth).toBe(5);
  });

  test('deepenWithLenses produces different fruit than plain deepen', () => {
    const fk1 = new FractalKernel();
    const fk2 = new FractalKernel();

    const r1 = fk1.deepen('G', 'trust');
    const r2 = fk2.deepenWithLenses('G', 'trust');

    // Both produce fruit, but with-lenses has more depth markers
    expect(r1.crystallizedFruit).toBeTruthy();
    expect(r2.crystallizedFruit).toBeTruthy();
    // With-lenses should have higher lens engagement
    expect(r2.fieldCoherence.lensDepth).toBeGreaterThan(r1.fieldCoherence.lensDepth);
  });

  // ─── Fractal Self-Similarity ───────────────────────────────

  test('deepen produces self-similar structure across phases', () => {
    const phases = ['S', 'G', 'Q', 'P', 'V'] as const;
    const results = phases.map(p => {
      const fk = new FractalKernel();
      return fk.deepen(p, 'test seed');
    });

    // All produce 5-mode engaged, crystallized fruit
    for (const r of results) {
      expect(r.fieldCoherence.modesEngaged).toBe(5);
      expect(r.crystallizedFruit).toBeTruthy();
      expect(r.crystallizedFruit).toContain('FRACTAL FRUIT');
    }
  });

  test('deepen from V produces return-aware fruit', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('V', 'completion test');
    expect(result.crystallizedFruit).toContain('value crystallization');
  });

  test('deepen from S produces question-deepening fruit', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('S', 'genuine inquiry');
    expect(result.crystallizedFruit).toContain('question itself');
  });

  // ─── Inheritance from Kernel ───────────────────────────────

  test('FractalKernel inherits all Kernel methods', () => {
    const fk = new FractalKernel();

    // Parent kernel operations still work
    expect(fk.getPhase().phase).toBe('S');
    fk.captureInput('parent question');
    expect(fk.getOutputStates().X).toBe('EMERGING');

    // Deepen doesn't affect parent state
    const result = fk.deepen('G', 'deep seed');
    expect(result.crystallizedFruit).toBeTruthy();

    // Parent state remains intact
    expect(fk.getPhase().phase).toBe('S');
    expect(fk.getOutputStates().X).toBe('EMERGING');
    expect(fk.getCycleTrace().X).toBe('parent question');
  });

  test('parent and child kernels are isolated', () => {
    const fk = new FractalKernel();
    fk.captureInput('parent X');
    fk.transition('G');
    fk.captureInput('parent Y');

    // Deepen — spawns child
    const result = fk.deepen('V', 'child seed');

    // Child has its own cycle
    expect(result.childCycle.X).toContain('child seed');
    expect(result.childCycle.X).not.toBe('parent X');

    // Parent is unchanged
    expect(fk.getPhase().phase).toBe('G');
    expect(fk.getCycleTrace().X).toBe('parent X');
  });

  // ─── Progressive Deepening ─────────────────────────────────

  test('deepen can chain: one phase fruit seeds next phase', () => {
    const fk = new FractalKernel();

    // Deepen G — get fruit
    const r1 = fk.deepen('G', 'initial pattern');
    const fruit = r1.crystallizedFruit!;
    expect(fruit).toBeTruthy();

    // Use fruit as seed for next deepening
    const r2 = fk.deepen('Q', fruit);
    expect(r2.crystallizedFruit).toBeTruthy();
    expect(r2.depthLevel).toBe(2);

    // Stack records both
    const stack = fk.getDepthStack();
    expect(stack.length).toBe(2);
  });

  test('chained deepening produces coherent lineage', () => {
    const fk = new FractalKernel();
    fk.deepen('G', 'step 1');
    fk.deepen('Q', 'step 2');
    fk.deepen('P', 'step 3');
    fk.deepen('V', 'step 4');
    fk.deepen('S', 'step 5');

    const stack = fk.getDepthStack();
    expect(stack.length).toBe(3);
    // Depths are sequential
    expect(stack[0].depth).toBe(1);
    expect(stack[2].depth).toBe(3);
  });

  // ─── Field Coherence ───────────────────────────────────────

  test('child cycle field coherence reports correctly', () => {
    const fk = new FractalKernel();
    const result = fk.deepenWithLenses('G', 'coherence test');

    expect(result.fieldCoherence.modesEngaged).toBe(5);
    expect(result.fieldCoherence.modesValidated).toBe(5);
    expect(result.fieldCoherence.lensDepth).toBe(5); // all 5 sub-phases
    expect(result.fieldCoherence.returnCompleted).toBe(false); // no explicit return
    expect(result.fieldCoherence.centerOpen).toBe(false);
  });

  test('max-depth return has zero coherence', () => {
    const fk = new FractalKernel();
    fk.setMaxDepth(1);
    fk.deepen('G', 'only one');

    const r2 = fk.deepen('V', 'too deep');
    expect(r2.fieldCoherence.modesEngaged).toBe(0);
  });

  // ─── Summary Reports ───────────────────────────────────────

  test('summary includes depth level and phase', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('Q', 'resonance check');

    expect(result.summary).toContain('Fractal depth 1');
    expect(result.summary).toContain('within Q');
  });

  test('summary reports crystallization state', () => {
    const fk = new FractalKernel();
    const result = fk.deepen('V', 'final check');

    expect(result.summary).toContain('Fruit: crystallized');
  });

  test('max-depth summary explains limitation', () => {
    const fk = new FractalKernel();
    fk.setMaxDepth(1);
    fk.deepen('G', 'first');
    const result = fk.deepen('V', 'second');

    expect(result.summary).toContain('Cannot deepen further');
  });
});
