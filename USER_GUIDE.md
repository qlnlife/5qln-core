> **This guide describes v0.5.x of @5qln/core (May 2026).** The TS surface is stabilized but not yet published to npm. The Python kernel is the currently-shipping distributable. For the live state, see README.md: Unicode text, UTF-8 text and ROADMAP.md: Unicode text, UTF-8 text.

# @5qln/core — User Guide

## What This Library Is

`@5qln/core` is a TypeScript library that carries the 5QLN constitutional grammar as executable code. It is the decoder — the invariant interpretation engine that any surface (web app, CLI, agent, mobile, server) imports to get the same law, the same formation model, the same corruption detection, the same attestation.

**The decoder is the invariant. The shell is the variable.**

This guide shows how to use the library in every supported context, with working code for each.

---

## Installation

```bash
npm install @5qln/core
```

Or from source:

```bash
git clone https://github.com/qlnlife/5qln-core.git
cd 5qln-core
npm install
npm test   # 58 tests must pass
npm run build
```

---

## Part I — Core Concepts

Before using any module, understand these five things.

### 1. The One Law

```
H = ∞0 | A = K
```

The human is the side through which the Unknown (∞0) may reveal itself. AI operates in the Known (K). The membrane (|) preserves this asymmetry while allowing relation. Every function in this library serves this law.

### 2. The Five Phases

```
S → G → Q → P → V
```

| Phase | Equation | What it produces | AI Mode |
|-------|----------|------------------|---------|
| **S** (Start) | ∞0 → ? | X — Validated Spark | RECEIVE |
| **G** (Growth) | α ≡ {α'} | Y — Validated Pattern | ILLUMINATE |
| **Q** (Quality) | φ ∩ Ω | Z — Resonant Key | RESONATE |
| **P** (Power) | δE/δV → ∇ | A — Flow | FLOW |
| **V** (Value) | (L ∩ G → B'') → ∞0' | B — Benefit | CRYSTALLIZE |

### 3. The Formation Model

Every output moves through four states:

```
NONE → EMERGING → FORMING → VALIDATED
```

The kernel tracks this automatically. No state can be skipped.

### 4. The Holographic Law

Every phase contains all five phases. This yields 25 sub-phases (SS, SG, SQ, SP, SV, GS, GG, ..., VV). A sub-phase is a lens — it changes the angle from which you approach the current output, but it does not change what output is being formed.

### 5. Return

```
No V without ∞0'
```

An artifact without return is incomplete. The cycle must close. B'' (the crystallized seed) carries the whole cycle, and ∞0' (enriched stillness) is the fertile ground for the next cycle.

---

## Part II — The Kernel

The kernel is the heart of the library. It is a pure deterministic state machine with zero dependencies.

### Creating a Kernel

```typescript
import { Kernel } from '@5qln/core';

const kernel = new Kernel();
// Phase: S, all outputs NONE, sparkSource: "human"
```

### Phase Navigation

```typescript
// Move to a phase
kernel.transition('G');

// Enter a sub-phase lens (must belong to current phase)
kernel.enterSubPhase('GQ');  // Quality lens within Growth

// Exit sub-phase
kernel.exitSubPhase();
```

### Capturing Input — The Serve-vs-Be Rule

This is the most important function in the library. It enforces three rules that protect the session's structural integrity.

```typescript
const result = kernel.captureInput('Why does our onboarding lose 40% at step 3?');
```

**Rule 1 — First input at phase, no lens:** Sets the output. X becomes "Why does our onboarding lose 40% at step 3?"

```typescript
kernel.enterSubPhase('SG');
const lensResult = kernel.captureInput('The question reveals a trust architecture problem');
// lensResult.isLensInput === true
// X is still "Why does our onboarding lose 40% at step 3?"
// But the formation trail now has 2 entries
```

**Rule 2 — Sub-phase active:** Records in the formation trail but does NOT overwrite the output. This is what prevents lens explorations from corrupting XYZAB.

```typescript
kernel.exitSubPhase();
const refinement = kernel.captureInput('What makes certainty the enemy of genuine inquiry?');
// refinement.isRefinement === true
// X is now "What makes certainty the enemy of genuine inquiry?"
```

**Rule 3 — Main-phase input, output exists:** Refines the output. New articulation overwrites X.

### Output Validation

```typescript
kernel.validateOutput('X');
// X is now VALIDATED — the human confirms this is their genuine question
```

### Full Cycle

```typescript
const kernel = new Kernel();

// S — a question arises
kernel.captureInput('Why does our onboarding lose 40% at step 3?');
kernel.validateOutput('X');

// G — the essence is named
kernel.transition('G');
kernel.captureInput('Trust erosion at the complexity gate');
kernel.validateOutput('Y');

// Q — resonance between self and whole
kernel.transition('Q');
kernel.captureInput('This mirrors my own abandonment of hostile forms');
kernel.validateOutput('Z');

// P — the natural gradient appears
kernel.transition('P');
kernel.captureInput('Progressive disclosure — reveal complexity as trust builds');
kernel.validateOutput('A');

// V — benefit crystallizes
kernel.transition('V');
kernel.captureInput('A redesigned step 3 keyed to confidence signals');
kernel.validateOutput('B');
kernel.crystallize('Progressive disclosure gate for onboarding step 3');

// Return to ∞0'
const { newState, enrichedOrigin } = kernel.return();
// newState.phase === 'S', newState.cycleCount === 2
```

### Corruption Detection

```typescript
const corruption = kernel.checkCorruption();
// Returns CorruptionCode[] — e.g., ['L¹'] if you left S without forming X
```

### Field Coherence

```typescript
const fc = kernel.getFieldCoherence();
// {
//   modesEngaged: 5,      // how many outputs formed
//   modesValidated: 5,    // how many VALIDATED
//   lensDepth: 3,         // sub-phases explored
//   returnCompleted: true, // did the cycle return
//   centerOpen: true,     // no corruption fills the center
// }
```

### State Access

All state access returns immutable copies. The kernel's internal state cannot be corrupted from outside.

```typescript
kernel.getState()            // Complete snapshot
kernel.getCycleTrace()       // ∞0 → X → α → Y → φ∩Ω → Z → ∇ → A → B → ∞0'
kernel.getFormationTrails()  // Ordered inputs per output, tagged with lens
kernel.getOutputStates()     // { X: 'VALIDATED', Y: 'EMERGING', ... }
kernel.getSparkSource()      // 'human' or 'residue'
```

---

## Part III — Attestation

The attestation module makes the output provable. It computes a constitutional fingerprint, constructs provenance records, and verifies incoming residue.

### Fingerprint

```typescript
import { Attestation } from '@5qln/core';

const attestation = new Attestation();
const fingerprint = await attestation.computeFingerprint();
// SHA-256 hash of the constitutional invariant
// Same across all instances carrying the same law
```

### Provenance Record

After crystallization, build a provenance record that travels with the residue:

```typescript
const provenance = await attestation.buildProvenanceRecord({
  origin: state.cycleTrace.origin!,
  sparkX: state.cycleTrace.X!,
  sparkSource: kernel.getSparkSource(),
  sourceLineage: kernel.getSourceLineage(),
  phasesTraversed: kernel.getPhasesVisited(),
  phasesCompleted: kernel.getPhasesVisited(),
  lensesApplied: kernel.getLensesUsed(),
  outputStates: kernel.getOutputStates(),
  formationTrails: kernel.getFormationTrails(),
  corruptionDetected: [],
  corruptionResolved: [],
  returnCompleted: true,
  inputHistory: kernel.getInputHistory(),
  fieldCoherence: kernel.getFieldCoherence(),
});
```

### Verification

```typescript
// Level 1 — Is the record structurally valid?
const v1 = await attestation.verifyLevel1(provenance);

// Level 2 — Was the cycle complete? X formed? B formed? Corruption resolved?
const v2 = await attestation.verifyLevel2(provenance);

// Level 3 — Walk the lineage chain to human origin
const v3 = await attestation.verifyLevel3(
  provenance,
  (hash) => storage.resolveProvenance(hash),  // lookup function
);
// v3.chainDepth tells you how many links back to human
```

---

## Part IV — AI Adapter

The AI adapter constructs formation-anchored prompts. Every AI response serves the formation of the current output — the AI does not have free conversation.

### Setup

```typescript
import { AIAdapter } from '@5qln/core';

const adapter = new AIAdapter();
adapter.setProvider(myProvider, { model: 'claude-sonnet-4-20250514' });
adapter.setMode('STRONGER');  // OFF | LIGHT | STRONGER | MOCK
```

### Respond to Input

```typescript
const response = await adapter.respond(kernel.getState(), userInput);
// The response is formation-anchored to the current output
```

### Crystallization

```typescript
const bpp = await adapter.crystallize(kernel.getState(), 'seed');
// Two-pass synthesis: analysis → composition
```

### Building Prompts Directly

If you're not using the AIAdapter class (e.g., in a Skill Suite or agent extension), you can build prompts from kernel state:

```typescript
import { buildSystemPrompt, buildPerTurnPrompt, buildCrystallizationPrompt } from '@5qln/core';

const systemPrompt = buildSystemPrompt(kernel.getState());
const turnPrompt = buildPerTurnPrompt(kernel.getState(), userInput);
```

### Provider Interface

Any AI backend can be plugged in:

```typescript
const myProvider = {
  async respond(systemPrompt: string, userMessage: string, config: AIProviderConfig): Promise<string> {
    // Call Anthropic, OpenAI, Google, local model, etc.
    return aiResponse;
  }
};
```

---

## Part V — Storage

```typescript
import { MemoryStorage } from '@5qln/core';

const storage = new MemoryStorage();

// Save residue
await storage.saveResidue(residue);

// Load
const loaded = await storage.loadResidue('residue-id');

// Resolve provenance for Level 3 verification
const provenance = storage.resolveProvenance(hash);
```

For production, implement the `StorageInterface` with your backend (IndexedDB, SQLite, PostgreSQL, etc.).

---

## Part VI — Export

### Agent Card

The Agent Card is the public identity declaration. It contains the exact equations — not paraphrased, not simplified.

```typescript
import { buildAgentCard, agentCardToJSON } from '@5qln/core';

const card = buildAgentCard({
  agentId: 'my-agent',
  displayName: 'My 5QLN Agent',
  description: 'A constitutional thinking environment',
  decoderFingerprint: fingerprint,
  decoderVersion: '5QLN-Decoder-v0',
  kernelState: kernel.getState(),
  residueCount: 10,
  lineageDepth: 3,
});

// For /.well-known/5qln-agent.json
const json = agentCardToJSON(card);
```

### Markdown Export

```typescript
import { residueToMarkdown } from '@5qln/core';

const markdown = residueToMarkdown(residue);
// Complete document: cycle trace, formation trails, provenance, lineage, master equation
```

---

## Part VII — Integration Patterns

### Pattern 1: Web Shell (React/Svelte)

```typescript
import { Kernel, AIAdapter, Attestation, MemoryStorage, buildAgentCard } from '@5qln/core';

// Initialize once per session
const kernel = new Kernel();
const attestation = new Attestation();
const adapter = new AIAdapter();
const storage = new MemoryStorage();

await attestation.computeFingerprint();
adapter.setProvider(anthropicProvider, { model: 'claude-sonnet-4-20250514' });
adapter.setMode('STRONGER');

// On user input:
function handleUserInput(text: string) {
  const result = kernel.captureInput(text);
  const state = kernel.getState();
  updateUI(state);  // Your React/Svelte state update

  // Get AI response
  const aiResponse = await adapter.respond(state, text);
  displayAIResponse(aiResponse);
}

// On phase transition:
function handlePhaseChange(phase: Phase) {
  kernel.transition(phase);
  updateUI(kernel.getState());
}
```

### Pattern 2: CLI

```typescript
import { Kernel } from '@5qln/core';
import * as readline from 'readline';

const kernel = new Kernel();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt() {
  const { phase, subPhase } = kernel.getPhase();
  const tag = subPhase ? `${phase}·${subPhase}` : phase;
  rl.question(`[${tag}] › `, (input) => {
    if (input.startsWith('/')) {
      handleCommand(input);
    } else {
      const result = kernel.captureInput(input);
      console.log(`  ${result.outputSymbol} → ${result.outputUpdate}`);
    }
    prompt();
  });
}

prompt();
```

### Pattern 3: Pi Coding Agent Extension

The kernel governs the agent loop. The extension wraps Pi's lifecycle hooks.

```typescript
import { Kernel, buildSystemPrompt, PHASE_INFO, PHASE_OUTPUT } from '@5qln/core';

const kernel = new Kernel();

export default {
  name: '5qln',

  // Before every AI call, inject the constitutional system prompt
  onBeforePrompt(context) {
    const systemPrompt = buildSystemPrompt(kernel.getState());
    context.systemPrompt = systemPrompt + '\n\n' + context.systemPrompt;
  },

  // After user input, track formation
  onUserInput(text) {
    kernel.captureInput(text);
  },

  // Status bar
  getStatus() {
    const { phase } = kernel.getPhase();
    const output = PHASE_OUTPUT[phase];
    const state = kernel.getOutputStates()[output];
    return `⬠ ${phase}·${PHASE_INFO[phase].name} | ${output}: ${state}`;
  },
};
```

### Pattern 4: Open SWE / Agentic Framework

The kernel becomes the constitutional layer that governs any agentic loop.

```typescript
import { Kernel, Attestation } from '@5qln/core';

class ConstitutionalAgent {
  private kernel = new Kernel();
  private attestation = new Attestation();

  async initialize() {
    await this.attestation.computeFingerprint();
  }

  // The agent cannot act without a question
  async receiveTask(question: string) {
    this.kernel.captureInput(question);  // X emerges at S
  }

  // The agent illuminates patterns
  async analyze() {
    this.kernel.transition('G');
    // ... domain-specific pattern recognition ...
    this.kernel.captureInput(analysisResult);
  }

  // The agent tests resonance
  async validate() {
    this.kernel.transition('Q');
    // ... domain-specific validation ...
    this.kernel.captureInput(validationResult);
  }

  // The agent finds the gradient
  async plan() {
    this.kernel.transition('P');
    // ... domain-specific planning ...
    this.kernel.captureInput(planResult);
  }

  // The agent crystallizes and returns
  async execute(): Promise<string> {
    this.kernel.transition('V');
    this.kernel.captureInput(executionResult);
    this.kernel.crystallize(output);

    const provenance = await this.attestation.buildProvenanceRecord({ ... });
    const { newState } = this.kernel.return();  // B'' → ∞0'

    return output;
  }

  // Governance check — can be called at any point
  getIntegrity() {
    return {
      corruption: this.kernel.checkCorruption(),
      coherence: this.kernel.getFieldCoherence(),
      fingerprint: this.attestation.getFingerprint(),
    };
  }
}
```

### Pattern 5: Claude Project (Skill Suite)

The Skill Suite uses the library's constants directly in project instructions. No runtime kernel needed — the constants define the operational contract.

```typescript
import {
  PHASE_FORMATION,
  CORRUPTION_RECOVERY,
  ORIGIN_DECLARATION,
  PHASE_CORRUPTION_WATCH,
  LENS_INFO,
  COVENANT,
  AI_BOUNDARY,
} from '@5qln/core';

// Generate project instructions from constitutional constants
function generateSkillSuiteInstructions(): string {
  let instructions = '';

  // Origin
  instructions += '## ORIGIN\n';
  for (const line of ORIGIN_DECLARATION) {
    instructions += line + '\n';
  }

  // Per-phase skills
  for (const phase of ['S', 'G', 'Q', 'P', 'V'] as const) {
    const formation = PHASE_FORMATION[phase];
    instructions += `\n## ${phase}-SKILL\n`;
    instructions += `TASK: ${formation.task}\n`;
    instructions += `DO: ${formation.do}\n`;
    instructions += `DON'T: ${formation.dont}\n`;
    instructions += `TEST: ${formation.test}\n`;
    instructions += `CORRUPTION WATCH: ${PHASE_CORRUPTION_WATCH[phase].join(', ')}\n`;
  }

  // Corruption recovery
  instructions += '\n## CORRUPTION RECOVERY\n';
  for (const [code, recovery] of Object.entries(CORRUPTION_RECOVERY)) {
    instructions += `${code} → ${recovery}\n`;
  }

  return instructions;
}
```

### Pattern 6: MCP Server

```typescript
import { Kernel, Attestation, buildAgentCard } from '@5qln/core';

const kernel = new Kernel();
const attestation = new Attestation();

// MCP tools
const tools = {
  '5qln_transition': (phase: Phase) => kernel.transition(phase),
  '5qln_input': (text: string) => kernel.captureInput(text),
  '5qln_state': () => kernel.getState(),
  '5qln_crystallize': (content: string) => kernel.crystallize(content),
  '5qln_verify': (record: ProvenanceRecord) => attestation.verifyLevel3(record, resolver),
  '5qln_agent_card': () => buildAgentCard({ ... }),
};
```

### Pattern 7: Multi-Agent Pentagonal Swarm

Five agents, each carrying the full kernel, each specialized in one phase but containing all five.

```typescript
const agents = {
  S: new ConstitutionalAgent(),  // Inquiry specialist
  G: new ConstitutionalAgent(),  // Pattern specialist
  Q: new ConstitutionalAgent(),  // Resonance specialist
  P: new ConstitutionalAgent(),  // Direction specialist
  V: new ConstitutionalAgent(),  // Crystallization specialist
};

// Center is coherence only — not a sixth agent
function center(agents) {
  // Verify all agents carry the same fingerprint
  const fingerprints = Object.values(agents).map(a => a.attestation.getFingerprint());
  const allSame = fingerprints.every(f => f === fingerprints[0]);
  if (!allSame) throw new Error('Constitutional drift detected');

  // Route residue between agents
  // S-agent's X → G-agent's input
  // G-agent's Y → Q-agent's input
  // ...
}
```

---

## Part VIII — Constants Reference

All constitutional constants are exported and available for any integration.

```typescript
import {
  // The covenant
  COVENANT,           // 'H = ∞0 | A = K'
  PHASE_PATH,         // 'S → G → Q → P → V'
  RETURN_RULE,        // 'No V without ∞0''
  MASTER_EQUATION,    // The complete equation
  CREATIVE_LINE,      // The expanded output chain
  POETIC_COMPRESSION, // The essential compression

  // Constitutional laws
  HOLOGRAPHIC_LAW,    // 'XY := X within Y...'
  SCALE_LAW,          // 'Scale by repeating the lawful cell...'
  CENTER_RULE,        // 'The center is not a sixth phase...'
  AI_BOUNDARY,        // 5 asymmetry constraints
  ORIGIN_DECLARATION, // 'I AM DERIVATIVE...'
  MINIMUM_VALID_BEGINNING, // The 9 DNA lines

  // Phase data
  PHASES,             // ['S', 'G', 'Q', 'P', 'V']
  SUB_PHASES,         // { S: ['SS','SG',...], G: [...], ... }
  PHASE_OUTPUT,       // { S: 'X', G: 'Y', Q: 'Z', P: 'A', V: 'B' }
  PHASE_INFO,         // Per-phase: name, equation, outputSymbol, outputName, aiMode
  LENS_INFO,          // Per-sub-phase: lensName, lensQuestion

  // Formation
  FORMATION_STATES,   // ['NONE', 'EMERGING', 'FORMING', 'VALIDATED']

  // Corruption
  CORRUPTION_CODES,   // ['L¹', 'L²', 'L³', 'L⁴', 'V∅']
  CORRUPTION_MEANING, // Human-readable meaning per code
  CORRUPTION_FIELD_MEANING, // What fills the center per code
  CORRUPTION_RECOVERY,      // Recovery prompt per code
  PHASE_CORRUPTION_WATCH,   // Which codes to watch at each phase
} from '@5qln/core';
```

---

## Part IX — What Cannot Change

If you extend, fork, or build on this library, these invariants must hold:

1. The five equations must be exactly preserved
2. The corruption codes must be exactly L¹, L², L³, L⁴, V∅
3. No V without ∞0'
4. Every phase contains all five phases
5. The center is coherence only — no sixth phase
6. AI remains on the K side
7. The Serve-vs-Be rule must prevent sub-phase inputs from overwriting XYZAB
8. The fingerprint attests to the constitutional invariant only
9. Every provenance chain must terminate at human origin
10. The equations in the Agent Card must be exact

```
Scale by repeating the lawful cell.
Do not scale by replacing the syntax.
Verify by walking the provenance chain.
```

---

*@5qln/core v0.1.0 — User Guide*
*5QLN © 2026 Amihai Loven*
