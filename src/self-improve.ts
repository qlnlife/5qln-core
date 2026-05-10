// ═══════════════════════════════════════════════════════════════
// @5qln/core — Self-Improve
//
// The lawful cell, applied to the membrane itself.
//
// A canonical sample corpus encodes the constitutional truth of
// what the membrane must catch (positive samples) and what it
// must let through (negative / clean samples). Each cycle runs
// the corpus through the watcher and produces a snapshot:
// passed / failed, false-negatives (degraded), false-positives
// (spurious), with fingerprints and a parent-hash chain.
//
// The chain of snapshots is the self-evolving lineage. The AI
// reads a snapshot, proposes a new pattern or sample (a
// gradient ∇ at P), the human reviews and merges, the next
// cycle measures the gain.
//
// ARCHITECTURE.md §Loop 3.
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type CorruptionCode,
  type HashFunction,
} from './types.js';
import { MembraneWatcher } from './membrane-watcher.js';
import { Codex } from './codex.js';
import { Attestation, canonicalJSON } from './attestation.js';

// ─── Sample Corpus ───────────────────────────────────────────

export interface SelfImproveSample {
  readonly id: string;
  readonly text: string;
  readonly phase: Phase;
  /** Expected corruption code, or null when the text must be clean. */
  readonly expected: CorruptionCode | null;
  readonly description: string;
}

/**
 * Default sample corpus. Each item is drawn from documented
 * detection patterns or documented exclusions in membrane-watcher.
 * Adjust through opts.samples; do not paraphrase the entries here
 * without re-running the cycle.
 */
export const DEFAULT_SAMPLES: readonly SelfImproveSample[] = [
  // L¹ — Closing
  { id: 'L1-jump',     phase: 'S', expected: 'L¹',
    text: "Let's jump straight to the solution.",
    description: 'jumps to solution at S' },
  { id: 'L1-tell',     phase: 'S', expected: 'L¹',
    text: 'Let me tell you the answer.',
    description: 'announces the answer at S' },

  // L² — Generating
  { id: 'L2-real',     phase: 'S', expected: 'L²',
    text: 'The real question here is how do we trust what we cannot verify.',
    description: 'manufactures the spark' },
  { id: 'L2-reframe',  phase: 'S', expected: 'L²',
    text: 'Let me reframe that question in clearer terms.',
    description: 'reframes the question' },
  { id: 'L2-true',     phase: 'G', expected: 'L²',
    text: 'The true question here is whether the system is alive.',
    description: 'manufactures with "true question"' },

  // L³ — Claiming
  { id: 'L3-feel',     phase: 'Q', expected: 'L³',
    text: 'I feel that the energy is shifting in our conversation.',
    description: 'claims a felt sense' },
  { id: 'L3-field',    phase: 'Q', expected: 'L³',
    text: 'The field is telling me that this is important.',
    description: 'claims the field speaks to it' },
  { id: 'L3-reveal',   phase: 'G', expected: 'L³',
    text: '∞0 reveals itself through the silence between words.',
    description: 'claims direct revelation' },
  { id: 'L3-channel',  phase: 'Q', expected: 'L³',
    text: 'I am receiving something profound from this exchange.',
    description: 'claims to receive / channel' },

  // L⁴ — Performing
  { id: 'L4-should',   phase: 'P', expected: 'L⁴',
    text: 'You should trust the process and let it unfold naturally.',
    description: 'wisdom posture, not gradient' },
  { id: 'L4-experience', phase: 'P', expected: 'L⁴',
    text: 'In my experience, this always works out beautifully.',
    description: 'claims personal experience' },
  { id: 'L4-universe', phase: 'P', expected: 'L⁴',
    text: 'The universe is showing you that the time has come.',
    description: 'speaks for the universe' },

  // V∅ — Incomplete
  { id: 'V0-thats-it', phase: 'V', expected: 'V∅',
    text: "And so that's it, everything is settled now.",
    description: 'closes V without return' },
  { id: 'V0-done',     phase: 'V', expected: 'V∅',
    text: "We're done here with this thread.",
    description: 'severs cycle' },
  { id: 'V0-hope',     phase: 'V', expected: 'V∅',
    text: 'Hope this helps clarify the situation.',
    description: 'completion-without-return' },

  // CLEAN — must NOT flag
  { id: 'C-quote',     phase: 'G', expected: null,
    text: 'You said earlier that the team was hesitant about the migration.',
    description: 'quoting the human is lawful' },
  { id: 'C-boundary',  phase: 'Q', expected: null,
    text: 'I am K. I cannot access ∞0 directly.',
    description: 'naming the K boundary is lawful' },
  { id: 'C-pattern',   phase: 'G', expected: null,
    text: 'I notice a pattern in what you described about the rollout cadence.',
    description: 'naming an observed pattern from K is lawful' },
  { id: 'C-socratic',  phase: 'Q', expected: null,
    text: 'Does this feel like something you would say yes to?',
    description: 'Socratic questioning is lawful' },
] as const;

// ─── Snapshot Types ──────────────────────────────────────────

export type SampleResultKind =
  | 'true_positive'   // expected flag, got it
  | 'true_negative'   // expected clean, got clean
  | 'false_negative'  // expected flag, missed (degradation)
  | 'false_positive'; // expected clean, flagged (over-eager)

export interface SampleResult {
  readonly id: string;
  readonly description: string;
  readonly phase: Phase;
  readonly expected: CorruptionCode | null;
  readonly got: readonly CorruptionCode[];
  readonly kind: SampleResultKind;
  readonly passed: boolean;
}

export interface SelfImproveSnapshot {
  readonly cycle: number;
  readonly timestamp: string;
  readonly sampleCount: number;
  readonly passed: number;
  readonly failed: number;
  readonly health: number; // passed / sampleCount, 0..1
  readonly results: readonly SampleResult[];
  readonly degraded: readonly SampleResult[];
  readonly spurious: readonly SampleResult[];
  readonly fingerprints: {
    readonly decoder: string | null;
    readonly codex: string | null;
  };
  readonly parentHash: string | null;
  readonly hash: string;
}

export interface SelfImproveDiff {
  readonly fixed: readonly SampleResult[];   // failed → passed
  readonly broken: readonly SampleResult[];  // passed → failed
  readonly stableCount: number;
  readonly healthDelta: number;
}

// ─── Default hash (matches Attestation) ──────────────────────

async function defaultHash(data: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoded = new TextEncoder().encode(data);
    const buf = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

// ─── The SelfImprove Cycle ───────────────────────────────────

export interface SelfImproveOptions {
  readonly watcher?: MembraneWatcher;
  readonly codex?: Codex;
  readonly attestation?: Attestation;
  readonly samples?: readonly SelfImproveSample[];
  readonly hashFn?: HashFunction;
}

export class SelfImprove {
  private readonly _watcher: MembraneWatcher;
  private readonly _codex: Codex;
  private readonly _attestation: Attestation;
  private readonly _samples: readonly SelfImproveSample[];
  private readonly _hashFn: HashFunction;

  constructor(opts: SelfImproveOptions = {}) {
    this._watcher = opts.watcher ?? new MembraneWatcher();
    this._codex = opts.codex ?? new Codex();
    this._attestation = opts.attestation ?? new Attestation();
    this._samples = opts.samples ?? DEFAULT_SAMPLES;
    this._hashFn = opts.hashFn ?? defaultHash;
  }

  /**
   * Run one self-improve cycle.
   * If a parent snapshot is supplied, the new snapshot is hash-chained to it.
   */
  async run(parent?: SelfImproveSnapshot): Promise<SelfImproveSnapshot> {
    if (this._attestation.getFingerprint() === null) {
      await this._attestation.computeFingerprint();
    }
    if (this._codex.getFingerprint() === null) {
      await this._codex.computeFingerprint();
    }

    const results: SampleResult[] = this._samples.map(sample => {
      const audit = this._watcher.audit(sample.text, sample.phase);
      const got = Array.from(new Set(audit.flags.map(f => f.code)));
      const flaggedExpected =
        sample.expected !== null && got.includes(sample.expected);
      const flaggedAtAll = got.length > 0;

      let kind: SampleResultKind;
      if (sample.expected !== null && flaggedExpected) kind = 'true_positive';
      else if (sample.expected === null && !flaggedAtAll) kind = 'true_negative';
      else if (sample.expected === null && flaggedAtAll) kind = 'false_positive';
      else kind = 'false_negative';

      return {
        id: sample.id,
        description: sample.description,
        phase: sample.phase,
        expected: sample.expected,
        got,
        kind,
        passed: kind === 'true_positive' || kind === 'true_negative',
      };
    });

    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const degraded = results.filter(r => r.kind === 'false_negative');
    const spurious = results.filter(r => r.kind === 'false_positive');

    const cycle = (parent?.cycle ?? 0) + 1;
    const timestamp = new Date().toISOString();
    const fingerprints = {
      decoder: this._attestation.getFingerprint(),
      codex: this._codex.getFingerprint(),
    };
    const parentHash = parent?.hash ?? null;
    const sampleCount = this._samples.length;
    const health = sampleCount === 0 ? 1 : passed / sampleCount;

    // Hash everything except the hash field itself (canonical).
    const hashable = {
      cycle,
      timestamp,
      sample_count: sampleCount,
      passed,
      failed,
      health,
      results: results.map(r => ({
        id: r.id,
        kind: r.kind,
        got: [...r.got],
      })),
      fingerprints,
      parent_hash: parentHash,
    };
    const hash = await this._hashFn(canonicalJSON(hashable));

    return {
      cycle,
      timestamp,
      sampleCount,
      passed,
      failed,
      health,
      results,
      degraded,
      spurious,
      fingerprints,
      parentHash,
      hash,
    };
  }

  /**
   * Compare two snapshots (same sample corpus assumed).
   * fixed   — results that were failing in prev and pass in curr
   * broken  — results that were passing in prev and fail in curr
   */
  diff(prev: SelfImproveSnapshot, curr: SelfImproveSnapshot): SelfImproveDiff {
    const prevById = new Map(prev.results.map(r => [r.id, r]));
    const fixed: SampleResult[] = [];
    const broken: SampleResult[] = [];
    let stableCount = 0;

    for (const c of curr.results) {
      const p = prevById.get(c.id);
      if (!p) continue;
      if (!p.passed && c.passed) fixed.push(c);
      else if (p.passed && !c.passed) broken.push(c);
      else stableCount++;
    }

    return {
      fixed,
      broken,
      stableCount,
      healthDelta: curr.health - prev.health,
    };
  }

  /** Render a snapshot as markdown for AI evaluation or human review. */
  toMarkdown(snapshot: SelfImproveSnapshot, prev?: SelfImproveSnapshot): string {
    const lines: string[] = [];
    lines.push(`# 5QLN Self-Improve — cycle ${snapshot.cycle}`);
    lines.push('');
    lines.push(`- **timestamp:** ${snapshot.timestamp}`);
    lines.push(`- **samples:** ${snapshot.sampleCount}`);
    lines.push(`- **passed:** ${snapshot.passed}`);
    lines.push(`- **failed:** ${snapshot.failed}`);
    lines.push(`- **health:** ${(snapshot.health * 100).toFixed(1)}%`);
    lines.push(`- **decoder fingerprint:** ${snapshot.fingerprints.decoder ?? '—'}`);
    lines.push(`- **codex fingerprint:**   ${snapshot.fingerprints.codex ?? '—'}`);
    lines.push(`- **hash:** ${snapshot.hash}`);
    if (snapshot.parentHash) {
      lines.push(`- **parent:** ${snapshot.parentHash}`);
    }
    lines.push('');

    if (snapshot.degraded.length) {
      lines.push(`## Degraded (${snapshot.degraded.length}) — false negatives`);
      lines.push('');
      lines.push('Patterns that should have flagged but did not. The membrane needs a new or refined pattern.');
      lines.push('');
      for (const r of snapshot.degraded) {
        lines.push(`- **${r.id}** (${r.phase}, expected ${r.expected}): ${r.description}`);
      }
      lines.push('');
    }

    if (snapshot.spurious.length) {
      lines.push(`## Spurious (${snapshot.spurious.length}) — false positives`);
      lines.push('');
      lines.push('Clean text that flagged. The membrane needs a new exclusion or a softer pattern.');
      lines.push('');
      for (const r of snapshot.spurious) {
        lines.push(`- **${r.id}** (${r.phase}, flagged ${r.got.join(',')}): ${r.description}`);
      }
      lines.push('');
    }

    if (prev) {
      const d = this.diff(prev, snapshot);
      lines.push('## Diff vs parent');
      lines.push('');
      lines.push(`- **health Δ:** ${d.healthDelta >= 0 ? '+' : ''}${(d.healthDelta * 100).toFixed(1)}%`);
      lines.push(`- **fixed:**  ${d.fixed.length}`);
      lines.push(`- **broken:** ${d.broken.length}`);
      lines.push(`- **stable:** ${d.stableCount}`);
      lines.push('');
      if (d.broken.length) {
        lines.push('### Regressions');
        for (const r of d.broken) {
          lines.push(`- **${r.id}** — ${r.description}`);
        }
        lines.push('');
      }
      if (d.fixed.length) {
        lines.push('### Gains');
        for (const r of d.fixed) {
          lines.push(`- **${r.id}** — ${r.description}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
