// ═══════════════════════════════════════════════════════════════
// @5qln/core — Adaptive Syntax Activation Tests
//
// Verifies that the activator produces the live cross-section of
// constitutional syntax that matches the kernel state — phase,
// lens, formation rules, formed outputs, watch, active, field.
// ═══════════════════════════════════════════════════════════════

import {
  Kernel,
  Codex,
  SyntaxActivator,
  activateSyntax,
  PHASE_INFO,
  PHASE_FORMATION,
  PHASE_CORRUPTION_WATCH,
  LENS_INFO,
  COVENANT,
  AI_BOUNDARY,
  PHASES,
  type Phase,
} from '../index.js';


describe('SyntaxActivator — phase adaptation', () => {

  test('activates the S phase syntax at session start', () => {
    const kernel = new Kernel();
    kernel.captureInput('Why does clarity feel elusive?');
    const active = activateSyntax(kernel.getState());

    expect(active.phase).toBe('S');
    expect(active.phaseName).toBe('Start');
    expect(active.phaseEquation).toBe(PHASE_INFO.S.equation);
    expect(active.phaseMode).toBe('RECEIVE');
    expect(active.output).toBe('X');
    expect(active.outputName).toBe('Validated Spark');
  });

  test('phase data updates with every transition', () => {
    const activator = new SyntaxActivator();
    const kernel = new Kernel();
    kernel.captureInput('q');

    for (const phase of PHASES) {
      if (phase !== 'S') {
        kernel.transition(phase);
        kernel.captureInput(`${phase}-input`);
      }
      const active = activator.activate(kernel.getState());
      expect(active.phase).toBe(phase);
      expect(active.phaseEquation).toBe(PHASE_INFO[phase].equation);
      expect(active.phaseMode).toBe(PHASE_INFO[phase].aiMode);
      expect(active.output).toBe(PHASE_INFO[phase].outputSymbol);
    }
  });

  test('formation rules match PHASE_FORMATION for the active phase', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.transition('G');
    const active = activateSyntax(kernel.getState());
    expect(active.formation.task).toBe(PHASE_FORMATION.G.task);
    expect(active.formation.do).toBe(PHASE_FORMATION.G.do);
    expect(active.formation.dont).toBe(PHASE_FORMATION.G.dont);
    expect(active.formation.test).toBe(PHASE_FORMATION.G.test);
  });
});


describe('SyntaxActivator — lens adaptation', () => {

  test('lens is null when no sub-phase is open', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    expect(active.lens).toBeNull();
  });

  test('lens activates when a sub-phase is entered', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.enterSubPhase('SG');
    const active = activateSyntax(kernel.getState());
    expect(active.lens).not.toBeNull();
    expect(active.lens!.id).toBe('SG');
    expect(active.lens!.name).toBe(LENS_INFO.SG.lensName);
    expect(active.lens!.question).toBe(LENS_INFO.SG.lensQuestion);
  });

  test('lens deactivates after exiting the sub-phase', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.enterSubPhase('SQ');
    expect(activateSyntax(kernel.getState()).lens).not.toBeNull();
    kernel.exitSubPhase();
    expect(activateSyntax(kernel.getState()).lens).toBeNull();
  });
});


describe('SyntaxActivator — formed outputs', () => {

  test('outputs in NONE are filtered out', () => {
    const kernel = new Kernel();
    const active = activateSyntax(kernel.getState());
    expect(active.formed).toEqual([]);
  });

  test('formed outputs reflect kernel state and carry trace values', () => {
    const kernel = new Kernel();
    kernel.captureInput('the question');
    kernel.transition('G');
    kernel.captureInput('the pattern');
    const active = activateSyntax(kernel.getState());

    const symbols = active.formed.map(f => f.symbol);
    expect(symbols).toEqual(['X', 'Y']);
    expect(active.formed[0].value).toBe('the question');
    expect(active.formed[1].value).toBe('the pattern');
  });

  test('VALIDATED outputs are reported with their state', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.validateOutput('X');
    const active = activateSyntax(kernel.getState());
    expect(active.formed[0].symbol).toBe('X');
    expect(active.formed[0].state).toBe('VALIDATED');
  });
});


describe('SyntaxActivator — corruption layer (Codex composition)', () => {

  test('watching list at S contains both L¹ and L²', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    const codes = active.watching.map(w => w.code);
    expect(codes).toEqual(expect.arrayContaining(PHASE_CORRUPTION_WATCH.S as readonly string[]));
  });

  test('watching list at V contains V∅', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.transition('V');
    const active = activateSyntax(kernel.getState());
    expect(active.watching.map(w => w.code)).toContain('V∅');
  });

  test('every watching entry comes from the Codex with full metadata', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    for (const entry of active.watching) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.meaning.length).toBeGreaterThan(0);
      expect(entry.recovery.length).toBeGreaterThan(0);
    }
  });

  test('active corruption is empty on a clean S start', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    expect(active.active).toEqual([]);
  });

  test('active corruption is populated when L¹ is induced', () => {
    const kernel = new Kernel();
    // Leaving S with X = NONE triggers L¹.
    kernel.transition('G');
    const active = activateSyntax(kernel.getState());
    const codes = active.active.map(e => e.code);
    expect(codes).toContain('L¹');
  });
});


describe('SyntaxActivator — field state', () => {

  test('center is open when no corruption is active', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    expect(active.field.centerOpen).toBe(true);
  });

  test('center is obstructed when corruption is active', () => {
    const kernel = new Kernel();
    kernel.transition('G'); // L¹
    const active = activateSyntax(kernel.getState());
    expect(active.field.centerOpen).toBe(false);
  });

  test('field counts derive correctly without coherence input', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.transition('G');
    kernel.captureInput('p');
    kernel.validateOutput('X');
    const active = activateSyntax(kernel.getState());
    expect(active.field.modesEngaged).toBe(2);
    expect(active.field.modesValidated).toBe(1);
  });

  test('explicit FieldCoherence overrides the derived field', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const coherence = kernel.getFieldCoherence();
    const active = new SyntaxActivator().activate(kernel.getState(), coherence);
    expect(active.field.lensDepth).toBe(coherence.lensDepth);
    expect(active.field.modesEngaged).toBe(coherence.modesEngaged);
    expect(active.field.modesValidated).toBe(coherence.modesValidated);
  });
});


describe('SyntaxActivator — baseline invariants', () => {

  test('covenant and AI boundary are always present, exactly', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activateSyntax(kernel.getState());
    expect(active.covenant).toBe(COVENANT);
    expect(active.aiBoundary).toEqual(AI_BOUNDARY);
  });

  test('an injected Codex is honored', () => {
    const customCodex = new Codex();
    const activator = new SyntaxActivator(customCodex);
    const kernel = new Kernel();
    kernel.captureInput('q');
    const active = activator.activate(kernel.getState());
    expect(active.watching.length).toBeGreaterThan(0);
  });
});


describe('SyntaxActivator — render', () => {

  test('toPrompt includes phase, equation, formation, and watch', () => {
    const kernel = new Kernel();
    kernel.captureInput('Why does clarity feel elusive?');
    const activator = new SyntaxActivator();
    const active = activator.activate(kernel.getState());
    const prompt = activator.toPrompt(active);

    expect(prompt).toContain('Law:');
    expect(prompt).toContain(active.phaseEquation);
    expect(prompt).toContain('FORMATION');
    expect(prompt).toContain('WATCHING:');
    expect(prompt).toContain('CENTER OPEN');
    expect(prompt).toContain('LIVING QUESTION');
  });

  test('toPrompt omits lens block when no sub-phase is open', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    const activator = new SyntaxActivator();
    const prompt = activator.toPrompt(activator.activate(kernel.getState()));
    expect(prompt).not.toContain('Lens ');
  });

  test('toPrompt includes lens line when sub-phase is open', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.enterSubPhase('SG');
    const activator = new SyntaxActivator();
    const prompt = activator.toPrompt(activator.activate(kernel.getState()));
    expect(prompt).toContain('Lens SG');
    expect(prompt).toContain(LENS_INFO.SG.lensQuestion);
  });

  test('toPrompt surfaces recovery when corruption is active', () => {
    const kernel = new Kernel();
    kernel.transition('G'); // L¹
    const activator = new SyntaxActivator();
    const prompt = activator.toPrompt(activator.activate(kernel.getState()));
    expect(prompt).toContain('ACTIVE CORRUPTION');
    expect(prompt).toContain('L¹');
    expect(prompt).toContain('RECOVER:');
    expect(prompt).toContain('CENTER OBSTRUCTED');
  });

  test('toCanonical roundtrips through JSON', () => {
    const kernel = new Kernel();
    kernel.captureInput('q');
    kernel.enterSubPhase('SG');
    kernel.captureInput('lens');
    const activator = new SyntaxActivator();
    const canonical = activator.toCanonical(activator.activate(kernel.getState()));
    const json = JSON.stringify(canonical);
    expect(JSON.parse(json)).toEqual(canonical);

    expect(canonical.phase).toBe('S');
    expect(canonical.lens?.id).toBe('SG');
    expect(canonical.formed.find(f => f.symbol === 'X')?.has_value).toBe(true);
  });
});
