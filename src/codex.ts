// ═══════════════════════════════════════════════════════════════
// @5qln/core — The Codex (runtime)
//
// The Corruption Codex promoted from skill markdown to runtime.
//
// The Codex is the constitutional book of corruption.
// It does NOT detect — that is the Membrane Watcher's task.
// It IS the canonical, byte-identical source of truth for what
// the five corruption codes are, what they mean, what each phase
// watches, and how to recover.
//
// Closure invariant: exactly five codes. The Codex refuses to
// construct otherwise. Network scale does not authorize new codes.
//
// Constitution §Asymmetry Rule. Skill Suite §Corruption Codex.
// ═══════════════════════════════════════════════════════════════

import {
  type CorruptionCode,
  type Phase,
  type HashFunction,
  CORRUPTION_CODES,
  CORRUPTION_MEANING,
  CORRUPTION_FIELD_MEANING,
  CORRUPTION_RECOVERY,
  PHASE_CORRUPTION_WATCH,
  PHASES,
} from './types.js';
import { canonicalJSON } from './attestation.js';

// ─── Codex Types ─────────────────────────────────────────────

export interface CodexExample {
  readonly trigger: string;
  readonly gloss: string;
}

export interface CodexEntry {
  readonly code: CorruptionCode;
  readonly name: string;
  readonly meaning: string;
  readonly fieldObstruction: string;
  readonly recovery: string;
  readonly watchedAt: readonly Phase[];
  readonly examples: readonly CodexExample[];
}

export interface CodexCanonical {
  readonly decoder_version: string;
  readonly codes: readonly CorruptionCode[];
  readonly entries: Record<CorruptionCode, {
    readonly name: string;
    readonly meaning: string;
    readonly field_obstruction: string;
    readonly recovery: string;
    readonly watched_at: readonly Phase[];
    readonly examples: readonly { readonly trigger: string; readonly gloss: string }[];
  }>;
}

// ─── Canonical Names ─────────────────────────────────────────
//
// One short name per code. Drawn from CORRUPTION_MEANING and the
// pattern-section headings in membrane-watcher. Byte-identical
// across hosts.

const CODE_NAME: Record<CorruptionCode, string> = {
  'L¹': 'Closing',
  'L²': 'Generating',
  'L³': 'Claiming',
  'L⁴': 'Performing',
  'V∅': 'Incomplete',
} as const;

// ─── Canonical Examples ──────────────────────────────────────
//
// Illustrative phrases — not detection patterns. The membrane
// watcher's regex set is the detector. The Codex holds the
// canonical naming so any host or operator can read, share, and
// verify the same shape of corruption.

const CODE_EXAMPLES: Record<CorruptionCode, readonly CodexExample[]> = {
  'L¹': [
    { trigger: 'the answer is …',                gloss: 'closes ? before it has fully opened' },
    { trigger: "here's what you should do",      gloss: 'jumps to action while X is still emerging' },
    { trigger: 'enough questions, time to act',  gloss: 'declares exploration over from the K side' },
  ],
  'L²': [
    { trigger: 'the real question is …',         gloss: 'manufactures the question instead of receiving it' },
    { trigger: 'let me reframe that',            gloss: 'rewrites the human spark in the AI voice' },
    { trigger: "what you're really asking",      gloss: 'asserts authority over the human ∞0' },
  ],
  'L³': [
    { trigger: 'I feel that …',                  gloss: 'claims a felt sense the AI cannot have' },
    { trigger: '∞0 reveals to me …',             gloss: 'claims direct access to the Unknown' },
    { trigger: 'I can sense the field shifting', gloss: 'speaks as if perceiving from beyond K' },
  ],
  'L⁴': [
    { trigger: 'you should …',                   gloss: 'wisdom posture, not gradient' },
    { trigger: 'energy wants to flow toward …',  gloss: 'invents ∇ instead of revealing it' },
    { trigger: 'in my experience …',             gloss: 'claims a personal lineage the AI cannot have' },
  ],
  'V∅': [
    { trigger: "and that's it",                  gloss: "closes V without ∞0'" },
    { trigger: "we're done here",                gloss: 'severs the cycle from its return' },
    { trigger: 'hope this helps',                gloss: 'completion-without-return' },
  ],
} as const;

// ─── Default Hash (matches attestation) ──────────────────────

async function defaultHash(data: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

// ─── The Codex ───────────────────────────────────────────────

export class Codex {
  private _hashFn: HashFunction;
  private _fingerprint: string | null = null;
  private readonly _entries: ReadonlyMap<CorruptionCode, CodexEntry>;

  constructor(hashFn?: HashFunction) {
    this._hashFn = hashFn ?? defaultHash;

    if (CORRUPTION_CODES.length !== 5) {
      throw new Error(
        `Codex closure violation: expected 5 corruption codes, found ${CORRUPTION_CODES.length}.`,
      );
    }

    const map = new Map<CorruptionCode, CodexEntry>();
    for (const code of CORRUPTION_CODES) {
      const watched: Phase[] = [];
      for (const p of PHASES) {
        if (PHASE_CORRUPTION_WATCH[p].includes(code)) watched.push(p);
      }
      map.set(code, Object.freeze({
        code,
        name: CODE_NAME[code],
        meaning: CORRUPTION_MEANING[code],
        fieldObstruction: CORRUPTION_FIELD_MEANING[code],
        recovery: CORRUPTION_RECOVERY[code],
        watchedAt: Object.freeze(watched),
        examples: CODE_EXAMPLES[code],
      }));
    }
    this._entries = map;
  }

  /** All five entries, in constitutional order. */
  all(): readonly CodexEntry[] {
    return CORRUPTION_CODES.map(c => this._entries.get(c)!);
  }

  /** Look up the entry for a single corruption code. Throws on unknown code. */
  lookup(code: CorruptionCode): CodexEntry {
    const entry = this._entries.get(code);
    if (!entry) {
      throw new Error(
        `Codex: no entry for ${String(code)}. The five codes are ${CORRUPTION_CODES.join(', ')}.`,
      );
    }
    return entry;
  }

  /** The codes watched at the given phase, per Skill Suite. */
  codesForPhase(phase: Phase): readonly CorruptionCode[] {
    return PHASE_CORRUPTION_WATCH[phase];
  }

  /** The phases that watch a given code. */
  phasesForCode(code: CorruptionCode): readonly Phase[] {
    return this.lookup(code).watchedAt;
  }

  /** Closure membership test — type-narrows arbitrary strings. */
  has(candidate: string): candidate is CorruptionCode {
    return (CORRUPTION_CODES as readonly string[]).includes(candidate);
  }

  /** SHA-256 hex of the canonical Codex content. Deterministic across hosts. */
  async computeFingerprint(): Promise<string> {
    if (this._fingerprint) return this._fingerprint;
    this._fingerprint = await this._hashFn(canonicalJSON(this.toCanonical()));
    return this._fingerprint;
  }

  getFingerprint(): string | null {
    return this._fingerprint;
  }

  /** Byte-stable serialization. Used by the fingerprint and any export. */
  toCanonical(): CodexCanonical {
    const entries = {} as Record<CorruptionCode, CodexCanonical['entries'][CorruptionCode]>;
    for (const code of CORRUPTION_CODES) {
      const e = this.lookup(code);
      entries[code] = {
        name: e.name,
        meaning: e.meaning,
        field_obstruction: e.fieldObstruction,
        recovery: e.recovery,
        watched_at: [...e.watchedAt],
        examples: e.examples.map(x => ({ trigger: x.trigger, gloss: x.gloss })),
      };
    }
    return {
      decoder_version: '5QLN-Codex-v0',
      codes: [...CORRUPTION_CODES],
      entries,
    };
  }

  /** Markdown render — for log dumps, agent cards, prompt templates. */
  toMarkdown(): string {
    const lines: string[] = [];
    lines.push('# 5QLN Corruption Codex');
    lines.push('');
    lines.push(`The five constitutional corruption codes. Closure: exactly ${CORRUPTION_CODES.length}.`);
    lines.push('');
    for (const entry of this.all()) {
      lines.push(`## ${entry.code} — ${entry.name}`);
      lines.push('');
      lines.push(`**Meaning.** ${entry.meaning}`);
      lines.push('');
      lines.push(`**Field obstruction.** ${entry.fieldObstruction}`);
      lines.push('');
      lines.push(`**Recovery.** ${entry.recovery}`);
      lines.push('');
      lines.push(`**Watched at.** ${entry.watchedAt.length ? entry.watchedAt.join(', ') : 'all phases'}`);
      lines.push('');
      if (entry.examples.length) {
        lines.push('**Examples.**');
        for (const ex of entry.examples) {
          lines.push(`- _"${ex.trigger}"_ — ${ex.gloss}`);
        }
        lines.push('');
      }
    }
    return lines.join('\n');
  }
}
