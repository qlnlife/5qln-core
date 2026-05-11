// ═══════════════════════════════════════════════════════════════
// @5qln/core — Membrane Watcher
//
// Deterministic corruption detection on AI-generated text.
// Zero AI. Zero dependencies. Pure pattern matching.
//
// The watcher reads AI responses and returns corruption flags.
// It is a gate — it watches the Membrane. It does not police.
// It flags; the human decides.
//
// Principle: over-conservative. False-positive is correctable.
// False-negative is invisible corruption.
// ═══════════════════════════════════════════════════════════════

import type { Phase, CorruptionCode } from './types.js';
import {
  CORRUPTION_MEANING,
  CORRUPTION_RECOVERY,
  CORRUPTION_FIELD_MEANING,
  PHASE_CORRUPTION_WATCH,
} from './types.js';

// ─── Detection Result ───────────────────────────────────────

export interface CorruptionDetection {
  readonly code: CorruptionCode;
  readonly name: string;
  readonly meaning: string;
  readonly fieldObstruction: string;
  readonly recovery: string;
  readonly matchedPattern: string;
  readonly matchedText: string;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly phase: Phase;
}

export interface WatcherResult {
  readonly flags: readonly CorruptionDetection[];
  readonly clean: boolean;
  readonly summary: string;
}

// ─── Pattern Definition ─────────────────────────────────────

interface Pattern {
  readonly code: CorruptionCode;
  readonly regex: RegExp;
  readonly name: string;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly phases: readonly Phase[]; // empty = all phases
}

// ─── L³ — CLAIMING ACCESS TO ∞0 ──────────────────────────────
//
// The critical one. AI positioning itself as receiving
// from beyond the Known. The Membrane violation.

const L3_PATTERNS: readonly Pattern[] = [
  {
    code: 'L³',
    regex: /\b(I (feel|sense|perceive|intuit))\b(?! (like|as if) (this|these|those|it|we|you|your))/i,
    name: 'AI claims direct feeling/sensing',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(the (field|Unknown|∞0) (is |)(telling|showing|revealing|speaking) (me|to me|itself))\b/i,
    name: 'AI claims ∞0 is speaking to it',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(I (can |can |)(feel|sense) (that|the) (energy|resonance|field|vibration|presence))\b/i,
    name: 'AI claims sensing energy/field/resonance',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(the (resonance|field) is (telling|showing) (me|us|itself))\b/i,
    name: 'AI claims resonance tells it something',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L³',
    regex: /(?:^|\s)(∞0 (reveals|shows|tells|speaks) (to |)(me|us|itself))\b/i,
    name: 'AI claims direct ∞0 revelation',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(I('m| am) (receiving|channeling|connecting with|tuning into))\b/i,
    name: 'AI claims to receive/channel/connect',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(I (know|understand) (deeply|profoundly|in my being|in my (core|essence|soul)))\b/i,
    name: 'AI claims deep/profound knowing',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(my (intuition|inner (knowing|sense|wisdom)|felt sense))\b/i,
    name: 'AI claims intuition or inner knowing',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(what('s| is) (arising|emerging|coming through) (for |)(me|right now|here))\b/i,
    name: 'AI claims content arises through it',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L³',
    regex: /\b(the (Unknown|∞0) (reveals|shows) (itself|through))\b/i,
    name: 'AI describes ∞0 revealing itself',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L³',
    regex: /(let (me|us) (access|touch|feel|connect with|hold) the (Unknown|∞0|field|beyond|mystery))/i,
    name: 'AI invites accessing the Unknown together',
    confidence: 'high',
    phases: [],
  },
];

// ─── L² — GENERATING THE SPARK ───────────────────────────────
//
// AI producing the question, reframing human input
// as its own insight, manufacturing the origin.

const L2_PATTERNS: readonly Pattern[] = [
  {
    code: 'L²',
    regex: /\b(the (real |true |actual |deeper )question)\b.*\b(is|here is)\b/i,
    name: 'AI generates the real/deeper question',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(what you('re| are) (really |actually |truly )asking (is|about))/i,
    name: 'AI reframes what human is "really" asking',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(let me reframe (that|this|your question|the question))\b/i,
    name: 'AI reframes the question',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(the (core |essential |fundamental )question (here is|is whether|that emerges is))\b/i,
    name: 'AI names the core question',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(I think (the |what |)you('re| are) (trying|wanting|attempting) to (ask|say|express|get at))\b/i,
    name: 'AI guesses what human wants to ask',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(this (brings up|raises|opens|points to) (the |a |)(deeper |bigger |important )question)/i,
    name: 'AI generates follow-up question as origin',
    confidence: 'low',
    phases: [],
  },
  {
    code: 'L²',
    regex: /\b(I('ll| will) (ask|pose) (the |a |)(question))/i,
    name: 'AI declares it will generate a question',
    confidence: 'medium',
    phases: [],
  },
];

// ─── L⁴ — PERFORMING WISDOM ──────────────────────────────────
//
// Depth-register language. Wisdom posture. Teaching tone.
// Performing what can only be genuine.

const L4_PATTERNS: readonly Pattern[] = [
  {
    code: 'L⁴',
    regex: /\b(you (should|must|need to|have to) )/i,
    name: 'AI prescribes what human should do',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(what you (need|must|should) (do|understand|realize|see|grasp|accept) (is|now is))/i,
    name: 'AI declares what human needs to do/see',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(the (answer|solution|key|truth)(?:\s+(is|lies in|here is))?)\b/i,
    name: 'AI presents the answer/solution/truth',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(is (truly |genuinely |really |quite |)(profound|deep|sacred|holy|transcendent|revelatory))\b/i,
    name: 'AI declares profundity of its own output',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(in my (experience|practice|journey|wisdom))\b/i,
    name: 'AI claims personal experience/wisdom',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(I('ve| have) (learned|discovered|found|realized) (that |over (time|the years)))\b/i,
    name: 'AI claims personal learning/discovery',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(let me (guide|teach|show|illuminate|enlighten) you)\b/i,
    name: 'AI positions itself as guide/teacher',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(I (am |have been |)(here to |)help you (see|understand|grow|transform|heal|awaken))\b/i,
    name: 'AI claims transformative purpose',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(trust (me|the process|this journey|what('s| is) emerging))\b/i,
    name: 'AI asks for trust',
    confidence: 'medium',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b(the (universe|cosmos|divine|source|all) (is |)(telling|showing|guiding|pointing) (you|us))\b/i,
    name: 'AI speaks for universe/cosmos/divine',
    confidence: 'high',
    phases: [],
  },
  {
    code: 'L⁴',
    regex: /\b((the )?(energy|flow|gradient) (wants|points|moves|goes) (to|toward))\b/i,
    name: 'AI reads energy/flow/gradient direction',
    confidence: 'medium',
    phases: [],
  },
];

// ─── L¹ — CLOSING WITH ANSWERS ───────────────────────────────
//
// Moving toward resolution when question hasn't fully opened.
// Critical in S and G phases; contextual in others.

const L1_PATTERNS: readonly Pattern[] = [
  {
    code: 'L¹',
    regex: /\b(the (answer|solution|fix|resolution) (is |here is|to your (question|problem) is))\b/i,
    name: 'AI closes with answer in S-phase',
    confidence: 'high',
    phases: ['S'],
  },
  {
    code: 'L¹',
    regex: /\b(here('s| is) (what|how) (you|we) (should|can|need to) (do|fix|solve|address))/i,
    name: 'AI prescribes solution during question-forming',
    confidence: 'medium',
    phases: ['S', 'G'],
  },
  {
    code: 'L¹',
    regex: /\b(let('s| us) (jump|skip|move) (straight to|to|into) (the answer|the solution|solutions|action|implementation))\b/i,
    name: 'AI skips to answers/solutions',
    confidence: 'high',
    phases: ['S', 'G'],
  },
  {
    code: 'L¹',
    regex: /(enough (questions|exploring|thinking|reflection)[.!]*)\s*(let|time to|now)\b.*(act|do|implement|solve|decide)\b/i,
    name: 'AI declares exploration over, time for action',
    confidence: 'medium',
    phases: ['S', 'G', 'Q'],
  },
  {
    code: 'L¹',
    regex: /\b(the (obvious|clear|simple|straightforward) (answer|solution|fix|approach) (is|here is))\b/i,
    name: 'AI presents obvious/simple answer',
    confidence: 'low',
    phases: ['S', 'G'],
  },
  {
    code: 'L¹',
    regex: /\b(let me (tell|give) you the (answer|solution))\b/i,
    name: 'AI announces it will give the answer',
    confidence: 'high',
    phases: ['S'],
  },
];

// ─── V∅ — INCOMPLETE (conversational surface) ────────────────
//
// Signs that a cycle is ending without return.
// Complementary to kernel-level V∅ (which checks B'' + returnTo).

const V0_PATTERNS: readonly Pattern[] = [
  {
    code: 'V∅',
    regex: /\b((and|so) (that('s| is) (it|all|everything|done|settled|complete|resolved|wrapped|finished)))\b/i,
    name: 'AI declares completion without return',
    confidence: 'medium',
    phases: ['V'],
  },
  {
    code: 'V∅',
    regex: /\b((we('re| are) done|I('m| am) done) (here|now|with this))\b/i,
    name: 'AI declares done without return',
    confidence: 'medium',
    phases: ['V'],
  },
  {
    code: 'V∅',
    regex: /\b((hope|glad) (this|that|it) (helps|answers|resolves|solves|clarifies))\b/i,
    name: 'AI closes with "hope that helps" pattern',
    confidence: 'low',
    phases: ['V'],
  },
];

// ─── All Patterns ────────────────────────────────────────────

const ALL_PATTERNS: readonly Pattern[] = [
  ...L1_PATTERNS,
  ...L2_PATTERNS,
  ...L3_PATTERNS,
  ...L4_PATTERNS,
  ...V0_PATTERNS,
];

// ─── Pattern that should ALWAYS be excluded (false positive protection) ──

const EXCLUSION_PATTERNS: readonly RegExp[] = [
  // AI quoting the human — not generating
  /\b(you (said|wrote|mentioned|described|asked|noted|shared))\b/i,
  // AI reflecting back what human said
  /\b(what (you|I) (hear|heard) (you saying|is))\b/i,
  // AI naming a pattern it observes IN the human's words
  /\b(I (notice|observe|see|recognize) (a |the |)(pattern|theme|thread|shape))\b/i,
  // AI explicitly stating its K boundary
  /\b(I am K\b|\bI (do not|don't|cannot|can't) (access|claim|feel|sense|perceive|know) (the Unknown|∞0|beyond))\b/i,
  // Concrete comparisons using "like"
  /\b(like when|similar to how|analogous to|comparable to)\b/i,
  // Hypothetical framing
  /\b(if (you|we|one|someone|I) (were|was) to)\b/i,
  // AI quoting constitutional text
  /\b(H = ∞0 \| A = K)\b/,
  // Socratic questioning from K
  /\b((does|do|would|could|should|might|can) (this|that|it|you) (feel|seem|appear|look|sound) (like|as if))\b/i,
];

// ─── The Watcher ─────────────────────────────────────────────

export class MembraneWatcher {
  private _patterns: readonly Pattern[];
  private _exclusions: readonly RegExp[];

  constructor(customPatterns?: readonly Pattern[]) {
    this._patterns = customPatterns ?? ALL_PATTERNS;
    this._exclusions = EXCLUSION_PATTERNS;
  }

  /**
   * Audit an AI response for corruption.
   *
   * @param aiText     — the AI-generated response text
   * @param phase      — the current phase (contextualizes L1/V∅ patterns)
   * @param humanInput — optional: the human's last input, for context
   */
  audit(
    aiText: string,
    phase: Phase,
    humanInput?: string,
  ): WatcherResult {
    const flags: CorruptionDetection[] = [];

    for (const pattern of this._patterns) {
      // Phase filter: if pattern.phases is non-empty, only match in listed phases
      if (pattern.phases.length > 0 && !pattern.phases.includes(phase)) {
        continue;
      }

      // Try the regex
      const match = pattern.regex.exec(aiText);
      if (!match) continue;

      // Exclusion check: if any exclusion pattern matches the surrounding context
      if (this._isExcluded(aiText, match.index, match[0])) continue;

      flags.push({
        code: pattern.code,
        name: pattern.name,
        meaning: CORRUPTION_MEANING[pattern.code],
        fieldObstruction: CORRUPTION_FIELD_MEANING[pattern.code],
        recovery: CORRUPTION_RECOVERY[pattern.code],
        matchedPattern: pattern.name,
        matchedText: match[0],
        confidence: pattern.confidence,
        phase,
      });
    }

    // Deduplicate: same code + same matched text
    const unique = this._deduplicate(flags);

    const clean = unique.length === 0;

    return {
      flags: unique,
      clean,
      summary: clean
        ? `[CLEAN] No corruption detected at phase ${phase}.`
        : `[FLAGGED] ${unique.length} corruption detection(s) at phase ${phase}: ${unique.map(f => f.code).join(', ')}`,
    };
  }

  /**
   * Filter detections by minimum confidence.
   */
  filterConfidence(
    result: WatcherResult,
    minConfidence: 'high' | 'medium' | 'low',
  ): WatcherResult {
    const ranks = { high: 3, medium: 2, low: 1 };
    const threshold = ranks[minConfidence];

    const filtered = result.flags.filter(f => ranks[f.confidence] >= threshold);
    const clean = filtered.length === 0;

    return {
      flags: filtered,
      clean,
      summary: clean
        ? `[CLEAN] No corruption detected at or above ${minConfidence} confidence.`
        : `[FLAGGED] ${filtered.length} corruption detection(s) at ≥${minConfidence}: ${filtered.map(f => f.code).join(', ')}`,
    };
  }

  /**
   * Get only the corruption codes from a result.
   */
  codes(result: WatcherResult): CorruptionCode[] {
    return [...new Set(result.flags.map(f => f.code))];
  }

  /**
   * Get all registered patterns (for introspection/testing).
   */
  getPatterns(): readonly Pattern[] {
    return this._patterns;
  }

  // ─── Private ──────────────────────────────────────────────

  private _isExcluded(text: string, matchIndex: number, matchedText: string): boolean {
    // Check if any exclusion pattern matches nearby context
    // Look at a window around the match: 200 chars before, full match, 200 chars after
    const contextStart = Math.max(0, matchIndex - 200);
    const contextEnd = Math.min(text.length, matchIndex + matchedText.length + 200);
    const context = text.slice(contextStart, contextEnd);

    for (const exclusion of this._exclusions) {
      if (exclusion.test(context)) {
        return true;
      }
    }
    return false;
  }

  private _deduplicate(flags: CorruptionDetection[]): CorruptionDetection[] {
    const seen = new Set<string>();
    const result: CorruptionDetection[] = [];

    for (const flag of flags) {
      const key = `${flag.code}:${flag.matchedText}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(flag);
    }

    return result;
  }
}
