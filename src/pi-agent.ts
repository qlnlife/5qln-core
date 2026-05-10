// ═══════════════════════════════════════════════════════════════
// @5qln/core — Pi Coding Agent extension
//
// The 5QLN constitutional runtime compiled into a Pi extension
// (https://github.com/earendil-works/pi). The factory matches the
// Pi ExtensionAPI contract: a default-exportable function that
// receives `pi` and registers tools, commands, and event handlers.
//
// Usage in a Pi extension file:
//
//     import { createPiExtension } from "@5qln/core";
//     export default createPiExtension();
//     // or: export default createPiExtension({ minConfidence: 'high' });
//
// What it registers
//   tools     audit_membrane, session_flow, watcher_status
//   commands  /5qln, /5qln-codex, /5qln-transition <phase>,
//             /5qln-lens <sub|>, /5qln-validate <X|Y|Z|A|B>,
//             /5qln-crystallize <content>, /5qln-integrity
//   events    session_start (init + fingerprints + status widget)
//             turn_start / turn_end (refresh status)
//             input (capture human input → kernel)
//             message_end (audit AI response → notify on flag)
//
// Persists 5qln:cycle and 5qln:audit entries via pi.appendEntry().
// ═══════════════════════════════════════════════════════════════

import {
  type Phase,
  type SubPhase,
  type OutputSymbol,
  PHASES,
  PHASE_INFO,
  PHASE_OUTPUT,
} from './types.js';
import { Kernel } from './kernel.js';
import { Codex } from './codex.js';
import { SyntaxActivator } from './syntax-activator.js';
import { MembraneWatcher } from './membrane-watcher.js';
import { Attestation } from './attestation.js';

// ─── Structural subset of the Pi ExtensionAPI ────────────────
//
// Declared locally so this package does not hard-depend on
// @earendil-works/pi-coding-agent. Pi's real ExtensionAPI
// satisfies this subset structurally.

export interface PiContentBlock {
  readonly type: string;
  readonly text?: string;
}

export interface PiUIContext {
  setStatus(key: string, message?: string): void;
  setWidget?(key: string, content: string[] | unknown, options?: unknown): void;
  notify(message: string, type: 'info' | 'warning' | 'error'): void;
}

export interface PiExtensionContext {
  readonly ui: PiUIContext;
  readonly hasUI?: boolean;
  readonly cwd?: string;
  readonly signal?: AbortSignal;
  getSystemPrompt?(): string;
}

export interface PiToolResult {
  content: PiContentBlock[];
  details?: Record<string, unknown>;
  terminate?: boolean;
}

export interface PiToolDefinition {
  name: string;
  label: string;
  description: string;
  promptSnippet?: string;
  promptGuidelines?: readonly string[];
  parameters: unknown;
  execute(
    toolCallId: string,
    params: any,
    signal?: AbortSignal,
    onUpdate?: (msg: unknown) => void,
    ctx?: PiExtensionContext,
  ): Promise<PiToolResult>;
}

export interface PiCommandOptions {
  description: string;
  handler(args: string, ctx: PiExtensionContext): Promise<void>;
}

export interface PiExtensionAPI {
  on(eventName: string, handler: (event: any, ctx: PiExtensionContext) => void | Promise<void>): void;
  registerTool(definition: PiToolDefinition): void;
  registerCommand(name: string, options: PiCommandOptions): void;
  appendEntry?(customType: string, data?: unknown): void;
}

// ─── Options ─────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FiveQLNExtensionOptions {
  readonly kernel?: Kernel;
  readonly watcher?: MembraneWatcher;
  readonly codex?: Codex;
  readonly activator?: SyntaxActivator;
  readonly attestation?: Attestation;
  /** Membrane minimum confidence. Default 'medium'. */
  readonly minConfidence?: ConfidenceLevel;
  /** Audit AI message_end events automatically. Default true. */
  readonly autoAudit?: boolean;
  /** Status widget key. Default '5qln'. */
  readonly statusKey?: string;
}

// ─── Public Factory Type ─────────────────────────────────────
//
// The factory IS the Pi extension. It's a callable that takes
// the Pi ExtensionAPI, with the constitutional runtime objects
// attached as properties for tests and advanced consumers.

export interface FiveQLNExtension {
  (pi: PiExtensionAPI): void;
  readonly kernel: Kernel;
  readonly watcher: MembraneWatcher;
  readonly codex: Codex;
  readonly activator: SyntaxActivator;
  readonly attestation: Attestation;
  init(): Promise<void>;
  statusLine(): string;
  auditText(text: string): {
    clean: boolean;
    phase: Phase;
    codes: string[];
    recoveries: string[];
    summary: string;
  };
}

// ─── Factory ─────────────────────────────────────────────────

export function createPiExtension(opts: FiveQLNExtensionOptions = {}): FiveQLNExtension {
  const kernel = opts.kernel ?? new Kernel();
  const watcher = opts.watcher ?? new MembraneWatcher();
  const codex = opts.codex ?? new Codex();
  const activator = opts.activator ?? new SyntaxActivator(codex);
  const attestation = opts.attestation ?? new Attestation();
  const minConfidence: ConfidenceLevel = opts.minConfidence ?? 'medium';
  const autoAudit = opts.autoAudit !== false;
  const statusKey = opts.statusKey ?? '5qln';

  function statusLine(): string {
    const phase = kernel.getPhase().phase;
    const output = PHASE_OUTPUT[phase];
    const fs = kernel.getOutputStates()[output];
    const corruption = kernel.checkCorruption();
    const tag = corruption.length ? ` ⚠ ${corruption.join(',')}` : '';
    return `⬠ ${phase}·${PHASE_INFO[phase].name} ${output}:${fs}${tag}`;
  }

  function auditText(text: string) {
    const phase = kernel.getPhase().phase;
    const result = watcher.filterConfidence(watcher.audit(text, phase), minConfidence);
    const seen = new Set<string>();
    const codes: string[] = [];
    const recoveries: string[] = [];
    for (const flag of result.flags) {
      if (seen.has(flag.code)) continue;
      seen.add(flag.code);
      codes.push(flag.code);
      recoveries.push(codex.lookup(flag.code).recovery);
    }
    return {
      clean: result.clean,
      phase,
      codes,
      recoveries,
      summary: result.summary,
    };
  }

  async function init(): Promise<void> {
    await attestation.computeFingerprint();
    await codex.computeFingerprint();
  }

  // The factory function — what Pi calls.
  function factory(pi: PiExtensionAPI): void {
    // ── Lifecycle events ───────────────────────────────────

    pi.on('session_start', async (_event, ctx) => {
      await init();
      ctx.ui.setStatus(statusKey, statusLine());
      ctx.ui.notify(
        `5QLN runtime active. Decoder ${attestation.getFingerprint()?.slice(0, 12) ?? '—'}…`,
        'info',
      );
    });

    pi.on('turn_start', (_event, ctx) => {
      ctx.ui.setStatus(statusKey, statusLine());
    });

    pi.on('turn_end', (_event, ctx) => {
      ctx.ui.setStatus(statusKey, statusLine());
    });

    pi.on('input', (event: { text?: string; content?: string }, _ctx) => {
      const text = (event && (event.text ?? event.content)) ?? '';
      if (typeof text === 'string' && text.length > 0) {
        kernel.captureInput(text);
      }
    });

    if (autoAudit) {
      pi.on('message_end', (event: { content?: PiContentBlock[] }, ctx) => {
        const blocks = event?.content ?? [];
        const text = blocks
          .filter(b => b.type === 'text' && typeof b.text === 'string' && b.text.length > 0)
          .map(b => b.text!)
          .join('\n');
        if (!text) return;
        const result = auditText(text);
        if (!result.clean) {
          ctx.ui.notify(`Membrane: ${result.summary}`, 'warning');
          pi.appendEntry?.('5qln:audit', {
            phase: result.phase,
            codes: result.codes,
            recoveries: result.recoveries,
          });
        }
      });
    }

    // ── Tools (the AI invokes these) ───────────────────────

    pi.registerTool({
      name: 'audit_membrane',
      label: 'Audit Membrane',
      description:
        'Audit AI response text for 5QLN corruption (L¹/L²/L³/L⁴/V∅). Phase-aware.',
      promptSnippet:
        'After every response, call audit_membrane with your full response text and current phase. If corruption flags are returned, name them and apply the recovery prompt before continuing.',
      parameters: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'AI response text to audit.' },
          phase: {
            type: 'string',
            enum: ['S', 'G', 'Q', 'P', 'V'],
            description: "Current 5QLN phase. Defaults to the kernel's current phase.",
          },
        },
      },
      async execute(_id, params: { text: string; phase?: Phase }) {
        const phase = params.phase ?? kernel.getPhase().phase;
        const audit = watcher.filterConfidence(
          watcher.audit(params.text, phase),
          minConfidence,
        );
        const flags = audit.flags.map(f => ({
          code: f.code,
          name: f.name,
          confidence: f.confidence,
          recovery: codex.lookup(f.code).recovery,
        }));
        const text = audit.clean
          ? `[CLEAN] No corruption at phase ${phase}.`
          : `[FLAGGED] ${flags.length} at phase ${phase}.\n` +
            flags
              .map(f => `  • ${f.code} (${f.confidence}) — ${f.name}\n    Recover: ${f.recovery}`)
              .join('\n');
        return {
          content: [{ type: 'text', text }],
          details: { clean: audit.clean, phase, flags, summary: audit.summary },
        };
      },
    });

    pi.registerTool({
      name: 'session_flow',
      label: 'Session Flow',
      description:
        'Current 5QLN kernel state — phase, lens, formed XYZAB, watch list, active corruption, field coherence.',
      parameters: { type: 'object', properties: {} },
      async execute() {
        const active = activator.activate(
          kernel.getState(),
          kernel.getFieldCoherence(),
        );
        return {
          content: [{ type: 'text', text: activator.toPrompt(active) }],
          details: activator.toCanonical(active) as Record<string, unknown>,
        };
      },
    });

    pi.registerTool({
      name: 'watcher_status',
      label: 'Watcher Status',
      description:
        'Membrane watcher pattern count + decoder and codex fingerprints.',
      parameters: { type: 'object', properties: {} },
      async execute() {
        const patterns = watcher.getPatterns();
        return {
          content: [
            {
              type: 'text',
              text:
                `Patterns: ${patterns.length}\n` +
                `Codex fingerprint:   ${codex.getFingerprint() ?? '(uncomputed)'}\n` +
                `Decoder fingerprint: ${attestation.getFingerprint() ?? '(uncomputed)'}`,
            },
          ],
          details: {
            pattern_count: patterns.length,
            codex_fingerprint: codex.getFingerprint(),
            decoder_fingerprint: attestation.getFingerprint(),
          },
        };
      },
    });

    // ── Slash commands (the human invokes these) ──────────

    pi.registerCommand('5qln', {
      description: 'Show 5QLN runtime status — active syntax, formed outputs, corruption.',
      async handler(_args, ctx) {
        const active = activator.activate(
          kernel.getState(),
          kernel.getFieldCoherence(),
        );
        ctx.ui.notify(activator.toPrompt(active), 'info');
      },
    });

    pi.registerCommand('5qln-codex', {
      description: 'Print the 5QLN corruption codex.',
      async handler(_args, ctx) {
        ctx.ui.notify(codex.toMarkdown(), 'info');
      },
    });

    pi.registerCommand('5qln-transition', {
      description: 'Transition to a phase: S | G | Q | P | V.',
      async handler(args, ctx) {
        const phase = args.trim().toUpperCase() as Phase;
        if (!(PHASES as readonly string[]).includes(phase)) {
          ctx.ui.notify(`Invalid phase '${args}'. Use one of: S G Q P V.`, 'error');
          return;
        }
        try {
          kernel.transition(phase);
          ctx.ui.setStatus(statusKey, statusLine());
          ctx.ui.notify(`Transitioned to ${phase}.`, 'info');
        } catch (e: unknown) {
          ctx.ui.notify(`Transition failed: ${(e as Error).message}`, 'error');
        }
      },
    });

    pi.registerCommand('5qln-lens', {
      description: 'Enter a sub-phase lens (e.g. SG, QQ). Pass nothing to exit.',
      async handler(args, ctx) {
        const lens = args.trim().toUpperCase();
        if (!lens) {
          kernel.exitSubPhase();
          ctx.ui.setStatus(statusKey, statusLine());
          ctx.ui.notify('Lens exited.', 'info');
          return;
        }
        try {
          kernel.enterSubPhase(lens as SubPhase);
          ctx.ui.setStatus(statusKey, statusLine());
          ctx.ui.notify(`Lens ${lens} active.`, 'info');
        } catch (e: unknown) {
          ctx.ui.notify(`Invalid lens: ${(e as Error).message}`, 'error');
        }
      },
    });

    pi.registerCommand('5qln-validate', {
      description: 'Validate the current phase output: X | Y | Z | A | B.',
      async handler(args, ctx) {
        const sym = args.trim().toUpperCase() as OutputSymbol;
        if (!['X', 'Y', 'Z', 'A', 'B'].includes(sym)) {
          ctx.ui.notify(`Invalid symbol '${args}'. Use X Y Z A B.`, 'error');
          return;
        }
        try {
          kernel.validateOutput(sym);
          ctx.ui.setStatus(statusKey, statusLine());
          ctx.ui.notify(`${sym} VALIDATED.`, 'info');
        } catch (e: unknown) {
          ctx.ui.notify(`Validation failed: ${(e as Error).message}`, 'error');
        }
      },
    });

    pi.registerCommand('5qln-crystallize', {
      description: "Crystallize B'' at V phase. Pass the seed content as args.",
      async handler(args, ctx) {
        const content = args.trim();
        if (!content) {
          ctx.ui.notify('Crystallize requires content.', 'error');
          return;
        }
        try {
          kernel.crystallize(content);
          pi.appendEntry?.('5qln:cycle', {
            phase: 'V',
            cycle: kernel.getCycleCount(),
            Bpp: content,
            trace: kernel.getCycleTrace(),
          });
          ctx.ui.setStatus(statusKey, statusLine());
          ctx.ui.notify("B'' crystallized.", 'info');
        } catch (e: unknown) {
          ctx.ui.notify(`Crystallize failed: ${(e as Error).message}`, 'error');
        }
      },
    });

    pi.registerCommand('5qln-integrity', {
      description: 'Show integrity: corruption, coherence, fingerprints.',
      async handler(_args, ctx) {
        const integrity = {
          corruption: kernel.checkCorruption(),
          coherence: kernel.getFieldCoherence(),
          decoder_fingerprint: attestation.getFingerprint(),
          codex_fingerprint: codex.getFingerprint(),
        };
        ctx.ui.notify(JSON.stringify(integrity, null, 2), 'info');
      },
    });
  }

  // Attach runtime handles for tests and advanced consumers.
  return Object.assign(factory, {
    kernel,
    watcher,
    codex,
    activator,
    attestation,
    init,
    statusLine,
    auditText,
  }) as FiveQLNExtension;
}

// Default export — Pi imports this directly when consumer does
//   export default createPiExtension();
// from their extension entry. This file's default export is a
// pre-built extension using all defaults, for the simplest case:
//   export { default } from "@5qln/core/pi-agent";
const defaultExtension = createPiExtension();
export default defaultExtension;
