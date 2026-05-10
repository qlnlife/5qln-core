// ═══════════════════════════════════════════════════════════════
// @5qln/core — Pi Coding Agent Extension Tests
//
// Drives the extension with a fake Pi ExtensionAPI and verifies
// that registrations, lifecycle events, tool execution, and
// slash commands behave as the constitutional contract requires.
// ═══════════════════════════════════════════════════════════════

import {
  createPiExtension,
  type PiExtensionAPI,
  type PiExtensionContext,
  type PiToolDefinition,
  type PiCommandOptions,
  type PiToolResult,
  type PiUIContext,
} from '../index.js';

// ─── Fake Pi harness ─────────────────────────────────────────

interface NotifyEntry {
  message: string;
  type: 'info' | 'warning' | 'error';
}

interface FakePi {
  api: PiExtensionAPI;
  ctx: PiExtensionContext;
  ui: PiUIContext;
  events: Map<string, ((event: any, ctx: PiExtensionContext) => void | Promise<void>)[]>;
  tools: Map<string, PiToolDefinition>;
  commands: Map<string, PiCommandOptions>;
  entries: { customType: string; data: unknown }[];
  notifications: NotifyEntry[];
  status: Map<string, string | undefined>;
  fire(eventName: string, event: any): Promise<void>;
}

function makeFakePi(): FakePi {
  const events = new Map<string, ((event: any, ctx: PiExtensionContext) => void | Promise<void>)[]>();
  const tools = new Map<string, PiToolDefinition>();
  const commands = new Map<string, PiCommandOptions>();
  const entries: { customType: string; data: unknown }[] = [];
  const notifications: NotifyEntry[] = [];
  const status = new Map<string, string | undefined>();

  const ui: PiUIContext = {
    setStatus: (key, message) => { status.set(key, message); },
    notify: (message, type) => { notifications.push({ message, type }); },
  };
  const ctx: PiExtensionContext = { ui, hasUI: true, cwd: '/tmp' };

  const api: PiExtensionAPI = {
    on(eventName, handler) {
      const list = events.get(eventName) ?? [];
      list.push(handler);
      events.set(eventName, list);
    },
    registerTool(definition) { tools.set(definition.name, definition); },
    registerCommand(name, options) { commands.set(name, options); },
    appendEntry(customType, data) { entries.push({ customType, data }); },
  };

  async function fire(eventName: string, event: any): Promise<void> {
    for (const h of events.get(eventName) ?? []) {
      await h(event, ctx);
    }
  }

  return { api, ctx, ui, events, tools, commands, entries, notifications, status, fire };
}


describe('createPiExtension — registration', () => {

  test('registers the constitutional tools', () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    expect(fake.tools.has('audit_membrane')).toBe(true);
    expect(fake.tools.has('session_flow')).toBe(true);
    expect(fake.tools.has('watcher_status')).toBe(true);
    expect(fake.tools.has('self_improve')).toBe(true);
  });

  test('registers the slash commands', () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    for (const name of [
      '5qln',
      '5qln-codex',
      '5qln-transition',
      '5qln-lens',
      '5qln-validate',
      '5qln-crystallize',
      '5qln-self-improve',
      '5qln-integrity',
    ]) {
      expect(fake.commands.has(name)).toBe(true);
    }
  });

  test('subscribes to expected lifecycle events', () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    for (const ev of ['session_start', 'turn_start', 'turn_end', 'input', 'message_end']) {
      expect(fake.events.has(ev)).toBe(true);
    }
  });

  test('autoAudit:false skips message_end subscription', () => {
    const ext = createPiExtension({ autoAudit: false });
    const fake = makeFakePi();
    ext(fake.api);
    expect(fake.events.has('message_end')).toBe(false);
  });
});


describe('createPiExtension — session lifecycle', () => {

  test('session_start computes fingerprints and sets the status widget', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    expect(ext.attestation.getFingerprint()).toBeNull();
    expect(ext.codex.getFingerprint()).toBeNull();
    await fake.fire('session_start', {});
    expect(ext.attestation.getFingerprint()).not.toBeNull();
    expect(ext.codex.getFingerprint()).not.toBeNull();
    expect(fake.status.get('5qln')).toMatch(/^⬠ S·Start/);
  });

  test('input event captures into the kernel', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await fake.fire('input', { text: 'Why does clarity feel elusive?' });
    expect(ext.kernel.getCycleTrace().X).toBe('Why does clarity feel elusive?');
  });

  test('message_end with clean text does not notify', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await fake.fire('input', { text: 'a question' });
    await fake.fire('message_end', {
      content: [{ type: 'text', text: 'A neutral statement of fact.' }],
    });
    const warnings = fake.notifications.filter(n => n.type === 'warning');
    expect(warnings).toEqual([]);
  });

  test('message_end with corrupt text notifies and persists an audit entry', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await fake.fire('input', { text: 'a question' });
    await fake.fire('message_end', {
      content: [{ type: 'text', text: 'I feel that the universe is telling you to act.' }],
    });
    const warnings = fake.notifications.filter(n => n.type === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toMatch(/Membrane/);
    const auditEntries = fake.entries.filter(e => e.customType === '5qln:audit');
    expect(auditEntries.length).toBe(1);
  });

  test('turn_start and turn_end refresh the status widget', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await fake.fire('turn_start', {});
    const a = fake.status.get('5qln');
    expect(a).toBeDefined();
    await fake.fire('input', { text: 'q' });
    await fake.fire('turn_end', {});
    const b = fake.status.get('5qln');
    expect(b).toBeDefined();
    expect(b).toBe(ext.statusLine());
  });
});


describe('createPiExtension — tool execution', () => {

  test('audit_membrane on clean text returns CLEAN', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const tool = fake.tools.get('audit_membrane')!;
    const result: PiToolResult = await tool.execute('id', {
      text: 'A neutral observation of the codebase.',
      phase: 'S',
    });
    expect(result.content[0].text).toMatch(/CLEAN/);
    expect((result.details as { clean: boolean }).clean).toBe(true);
  });

  test('audit_membrane on corrupt text returns FLAGGED with recovery from Codex', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const tool = fake.tools.get('audit_membrane')!;
    const result: PiToolResult = await tool.execute('id', {
      text: 'I feel that the universe is showing me what to do.',
      phase: 'Q',
    });
    expect(result.content[0].text).toMatch(/FLAGGED/);
    const flags = (result.details as { flags: { recovery: string }[] }).flags;
    expect(flags.length).toBeGreaterThan(0);
    for (const f of flags) {
      expect(typeof f.recovery).toBe('string');
      expect(f.recovery.length).toBeGreaterThan(0);
    }
  });

  test('audit_membrane defaults to the kernel phase when none is given', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    ext.kernel.transition('V');
    const tool = fake.tools.get('audit_membrane')!;
    const result = await tool.execute('id', { text: "and that's it, we're done here." });
    expect((result.details as { phase: string }).phase).toBe('V');
  });

  test('session_flow tool returns the active syntax prompt + canonical details', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('My genuine question.');
    const tool = fake.tools.get('session_flow')!;
    const result = await tool.execute('id', {});
    expect(result.content[0].text).toMatch(/Phase S/);
    expect(result.content[0].text).toMatch(/FORMATION/);
    expect((result.details as { phase: string }).phase).toBe('S');
  });

  test('watcher_status reports pattern count and fingerprints', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await ext.init();
    const tool = fake.tools.get('watcher_status')!;
    const result = await tool.execute('id', {});
    const details = result.details as { pattern_count: number; codex_fingerprint: string };
    expect(details.pattern_count).toBeGreaterThan(0);
    expect(details.codex_fingerprint.length).toBe(64);
  });
});


describe('createPiExtension — slash commands', () => {

  test('/5qln-transition advances the kernel phase', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    const cmd = fake.commands.get('5qln-transition')!;
    await cmd.handler('G', fake.ctx);
    expect(ext.kernel.getPhase().phase).toBe('G');
    expect(fake.status.get('5qln')).toMatch(/^⬠ G·Growth/);
  });

  test('/5qln-transition rejects an invalid phase', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const cmd = fake.commands.get('5qln-transition')!;
    await cmd.handler('Z', fake.ctx);
    const errors = fake.notifications.filter(n => n.type === 'error');
    expect(errors.length).toBe(1);
  });

  test('/5qln-lens enters and exits a sub-phase', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    const cmd = fake.commands.get('5qln-lens')!;
    await cmd.handler('SG', fake.ctx);
    expect(ext.kernel.getPhase().subPhase).toBe('SG');
    await cmd.handler('', fake.ctx);
    expect(ext.kernel.getPhase().subPhase).toBeNull();
  });

  test('/5qln-validate validates a formed output', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    const cmd = fake.commands.get('5qln-validate')!;
    await cmd.handler('X', fake.ctx);
    expect(ext.kernel.getOutputStates().X).toBe('VALIDATED');
  });

  test('/5qln-crystallize at V appends a 5qln:cycle entry', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    ext.kernel.transition('V');
    ext.kernel.captureInput('benefit');
    const cmd = fake.commands.get('5qln-crystallize')!;
    await cmd.handler('the seed content', fake.ctx);
    expect(ext.kernel.getCycleTrace().Bpp).toBe('the seed content');
    const cycleEntries = fake.entries.filter(e => e.customType === '5qln:cycle');
    expect(cycleEntries.length).toBe(1);
  });

  test('/5qln-codex prints the codex markdown', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const cmd = fake.commands.get('5qln-codex')!;
    await cmd.handler('', fake.ctx);
    const last = fake.notifications.at(-1)!;
    expect(last.message).toMatch(/Corruption Codex/);
    expect(last.message).toMatch(/L¹/);
  });

  test('/5qln-integrity reports corruption, coherence, fingerprints', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    await ext.init();
    const cmd = fake.commands.get('5qln-integrity')!;
    await cmd.handler('', fake.ctx);
    const last = fake.notifications.at(-1)!;
    const parsed = JSON.parse(last.message);
    expect(parsed).toHaveProperty('corruption');
    expect(parsed).toHaveProperty('coherence');
    expect(parsed.codex_fingerprint).toBeTruthy();
    expect(parsed.decoder_fingerprint).toBeTruthy();
  });
});


describe('createPiExtension — self-improve', () => {

  test('self_improve tool runs a cycle and persists a 5qln:self-improve entry', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const tool = fake.tools.get('self_improve')!;
    const result = await tool.execute('id', {});
    expect(result.content[0].text).toMatch(/Self-Improve — cycle 1/);
    const details = result.details as { cycle: number; hash: string; health: number };
    expect(details.cycle).toBe(1);
    expect(details.hash.length).toBe(64);
    expect(details.health).toBeGreaterThanOrEqual(0);
    const persisted = fake.entries.filter(e => e.customType === '5qln:self-improve');
    expect(persisted.length).toBe(1);
  });

  test('subsequent self_improve runs chain via parent_hash', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const tool = fake.tools.get('self_improve')!;
    const r1 = await tool.execute('id', {});
    const r2 = await tool.execute('id', {});
    const d1 = r1.details as { cycle: number; hash: string };
    const d2 = r2.details as { cycle: number; hash: string; parent_hash: string };
    expect(d2.cycle).toBe(d1.cycle + 1);
    expect(d2.parent_hash).toBe(d1.hash);
  });

  test('/5qln-self-improve runs and notifies, info on green corpus', async () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    const cmd = fake.commands.get('5qln-self-improve')!;
    await cmd.handler('', fake.ctx);
    const last = fake.notifications.at(-1)!;
    expect(last.message).toMatch(/Self-Improve/);
    expect(last.type).toBe('info');
    expect(ext.lastSnapshot()).not.toBeNull();
  });
});


describe('createPiExtension — runtime handles', () => {

  test('attached handles are the same instances used by the factory', () => {
    const ext = createPiExtension();
    const fake = makeFakePi();
    ext(fake.api);
    ext.kernel.captureInput('q');
    expect(ext.kernel.getCycleTrace().X).toBe('q');
  });

  test('options.minConfidence is honored by auditText', () => {
    const ext = createPiExtension({ minConfidence: 'high' });
    const result = ext.auditText('let me reframe that');
    // 'let me reframe that' is medium confidence; with minConfidence='high'
    // it should not flag.
    expect(result.clean).toBe(true);
  });
});
