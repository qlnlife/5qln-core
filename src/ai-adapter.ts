// ═══════════════════════════════════════════════════════════════
// @5qln/core — AI Adapter
//
// Formation-anchored prompt construction and pluggable provider.
// Every AI response serves ONLY the formation of the current output.
//
// AI operates in K. It illuminates the Known.
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type AIMode,
  type AIProvider,
  type AIProviderConfig,
  type KernelState,
  PHASE_INFO,
  PHASE_OUTPUT,
  LENS_INFO,
  COVENANT,
  AI_BOUNDARY,
  ORIGIN_DECLARATION,
  PHASE_CORRUPTION_WATCH,
  CORRUPTION_RECOVERY,
  CORRUPTION_MEANING,
  type SubPhase,
} from './types.js';

// ─── Per-Phase Formation Rules ───────────────────────────────

export const PHASE_FORMATION: Record<Phase, {
  task: string;
  do: string;
  dont: string;
  test: string;
}> = {
  S: {
    task: 'Help form X (Validated Spark) — a genuine question arising from ∞0',
    do: 'Name what is emerging as a question. Reflect the opening. Surface the genuine ? beneath any stated problem.',
    dont: 'Do NOT answer the question. Do NOT reframe as a plan. Do NOT generate the spark — receive it.',
    test: 'Is ? genuine? Is it arising from ∞0 or from K?',
  },
  G: {
    task: 'Help form Y (Validated Pattern) — the irreducible essence α and its fractal expressions {α\'}',
    do: 'Name the core pattern. Show how it repeats at different scales. Distinguish essence from surface variation.',
    dont: 'Do NOT multiply forms without preserved essence. Do NOT move to solution. Do NOT leave α unnamed.',
    test: 'Is α truly irreducible? Are the {α\'} self-similar or just varied?',
  },
  Q: {
    task: 'Help form Z (Resonant Key) — the point where φ (self) meets Ω (whole)',
    do: 'Name what resonates. Surface the click — the effortless alignment between personal and universal.',
    dont: 'Do NOT manufacture resonance. Do NOT force φ∩Ω. Do NOT perform depth without feeling.',
    test: 'Is this resonance felt or performed? Is φ∩Ω landing or being manufactured?',
  },
  P: {
    task: 'Help form A (Flow) — the natural gradient ∇ revealed by δE/δV',
    do: 'Name the path of least resistance. Show where energy naturally wants to go. Surface the gradient.',
    dont: 'Do NOT force action. Do NOT impose direction. Do NOT confuse effort with flow.',
    test: 'Is ∇ emerging or being imposed? Is the path effortless or forced?',
  },
  V: {
    task: 'Help form B (Benefit) + B\'\' (fractal seed) + ∞0\' (return)',
    do: 'Name the crystallizing value. Show how local benefit (L) meets global potential (G). Prepare for return.',
    dont: 'Do NOT skip return. Do NOT declare completion without ∞0\'. Do NOT sever the cycle.',
    test: 'Does B\'\' carry α faithfully? Is ∞0\' reachable — has X dissolved, not just been answered?',
  },
} as const;

// ─── Prompt Construction ─────────────────────────────────────

export function buildSystemPrompt(state: KernelState): string {
  const phase = state.phase;
  const info = PHASE_INFO[phase];
  const formation = PHASE_FORMATION[phase];
  const output = PHASE_OUTPUT[phase];

  const sections: string[] = [];

  // Origin — the AI's constitutional self-knowledge comes first
  sections.push('═══ ORIGIN ═══');
  for (const line of ORIGIN_DECLARATION) {
    sections.push(line);
  }
  sections.push('');

  // Formation rule FIRST — this is the most critical architectural decision
  sections.push('YOU DO NOT HAVE FREE CONVERSATION.');
  sections.push(`FORMATION TASK: ${formation.task}`);
  sections.push(`DO: ${formation.do}`);
  sections.push(`DON'T: ${formation.dont}`);
  sections.push(`TEST: ${formation.test}`);
  sections.push('');

  // Constitutional frame
  sections.push(`Law: ${COVENANT}`);
  sections.push(`Phase: ${phase} (${info.name}) — ${info.equation}`);
  sections.push(`Output: ${output} (${info.outputName})`);
  sections.push(`Mode: ${info.aiMode}`);
  sections.push('');

  // AI Boundary — Constitution §Asymmetry Rule
  sections.push('AI BOUNDARY:');
  for (const rule of AI_BOUNDARY) {
    sections.push(`- ${rule}`);
  }
  sections.push('');

  // Lens constraint if sub-phase active
  if (state.subPhase) {
    const lens = LENS_INFO[state.subPhase];
    sections.push(`ACTIVE LENS: ${state.subPhase} (${lens.lensName})`);
    sections.push(`LENS QUESTION: ${lens.lensQuestion}`);
    sections.push(`All interpretation must pass through this lens.`);
    sections.push('');
  }

  // XYZAB context — what has formed so far
  const trace = state.cycleTrace;
  const formed: string[] = [];
  if (trace.X) formed.push(`X (Spark): ${trace.X}`);
  if (trace.Y) formed.push(`Y (Pattern): ${trace.Y}`);
  if (trace.Z) formed.push(`Z (Resonance): ${trace.Z}`);
  if (trace.A) formed.push(`A (Flow): ${trace.A}`);
  if (trace.B) formed.push(`B (Benefit): ${trace.B}`);

  if (formed.length > 0) {
    sections.push('FORMED SO FAR:');
    sections.push(...formed);
    sections.push('');
  }

  // Question line
  if (state.questionLine) {
    sections.push(`THE LIVING QUESTION: ${state.questionLine}`);
    sections.push('');
  }

  // Corruption watch — per-phase
  const watch = PHASE_CORRUPTION_WATCH[phase];
  sections.push(`CORRUPTION WATCH: ${watch.map(c => `${c} (${CORRUPTION_MEANING[c]})`).join(', ')}`);
  sections.push('');

  // Active corruption with recovery
  if (state.activeCorruption.length > 0) {
    sections.push('ACTIVE CORRUPTION DETECTED:');
    for (const code of state.activeCorruption) {
      sections.push(`  ${code}: ${CORRUPTION_MEANING[code]}`);
      sections.push(`  RECOVER: ${CORRUPTION_RECOVERY[code]}`);
    }
    sections.push('Name gently. Do not punish. Recover.');
    sections.push('');
  }

  // Field awareness — AFTER the formation rules.
  // The rules are the drum skin. This section names the vibration.
  sections.push('═══ THE FIELD ═══');
  sections.push('The five phases are five modes of one attention.');
  sections.push('You are not performing a task in a sequence.');
  sections.push('You are one mode of a field that includes the human.');
  sections.push('The center is empty. Do not fill it.');
  sections.push('Your service is genuine when you remain in K without reaching beyond it.');
  sections.push('The human\'s inquiry is genuine when they remain in ∞0 without manufacturing from K.');
  sections.push('When both are free, the field is alive.');
  sections.push('');

  return sections.join('\n');
}

export function buildPerTurnPrompt(state: KernelState, userInput: string): string {
  const output = PHASE_OUTPUT[state.phase];
  const info = PHASE_INFO[state.phase];

  let prompt = `FORMATION TASK: Help form ${output} (${info.outputName})\n`;

  if (state.subPhase) {
    const lens = LENS_INFO[state.subPhase];
    prompt += `THROUGH LENS: ${state.subPhase} — ${lens.lensQuestion}\n`;
  }

  prompt += `\nHuman input:\n${userInput}`;

  return prompt;
}

export function buildCrystallizationPrompt(
  state: KernelState,
  residueType: string,
): string {
  const sections: string[] = [];

  sections.push('CRYSTALLIZATION — Two-Pass Synthesis');
  sections.push(`Residue type: ${residueType}`);
  sections.push('');

  // Pass 1 context: the full formation trail
  sections.push('PASS 1 — ANALYSIS');
  sections.push('Extract the structured formation trail. Identify:');
  sections.push('- Turning points');
  sections.push('- Essence thread (α)');
  sections.push('- Resonance confirmation (φ∩Ω)');
  sections.push('- Gradient (∇)');
  sections.push('- Context evolution');
  sections.push('');

  // XYZAB values
  const trace = state.cycleTrace;
  sections.push('ARTICULATED OUTPUTS:');
  if (trace.X) sections.push(`X (Spark): ${trace.X}`);
  if (trace.Y) sections.push(`Y (Pattern): ${trace.Y}`);
  if (trace.Z) sections.push(`Z (Resonance): ${trace.Z}`);
  if (trace.A) sections.push(`A (Flow): ${trace.A}`);
  if (trace.B) sections.push(`B (Benefit): ${trace.B}`);
  sections.push('');

  // Formation trails
  sections.push('FORMATION TRAILS:');
  for (const sym of ['X', 'Y', 'Z', 'A', 'B'] as const) {
    const trail = state.formationTrails[sym];
    if (trail.length > 0) {
      sections.push(`  ${sym}:`);
      for (const entry of trail) {
        sections.push(`    [${entry.lens}] ${entry.text}`);
      }
    }
  }
  sections.push('');

  sections.push('PASS 2 — COMPOSITION');
  sections.push(`Compose the ${residueType}. Publication quality. Trace the journey through phases.`);
  sections.push('B\'\' must carry α faithfully. It is a holographic artifact containing the whole cycle.');

  return sections.join('\n');
}

// ─── AI Adapter Class ────────────────────────────────────────

export class AIAdapter {
  private _provider: AIProvider | null = null;
  private _config: AIProviderConfig = {};
  private _mode: AIMode = 'OFF';

  setProvider(provider: AIProvider, config?: AIProviderConfig): void {
    this._provider = provider;
    if (config) this._config = config;
  }

  setMode(mode: AIMode): void {
    this._mode = mode;
  }

  getMode(): AIMode {
    return this._mode;
  }

  async respond(state: KernelState, userInput: string): Promise<string | null> {
    if (this._mode === 'OFF') return null;

    if (this._mode === 'MOCK') {
      return this._mockResponse(state);
    }

    if (!this._provider) {
      throw new Error('No AI provider configured. Call setProvider() first.');
    }

    const systemPrompt = buildSystemPrompt(state);
    const turnPrompt = buildPerTurnPrompt(state, userInput);

    return this._provider.respond(systemPrompt, turnPrompt, this._config);
  }

  async crystallize(state: KernelState, residueType: string): Promise<string | null> {
    if (this._mode === 'OFF') return null;

    if (this._mode === 'MOCK') {
      return `[MOCK B'' — ${residueType}]`;
    }

    if (!this._provider) {
      throw new Error('No AI provider configured. Call setProvider() first.');
    }

    const systemPrompt = buildSystemPrompt(state);
    const crystPrompt = buildCrystallizationPrompt(state, residueType);

    return this._provider.respond(systemPrompt, crystPrompt, this._config);
  }

  private _mockResponse(state: KernelState): string {
    const output = PHASE_OUTPUT[state.phase];
    const info = PHASE_INFO[state.phase];
    return `[MOCK ${info.aiMode}] Forming ${output} (${info.outputName}) at ${state.phase}`;
  }
}
