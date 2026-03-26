// ═══════════════════════════════════════════════════════════════
// @5qln/core — Kernel
//
// The deterministic state machine that holds the 5QLN law.
// Zero dependencies. Zero AI. Zero UI. Pure law.
//
// The decoder is the invariant. The shell is the variable.
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type SubPhase,
  type OutputSymbol,
  type FormationState,
  type CorruptionCode,
  type KernelState,
  type CycleTrace,
  type OutputStates,
  type FormationTrails,
  type TrailEntry,
  type InputResult,
  type CorruptionEvent,
  type FieldCoherence,
  PHASES,
  SUB_PHASES,
  PHASE_OUTPUT,
  FORMATION_STATES,
} from './types.js';

// ─── Helpers ─────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function emptyTrace(): CycleTrace {
  return {
    origin: now(),
    question: null,
    X: null, alpha: null, Y: null,
    phiOmega: null, Z: null,
    nabla: null, A: null,
    B: null, Bpp: null,
    returnQuestion: null, returnTo: null,
  };
}

function emptyOutputStates(): OutputStates {
  return { X: 'NONE', Y: 'NONE', Z: 'NONE', A: 'NONE', B: 'NONE' };
}

function emptyFormationTrails(): FormationTrails {
  return { X: [], Y: [], Z: [], A: [], B: [] };
}

/** Advance formation state one step (idempotent at VALIDATED) */
function advanceFormation(current: FormationState, isLens: boolean): FormationState {
  if (current === 'VALIDATED') return 'VALIDATED';
  if (current === 'NONE') return 'EMERGING';
  if (current === 'EMERGING') return 'FORMING';
  // FORMING stays FORMING — only validateOutput promotes to VALIDATED
  return 'FORMING';
}

// ─── The Kernel ──────────────────────────────────────────────

export class Kernel {
  private _phase: Phase = 'S';
  private _subPhase: SubPhase | null = null;
  private _questionLine: string | null = null;
  private _cycleTrace: CycleTrace;
  private _outputStates: OutputStates;
  private _formationTrails: FormationTrails;
  private _corruptionHistory: CorruptionEvent[] = [];
  private _branch: string = 'main';
  private _sessionId: string;
  private _cycleCount: number = 1;
  private _sparkSource: 'human' | 'residue' = 'human';
  private _sourceLineage: string | null = null;
  private _returnCompleted: boolean = false;
  private _inputHistory: string[] = [];
  private _phasesVisited: Set<Phase> = new Set(['S']);
  private _lensesUsed: Set<SubPhase> = new Set();

  constructor() {
    this._sessionId = generateId();
    this._cycleTrace = emptyTrace();
    this._outputStates = emptyOutputStates();
    this._formationTrails = emptyFormationTrails();
  }

  // ─── Phase Navigation ────────────────────────────────────

  getPhase(): { phase: Phase; subPhase: SubPhase | null } {
    return { phase: this._phase, subPhase: this._subPhase };
  }

  transition(phase: Phase): KernelState {
    // Run corruption checks on exit from current phase
    this._checkTransitionCorruption(phase);

    this._phase = phase;
    this._subPhase = null;
    this._phasesVisited.add(phase);

    return this.getState();
  }

  enterSubPhase(lens: SubPhase): KernelState {
    // Validate: lens must belong to current phase
    const validLenses = SUB_PHASES[this._phase];
    if (!validLenses.includes(lens)) {
      throw new Error(
        `Sub-phase ${lens} does not belong to phase ${this._phase}. ` +
        `Valid lenses: ${validLenses.join(', ')}`
      );
    }

    this._subPhase = lens;
    this._lensesUsed.add(lens);
    return this.getState();
  }

  exitSubPhase(): KernelState {
    this._subPhase = null;
    return this.getState();
  }

  // ─── Input (Serve-vs-Be Rule enforced here) ──────────────

  captureInput(text: string): InputResult {
    const outputSymbol = PHASE_OUTPUT[this._phase];
    const isLens = this._subPhase !== null;
    const currentState = this._outputStates[outputSymbol];
    const hasOutput = currentState !== 'NONE';

    // Build trail entry
    const trailEntry: TrailEntry = {
      text,
      lens: this._subPhase ?? this._phase,
      timestamp: now(),
    };

    // Record in formation trail (always — lens or main)
    const trails = { ...this._formationTrails };
    trails[outputSymbol] = [...trails[outputSymbol], trailEntry];
    this._formationTrails = trails as FormationTrails;

    // Record in input history
    this._inputHistory.push(text);

    let isNewOutput = false;
    let isRefinement = false;
    let isLensInput = false;
    let newFormationState: FormationState;

    if (isLens) {
      // ── Rule 2: Sub-phase active ──
      // Serves formation through lens. Trail recorded above.
      // Output symbol and question line NOT overwritten.
      isLensInput = true;
      newFormationState = advanceFormation(currentState, true);
    } else if (!hasOutput) {
      // ── Rule 1: First input at phase, no lens ──
      // This IS the output emerging.
      isNewOutput = true;
      newFormationState = 'EMERGING';
      this._setOutput(outputSymbol, text);
      if (this._phase === 'S') {
        this._questionLine = text;
      }
    } else {
      // ── Rule 3: Main-phase input, output exists ──
      // Refines the output.
      isRefinement = true;
      newFormationState = 'FORMING';
      this._setOutput(outputSymbol, text);
      if (this._phase === 'S') {
        this._questionLine = text;
      }
    }

    // Update output state
    const states = { ...this._outputStates };
    states[outputSymbol] = newFormationState;
    this._outputStates = states as OutputStates;

    return {
      phaseTag: this._phase,
      subPhaseTag: this._subPhase,
      outputSymbol,
      outputUpdate: newFormationState,
      trailEntry,
      isNewOutput,
      isRefinement,
      isLensInput,
    };
  }

  // ─── Output Lifecycle ────────────────────────────────────

  validateOutput(symbol?: OutputSymbol): KernelState {
    const target = symbol ?? PHASE_OUTPUT[this._phase];
    const current = this._outputStates[target];

    if (current === 'NONE') {
      throw new Error(`Cannot validate ${target}: no output has emerged yet.`);
    }

    const states = { ...this._outputStates };
    states[target] = 'VALIDATED';
    this._outputStates = states as OutputStates;

    return this.getState();
  }

  crystallize(content: string): KernelState {
    if (this._phase !== 'V') {
      throw new Error('Crystallization is lawful only at V.');
    }

    const trace = { ...this._cycleTrace };
    trace.Bpp = content;
    this._cycleTrace = trace as CycleTrace;

    return this.getState();
  }

  // ─── Cycle Lifecycle ─────────────────────────────────────

  return(): { newState: KernelState; enrichedOrigin: string } {
    // Check: B'' must exist
    if (!this._cycleTrace.Bpp) {
      this._recordCorruption('V∅');
    }

    const returnTimestamp = now();
    const trace = { ...this._cycleTrace };
    trace.returnTo = returnTimestamp;
    this._cycleTrace = trace as CycleTrace;
    this._returnCompleted = true;

    const enrichedOrigin = returnTimestamp;

    // Reset for new cycle
    this._phase = 'S';
    this._subPhase = null;
    this._questionLine = null;
    this._cycleTrace = emptyTrace();
    this._outputStates = emptyOutputStates();
    this._formationTrails = emptyFormationTrails();
    this._inputHistory = [];
    this._phasesVisited = new Set(['S']);
    this._lensesUsed = new Set();
    this._cycleCount++;
    this._returnCompleted = false;
    // sparkSource stays until explicitly changed via reopenResidue

    return { newState: this.getState(), enrichedOrigin };
  }

  reopenResidue(question: string, provenanceHash: string): KernelState {
    this._sparkSource = 'residue';
    this._sourceLineage = provenanceHash;
    this._questionLine = question;

    // Inject as X emerging
    const states = { ...this._outputStates };
    states.X = 'EMERGING';
    this._outputStates = states as OutputStates;

    const trace = { ...this._cycleTrace };
    trace.X = question;
    trace.question = question;
    this._cycleTrace = trace as CycleTrace;

    return this.getState();
  }

  // ─── Branching ───────────────────────────────────────────

  branch(name: string): KernelState {
    this._branch = name;
    return this.getState();
  }

  // ─── Corruption ──────────────────────────────────────────

  checkCorruption(): CorruptionCode[] {
    const active: CorruptionCode[] = [];

    // L¹: Premature exit from S — moved past S with X = NONE
    if (this._phase !== 'S' && this._outputStates.X === 'NONE') {
      active.push('L¹');
      this._recordCorruption('L¹');
    }

    // Structural skip: G without Y at Q or beyond
    const phaseIndex = PHASES.indexOf(this._phase);
    if (phaseIndex >= 2 && this._outputStates.Y === 'NONE') {
      // Not a named L-code in the constitution, but tracked as L¹ (closing)
      // because skipping outputs is a form of closing toward answer
    }

    // V∅: B'' exists but no return
    if (this._cycleTrace.Bpp && !this._cycleTrace.returnTo) {
      active.push('V∅');
    }

    return active;
  }

  // ─── Field Coherence ─────────────────────────────────────

  getFieldCoherence(): FieldCoherence {
    // Modes engaged = how many phases have outputs beyond NONE
    const outputs = this._outputStates;
    let modesEngaged = 0;
    let modesValidated = 0;
    for (const sym of ['X', 'Y', 'Z', 'A', 'B'] as OutputSymbol[]) {
      if (outputs[sym] !== 'NONE') modesEngaged++;
      if (outputs[sym] === 'VALIDATED') modesValidated++;
    }

    return {
      modesEngaged,
      modesValidated,
      lensDepth: this._lensesUsed.size,
      returnCompleted: this._returnCompleted,
      // centerOpen is true when no active corruption fills the center.
      // The center is open because nothing is obstructing it.
      // The field cannot be detected by its presence — only by the absence of what blocks it.
      centerOpen: this.checkCorruption().length === 0,
    };
  }

  // ─── State Access (all return immutable copies) ──────────

  getState(): KernelState {
    return {
      phase: this._phase,
      subPhase: this._subPhase,
      questionLine: this._questionLine,
      cycleTrace: { ...this._cycleTrace },
      outputStates: { ...this._outputStates },
      formationTrails: this._copyTrails(),
      corruptionHistory: [...this._corruptionHistory],
      activeCorruption: this.checkCorruption(),
      branch: this._branch,
      sessionId: this._sessionId,
      cycleCount: this._cycleCount,
      sparkSource: this._sparkSource,
      sourceLineage: this._sourceLineage,
      returnCompleted: this._returnCompleted,
    };
  }

  getCycleTrace(): CycleTrace {
    return { ...this._cycleTrace };
  }

  getFormationTrails(): FormationTrails {
    return this._copyTrails();
  }

  getOutputStates(): OutputStates {
    return { ...this._outputStates };
  }

  getCorruptionHistory(): CorruptionEvent[] {
    return [...this._corruptionHistory];
  }

  getInputHistory(): string[] {
    return [...this._inputHistory];
  }

  getSessionId(): string {
    return this._sessionId;
  }

  getBranch(): string {
    return this._branch;
  }

  getCycleCount(): number {
    return this._cycleCount;
  }

  getSparkSource(): 'human' | 'residue' {
    return this._sparkSource;
  }

  getSourceLineage(): string | null {
    return this._sourceLineage;
  }

  getPhasesVisited(): Phase[] {
    return [...this._phasesVisited];
  }

  getLensesUsed(): SubPhase[] {
    return [...this._lensesUsed];
  }

  // ─── Private Helpers ─────────────────────────────────────

  private _setOutput(symbol: OutputSymbol, text: string): void {
    const trace = { ...this._cycleTrace };

    switch (symbol) {
      case 'X':
        (trace as { X: string | null }).X = text;
        (trace as { question: string | null }).question = text;
        break;
      case 'Y':
        (trace as { Y: string | null }).Y = text;
        (trace as { alpha: string | null }).alpha = text;
        break;
      case 'Z':
        (trace as { Z: string | null }).Z = text;
        (trace as { phiOmega: string | null }).phiOmega = text;
        break;
      case 'A':
        (trace as { A: string | null }).A = text;
        (trace as { nabla: string | null }).nabla = text;
        break;
      case 'B':
        (trace as { B: string | null }).B = text;
        break;
    }

    this._cycleTrace = trace;
  }

  private _checkTransitionCorruption(targetPhase: Phase): void {
    // L¹: leaving S without X
    if (this._phase === 'S' && targetPhase !== 'S' && this._outputStates.X === 'NONE') {
      this._recordCorruption('L¹');
    }
  }

  private _recordCorruption(code: CorruptionCode): void {
    // Don't double-record the same code in the same phase
    const alreadyRecorded = this._corruptionHistory.some(
      e => e.code === code && e.phase === this._phase && !e.resolved
    );
    if (alreadyRecorded) return;

    this._corruptionHistory.push({
      code,
      phase: this._phase,
      timestamp: now(),
      resolved: false,
    });
  }

  private _copyTrails(): FormationTrails {
    return {
      X: [...this._formationTrails.X],
      Y: [...this._formationTrails.Y],
      Z: [...this._formationTrails.Z],
      A: [...this._formationTrails.A],
      B: [...this._formationTrails.B],
    };
  }
}
