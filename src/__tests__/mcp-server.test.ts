// ═══════════════════════════════════════════════════════════════
// @5qln/core — MCP Server Tests
//
// Drives processRequest() with synthetic JSON-RPC frames to verify
// the wire contract: handshake, tools/list, tools/call paths,
// notifications, and error codes. No subprocess spawned.
// ═══════════════════════════════════════════════════════════════

import {
  createServerState,
  processRequest,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  MCP_PROTOCOL_VERSION,
  type JsonRpcRequest,
  type JsonRpcResponse,
} from '../index.js';

async function call(
  state: ReturnType<typeof createServerState>,
  req: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  return processRequest(state, req);
}


describe('MCP server — handshake', () => {

  test('initialize returns protocol + serverInfo + tools capability', async () => {
    const state = createServerState();
    const res = await call(state, { jsonrpc: '2.0', id: 1, method: 'initialize' });
    expect(res).not.toBeNull();
    expect(res!.id).toBe(1);
    const r = res!.result as {
      protocolVersion: string;
      serverInfo: { name: string; version: string };
      capabilities: { tools: object };
    };
    expect(r.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect(r.serverInfo.name).toBe(MCP_SERVER_NAME);
    expect(r.serverInfo.version).toBe(MCP_SERVER_VERSION);
    expect(r.capabilities.tools).toBeDefined();
    expect(state.initialized).toBe(true);
  });

  test('notifications/initialized produces no response', async () => {
    const state = createServerState();
    const res = await call(state, {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });
    expect(res).toBeNull();
  });

  test('ping returns an empty result', async () => {
    const state = createServerState();
    const res = await call(state, { jsonrpc: '2.0', id: 'p', method: 'ping' });
    expect(res!.id).toBe('p');
    expect(res!.result).toEqual({});
  });

  test('unknown method returns -32601', async () => {
    const state = createServerState();
    const res = await call(state, { jsonrpc: '2.0', id: 7, method: 'nope' });
    expect(res!.error?.code).toBe(-32601);
  });
});


describe('MCP server — tools/list', () => {

  test('lists the constitutional toolset', async () => {
    const state = createServerState();
    const res = await call(state, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const tools = (res!.result as { tools: { name: string }[] }).tools;
    const names = tools.map(t => t.name);
    expect(names).toEqual(expect.arrayContaining([
      'audit_membrane',
      'session_flow',
      'watcher_status',
      'codex',
      'self_improve',
      'kernel_input',
      'kernel_transition',
      'kernel_lens',
      'kernel_validate',
      'kernel_crystallize',
    ]));
  });

  test('every tool has a JSON-Schema input shape', async () => {
    const state = createServerState();
    const res = await call(state, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const tools = (res!.result as { tools: { name: string; inputSchema: { type: string } }[] }).tools;
    for (const t of tools) {
      expect(t.inputSchema.type).toBe('object');
    }
  });
});


describe('MCP server — tools/call', () => {

  async function callTool(state: ReturnType<typeof createServerState>, name: string, args: Record<string, unknown>) {
    const res = await call(state, {
      jsonrpc: '2.0',
      id: 'call',
      method: 'tools/call',
      params: { name, arguments: args },
    });
    return res!.result as { content: { type: string; text: string }[]; isError?: boolean };
  }

  test('audit_membrane on clean text returns CLEAN', async () => {
    const state = createServerState();
    const r = await callTool(state, 'audit_membrane', {
      text: 'A neutral observation.',
      phase: 'S',
    });
    expect(r.content[0].text).toMatch(/CLEAN/);
  });

  test('audit_membrane on corrupt text returns FLAGGED with recovery', async () => {
    const state = createServerState();
    const r = await callTool(state, 'audit_membrane', {
      text: 'I feel that the energy is shifting in our conversation.',
      phase: 'Q',
    });
    expect(r.content[0].text).toMatch(/FLAGGED/);
    expect(r.content[0].text).toMatch(/Recover:/);
  });

  test('codex returns the markdown table', async () => {
    const state = createServerState();
    const r = await callTool(state, 'codex', {});
    expect(r.content[0].text).toMatch(/Corruption Codex/);
    expect(r.content[0].text).toContain('L¹');
  });

  test('self_improve runs cycle 1 and returns markdown with hash', async () => {
    const state = createServerState();
    const r = await callTool(state, 'self_improve', {});
    expect(r.content[0].text).toMatch(/Self-Improve — cycle 1/);
    expect(state.lastSnapshot).not.toBeNull();
    expect(state.lastSnapshot!.hash.length).toBe(64);
  });

  test('kernel_input + kernel_transition mutate the kernel', async () => {
    const state = createServerState();
    await callTool(state, 'kernel_input', { text: 'a question' });
    expect(state.kernel.getCycleTrace().X).toBe('a question');
    await callTool(state, 'kernel_transition', { phase: 'G' });
    expect(state.kernel.getPhase().phase).toBe('G');
  });

  test('kernel_transition with bogus phase returns isError', async () => {
    const state = createServerState();
    const r = await callTool(state, 'kernel_transition', { phase: 'Z' });
    expect(r.isError).toBe(true);
  });

  test('session_flow returns a phase-aware prompt', async () => {
    const state = createServerState();
    await callTool(state, 'kernel_input', { text: 'a question' });
    const r = await callTool(state, 'session_flow', {});
    expect(r.content[0].text).toMatch(/Phase S/);
  });

  test('watcher_status reports patterns and fingerprints', async () => {
    const state = createServerState();
    const r = await callTool(state, 'watcher_status', {});
    expect(r.content[0].text).toMatch(/Patterns: \d+/);
    expect(r.content[0].text).toMatch(/Codex fingerprint:/);
    expect(r.content[0].text).toMatch(/Decoder fingerprint:/);
  });
});
