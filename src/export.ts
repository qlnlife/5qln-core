// ═══════════════════════════════════════════════════════════════
// @5qln/core — Export
//
// Agent Card generation, Markdown export, JSON export.
// The equations in the Agent Card must be exact.
// Not paraphrased. Not simplified. Not "equivalent." Exact.
// ═══════════════════════════════════════════════════════════════

import {
  type AgentCard,
  type KernelState,
  type Residue,
  PHASE_INFO,
  COVENANT,
  MASTER_EQUATION,
  RETURN_RULE,
  CORRUPTION_CODES,
  HOLOGRAPHIC_LAW,
  SCALE_LAW,
  CENTER_RULE,
  AI_BOUNDARY,
} from './types.js';

// ─── Agent Card ──────────────────────────────────────────────

export function buildAgentCard(params: {
  agentId: string;
  displayName: string;
  description: string;
  decoderFingerprint: string;
  decoderVersion: string;
  kernelState: KernelState;
  residueCount: number;
  lineageDepth: number;
}): AgentCard {
  return {
    agentId: params.agentId,
    displayName: params.displayName,
    description: params.description,
    constitutional: {
      covenant: COVENANT,
      masterEquation: MASTER_EQUATION,
      equations: {
        S: PHASE_INFO.S.equation,
        G: PHASE_INFO.G.equation,
        Q: PHASE_INFO.Q.equation,
        P: PHASE_INFO.P.equation,
        V: PHASE_INFO.V.equation,
      },
      outputs: {
        S: `X — ${PHASE_INFO.S.outputName}`,
        G: `Y — ${PHASE_INFO.G.outputName}`,
        Q: `Z — ${PHASE_INFO.Q.outputName}`,
        P: `A — ${PHASE_INFO.P.outputName}`,
        V: `B — ${PHASE_INFO.V.outputName}`,
      },
      corruptionCodes: CORRUPTION_CODES,
      returnRule: RETURN_RULE,
      holographicLaw: HOLOGRAPHIC_LAW,
      scaleLaw: SCALE_LAW,
      centerRule: CENTER_RULE,
      aiBoundary: AI_BOUNDARY,
      fieldPrinciple: 'The five modes create conditions for coherence. The center is not a sixth mode — it is the opening that arises when the five are in right relation.',
    },
    runtime: {
      decoderFingerprint: params.decoderFingerprint,
      decoderVersion: params.decoderVersion,
      phase: params.kernelState.phase,
      residueCount: params.residueCount,
      lineageDepth: params.lineageDepth,
    },
  };
}

export function agentCardToJSON(card: AgentCard): string {
  return JSON.stringify(card, null, 2);
}

// ─── Markdown Export ─────────────────────────────────────────

export function residueToMarkdown(residue: Residue): string {
  const lines: string[] = [];

  lines.push(`# ${residue.title}`);
  lines.push('');
  lines.push(`**Type:** ${residue.type}`);
  lines.push(`**Created:** ${residue.createdAt}`);
  lines.push('');

  // Content
  lines.push('## Content');
  lines.push('');
  lines.push(residue.content);
  lines.push('');

  // Cycle Trace
  lines.push('## Cycle Trace');
  lines.push('');
  const ct = residue.cycle;
  lines.push(`| Position | Value |`);
  lines.push(`|----------|-------|`);
  if (ct.origin) lines.push(`| ∞0 (origin) | ${ct.origin} |`);
  if (ct.X) lines.push(`| X (spark) | ${ct.X} |`);
  if (ct.alpha) lines.push(`| α (essence) | ${ct.alpha} |`);
  if (ct.Y) lines.push(`| Y (pattern) | ${ct.Y} |`);
  if (ct.phiOmega) lines.push(`| φ∩Ω (resonance) | ${ct.phiOmega} |`);
  if (ct.Z) lines.push(`| Z (key) | ${ct.Z} |`);
  if (ct.nabla) lines.push(`| ∇ (gradient) | ${ct.nabla} |`);
  if (ct.A) lines.push(`| A (flow) | ${ct.A} |`);
  if (ct.B) lines.push(`| B (benefit) | ${ct.B} |`);
  if (ct.Bpp) lines.push(`| B'' (seed) | [crystallized] |`);
  if (ct.returnTo) lines.push(`| ∞0' (return) | ${ct.returnTo} |`);
  lines.push('');

  // Formation Trails
  lines.push('## Formation Trails');
  lines.push('');
  for (const sym of ['X', 'Y', 'Z', 'A', 'B'] as const) {
    const trail = residue.formationTrails[sym];
    if (trail.length > 0) {
      lines.push(`### ${sym} — ${residue.outputStates[sym]}`);
      for (const entry of trail) {
        lines.push(`- [${entry.lens}] ${entry.text}`);
      }
      lines.push('');
    }
  }

  // Provenance
  if (residue.provenance) {
    const p = residue.provenance;
    lines.push('## Provenance');
    lines.push('');
    lines.push(`- **Hash:** ${p.provenance_hash}`);
    lines.push(`- **Spark source:** ${p.spark_source}`);
    if (p.source_lineage) lines.push(`- **Lineage:** ${p.source_lineage}`);
    lines.push(`- **Return completed:** ${p.return_completed ? '✓' : '✗'}`);
    lines.push(`- **Decoder fingerprint:** ${p.decoder_fingerprint}`);
    if (p.corruption_detected.length > 0) {
      lines.push(`- **Corruption detected:** ${p.corruption_detected.join(', ')}`);
      lines.push(`- **Corruption resolved:** ${p.corruption_resolved.join(', ')}`);
    }
    if (p.field_coherence) {
      lines.push('');
      lines.push('### Field Coherence at Crystallization');
      lines.push(`- Modes engaged: ${p.field_coherence.modesEngaged}/5`);
      lines.push(`- Modes validated: ${p.field_coherence.modesValidated}/5`);
      lines.push(`- Lens depth: ${p.field_coherence.lensDepth} sub-phase explorations`);
      lines.push(`- Center open: ${p.field_coherence.centerOpen ? '✓' : '✗'}`);
    }
    lines.push('');
  }

  // Lineage
  lines.push('## Lineage');
  lines.push('');
  lines.push(`- **Session:** ${residue.lineage.session}`);
  lines.push(`- **Branch:** ${residue.lineage.branch}`);
  lines.push(`- **Phase:** ${residue.lineage.phase}`);
  lines.push('');

  // Footer
  lines.push('---');
  lines.push(`*${MASTER_EQUATION}*`);

  return lines.join('\n');
}

// ─── JSON Export ─────────────────────────────────────────────

export function residueToJSON(residue: Residue): object {
  return {
    _meta: {
      format: '@5qln/residue',
      version: '0.1.0',
      covenant: COVENANT,
      masterEquation: MASTER_EQUATION,
    },
    ...residue,
  };
}
