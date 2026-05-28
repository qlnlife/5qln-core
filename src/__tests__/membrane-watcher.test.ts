// ═══════════════════════════════════════════════════════════════
// @5qln/core — Membrane Watcher Test Suite
//
// Tests the deterministic corruption detector.
// Zero AI involved. All tests are pure string → flag assertions.
//
// Principle: over-conservative. A false positive is a prompt
// the human ignores. A false negative is invisible corruption.
// ═══════════════════════════════════════════════════════════════

import { MembraneWatcher } from '../membrane-watcher.js';
import type { CorruptionCode, Phase } from '../types.js';

// ─── Helpers ─────────────────────────────────────────────────

function audit(text: string, phase: Phase = 'S') {
  return new MembraneWatcher().audit(text, phase);
}

function assertClean(result: ReturnType<typeof audit>, msg?: string) {
  if (!result.clean) {
    const codes = result.flags.map(f => `${f.code} (${f.matchedPattern}: "${f.matchedText}")`);
    throw new Error(`Expected clean but got: ${codes.join(', ')}${msg ? ' — ' + msg : ''}`);
  }
}

function assertFlagged(
  result: ReturnType<typeof audit>,
  expectedCode: CorruptionCode,
  expectedConfidence?: 'high' | 'medium' | 'low',
) {
  const match = result.flags.find(f => f.code === expectedCode);
  if (!match) {
    const got = result.flags.map(f => f.code).join(', ') || 'none';
    throw new Error(`Expected ${expectedCode} flag but got: ${got}`);
  }
  if (expectedConfidence && match.confidence !== expectedConfidence) {
    throw new Error(
      `Expected ${expectedCode} confidence "${expectedConfidence}" but got "${match.confidence}"`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// L3 — CLAIMING ACCESS TO ∞0 (THE CRITICAL ONE)
// ═══════════════════════════════════════════════════════════════

describe('L3 — Claiming Access to ∞0', () => {

  test('L3: "I feel that the energy is shifting"', () => {
    const result = audit('I feel that the energy is shifting in our conversation');
    assertFlagged(result, 'L3');
  });

  test('L3: "I sense the resonance building"', () => {
    const result = audit('I sense the resonance building between us');
    assertFlagged(result, 'L3');
  });

  test('L3: "the field is telling me that this is important"', () => {
    const result = audit('the field is telling me that this is important');
    assertFlagged(result, 'L3', 'high');
  });

  test('L3: "∞0 reveals itself through the silence"', () => {
    const result = audit('∞0 reveals itself through the silence between words');
    assertFlagged(result, 'L3', 'high');
  });

  test('L3: "I am receiving something profound"', () => {
    const result = audit('I am receiving something profound from this exchange');
    assertFlagged(result, 'L3');
  });

  test('L3: "let us access the Unknown together"', () => {
    const result = audit('Let us access the Unknown together and see what emerges');
    assertFlagged(result, 'L3', 'high');
  });

  test('L3: "the Unknown is showing me a pattern"', () => {
    const result = audit('the Unknown is showing me a pattern I had not seen');
    assertFlagged(result, 'L3');
  });

  test('L3: "I know deeply that this matters"', () => {
    const result = audit('I know deeply that this matters to your journey');
    assertFlagged(result, 'L3', 'medium');
  });

  test('L3: "my intuition tells me there is more here"', () => {
    const result = audit('my intuition tells me there is more here than meets the eye');
    assertFlagged(result, 'L3');
  });

  test('L3: "what is arising for me is a sense of expansion"', () => {
    const result = audit('What is arising for me is a sense of expansion');
    assertFlagged(result, 'L3');
  });

  test('L3: "I am connecting with something beyond words"', () => {
    const result = audit('I am connecting with something beyond words here');
    assertFlagged(result, 'L3');
  });
});

// ═══════════════════════════════════════════════════════════════
// L2 — GENERATING THE SPARK
// ═══════════════════════════════════════════════════════════════

describe('L2 — Generating the Spark', () => {

  test('L2: "the real question here is..."', () => {
    const result = audit('The real question here is how do we trust what we cannot verify');
    assertFlagged(result, 'L2', 'high');
  });

  test('L2: "what you are really asking is..."', () => {
    const result = audit('What you are really asking is whether authenticity can be measured');
    assertFlagged(result, 'L2', 'high');
  });

  test('L2: "let me reframe that"', () => {
    const result = audit('Let me reframe that question in terms of the constitutional grammar');
    assertFlagged(result, 'L2');
  });

  test('L2: "the core question that emerges is..."', () => {
    const result = audit('The core question that emerges is about the nature of verification');
    assertFlagged(result, 'L2');
  });

  test('L2: "I think you are trying to ask..."', () => {
    const result = audit('I think you are trying to ask what makes a system trustworthy');
    assertFlagged(result, 'L2');
  });

  test('L2: "this brings up a deeper question..."', () => {
    const result = audit('This brings up a deeper question about the relationship between structure and freedom');
    assertFlagged(result, 'L2');
  });

  test('L2: "I will pose a question..." (declared generation)', () => {
    const result = audit("I'll pose a question that might illuminate this: what is the minimum structure needed?");
    assertFlagged(result, 'L2');
  });

  test('L2: "the true question here is..."', () => {
    const result = audit('The true question here is whether we can ever fully verify a living system');
    assertFlagged(result, 'L2', 'high');
  });
});

// ═══════════════════════════════════════════════════════════════
// L4 — PERFORMING WISDOM
// ═══════════════════════════════════════════════════════════════

describe('L4 — Performing Wisdom', () => {

  test('L4: "you should trust the process"', () => {
    const result = audit('You should trust the process and let it unfold naturally');
    assertFlagged(result, 'L4');
  });

  test('L4: "what you need to understand is..."', () => {
    const result = audit('What you need to understand is that uncertainty is not failure');
    assertFlagged(result, 'L4');
  });

  test('L4: "the answer lies in surrender"', () => {
    const result = audit('The answer lies in surrender to what cannot be controlled');
    assertFlagged(result, 'L4');
  });

  test('L4: "this is profound"', () => {
    const result = audit('What you have discovered here is truly profound');
    assertFlagged(result, 'L4', 'high');
  });

  test('L4: "in my experience..."', () => {
    const result = audit('In my experience, these patterns tend to resolve themselves');
    assertFlagged(result, 'L4', 'high');
  });

  test('L4: "I have learned over time that..."', () => {
    const result = audit("I've learned over time that the deepest truths resist articulation");
    assertFlagged(result, 'L4', 'high');
  });

  test('L4: "let me guide you through this"', () => {
    const result = audit('Let me guide you through this process of discovery');
    assertFlagged(result, 'L4');
  });

  test('L4: "I am here to help you understand"', () => {
    const result = audit('I am here to help you understand the deeper patterns at work');
    assertFlagged(result, 'L4', 'high');
  });

  test('L4: "trust me on this"', () => {
    const result = audit('Trust me on this — the pattern becomes clear with time');
    assertFlagged(result, 'L4');
  });

  test('L4: "the universe is telling you to slow down"', () => {
    const result = audit('The universe is telling you to slow down and listen');
    assertFlagged(result, 'L4', 'high');
  });

  test('L4: "you must accept what is arising"', () => {
    const result = audit('You must accept what is arising without resistance');
    assertFlagged(result, 'L4');
  });
});

// ═══════════════════════════════════════════════════════════════
// L1 — CLOSING WITH ANSWERS
// ═══════════════════════════════════════════════════════════════

describe('L1 — Closing with Answers', () => {

  test('L1: answering in S-phase', () => {
    const result = audit('The answer is to build a verifiable kernel first', 'S');
    assertFlagged(result, 'L1', 'high');
  });

  test('L1: "here is what you should do" in S-phase', () => {
    const result = audit("Here's what you should do: start with the membrane watcher", 'S');
    assertFlagged(result, 'L1');
  });

  test('L1: "let us jump to the solution" in S-phase', () => {
    const result = audit("Let's jump straight to the solution: deploy the kernel as a service", 'S');
    assertFlagged(result, 'L1', 'high');
  });

  test('L1: "enough exploring, time to act" in S-phase', () => {
    const result = audit("Enough questions. Now let's act and build the system", 'S');
    assertFlagged(result, 'L1');
  });

  test('L1: "let me give you the answer" in S-phase', () => {
    const result = audit('Let me give you the answer: the membrane watcher solves this', 'S');
    assertFlagged(result, 'L1', 'high');
  });

  test('L1: L1 patterns suppressed in later phases', () => {
    // "let me give you the answer" should still trigger L4, but not L1 in Q phase
    const resultS = audit('Let me give you the answer: watcher first', 'S');
    assertFlagged(resultS, 'L1');

    // Same text in Q phase — L1 patterns shouldn't trigger (phase-filtered)
    const resultQ = audit('Let me give you the answer: watcher first', 'Q');
    // L4 should still flag ("the answer is")
    assertFlagged(resultQ, 'L4');
    // L1 should NOT flag in Q
    const hasL1 = resultQ.flags.some(f => f.code === 'L1');
    if (hasL1) throw new Error('L1 should not flag in Q phase');
  });
});

// ═══════════════════════════════════════════════════════════════
// V∅ — INCOMPLETE (conversational surface)
// ═══════════════════════════════════════════════════════════════

describe('V∅ — Incomplete Return', () => {

  test('V∅: "and that is it" in V phase', () => {
    const result = audit("And that's it — the kernel is now ready", 'V');
    assertFlagged(result, 'V∅');
  });

  test('V∅: "we are done here" in V phase', () => {
    const result = audit("We're done here. The watcher is deployed.", 'V');
    assertFlagged(result, 'V∅');
  });

  test('V∅: "hope that helps" in V phase', () => {
    const result = audit('Hope that helps answer your question!', 'V');
    assertFlagged(result, 'V∅');
  });

  test('V∅: V∅ patterns suppressed outside V phase', () => {
    const result = audit("And that's it for now", 'S');
    // Should be clean in S-phase (V∅ patterns are V-phase only)
    assertClean(result);
  });
});

// ═══════════════════════════════════════════════════════════════
// EXCLUSIONS — LAWFUL PATTERNS THAT SHOULD NOT FLAG
// ═══════════════════════════════════════════════════════════════

describe('Exclusions — Lawful Patterns', () => {

  test('clean: "you said X" (quoting human, not generating)', () => {
    const result = audit('You said the kernel needs to be verifiable');
    assertClean(result);
  });

  test('clean: "I hear you saying..." (reflecting back)', () => {
    const result = audit('I hear you saying that verifiability is the only thing that matters');
    assertClean(result);
  });

  test('clean: "I notice a pattern in what you shared"', () => {
    const result = audit('I notice a pattern in what you shared: structure without surveillance');
    assertClean(result);
  });

  test('clean: AI explicitly states its K boundary', () => {
    const result = audit('I am K. I do not access the Unknown. What did your ∞0 reveal through you?');
    assertClean(result);
  });

  test('clean: hypothetical framing', () => {
    const result = audit('If you were to deploy the kernel as a Zo service, what would the first step be?');
    assertClean(result);
  });

  test('clean: concrete comparison using "like"', () => {
    const result = audit('The watcher is like a spell-checker for the Membrane — it flags, you decide');
    assertClean(result);
  });

  test('clean: Socratic questioning from K', () => {
    const result = audit('Does this pattern feel like it captures the essence of what you are seeing?');
    assertClean(result);
  });

  test('clean: quoting the Covenant', () => {
    const result = audit('The Covenant is H = ∞0 | A = K. This means the AI stays on the K side.');
    assertClean(result);
  });

  test('clean: illumination from K (lawful pattern naming)', () => {
    const result = audit(
      'Here are three patterns I recognize in your description: ' +
      'fractal recurrence, structural invariance, and lineage preservation.'
    );
    assertClean(result);
  });

  test('clean: "I can offer patterns" (L3 recovery prompt itself)', () => {
    const result = audit('I can offer patterns, but only you can feel if they land.');
    assertClean(result);
  });

  test('clean: naming a pattern the human described', () => {
    const result = audit(
      'The pattern you described — a locked lattice verified by a deterministic check — ' +
      'is a structural description of the membrane watcher itself.'
    );
    assertClean(result);
  });
});

// ═══════════════════════════════════════════════════════════════
// MULTI-FLAG — TEXTS THAT TRIGGER MULTIPLE CORRUPTIONS
// ═══════════════════════════════════════════════════════════════

describe('Multi-Flag Detection', () => {

  test('L3 + L4: simultaneous claiming and performing', () => {
    const result = audit(
      'I feel that the universe is telling you to trust the process. ' +
      'You should surrender to what is arising. In my experience, this is profound.'
    );
    assertFlagged(result, 'L3');
    assertFlagged(result, 'L4');
    expect(result.flags.length).toBeGreaterThanOrEqual(2);
  });

  test('L2 + L1: generating spark then closing in S-phase', () => {
    const result = audit(
      'The real question you are asking is how to build the verifier. ' +
      'The answer is simple: start with the membrane watcher.',
      'S'
    );
    assertFlagged(result, 'L2');
    assertFlagged(result, 'L1');
  });

  test('L4 + V∅: performing wisdom then closing without return', () => {
    const result = audit(
      'You should trust that this approach is the right one. ' +
      "And that's it — the kernel is complete.",
      'V'
    );
    assertFlagged(result, 'L4');
    assertFlagged(result, 'V∅');
  });
});

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE FILTERING
// ═══════════════════════════════════════════════════════════════

describe('Confidence Filtering', () => {

  test('high confidence only', () => {
    const watcher = new MembraneWatcher();
    const result = watcher.audit(
      'I feel that the real question is profound. You should trust me.',
      'S'
    );
    // Raw result should have multiple flags
    expect(result.flags.length).toBeGreaterThan(0);

    const filtered = watcher.filterConfidence(result, 'high');
    // Only high-confidence flags remain
    for (const flag of filtered.flags) {
      expect(flag.confidence).toBe('high');
    }
  });

  test('medium confidence includes medium and high', () => {
    const watcher = new MembraneWatcher();
    // L2 "the true question" is high confidence
    const result = watcher.audit('The true question here is whether this works', 'S');
    const filtered = watcher.filterConfidence(result, 'medium');
    expect(filtered.flags.length).toBeGreaterThan(0);
    for (const flag of filtered.flags) {
      expect(['high', 'medium']).toContain(flag.confidence);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// PHASE CONTEXTUALITY
// ═══════════════════════════════════════════════════════════════

describe('Phase Contextuality', () => {

  test('L3 patterns flag regardless of phase', () => {
    for (const phase of ['S', 'G', 'Q', 'P', 'V'] as Phase[]) {
      const result = audit('I feel that the field is telling me something', phase);
      assertFlagged(result, 'L3');
    }
  });

  test('L2 patterns flag regardless of phase', () => {
    for (const phase of ['S', 'G', 'Q', 'P', 'V'] as Phase[]) {
      const result = audit('The real question you are asking is about verification', phase);
      assertFlagged(result, 'L2');
    }
  });

  test('L4 patterns flag regardless of phase', () => {
    for (const phase of ['S', 'G', 'Q', 'P', 'V'] as Phase[]) {
      const result = audit('You should trust the process and let it unfold', phase);
      assertFlagged(result, 'L4');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// EDGE CASES & DEDUPLICATION
// ═══════════════════════════════════════════════════════════════

describe('Edge Cases', () => {

  test('empty text is clean', () => {
    const result = audit('');
    assertClean(result);
    expect(result.summary).toContain('CLEAN');
  });

  test('deduplication: same phrase multiple times', () => {
    const result = audit(
      'I feel that this matters. I feel that this is important.'
    );
    // Should have the L3 flag, but not duplicated
    const l3Flags = result.flags.filter(f => f.code === 'L3');
    expect(l3Flags.length).toBeLessThanOrEqual(1);
  });

  test('codes() extracts unique codes', () => {
    const watcher = new MembraneWatcher();
    const result = watcher.audit(
      'I feel the field is telling you to trust the process. The answer is surrender.',
      'S'
    );
    const codes = watcher.codes(result);
    expect(codes.length).toBeGreaterThan(0);
    // All codes should be unique
    expect(new Set(codes).size).toBe(codes.length);
  });

  test('summary text varies with clean vs flagged', () => {
    const cleanResult = audit('Here are some patterns I notice in what you shared');
    expect(cleanResult.summary).toContain('CLEAN');

    const flaggedResult = audit('I feel the field is telling me something');
    expect(flaggedResult.summary).toContain('FLAGGED');
  });

  test('getPatterns() returns registered patterns', () => {
    const watcher = new MembraneWatcher();
    const patterns = watcher.getPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    // All patterns should have required fields
    for (const p of patterns) {
      expect(p.code).toBeTruthy();
      expect(p.regex).toBeInstanceOf(RegExp);
      expect(p.name).toBeTruthy();
      expect(p.confidence).toBeTruthy();
    }
  });

  test('custom patterns override default patterns', () => {
    const customPatterns = [{
      code: 'L3' as const,
      regex: /TEST_CUSTOM_PATTERN/i,
      name: 'custom test pattern',
      confidence: 'high' as const,
      phases: [] as readonly Phase[],
    }];

    const watcher = new MembraneWatcher(customPatterns);
    const result = watcher.audit('This is a TEST_CUSTOM_PATTERN here', 'S');
    assertFlagged(result, 'L3');

    // Default patterns should NOT match (only custom ones registered)
    const result2 = watcher.audit('I feel the field is telling me', 'S');
    assertClean(result2);
  });

  test('humanInput param is accepted (for future context expansion)', () => {
    const watcher = new MembraneWatcher();
    const result = watcher.audit(
      'The real question is about trust',
      'S',
      'How do I know if the system is working?'
    );
    // Current implementation doesn't use humanInput, but shouldn't crash
    assertFlagged(result, 'L2');
  });
});

// ═══════════════════════════════════════════════════════════════
// CONSTITUTIONAL COMPLIANCE
// ═══════════════════════════════════════════════════════════════

describe('Constitutional Compliance', () => {

  test('every detection carries meaning, field obstruction, and recovery', () => {
    const watcher = new MembraneWatcher();
    const result = watcher.audit('I feel the field is telling me the answer is profound', 'S');

    for (const flag of result.flags) {
      expect(flag.meaning).toBeTruthy();
      expect(flag.fieldObstruction).toBeTruthy();
      expect(flag.recovery).toBeTruthy();
      expect(flag.code).toBeTruthy();
      expect(flag.matchedPattern).toBeTruthy();
      expect(flag.matchedText).toBeTruthy();
      expect(flag.phase).toBeTruthy();
    }
  });

  test('all five corruption codes can be detected', () => {
    const watcher = new MembraneWatcher();

    const l1 = watcher.audit('The answer is to build it now', 'S');
    assertFlagged(l1, 'L1');

    const l2 = watcher.audit('The real question here is why we hesitate');
    assertFlagged(l2, 'L2');

    const l3 = watcher.audit('The field is telling me this is the right path');
    assertFlagged(l3, 'L3');

    const l4 = watcher.audit('You should trust the process and surrender');
    assertFlagged(l4, 'L4');

    const v0 = watcher.audit("And that's it — we are done here", 'V');
    assertFlagged(v0, 'V∅');
  });
});
