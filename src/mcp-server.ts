// ═══════════════════════════════════════════════════════════════
// @5qln/core — MCP Server (stdio, dependency-free)
//
// Hand-rolled JSON-RPC 2.0 stdio MCP server. No external SDK.
// Exposes the 5QLN constitutional runtime as MCP tools so any
// MCP-speaking host (Zo Computer, Hermes, Claude Desktop) can
// reach Codex, SyntaxActivator, SelfImprove on top of the
// original audit_membrane / session_flow / watcher_status set.
//
// Wire: newline-delimited JSON-RPC. One message per line.
// Tested through processRequest() — the stdio loop is a thin
// adapter around it.
// ═══════════════════════════════════════════════════════════════

import { createInterface } from 'readline';
import {
  Kernel,
  Codex,
  MembraneWatcher,
  SyntaxActivator,
  Attestation,
  SelfImprove,
  type SelfImproveSnapshot,
  PHASES,
  type Phase,
  type SubPhase,
  type OutputSymbol,
} from './index.js';

export const MCP_SERVER_NAME = '@5qln/core-mcp';
export const MCP_SERVER_VERSION = '0.1.0';
export const MCP_PROTOCOL_VERSION = '2024-11-05';

// ─── Wire types ──────────────────────────────────────────────

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ─── Tool catalogue ──────────────────────────────────────────

const TOOLS = [
  {
    name: 'audit_membrane',
    description:
      'Audit AI response text for 5QLN corruption (L¹/L²/L³/L⁴/V∅). Phase-aware. Returns flags with recovery prompts.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'AI response text to audit.' },
        phase: {
          type: 'string',
          enum: ['S', 'G', 'Q', 'P', 'V'],
          description: 'Current 5QLN phase. Defaults to current kernel phase.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'session_flow',
    description:
      'Current 5QLN kernel state — phase, lens, formed XYZAB, watch list, active corruption, field coherence.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'watcher_status',
    description:
      'Membrane watcher pattern count + decoder and codex fingerprints.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'codex',
    description:
      'The 5QLN corruption codex — names, meanings, recoveries, examples for the five constitutional codes.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'self_improve',
    description:
      'Run one self-improve cycle: replay the canonical sample corpus through the membrane, return health, degraded, spurious, hash chained to the prior snapshot.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'kernel_input',
    description:
      'Capture human input into the kernel. Forms or refines the current phase output.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'kernel_transition',
    description: 'Transition the kernel to phase S, G, Q, P, or V.',
    inputSchema: {
      type: 'object',
      properties: {
        phase: { type: 'string', enum: ['S', 'G', 'Q', 'P', 'V'] },
      },
      required: ['phase'],
    },
  },
  {
    name: 'kernel_lens',
    description:
      'Enter a sub-phase lens (e.g. "SG", "QQ"). Pass empty string to exit the current lens.',
    inputSchema: {
      type: 'object',
      properties: { lens: { type: 'string' } },
      required: ['lens'],
    },
  },
  {
    name: 'kernel_validate',
    description: 'Validate a formed output: X | Y | Z | A | B.',
    inputSchema: {
      type: 'object',
      properties: { symbol: { type: 'string', enum: ['X', 'Y', 'Z', 'A', 'B'] } },
      required: ['symbol'],
    },
  },
  {
    name: 'kernel_crystallize',
    description: "Crystallize B'' at V phase. Pass the seed content.",
    inputSchema: {
      type: 'object',
      properties: { content: { type: 'string' } },
      required: ['content'],
    },
  },
] as const;

// ─── Server state ────────────────────────────────────────────

export interface McpServerState {
  kernel: Kernel;
  codex: Codex;
  watcher: MembraneWatcher;
  activator: SyntaxActivator;
  attestation: Attestation;
  selfImprove: SelfImprove;
  lastSnapshot: SelfImproveSnapshot | null;
  initialized: boolean;
}

export function createServerState(): McpServerState {
  const codex = new Codex();
  const watcher = new MembraneWatcher();
  const attestation = new Attestation();
  return {
    kernel: new Kernel(),
    codex,
    watcher,
    activator: new SyntaxActivator(codex),
    attestation,
    selfImprove: new SelfImprove({ watcher, codex, attestation }),
    lastSnapshot: null,
    initialized: false,
  };
}

// ─── Tool dispatch ───────────────────────────────────────────

interface ToolText {
  type: 'text';
  text: string;
}

interface ToolCallResult {
  content: ToolText[];
  isError?: boolean;
}

async function callTool(
  state: McpServerState,
  name: string,
  args: Record<string, unknown>,
): Promise<ToolCallResult> {
  switch (name) {
    case 'audit_membrane': {
      const text = String(args.text ?? '');
      const phase = (args.phase as Phase) ?? state.kernel.getPhase().phase;
      const audit = state.watcher.audit(text, phase);
      const flags = audit.flags.map(f => ({
        code: f.code,
        name: f.name,
        confidence: f.confidence,
        recovery: state.codex.lookup(f.code).recovery,
      }));
      const body = audit.clean
        ? `[CLEAN] No corruption at phase ${phase}.`
        : `[FLAGGED] ${flags.length} at phase ${phase}.\n` +
          flags
            .map(
              f =>
                `  • ${f.code} (${f.confidence}) — ${f.name}\n    Recover: ${f.recovery}`,
            )
            .join('\n');
      return {
        content: [{ type: 'text', text: body }],
      };
    }

    case 'session_flow': {
      const active = state.activator.activate(
        state.kernel.getState(),
        state.kernel.getFieldCoherence(),
      );
      return {
        content: [{ type: 'text', text: state.activator.toPrompt(active) }],
      };
    }

    case 'watcher_status': {
      if (state.attestation.getFingerprint() === null) {
        await state.attestation.computeFingerprint();
      }
      if (state.codex.getFingerprint() === null) {
        await state.codex.computeFingerprint();
      }
      const patterns = state.watcher.getPatterns();
      return {
        content: [
          {
            type: 'text',
            text:
              `Patterns: ${patterns.length}\n` +
              `Codex fingerprint:   ${state.codex.getFingerprint()}\n` +
              `Decoder fingerprint: ${state.attestation.getFingerprint()}`,
          },
        ],
      };
    }

    case 'codex': {
      return {
        content: [{ type: 'text', text: state.codex.toMarkdown() }],
      };
    }

    case 'self_improve': {
      const snap = await state.selfImprove.run(state.lastSnapshot ?? undefined);
      const md = state.selfImprove.toMarkdown(
        snap,
        state.lastSnapshot ?? undefined,
      );
      state.lastSnapshot = snap;
      return { content: [{ type: 'text', text: md }] };
    }

    case 'kernel_input': {
      state.kernel.captureInput(String(args.text ?? ''));
      const { phase, subPhase } = state.kernel.getPhase();
      return {
        content: [
          {
            type: 'text',
            text: `Captured at ${phase}${subPhase ? `·${subPhase}` : ''}.`,
          },
        ],
      };
    }

    case 'kernel_transition': {
      const phase = String(args.phase) as Phase;
      if (!(PHASES as readonly string[]).includes(phase)) {
        return errorResult(`Invalid phase '${phase}'. Use one of: S G Q P V.`);
      }
      state.kernel.transition(phase);
      return {
        content: [{ type: 'text', text: `Transitioned to ${phase}.` }],
      };
    }

    case 'kernel_lens': {
      const lens = String(args.lens ?? '').trim().toUpperCase();
      if (!lens) {
        state.kernel.exitSubPhase();
        return { content: [{ type: 'text', text: 'Lens exited.' }] };
      }
      try {
        state.kernel.enterSubPhase(lens as SubPhase);
        return { content: [{ type: 'text', text: `Lens ${lens} active.` }] };
      } catch (e) {
        return errorResult(`Invalid lens: ${(e as Error).message}`);
      }
    }

    case 'kernel_validate': {
      const symbol = String(args.symbol) as OutputSymbol;
      if (!['X', 'Y', 'Z', 'A', 'B'].includes(symbol)) {
        return errorResult(`Invalid symbol '${symbol}'. Use X Y Z A B.`);
      }
      try {
        state.kernel.validateOutput(symbol);
        return { content: [{ type: 'text', text: `${symbol} VALIDATED.` }] };
      } catch (e) {
        return errorResult(`Validation failed: ${(e as Error).message}`);
      }
    }

    case 'kernel_crystallize': {
      const content = String(args.content ?? '').trim();
      if (!content) return errorResult('Crystallize requires content.');
      try {
        state.kernel.crystallize(content);
        return {
          content: [{ type: 'text', text: "B'' crystallized." }],
        };
      } catch (e) {
        return errorResult(`Crystallize failed: ${(e as Error).message}`);
      }
    }

    default:
      return errorResult(`Unknown tool: ${name}`);
  }
}

function errorResult(msg: string): ToolCallResult {
  return {
    content: [{ type: 'text', text: msg }],
    isError: true,
  };
}

// ─── JSON-RPC dispatch ───────────────────────────────────────

export async function processRequest(
  state: McpServerState,
  req: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  const id = req.id ?? null;

  // Notifications (no id) get no response.
  const isNotification = id === null || id === undefined;

  try {
    switch (req.method) {
      case 'initialize': {
        state.initialized = true;
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: MCP_PROTOCOL_VERSION,
            serverInfo: { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
            capabilities: { tools: { listChanged: false } },
          },
        };
      }

      case 'notifications/initialized':
      case 'initialized':
        return null;

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };

      case 'tools/call': {
        const params = (req.params ?? {}) as {
          name?: string;
          arguments?: Record<string, unknown>;
        };
        const name = String(params.name ?? '');
        const args = params.arguments ?? {};
        const result = await callTool(state, name, args);
        return { jsonrpc: '2.0', id, result };
      }

      case 'shutdown':
        return { jsonrpc: '2.0', id, result: null };

      default:
        if (isNotification) return null;
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${req.method}` },
        };
    }
  } catch (e) {
    if (isNotification) return null;
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: (e as Error).message },
    };
  }
}

// ─── Stdio loop ──────────────────────────────────────────────

export function startStdioServer(state: McpServerState = createServerState()): void {
  const rl = createInterface({ input: process.stdin });

  // Serialize message processing — readline can fire 'line' events for many
  // queued messages before the prior async handler completes, which would
  // let a later request (like shutdown) win the race.
  let queue: Promise<void> = Promise.resolve();
  let shutdownRequested = false;

  rl.on('line', (line: string) => {
    queue = queue.then(async () => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let req: JsonRpcRequest;
      try {
        req = JSON.parse(trimmed);
      } catch {
        return;
      }
      const response = await processRequest(state, req);
      if (response !== null) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
      if (req.method === 'shutdown') {
        shutdownRequested = true;
      }
    });
  });

  rl.on('close', () => {
    queue.finally(() => process.exit(0));
  });

  // Allow shutdown method to actually shut down once the queue drains.
  const tick = setInterval(() => {
    if (shutdownRequested) {
      clearInterval(tick);
      queue.finally(() => process.exit(0));
    }
  }, 25);

  process.stderr.write(
    `[5qln-mcp] ${MCP_SERVER_NAME} v${MCP_SERVER_VERSION} listening on stdio\n`,
  );
}

// Run when invoked directly: `node dist/mcp-server.js`.
// (Detect via import.meta.url match to argv[1].)
const isMain = (() => {
  try {
    const url = new URL(import.meta.url);
    return url.pathname.endsWith(process.argv[1] ?? '');
  } catch {
    return false;
  }
})();

if (isMain) {
  startStdioServer();
}
