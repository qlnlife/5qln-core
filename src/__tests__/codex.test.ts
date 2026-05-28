// ═══════════════════════════════════════════════════════════════
// @5qln/core — Codex Tests
//
// The Codex is the constitutional book of corruption at runtime.
// These tests verify closure (exactly five), fidelity to types.ts,
// per-phase watch alignment, fingerprint determinism, and render.
// ═══════════════════════════════════════════════════════════════

import {
  Codex,
  CORRUPTION_CODES,
  CORRUPTION_MEANING,
  CORRUPTION_FIELD_MEANING,
  CORRUPTION_RECOVERY,
  PHASE_CORRUPTION_WATCH,
  PHASES,
  type CorruptionCode,
  type Phase,
} from '../index.js';


describe('Codex — closure and fidelity', () => {

  test('the Codex carries exactly five entries, in constitutional order', () => {
    const codex = new Codex();
    const entries = codex.all();
    expect(entries.length).toBe(5);
    expect(entries.map(e => e.code)).toEqual(['L1', 'L2', 'L3', 'L4', 'V∅']);
  });

  test('each entry mirrors types.ts byte-for-byte', () => {
    const codex = new Codex();
    for (const code of CORRUPTION_CODES) {
      const entry = codex.lookup(code);
      expect(entry.code).toBe(code);
      expect(entry.meaning).toBe(CORRUPTION_MEANING[code]);
      expect(entry.fieldObstruction).toBe(CORRUPTION_FIELD_MEANING[code]);
      expect(entry.recovery).toBe(CORRUPTION_RECOVERY[code]);
    }
  });

  test('each entry has a non-empty short name and at least one example', () => {
    const codex = new Codex();
    for (const entry of codex.all()) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.examples.length).toBeGreaterThan(0);
      for (const ex of entry.examples) {
        expect(ex.trigger.length).toBeGreaterThan(0);
        expect(ex.gloss.length).toBeGreaterThan(0);
      }
    }
  });

  test('lookup throws on a code that is not constitutional', () => {
    const codex = new Codex();
    expect(() => codex.lookup('L⁵' as CorruptionCode)).toThrow();
  });

  test('has() narrows known codes and rejects unknown', () => {
    const codex = new Codex();
    for (const code of CORRUPTION_CODES) {
      expect(codex.has(code)).toBe(true);
    }
    expect(codex.has('L⁵')).toBe(false);
    expect(codex.has('')).toBe(false);
    expect(codex.has('VV')).toBe(false);
  });
});


describe('Codex — phase watch alignment', () => {

  test('codesForPhase agrees with PHASE_CORRUPTION_WATCH for every phase', () => {
    const codex = new Codex();
    for (const p of PHASES) {
      expect(codex.codesForPhase(p)).toEqual(PHASE_CORRUPTION_WATCH[p]);
    }
  });

  test('phasesForCode is consistent with PHASE_CORRUPTION_WATCH', () => {
    const codex = new Codex();
    for (const code of CORRUPTION_CODES) {
      const watched = codex.phasesForCode(code);
      // Every phase reported as watching this code must list it.
      for (const p of watched) {
        expect(PHASE_CORRUPTION_WATCH[p]).toContain(code);
      }
      // And every phase that lists this code must appear here.
      const expected: Phase[] = PHASES.filter(p =>
        PHASE_CORRUPTION_WATCH[p].includes(code),
      );
      expect([...watched].sort()).toEqual(expected.sort());
    }
  });

  test('V∅ is watched at V', () => {
    const codex = new Codex();
    expect(codex.phasesForCode('V∅')).toContain('V');
  });

  test('L1 and L2 are both watched at S', () => {
    const codex = new Codex();
    expect(codex.codesForPhase('S')).toEqual(expect.arrayContaining(['L1', 'L2']));
  });
});


describe('Codex — fingerprint', () => {

  test('fingerprint is deterministic across two clean instances', async () => {
    const a = new Codex();
    const b = new Codex();
    const fa = await a.computeFingerprint();
    const fb = await b.computeFingerprint();
    expect(fa).toBe(fb);
    expect(fa.length).toBe(64); // SHA-256 hex
  });

  test('computeFingerprint is stable across multiple calls', async () => {
    const codex = new Codex();
    const f1 = await codex.computeFingerprint();
    const f2 = await codex.computeFingerprint();
    expect(f1).toBe(f2);
  });

  test('getFingerprint returns null before compute, and the hash after', async () => {
    const codex = new Codex();
    expect(codex.getFingerprint()).toBeNull();
    const f = await codex.computeFingerprint();
    expect(codex.getFingerprint()).toBe(f);
  });

  test('a custom hash function is honored', async () => {
    let called = 0;
    const codex = new Codex(async (data: string) => {
      called += 1;
      return `mock:${data.length}`;
    });
    const f = await codex.computeFingerprint();
    expect(called).toBe(1);
    expect(f.startsWith('mock:')).toBe(true);
  });
});


describe('Codex — canonical and markdown render', () => {

  test('toCanonical lists exactly the five codes in order', () => {
    const codex = new Codex();
    const canonical = codex.toCanonical();
    expect(canonical.codes).toEqual(['L1', 'L2', 'L3', 'L4', 'V∅']);
    expect(canonical.decoder_version).toBe('5QLN-Codex-v0');
    for (const code of CORRUPTION_CODES) {
      expect(canonical.entries[code].meaning).toBe(CORRUPTION_MEANING[code]);
      expect(canonical.entries[code].recovery).toBe(CORRUPTION_RECOVERY[code]);
    }
  });

  test('toMarkdown contains every code and its name', () => {
    const codex = new Codex();
    const md = codex.toMarkdown();
    for (const entry of codex.all()) {
      expect(md).toContain(entry.code);
      expect(md).toContain(entry.name);
      expect(md).toContain(entry.meaning);
      expect(md).toContain(entry.recovery);
    }
    expect(md).toContain('Closure: exactly 5');
  });
});
