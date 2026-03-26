// ═══════════════════════════════════════════════════════════════
// @5qln/core — Public API
//
// The decoder is the invariant. The shell is the variable.
// Scale by repeating the lawful cell.
// Do not scale by replacing the syntax.
//
// @5qln/core v0.1.0 · 5QLN © 2026 Amihai Loven
// ═══════════════════════════════════════════════════════════════

// ─── Types ───────────────────────────────────────────────────
export type {
  Phase,
  SubPhase,
  OutputSymbol,
  FormationState,
  CorruptionCode,
  AIMode,
  KernelState,
  CycleTrace,
  OutputStates,
  FormationTrails,
  TrailEntry,
  InputResult,
  CorruptionEvent,
  FieldCoherence,
  ProvenanceRecord,
  Residue,
  ResidueType,
  AgentCard,
  AIProvider,
  AIProviderConfig,
  StorageInterface,
  HashFunction,
} from './types.js';

// ─── Constants ───────────────────────────────────────────────
export {
  PHASES,
  SUB_PHASES,
  PHASE_OUTPUT,
  PHASE_INFO,
  LENS_INFO,
  FORMATION_STATES,
  CORRUPTION_CODES,
  CORRUPTION_MEANING,
  CORRUPTION_FIELD_MEANING,
  COVENANT,
  PHASE_PATH,
  RETURN_RULE,
  MASTER_EQUATION,
  CREATIVE_LINE,
  POETIC_COMPRESSION,
  HOLOGRAPHIC_LAW,
  SCALE_LAW,
  CENTER_RULE,
  AI_BOUNDARY,
  MINIMUM_VALID_BEGINNING,
  CORRUPTION_RECOVERY,
  ORIGIN_DECLARATION,
  PHASE_CORRUPTION_WATCH,
} from './types.js';

// ─── Kernel ──────────────────────────────────────────────────
export { Kernel } from './kernel.js';

// ─── Attestation ─────────────────────────────────────────────
export { Attestation, canonicalJSON } from './attestation.js';

// ─── AI Adapter ──────────────────────────────────────────────
export {
  AIAdapter,
  PHASE_FORMATION,
  buildSystemPrompt,
  buildPerTurnPrompt,
  buildCrystallizationPrompt,
} from './ai-adapter.js';

// ─── Storage ─────────────────────────────────────────────────
export { MemoryStorage } from './storage.js';

// ─── Export ──────────────────────────────────────────────────
export {
  buildAgentCard,
  agentCardToJSON,
  residueToMarkdown,
  residueToJSON,
} from './export.js';
