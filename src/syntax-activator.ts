// ═══════════════════════════════════════════════════════════════
// @5qln/core — Adaptive Syntax Activation
//
// Selects the slice of constitutional syntax that is alive *now*.
//
// The constitutional grammar is large and mostly silent at any
// given moment. At phase S the L¹ watch is live; at phase V the
// V∅ watch is live; the GG lens speaks only inside G; an L²
// recovery prompt is only ever needed when L² is flagged.
//
// The Activator reads kernel state and produces an ActiveSyntax
// view: which equation governs, which lens is open, what has
// formed, what is being watched, what is currently flagged, and
// whether the center is open. It does no detection and no AI
// work — it is pure adaptation, the live cross-section of the
// invariant.
//
// Scale Law: scale by repeating the lawful cell. Activation is
// the cell's surface as seen at this turn.
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type SubPhase,
  type OutputSymbol,
  type FormationState,
  type KernelState,
  type FieldCoherence,
  PHASE_INFO,
  LENS_INFO,
  COVENANT,
  AI_BOUNDARY,
} from './types.js';
import { PHASE_FORMATION } from './ai-adapter.js';
import { Codex, type CodexEntry } from './codex.js';

// ─── Active Syntax ───────────────────────────────────────────

const OUTPUT_SYMBOLS = ['X', 'Y', 'Z', 'A', 'B'] as const;

export interface FormedOutput {
  readonly symbol: OutputSymbol;
  readonly state: FormationState;
  readonly value: string | null;
}

export interface ActiveLens {
  readonly id: SubPhase;
  readonly name: string;
  readonly question: string;
}

export interface ActiveFormation {
  readonly task: string;
  readonly do: string;
  readonly dont: string;
  readonly test: string;
}

export interface ActiveField {
  readonly centerOpen: boolean;
  readonly modesEngaged: number;
  readonly modesValidated: number;
  readonly lensDepth: number;
}

export interface ActiveSyntax {
  // Phase layer — exactly one phase is governing at any moment.
  readonly phase: Phase;
  readonly phaseName: string;
  readonly phaseEquation: string;
  readonly phaseMode: string;
  readonly output: OutputSymbol;
  readonly outputName: string;

  // Lens layer — null unless a sub-phase is open.
  readonly lens: ActiveLens | null;

  // Formation rules drawn from PHASE_FORMATION.
  readonly formation: ActiveFormation;

  // What has formed in the current cycle. Outputs in NONE are filtered out.
  readonly formed: readonly FormedOutput[];

  // Codex layer — what corruption is watched here, what is flagged now.
  readonly watching: readonly CodexEntry[];
  readonly active: readonly CodexEntry[];

  // The constitutional baseline that never adapts.
  readonly covenant: typeof COVENANT;
  readonly aiBoundary: readonly string[];

  // The living question and the field.
  readonly questionLine: string | null;
  readonly field: ActiveField;
}

// ─── The Activator ───────────────────────────────────────────

export class SyntaxActivator {
  private readonly _codex: Codex;

  constructor(codex?: Codex) {
    this._codex = codex ?? new Codex();
  }

  /**
   * Compute the active syntax for the given kernel state.
   * If a FieldCoherence is supplied, its mode/lens counts are used;
   * otherwise they are derived from the state itself.
   */
  activate(state: KernelState, coherence?: FieldCoherence): ActiveSyntax {
    const info = PHASE_INFO[state.phase];
    const formation = PHASE_FORMATION[state.phase];

    const lens: ActiveLens | null = state.subPhase
      ? {
          id: state.subPhase,
          name: LENS_INFO[state.subPhase].lensName,
          question: LENS_INFO[state.subPhase].lensQuestion,
        }
      : null;

    const formed: FormedOutput[] = [];
    for (const sym of OUTPUT_SYMBOLS) {
      const formationState = state.outputStates[sym];
      if (formationState === 'NONE') continue;
      formed.push({
        symbol: sym,
        state: formationState,
        value: state.cycleTrace[sym] ?? null,
      });
    }

    const watching = this._codex
      .codesForPhase(state.phase)
      .map(c => this._codex.lookup(c));

    const active = state.activeCorruption.map(c => this._codex.lookup(c));

    const field: ActiveField = coherence
      ? {
          centerOpen: coherence.centerOpen,
          modesEngaged: coherence.modesEngaged,
          modesValidated: coherence.modesValidated,
          lensDepth: coherence.lensDepth,
        }
      : this._deriveField(state);

    return {
      phase: state.phase,
      phaseName: info.name,
      phaseEquation: info.equation,
      phaseMode: info.aiMode,
      output: info.outputSymbol,
      outputName: info.outputName,
      lens,
      formation,
      formed,
      watching,
      active,
      covenant: COVENANT,
      aiBoundary: AI_BOUNDARY,
      questionLine: state.questionLine,
      field,
    };
  }

  /**
   * A tight, phase-and-lens-aware prompt rendering of the active syntax.
   * Smaller and more focused than buildSystemPrompt — only what is live.
   */
  toPrompt(active: ActiveSyntax): string {
    const out: string[] = [];
    out.push(`Law: ${active.covenant}`);
    out.push(`Phase ${active.phase} (${active.phaseName}): ${active.phaseEquation}`);
    out.push(`Forming ${active.output} (${active.outputName}). Mode: ${active.phaseMode}.`);
    if (active.lens) {
      out.push(`Lens ${active.lens.id} (${active.lens.name}): ${active.lens.question}`);
    }
    out.push('');
    out.push('FORMATION:');
    out.push(`  TASK: ${active.formation.task}`);
    out.push(`  DO:   ${active.formation.do}`);
    out.push(`  DON'T: ${active.formation.dont}`);
    out.push(`  TEST: ${active.formation.test}`);

    if (active.formed.length) {
      out.push('');
      out.push('FORMED:');
      for (const f of active.formed) {
        const tail = f.value !== null ? `: ${f.value}` : '';
        out.push(`  ${f.symbol} [${f.state}]${tail}`);
      }
    }

    if (active.watching.length) {
      out.push('');
      out.push(
        `WATCHING: ${active.watching.map(w => `${w.code} (${w.name})`).join(', ')}`,
      );
    }

    if (active.active.length) {
      out.push('');
      out.push('ACTIVE CORRUPTION:');
      for (const e of active.active) {
        out.push(`  ${e.code} (${e.name}) — ${e.meaning}`);
        out.push(`  RECOVER: ${e.recovery}`);
      }
    }

    out.push('');
    if (active.questionLine) {
      out.push(`LIVING QUESTION: ${active.questionLine}`);
    }
    out.push(`CENTER ${active.field.centerOpen ? 'OPEN' : 'OBSTRUCTED'}.`);

    return out.join('\n');
  }

  /**
   * Compact, JSON-stable snapshot for logs, replay, and audit.
   * Stable enough to diff across turns.
   */
  toCanonical(active: ActiveSyntax): {
    phase: Phase;
    phase_equation: string;
    phase_mode: string;
    output: OutputSymbol;
    lens: { id: SubPhase; name: string } | null;
    formation_test: string;
    formed: { symbol: OutputSymbol; state: FormationState; has_value: boolean }[];
    watching: string[];
    active: string[];
    question_present: boolean;
    field: ActiveField;
  } {
    return {
      phase: active.phase,
      phase_equation: active.phaseEquation,
      phase_mode: active.phaseMode,
      output: active.output,
      lens: active.lens ? { id: active.lens.id, name: active.lens.name } : null,
      formation_test: active.formation.test,
      formed: active.formed.map(f => ({
        symbol: f.symbol,
        state: f.state,
        has_value: f.value !== null,
      })),
      watching: active.watching.map(w => w.code),
      active: active.active.map(e => e.code),
      question_present: active.questionLine !== null,
      field: active.field,
    };
  }

  // ─── Private ──────────────────────────────────────────────

  private _deriveField(state: KernelState): ActiveField {
    let modesEngaged = 0;
    let modesValidated = 0;
    for (const sym of OUTPUT_SYMBOLS) {
      const s = state.outputStates[sym];
      if (s !== 'NONE') modesEngaged++;
      if (s === 'VALIDATED') modesValidated++;
    }
    // lensDepth cannot be reconstructed from state alone (the kernel
    // tracks distinct lenses used internally); without coherence the
    // best we can do is "1 if a sub-phase is currently open, else 0".
    const lensDepth = state.subPhase ? 1 : 0;
    return {
      centerOpen: state.activeCorruption.length === 0,
      modesEngaged,
      modesValidated,
      lensDepth,
    };
  }
}

/**
 * Convenience: one-shot activation with a fresh Codex.
 * For repeated use, prefer constructing a SyntaxActivator once.
 */
export function activateSyntax(
  state: KernelState,
  coherence?: FieldCoherence,
): ActiveSyntax {
  return new SyntaxActivator().activate(state, coherence);
}
