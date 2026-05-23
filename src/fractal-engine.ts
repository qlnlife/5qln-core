// ═══════════════════════════════════════════════════════════════
// @5qln/core — Fractal Engine
//
// Turns human language into phase-aware formation trail entries
// while keeping AI bounded to K.
// ═══════════════════════════════════════════════════════════════

import { Kernel } from './kernel.js';
import { MembraneWatcher, type WatcherResult } from './membrane-watcher.js';
import {
  type CorruptionCode,
  type CycleTrace,
  type FormationState,
  type FormationTrails,
  type KernelState,
  type OutputSymbol,
  type Phase,
  type SubPhase,
  CORRUPTION_FIELD_MEANING,
  CORRUPTION_MEANING,
  CORRUPTION_RECOVERY,
  LENS_INFO,
  PHASE_INFO,
  PHASE_OUTPUT,
} from './types.js';

export type PhaseConfidence = 'high' | 'medium' | 'low';

export interface PhaseSignal {
  readonly phrase: string;
  readonly reason: string;
  readonly weight: number;
}

export interface PhaseScore {
  readonly phase: Phase;
  readonly score: number;
  readonly signals: readonly PhaseSignal[];
}

export interface PhaseRoute {
  readonly phase: Phase;
  readonly confidence: PhaseConfidence;
  readonly why: string;
  readonly scores: readonly PhaseScore[];
}

export interface SubPhaseRoute {
  readonly subPhase: SubPhase;
  readonly confidence: PhaseConfidence;
  readonly why: string;
}

export interface FormationTrailEntry {
  readonly phase: Phase;
  readonly subPhase: SubPhase | null;
  readonly outputSymbol: OutputSymbol;
  readonly outputState: FormationState;
  readonly humanInput: string;
  readonly aiReflection: string;
  readonly phaseWhy: string;
  readonly membraneSummary: string;
  readonly corruptionFlags: readonly CorruptionCode[];
  readonly recoveryPrompts: readonly string[];
  readonly humanValidated: boolean;
  readonly timestamp: string;
}

export interface FractalTurnRequest {
  readonly humanInput: string;
  readonly aiReflection?: string;
  readonly phaseOverride?: Phase;
  readonly subPhaseOverride?: SubPhase;
  readonly humanValidated?: boolean;
}

export interface FractalTurnResult {
  readonly route: PhaseRoute;
  readonly subPhase: SubPhaseRoute;
  readonly watcher: WatcherResult;
  readonly entry: FormationTrailEntry;
  readonly state: KernelState;
  readonly cycleTrace: CycleTrace;
  readonly formationTrails: FormationTrails;
}

const PHASE_ORDER: readonly Phase[] = ['S', 'G', 'Q', 'P', 'V'] as const;

const PHASE_SIGNALS: Record<Phase, readonly { pattern: RegExp; reason: string; weight: number }[]> = {
  S: [
    { pattern: /\b(I don't know|I do not know|not sure|can't (yet )?name|cannot (yet )?name|unclear|mystery|unknown|not knowing)\b/i, reason: 'language of not-knowing', weight: 4 },
    { pattern: /\b(question|inquiry|ask|asking|wonder|wondering)\b/i, reason: 'question is active', weight: 3 },
    { pattern: /\b(wants to emerge|trying to appear|underneath|alive underneath|what is alive|seed|spark)\b/i, reason: 'emergence language', weight: 4 },
    { pattern: /\?/, reason: 'explicit question mark', weight: 2 },
    { pattern: /\b(before|prior to|first|start|begin)\b/i, reason: 'origin language', weight: 1 },
  ],
  G: [
    { pattern: /\b(pattern|echo|fractal|self-similar|recurs|recurring|across scales|same structure)\b/i, reason: 'pattern recognition language', weight: 4 },
    { pattern: /\b(essence|core|alpha|α|identity|DNA|thread)\b/i, reason: 'essence language', weight: 4 },
    { pattern: /\b(shows up|appears in|manifests|expression|branches|unfolds)\b/i, reason: 'expression across forms', weight: 2 },
    { pattern: /\b(map|mirror|illuminate|decode)\b/i, reason: 'Known-side illumination language', weight: 2 },
  ],
  Q: [
    { pattern: /\b(resonate|resonance|lands|landed|click|felt|feels true|rightness|alignment)\b/i, reason: 'resonance-testing language', weight: 4 },
    { pattern: /\b(body|room|sense|felt sense|quality|authentic|φ|omega|Ω)\b/i, reason: 'quality/field validation language', weight: 3 },
    { pattern: /\b(does this|is this true|validates|validate|confirmation|confirm)\b/i, reason: 'human validation language', weight: 2 },
  ],
  P: [
    { pattern: /\b(next step|next move|movement|action|flow|gradient|∇|path|least resistance)\b/i, reason: 'movement/gradient language', weight: 4 },
    { pattern: /\b(energy|effort|friction|resistance|leverage|momentum|stuck|unstuck)\b/i, reason: 'energy/friction language', weight: 3 },
    { pattern: /\b(easiest|smallest|practical|implement|build|ship|do)\b/i, reason: 'action-forming language', weight: 2 },
  ],
  V: [
    { pattern: /\b(artifact|deliverable|crystallize|crystallized|harvest|summary|output|result|benefit)\b/i, reason: 'artifact/value language', weight: 4 },
    { pattern: /\b(value|gift|fruit|seed|propagate|share|publish|complete|completion)\b/i, reason: 'local/global value language', weight: 3 },
    { pattern: /\b(return question|new question|opens now|next inquiry|∞0['′])\b/i, reason: 'return-to-∞0 language', weight: 4 },
  ],
} as const;

const SUB_PHASE_LENS: Record<Phase, readonly { lens: Phase; patterns: readonly RegExp[] }[]> = {
  S: [
    { lens: 'S', patterns: [/\b(silence|pause|wait|hold|not knowing|unknown)\b/i] },
    { lens: 'G', patterns: [/\b(pattern|structure|shape|thread)\b/i] },
    { lens: 'Q', patterns: [/\b(feels|felt|lands|real|true)\b/i] },
    { lens: 'P', patterns: [/\b(pull|momentum|move|direction)\b/i] },
    { lens: 'V', patterns: [/\b(gift|benefit|value|asking itself)\b/i] },
  ],
  G: [
    { lens: 'S', patterns: [/\b(unknown|still unclear|not yet)\b/i] },
    { lens: 'G', patterns: [/\b(fractal|echo|self-similar|across scales|pattern)\b/i] },
    { lens: 'Q', patterns: [/\b(authentic|resembles|lands|resonates)\b/i] },
    { lens: 'P', patterns: [/\b(unfold|next|grow|direction)\b/i] },
    { lens: 'V', patterns: [/\b(gift|value|benefit)\b/i] },
  ],
  Q: [
    { lens: 'S', patterns: [/\b(doubt|fresh|open|unknown)\b/i] },
    { lens: 'G', patterns: [/\b(pattern|distinguish|attraction)\b/i] },
    { lens: 'Q', patterns: [/\b(click|resonance|resonates|lands|alignment)\b/i] },
    { lens: 'P', patterns: [/\b(effortless|without searching|moves)\b/i] },
    { lens: 'V', patterns: [/\b(regenerative|benefit|value)\b/i] },
  ],
  P: [
    { lens: 'S', patterns: [/\b(assumption|actually wants|unknown)\b/i] },
    { lens: 'G', patterns: [/\b(pattern|shape|guiding)\b/i] },
    { lens: 'Q', patterns: [/\b(true|works and|resonates)\b/i] },
    { lens: 'P', patterns: [/\b(flow|energy|gradient|least resistance)\b/i] },
    { lens: 'V', patterns: [/\b(surplus|generosity|value|benefit)\b/i] },
  ],
  V: [
    { lens: 'S', patterns: [/\b(surprising|beyond plan|opens)\b/i] },
    { lens: 'G', patterns: [/\b(carry|faithful|essence|α)\b/i] },
    { lens: 'Q', patterns: [/\b(resonate|genuinely|lands)\b/i] },
    { lens: 'P', patterns: [/\b(propagate|flow|reach|gradient)\b/i] },
    { lens: 'V', patterns: [/\b(return|new question|∞0['′]|fruit becoming seed)\b/i] },
  ],
} as const;

function now(): string {
  return new Date().toISOString();
}

function confidenceFor(score: number, nextScore: number): PhaseConfidence {
  if (score >= 7 && score - nextScore >= 2) return 'high';
  if (score >= 4 && nextScore === 0) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function containsQuestion(text: string): boolean {
  return /[?？]/.test(text) || /\b(what|why|how|where|when|who|which|whether|could|can|might|does|do|is|are)\b/i.test(text);
}

function makeSubPhase(parent: Phase, lens: Phase): SubPhase {
  return `${parent}${lens}` as SubPhase;
}

function countMatches(text: string, patterns: readonly RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) count += 1;
  }
  return count;
}

export class FractalEngine {
  private readonly _kernel: Kernel;
  private readonly _watcher: MembraneWatcher;
  private readonly _entries: FormationTrailEntry[] = [];
  private readonly _structuralCorruption: CorruptionCode[] = [];

  constructor(kernel?: Kernel, watcher?: MembraneWatcher) {
    this._kernel = kernel ?? new Kernel();
    this._watcher = watcher ?? new MembraneWatcher();
  }

  route(input: string): PhaseRoute {
    const scores = PHASE_ORDER.map((phase): PhaseScore => {
      const signals: PhaseSignal[] = [];
      let score = 0;

      for (const signal of PHASE_SIGNALS[phase]) {
        const match = signal.pattern.exec(input);
        if (!match) continue;
        score += signal.weight;
        signals.push({
          phrase: match[0],
          reason: signal.reason,
          weight: signal.weight,
        });
      }

      return { phase, score, signals };
    }).sort((a, b) => b.score - a.score);

    const [top, second] = scores;
    const route = top.score === 0
      ? this._fallbackRoute(input, scores)
      : top;

    const confidence = confidenceFor(route.score, second?.score ?? 0);
    const signalText = route.signals.length > 0
      ? route.signals.map(s => `${s.reason} ("${s.phrase}")`).join('; ')
      : 'no strong lexical signal; defaulting to the current formation need';

    return {
      phase: route.phase,
      confidence,
      why: signalText,
      scores,
    };
  }

  routeSubPhase(parent: Phase, input: string): SubPhaseRoute {
    const scored = SUB_PHASE_LENS[parent]
      .map(item => ({ lens: item.lens, score: countMatches(input, item.patterns) }))
      .sort((a, b) => b.score - a.score);

    const selected = scored[0].score > 0 ? scored[0] : { lens: parent, score: 0 };
    const subPhase = makeSubPhase(parent, selected.lens);
    const lens = LENS_INFO[subPhase];

    return {
      subPhase,
      confidence: selected.score > 1 ? 'high' : selected.score === 1 ? 'medium' : 'low',
      why: selected.score > 0
        ? `${subPhase} lens selected for ${lens.lensName}: ${lens.lensQuestion}`
        : `${subPhase} lens selected by parent phase default: ${lens.lensQuestion}`,
    };
  }

  processTurn(request: FractalTurnRequest): FractalTurnResult {
    const route = request.phaseOverride
      ? this._overrideRoute(request.phaseOverride)
      : this.route(request.humanInput);
    const subPhase = request.subPhaseOverride
      ? this._overrideSubPhase(request.subPhaseOverride)
      : this.routeSubPhase(route.phase, request.humanInput);
    this._assertSubPhaseBelongsToPhase(route.phase, subPhase.subPhase);

    const previousState = this._kernel.getState();
    this._kernel.transition(route.phase);
    this._structuralCorruption.push(...this._detectTransitionCorruption(previousState, route.phase));
    const before = this._kernel.getState();
    const needsMainOutput = before.outputStates[PHASE_OUTPUT[route.phase]] === 'NONE';
    const inputResult = needsMainOutput
      ? this._kernel.captureInput(request.humanInput)
      : this._captureThroughLens(subPhase.subPhase, request.humanInput);

    if (request.humanValidated) {
      this._kernel.validateOutput(PHASE_OUTPUT[route.phase]);
    }

    const aiReflection = request.aiReflection ?? this.buildBoundedReflection(route, subPhase, request.humanInput);
    const watcher = this._enforceReturn(
      route.phase,
      aiReflection,
      this._watcher.audit(aiReflection, route.phase, request.humanInput),
    );

    const kernelCorruption = this._kernel.checkCorruption();
    const corruptionFlags = this._dedupeCorruption([
      ...watcher.flags.map(flag => flag.code),
      ...kernelCorruption,
      ...this._structuralCorruption,
    ]);

    const entry: FormationTrailEntry = {
      phase: route.phase,
      subPhase: subPhase.subPhase,
      outputSymbol: inputResult.outputSymbol,
      outputState: inputResult.outputUpdate,
      humanInput: request.humanInput,
      aiReflection,
      phaseWhy: route.why,
      membraneSummary: watcher.summary,
      corruptionFlags,
      recoveryPrompts: corruptionFlags.map(code => CORRUPTION_RECOVERY[code]),
      humanValidated: request.humanValidated ?? false,
      timestamp: now(),
    };

    this._entries.push(entry);

    return {
      route,
      subPhase,
      watcher,
      entry,
      state: this._kernel.getState(),
      cycleTrace: this._kernel.getCycleTrace(),
      formationTrails: this._kernel.getFormationTrails(),
    };
  }

  buildBoundedReflection(route: PhaseRoute, subPhase: SubPhaseRoute, humanInput: string): string {
    const info = PHASE_INFO[route.phase];
    const prefix = `From K, phase ${route.phase} (${info.aiMode})`;

    switch (route.phase) {
      case 'S':
        return `${prefix}: I can reflect that a question is forming in "${humanInput}". I will not name it for you. What is actually wanting to be asked?`;
      case 'G':
        return `${prefix}: A possible α is visible through repeated language patterns. This is only a mirror through ${subPhase.subPhase}; does it preserve your originating question?`;
      case 'Q':
        return `${prefix}: I can offer a candidate resonance, not claim the click. Does this land for you, or is it only coherent?`;
      case 'P':
        return `${prefix}: I can compare energy and value to reveal a possible ∇. Which next movement feels least forced?`;
      case 'V':
        return `${prefix}: I can help shape B'' as local value with propagating seed. What return question does this open now?`;
    }
  }

  completeCycle(artifact: string, returnQuestion: string): KernelState {
    if (this._kernel.getState().phase !== 'V') {
      throw new Error('Cycle completion is lawful only from V.');
    }

    this._kernel.captureInput(artifact);
    this._kernel.validateOutput('B');
    this._kernel.crystallize(`${artifact}\n\n∞0′: ${returnQuestion}`);
    const returned = this._kernel.return();
    return returned.newState;
  }

  hasReturnQuestion(text: string): boolean {
    return /\b(return question|new question|question.*opens|opens.*question|∞0['′]|what .* opens|what .* now\?)\b/i.test(text);
  }

  getFormationTrail(): readonly FormationTrailEntry[] {
    return [...this._entries];
  }

  getState(): KernelState {
    return this._kernel.getState();
  }

  private _fallbackRoute(input: string, scores: readonly PhaseScore[]): PhaseScore {
    const state = this._kernel.getState();
    const phase = containsQuestion(input) ? 'S' : state.phase;
    return {
      phase,
      score: containsQuestion(input) ? 2 : 1,
      signals: [{
        phrase: input.slice(0, 80),
        reason: containsQuestion(input) ? 'question-form input without stronger downstream signal' : 'continuing current phase',
        weight: containsQuestion(input) ? 2 : 1,
      }],
    };
  }

  private _overrideRoute(phase: Phase): PhaseRoute {
    return {
      phase,
      confidence: 'high',
      why: 'human override',
      scores: PHASE_ORDER.map(p => ({ phase: p, score: p === phase ? 1 : 0, signals: [] })),
    };
  }

  private _overrideSubPhase(subPhase: SubPhase): SubPhaseRoute {
    const lens = LENS_INFO[subPhase];
    return {
      subPhase,
      confidence: 'high',
      why: `human override: ${lens.lensQuestion}`,
    };
  }

  private _captureThroughLens(subPhase: SubPhase, input: string) {
    this._kernel.enterSubPhase(subPhase);
    const result = this._kernel.captureInput(input);
    this._kernel.exitSubPhase();
    return result;
  }

  private _assertSubPhaseBelongsToPhase(phase: Phase, subPhase: SubPhase): void {
    if (!subPhase.startsWith(phase)) {
      throw new Error(`Sub-phase ${subPhase} does not belong to phase ${phase}.`);
    }
  }

  private _dedupeCorruption(codes: readonly CorruptionCode[]): readonly CorruptionCode[] {
    return [...new Set(codes)];
  }

  private _detectTransitionCorruption(previousState: KernelState, targetPhase: Phase): readonly CorruptionCode[] {
    const previousIndex = PHASE_ORDER.indexOf(previousState.phase);
    const targetIndex = PHASE_ORDER.indexOf(targetPhase);

    if (targetIndex > previousIndex + 1) return ['L¹'];
    if (previousState.phase === 'S' && targetPhase !== 'S' && previousState.outputStates.X === 'NONE') return ['L¹'];
    if (previousState.phase === 'G' && targetPhase === 'Q' && previousState.outputStates.Y === 'NONE') return ['L¹'];
    if (previousState.phase === 'Q' && targetPhase === 'P' && previousState.outputStates.Z === 'NONE') return ['L¹'];
    if (previousState.phase === 'P' && targetPhase === 'V' && previousState.outputStates.A === 'NONE') return ['L¹'];

    return [];
  }

  private _enforceReturn(phase: Phase, aiReflection: string, watcher: WatcherResult): WatcherResult {
    if (phase !== 'V' || this.hasReturnQuestion(aiReflection)) {
      return watcher;
    }

    const flags = [
      ...watcher.flags,
      {
        code: 'V∅' as const,
        name: 'Missing ∞0′ return question',
        meaning: CORRUPTION_MEANING['V∅'],
        fieldObstruction: CORRUPTION_FIELD_MEANING['V∅'],
        recovery: CORRUPTION_RECOVERY['V∅'],
        matchedPattern: 'V output lacks return question',
        matchedText: aiReflection,
        confidence: 'high' as const,
        phase,
      },
    ];

    return {
      flags,
      clean: false,
      summary: `[FLAGGED] ${flags.length} corruption detection(s) at phase ${phase}: ${flags.map(f => f.code).join(', ')}`,
    };
  }
}
