// ═══════════════════════════════════════════════════════════════
// @5qln/core — Attestation
//
// Constitutional fingerprint computation, provenance record
// construction, and three-level verification.
//
// The law is no longer only carried. It is also provable.
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type SubPhase,
  type CorruptionCode,
  type FormationState,
  type ProvenanceRecord,
  type OutputStates,
  type FormationTrails,
  type FieldCoherence,
  type HashFunction,
  PHASE_INFO,
  FORMATION_STATES,
  SUB_PHASES,
  CORRUPTION_CODES,
  PHASES,
  HOLOGRAPHIC_LAW,
  SCALE_LAW,
  CENTER_RULE,
  AI_BOUNDARY,
} from './types.js';


// ─── The Codex Gold Hash ─────────────────────────────────────
// SHA-256 of the 10 invariant lines as they appear in CODEX.md.
// This is the byte-identical, timeless anchor. The decoder
// fingerprint carries this hash inside it. Any verifier can
// independently compute and compare.

export const CODEX_LINES_GOLD: readonly string[] = ['1. H = ∞0 | A = K', '2. S → G → Q → P → V', '3. S = ∞0 → ?', "4. G = α ≡ {α'}", '5. Q = φ ∩ Ω', '6. P = δE/δV → ∇', "7. V = (L ∩ G → B'') → ∞0'", '8. XY := X within Y, X,Y ∈ {S,G,Q,P,V}', "9. No V without ∞0'", '10. L¹  L²  L³  L⁴  V∅'];

export const CODEX_GOLD_HASH = 'cee119fc63277b3b01a4ec6f873ceb60ec9a90f605500b03035b3aeb0dcc4b9a';

// ─── Canonical JSON ──────────────────────────────────────────
// Sorts object keys deterministically before serializing.
// Ensures the same fingerprint regardless of property insertion order.

function canonicalJSON(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJSON).join(',') + ']';
  }
  if (typeof obj === 'object') {
    const sorted = Object.keys(obj as Record<string, unknown>).sort();
    const pairs = sorted.map(
      k => JSON.stringify(k) + ':' + canonicalJSON((obj as Record<string, unknown>)[k])
    );
    return '{' + pairs.join(',') + '}';
  }
  return String(obj);
}

// ─── Default hash function (SHA-256 via Web Crypto) ──────────

async function defaultHash(data: string): Promise<string> {
  // Works in browser and Node 18+
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback: Node.js crypto
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

// ─── The Constitutional Invariant ────────────────────────────
// This is what gets hashed. If any component changes, the hash changes.

function getConstitutionalInvariant() {
  const allSubPhases: SubPhase[] = [];
  for (const p of PHASES) {
    allSubPhases.push(...SUB_PHASES[p]);
  }

  return {
    decoder_version: '5QLN-Decoder-v0',
    equation_set: {
      S: PHASE_INFO.S.equation,
      G: PHASE_INFO.G.equation,
      Q: PHASE_INFO.Q.equation,
      P: PHASE_INFO.P.equation,
      V: PHASE_INFO.V.equation,
    },
    formation_model: {
      states: [...FORMATION_STATES],
      outputs: ['X', 'Y', 'Z', 'A', 'B'],
      serve_vs_be_rule: true,
    },
    lens_engine: allSubPhases,
    corruption_codes: [...CORRUPTION_CODES],
    return_enforcement: 'No V without ∞0\'',
    holographic_law: HOLOGRAPHIC_LAW,
    scale_law: SCALE_LAW,
    center_rule: CENTER_RULE,
    ai_boundary: [...AI_BOUNDARY],
    codex_gold_hash: CODEX_GOLD_HASH,
  };
}

// ─── Attestation Class ───────────────────────────────────────

export class Attestation {
  private _hashFn: HashFunction;
  private _fingerprint: string | null = null;

  constructor(hashFn?: HashFunction) {
    this._hashFn = hashFn ?? defaultHash;
  }

  // ─── Fingerprint ───────────────────────────────────────

  async computeFingerprint(): Promise<string> {
    const invariant = getConstitutionalInvariant();
    const canonical = canonicalJSON(invariant);
    this._fingerprint = await this._hashFn(canonical);
    return this._fingerprint;
  }

  getFingerprint(): string | null {
    return this._fingerprint;
  }

  getDecoderVersion(): string {
    return '5QLN-Decoder-v0';
  }

  getConstitutionalInvariant(): ReturnType<typeof getConstitutionalInvariant> {
    return getConstitutionalInvariant();
  }

  // ─── Provenance Record Construction ────────────────────

  async buildProvenanceRecord(params: {
    origin: string;
    sparkX: string;
    sparkSource: 'human' | 'residue';
    sourceLineage: string | null;
    phasesTraversed: Phase[];
    phasesCompleted: Phase[];
    lensesApplied: SubPhase[];
    outputStates: OutputStates;
    formationTrails: FormationTrails;
    corruptionDetected: CorruptionCode[];
    corruptionResolved: CorruptionCode[];
    returnCompleted: boolean;
    inputHistory: string[];
    fieldCoherence?: FieldCoherence;
  }): Promise<ProvenanceRecord> {
    if (!this._fingerprint) {
      await this.computeFingerprint();
    }

    const originHash = await this._hashFn(params.origin);
    const traceData = canonicalJSON({
      trails: params.formationTrails,
      inputs: params.inputHistory,
      lenses: params.lensesApplied,
    });
    const traceHash = await this._hashFn(traceData);

    const formationTrail = {
      X: { state: params.outputStates.X, input_count: params.formationTrails.X.length },
      Y: { state: params.outputStates.Y, input_count: params.formationTrails.Y.length },
      Z: { state: params.outputStates.Z, input_count: params.formationTrails.Z.length },
      A: { state: params.outputStates.A, input_count: params.formationTrails.A.length },
      B: { state: params.outputStates.B, input_count: params.formationTrails.B.length },
    };

    // Build the record without provenance_hash first
    const recordWithoutHash = {
      origin_hash: originHash,
      spark_X: params.sparkX,
      spark_source: params.sparkSource,
      source_lineage: params.sourceLineage,
      phases_traversed: params.phasesTraversed,
      phases_completed: params.phasesCompleted,
      lenses_applied: params.lensesApplied,
      formation_trail: formationTrail,
      return_completed: params.returnCompleted,
      corruption_detected: params.corruptionDetected,
      corruption_resolved: params.corruptionResolved,
      decoder_fingerprint: this._fingerprint!,
      timestamp: new Date().toISOString(),
      trace_hash: traceHash,
      ...(params.fieldCoherence ? { field_coherence: params.fieldCoherence } : {}),
    };

    // Hash the entire record to get provenance_hash
    const provenanceHash = await this._hashFn(canonicalJSON(recordWithoutHash));

    return {
      provenance_hash: provenanceHash,
      ...recordWithoutHash,
    };
  }

  // ─── Verification ──────────────────────────────────────

  /**
   * Level 1 — Structural Presence
   * Record exists, well-formed, fingerprint is known.
   */
  async verifyLevel1(record: ProvenanceRecord): Promise<{
    passed: boolean;
    failures: string[];
  }> {
    const failures: string[] = [];

    if (!record.provenance_hash) failures.push('Missing provenance_hash');
    if (!record.origin_hash) failures.push('Missing origin_hash');
    if (!record.spark_X) failures.push('Missing spark_X');
    if (!record.decoder_fingerprint) failures.push('Missing decoder_fingerprint');
    if (!record.timestamp) failures.push('Missing timestamp');
    if (!record.trace_hash) failures.push('Missing trace_hash');

    // Check that fingerprint matches a known constitutional fingerprint
    if (!this._fingerprint) {
      await this.computeFingerprint();
    }
    if (record.decoder_fingerprint !== this._fingerprint) {
      failures.push(`Unknown decoder fingerprint: ${record.decoder_fingerprint}`);
    }

    return { passed: failures.length === 0, failures };
  }

  /**
   * Level 2 — Cycle Integrity
   * Return completed, X and B formed, corruption resolved.
   */
  async verifyLevel2(record: ProvenanceRecord): Promise<{
    passed: boolean;
    failures: string[];
  }> {
    const level1 = await this.verifyLevel1(record);
    if (!level1.passed) {
      return { passed: false, failures: level1.failures };
    }

    const failures: string[] = [];

    if (!record.return_completed) {
      failures.push('Return not completed (V∅)');
    }

    if (record.formation_trail.X.state === 'NONE') {
      failures.push('X never formed — spark missing');
    }

    if (record.formation_trail.B.state === 'NONE') {
      failures.push('B never formed — benefit missing');
    }

    // Check that all detected corruption was resolved
    const unresolved = record.corruption_detected.filter(
      c => !record.corruption_resolved.includes(c)
    );
    if (unresolved.length > 0) {
      failures.push(`Unresolved corruption: ${unresolved.join(', ')}`);
    }

    return { passed: failures.length === 0, failures };
  }

  /**
   * Level 3 — Lineage Verification
   * Walk chain to human origin, every link passes Level 2.
   */
  async verifyLevel3(
    record: ProvenanceRecord,
    resolveLineage: (hash: string) => ProvenanceRecord | null,
  ): Promise<{
    passed: boolean;
    failures: string[];
    chainDepth: number;
  }> {
    const level2 = await this.verifyLevel2(record);
    if (!level2.passed) {
      return { passed: false, failures: level2.failures, chainDepth: 0 };
    }

    // If spark is human, chain terminates here
    if (record.spark_source === 'human') {
      return { passed: true, failures: [], chainDepth: 1 };
    }

    // If spark is residue, walk the chain
    if (!record.source_lineage) {
      return {
        passed: false,
        failures: ['Spark source is residue but source_lineage is null'],
        chainDepth: 0,
      };
    }

    const visited = new Set<string>();
    let current: ProvenanceRecord | null = record;
    let depth = 0;

    while (current && current.spark_source === 'residue') {
      if (!current.source_lineage) {
        return {
          passed: false,
          failures: ['Chain broken: residue source without lineage'],
          chainDepth: depth,
        };
      }

      if (visited.has(current.source_lineage)) {
        return {
          passed: false,
          failures: ['Circular reference in lineage chain'],
          chainDepth: depth,
        };
      }

      visited.add(current.provenance_hash);
      depth++;

      const parent = resolveLineage(current.source_lineage);
      if (!parent) {
        return {
          passed: false,
          failures: [`Cannot resolve lineage: ${current.source_lineage}`],
          chainDepth: depth,
        };
      }

      // Every link must pass Level 2
      const linkCheck = await this.verifyLevel2(parent);
      if (!linkCheck.passed) {
        return {
          passed: false,
          failures: [`Chain link failed Level 2: ${linkCheck.failures.join(', ')}`],
          chainDepth: depth,
        };
      }

      current = parent;
    }

    // Chain must terminate at human
    if (current && current.spark_source !== 'human') {
      return {
        passed: false,
        failures: ['Chain does not terminate at human spark'],
        chainDepth: depth,
      };
    }

    return { passed: true, failures: [], chainDepth: depth + 1 };
  }
  /**
   * Verify this decoder against the Codex gold hash.
   * Computes SHA-256 of the 10 invariant lines and compares
   * to the pinned CODEX_GOLD_HASH. This closes the gap between
   * the decoder fingerprint and the published Codex claim.
   */
  async verifyAgainstCodexGold(hashFn?: HashFunction): Promise<{
    passed: boolean;
    computed: string;
    expected: string;
  }> {
    const h = hashFn ?? this._hashFn;
    const lines = [
      '1. H = ∞0 | A = K',
      '2. S → G → Q → P → V',
      '3. S = ∞0 → ?',
      '4. G = α ≡ {α\'}',
      '5. Q = φ ∩ Ω',
      '6. P = δE/δV → ∇',
      '7. V = (L ∩ G → B\'\') → ∞0\'',
      '8. XY := X within Y, X,Y ∈ {S,G,Q,P,V}',
      '9. No V without ∞0\'',
      '10. L¹  L²  L³  L⁴  V∅',
    ];
    const computed = await h(lines.join('\n'));
    return {
      passed: computed === CODEX_GOLD_HASH,
      computed,
      expected: CODEX_GOLD_HASH,
    };
  }

}

export { canonicalJSON };
