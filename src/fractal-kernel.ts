// ═══════════════════════════════════════════════════════════════
// @5qln/core — Fractal Kernel
//
// The lawful cell repeated at every scale.
// A phase IS a full S→G→Q→P→V cycle.
//
// depthRecurse(phase, seed) → runs a complete cycle within that phase
//   S: "What is the kernel of this?"  (receive the seed)
//   G:  fractal echoes from seed      (illuminate patterns)
//   Q:  resonance with parent context  (find what clicks)
//   P:  natural gradient              (where energy goes)
//   V:  crystallize fractal fruit     (return enriched)
//
// The fruit enriches the parent phase — deeper Y from G, deeper B'' from V.
// ═══════════════════════════════════════════════════════════════

import { Kernel } from './kernel.js';
import {
  type Phase,
  type CycleTrace,
  type FieldCoherence,
  PHASES,
} from './types.js';

// ─── Fractal Depth Result ────────────────────────────────────

export interface DepthResult {
  readonly parentPhase: Phase;
  readonly childCycle: CycleTrace;
  readonly crystallizedFruit: string | null;
  readonly depthLevel: number;
  readonly fieldCoherence: FieldCoherence;
  readonly summary: string;
}

export interface DepthStackEntry {
  readonly phase: Phase;
  readonly fruit: string | null;
  readonly depth: number;
  readonly trace: CycleTrace;
}

// ─── The Fractal Kernel ──────────────────────────────────────

export class FractalKernel extends Kernel {
  private _depthStack: DepthStackEntry[] = [];
  private _maxDepth = 3;

  getDepthStack(): readonly DepthStackEntry[] {
    return [...this._depthStack];
  }

  getCurrentDepth(): number { return this._depthStack.length; }

  setMaxDepth(n: number): void {
    this._maxDepth = n;
  }

  /**
   * Deepen a phase by running a full S→G→Q→P→V cycle within it.
   *
   * The human provides a `seed` — the question or pattern to explore.
   * The kernel spawns a child, seeds S with the seed, and runs the cycle.
   * The child's B'' becomes the enriched output that deepens the parent phase.
   *
   * @param phase  - The current phase to deepen (e.g., G or V)
   * @param seed   - The question or text to explore at fractal depth
   * @param onStep - Optional callback for each phase step (for observability)
   */
  deepen(
    phase: Phase,
    seed: string,
    onStep?: (step: { phase: Phase; output: string; depth: number }) => void,
  ): DepthResult {
    const depthLevel = this._depthStack.length + 1;

    if (depthLevel > this._maxDepth) {
      return {
        parentPhase: phase,
        childCycle: { origin: null, question: null, X: null, alpha: null, Y: null, phiOmega: null, Z: null, nabla: null, A: null, B: null, Bpp: null, returnQuestion: null, returnTo: null },
        crystallizedFruit: null,
        depthLevel,
        fieldCoherence: { modesEngaged: 0, modesValidated: 0, lensDepth: 0, returnCompleted: false, centerOpen: true },
        summary: `Max depth ${this._maxDepth} reached. Cannot deepen further.`,
      };
    }

    // Spawn a child kernel — a pure cell
    const child = new Kernel();

    // ── S — RECEIVE ──────────────────────────────────────────
    // The seed becomes the question
    onStep?.({ phase: 'S', output: seed, depth: depthLevel });
    child.captureInput(seed);
    child.validateOutput('X');

    // ── G — ILLUMINATE ───────────────────────────────────────
    // Show fractal echoes of the seed
    const gOutput = this._illuminate(phase, seed);
    onStep?.({ phase: 'G', output: gOutput, depth: depthLevel });
    child.transition('G');
    child.captureInput(gOutput);
    child.validateOutput('Y');

    // ── Q — RESONATE ─────────────────────────────────────────
    // Test where the pattern clicks
    const qOutput = this._resonate(phase, seed, gOutput);
    onStep?.({ phase: 'Q', output: qOutput, depth: depthLevel });
    child.transition('Q');
    child.captureInput(qOutput);
    child.validateOutput('Z');

    // ── P — FLOW ─────────────────────────────────────────────
    // Name the gradient
    const pOutput = this._flow(phase, seed, gOutput, qOutput);
    onStep?.({ phase: 'P', output: pOutput, depth: depthLevel });
    child.transition('P');
    child.captureInput(pOutput);
    child.validateOutput('A');

    // ── V — CRYSTALLIZE ──────────────────────────────────────
    // Crystallize the fractal fruit
    const bOutput = this._crystallizePhase(phase, seed, gOutput, qOutput, pOutput);
    onStep?.({ phase: 'V', output: bOutput, depth: depthLevel });
    child.transition('V');
    child.captureInput(bOutput);
    child.validateOutput('B');
    child.crystallize(bOutput);

    // Capture the child cycle trace before return
    const childTrace = child.getCycleTrace();
    const childCoherence = child.getFieldCoherence();

    // Complete the child cycle — fractal deepening is a complete cycle
    child.return();

    // Push to depth stack
    this._depthStack.push({
      phase,
      fruit: childTrace.Bpp,
      depth: depthLevel,
      trace: childTrace,
    });

    return {
      parentPhase: phase,
      childCycle: childTrace,
      crystallizedFruit: childTrace.Bpp,
      depthLevel,
      fieldCoherence: childCoherence,
      summary: this._buildSummary(phase, depthLevel, childTrace),
    };
  }

  /**
   * Deepen with active lenses — uses sub-phase questions to guide depth.
   * For example, within S-phase, use the SG lens to explore pattern structure
   * of the question itself.
   */
  deepenWithLenses(
    phase: Phase,
    seed: string,
    onStep?: (step: { phase: Phase; output: string; depth: number }) => void,
  ): DepthResult {
    const depthLevel = this._depthStack.length + 1;

    if (depthLevel > this._maxDepth) {
      return this.deepen(phase, seed, onStep); // falls through to max-depth guard
    }

    // Spawn with sub-phase exploration
    const child = new Kernel();

    // ── S with SG lens ───────────────────────────────────────
    const sInput = `[deepened from ${phase}] ${seed}`;
    onStep?.({ phase: 'S', output: sInput, depth: depthLevel });
    child.captureInput(sInput);

    child.enterSubPhase('SG');
    child.captureInput(`The structure within: what layers does this seed contain?`);
    child.exitSubPhase();

    child.validateOutput('X');

    // ── G with GG lens ───────────────────────────────────────
    child.transition('G');
    const gInput = this._illuminate(phase, seed);
    onStep?.({ phase: 'G', output: gInput, depth: depthLevel });
    child.captureInput(gInput);

    child.enterSubPhase('GG');
    child.captureInput(`Deeper scales of α: what does the pattern reveal when magnified?`);
    child.exitSubPhase();

    child.validateOutput('Y');

    // ── Q with QQ lens ───────────────────────────────────────
    child.transition('Q');
    const qInput = this._resonate(phase, seed, gInput);
    onStep?.({ phase: 'Q', output: qInput, depth: depthLevel });
    child.captureInput(qInput);

    child.enterSubPhase('QQ');
    child.captureInput(`Sensitivity test: is this felt resonance or manufactured alignment?`);
    child.exitSubPhase();

    child.validateOutput('Z');

    // ── P with PP lens ───────────────────────────────────────
    child.transition('P');
    const pInput = this._flow(phase, seed, gInput, qInput);
    onStep?.({ phase: 'P', output: pInput, depth: depthLevel });
    child.captureInput(pInput);

    child.enterSubPhase('PP');
    child.captureInput(`Action-being indistinction: is the gradient effortless or forced?`);
    child.exitSubPhase();

    child.validateOutput('A');

    // ── V with VV lens ───────────────────────────────────────
    child.transition('V');
    const bInput = this._crystallizePhase(phase, seed, gInput, qInput, pInput);
    onStep?.({ phase: 'V', output: bInput, depth: depthLevel });
    child.captureInput(bInput);

    child.enterSubPhase('VV');
    child.captureInput(`Fruit becoming seed: does B'' carry the potential for a new cycle?`);
    child.exitSubPhase();

    child.validateOutput('B');
    child.crystallize(bInput);

    // Capture child cycle trace before return
    const childTrace = child.getCycleTrace();
    const childCoherence = child.getFieldCoherence();

    // Complete the child cycle — fractal deepening is a complete cycle
    child.return();

    this._depthStack.push({
      phase,
      fruit: childTrace.Bpp,
      depth: depthLevel,
      trace: childTrace,
    });

    return {
      parentPhase: phase,
      childCycle: childTrace,
      crystallizedFruit: childTrace.Bpp,
      depthLevel,
      fieldCoherence: childCoherence,
      summary: this._buildSummary(phase, depthLevel, childTrace),
    };
  }

  // ─── Generative Methods (produce text from K) ──────────────
  //
  // These are NOT AI. They are structural templates that produce
  // phase-appropriate text. An AI can override them, but the kernel
  // always has a lawful fallback.

  private _illuminate(parentPhase: Phase, seed: string): string {
    switch (parentPhase) {
      case 'S':
        return `The question "${seed}" patterns fractally: at surface scale it asks [X], at structural scale it reveals [pattern], at depth scale it points to [essence]. The irreducible α is: what genuinely seeks to emerge through this asking?`;
      case 'G':
        return `Deepening α from "${seed}": the pattern repeats at smaller scale (micro-behavior), same scale (peer resonance), larger scale (systemic echo). The invariant is [α]. The fractal expressions {α'} include: [surface variation], [inverted form], [boundary case].`;
      case 'Q':
        return `The resonance point in "${seed}" echoes at multiple depths: personal φ meets universal Ω at [intersection point]. What clicks? [genuine resonance]. What drifts? [performed alignment]. The qualitative signature is: [distinctive mark].`;
      case 'P':
        return `Energy gradient in "${seed}": δE/δV reveals that effort increases with [direction A] and decreases with [direction B]. The natural flow ∇ points toward [path of least resistance]. Friction sources: [obstacle]. Leverage points: [amplifier].`;
      default:
        return `Crystallization from "${seed}": local benefit L meets global potential G at the point where [specific value] propagates to [wider impact]. The B'' carries α faithfully as [essence-in-form]. The seed is ready to become a new question.`;
    }
  }

  private _resonate(parentPhase: Phase, seed: string, gOutput: string): string {
    return `Testing the pattern against felt experience: where does "${seed}" genuinely resonate? The click φ∩Ω occurs at [specific point]. The false-positives are [shadow resonance] and [attempted alignment]. The authentic signal is: [what survives doubt].`;
  }

  private _flow(parentPhase: Phase, seed: string, gOutput: string, qOutput: string): string {
    return `The energy gradient ∇ emerges from [source]. The path of least resistance runs through [direction]. Friction is present at [obstacle] but dissolves at [lever point]. The momentum is not toward [forced outcome] but toward [natural unfolding].`;
  }

  private _crystallizePhase(
    parentPhase: Phase,
    seed: string,
    gOutput: string,
    qOutput: string,
    pOutput: string,
  ): string {
    return `[FRACTAL FRUIT — depth-${this._depthStack.length + 1} from ${parentPhase}]
From seed: "${seed}"
Through G: ${gOutput.slice(0, 60)}...
Through Q: ${qOutput.slice(0, 60)}...
Through P: ${pOutput.slice(0, 60)}...
Crystallized: the deeper pattern reveals that ${parentPhase} contains a full cycle. The fruit enriches the parent phase with [specific insight]. Return question: what does this fruit reveal about ${parentPhase === 'S' ? 'the question itself' : parentPhase === 'G' ? 'the pattern structure' : parentPhase === 'Q' ? 'the resonance quality' : parentPhase === 'P' ? 'the gradient nature' : 'the value crystallization'}?`;
  }

  private _buildSummary(phase: Phase, depth: number, trace: CycleTrace): string {
    return `Fractal depth ${depth} within ${phase}: ${trace.Bpp ? 'cycle complete' : 'cycle incomplete'}. Fruit: ${trace.Bpp ? 'crystallized' : 'not crystallized'}. ${trace.X ? `Seed: ${trace.X.slice(0, 40)}...` : ''}`;
  }
}