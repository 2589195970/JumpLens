import type { OrcaWorkerApi, PanelRequestContext } from 'orca/worker';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { activeWorkspace, CLI, documentContext, inside, sourceFiles, matchDocument } from './project';
import { ensureRuntime, run, type Runtime } from './runtime';
import { LanguageServer } from './language-server';
import { WebLanguageServer } from './web-language-server';
import type { NavigationServer } from './navigation-server';
import { languageForPath } from './languages';
import { NavigationHistory } from './history';
import { searchTargets, sourcePreview, uniqueTargets } from './candidates';
import { describeTarget, describeVirtualTarget } from './target-source';
import { errorMessage, type DocumentContext, type LocationSnapshot, type NavigationKind, type Range, type Settings, type Target, type Workspace } from './types';

type Session = { context: DocumentContext; text: string; lastUsed: number };
type ServerEntry = { server: NavigationServer; lastUsed: number };
let cleanup: (() => void) | undefined;

function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('请求参数无效');
  return input as Record<string, unknown>;
}
function source(input: unknown): string {
  if (typeof input !== 'string' || input.length > 2 * 1024 * 1024) throw new Error('文件过大或内容无效');
  return input;
}

export default function activate(orca: OrcaWorkerApi): void {
  const sessions = new Map<string, Session>();
  const servers = new Map<string, ServerEntry>();
  const pending = new Map<string, LocationSnapshot & { navigationId: number }>();
  let navigationId = 0;
  const permitted = new Map<string, Set<string>>();
  const histories = new Map<string, NavigationHistory>();
  const attachVersions = new Map<string, number>();
  const sourceChoices = new Map<string, { workspace: Workspace; candidates: string[] }>();
  let runtime: Promise<Runtime> | undefined;

  const serverKey = (context: DocumentContext) => `${languageForPath(context.path) === 'java' ? 'java' : 'web'}:${context.root}`;
  async function serverFor(session: Session): Promise<NavigationServer> {
    const root = session.context.root;
    const key = serverKey(session.context);
    const serverProgress = (message: string) => {
      for (const [panel, current] of sessions) if (serverKey(current.context) === key) orca.panels.post('progress', { message }, { panel });
    };
    const old = servers.get(key);
    if (old?.server.healthy) { old.lastUsed = Date.now(); return old.server; }
    const java = languageForPath(session.context.path) === 'java';
    let resolved: Runtime | undefined;
    if (java) {
      if (!runtime) runtime = orca.settings.get().then((settings) => ensureRuntime(settings as Settings, serverProgress)).catch((error) => { runtime = undefined; throw error; });
      resolved = await runtime;
    }
    // Another editor can finish preparing the same server while this one awaits the runtime.
    const current = servers.get(key);
    if (current?.server.healthy) { current.lastUsed = Date.now(); return current.server; }
    if (servers.size >= 3) {
      const oldest = [...servers].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
      if (oldest) { oldest[1].server.dispose(); servers.delete(oldest[0]); }
    }
    const server = java ? new LanguageServer(root, resolved!, serverProgress, (message) => orca.log(message)) : new WebLanguageServer(root, serverProgress, (message) => orca.log(message));
    servers.set(key, { server, lastUsed: Date.now() });
    return server;
  }

  function sessionFor(context: PanelRequestContext): Session {
    const session = sessions.get(context.panel.id);
    if (!session) throw new Error('请先识别当前文件，或点击重新连接');
    session.lastUsed = Date.now();
    return session;
  }

  function historyFor(session: Session): NavigationHistory {
    const key = session.context.workspace.selector;
    if (!histories.has(key)) histories.set(key, new NavigationHistory());
    return histories.get(key)!;
  }

  function originOf(session: Session, range: unknown, viewport?: unknown): LocationSnapshot {
    const value = object(range);
    for (const side of ['start', 'end']) {
      const point = object(value[side]);
      if (!Number.isInteger(point.line) || !Number.isInteger(point.character) || Number(point.line) < 0 || Number(point.character) < 0) throw new Error('导航位置无效');
    }
    let scroll: { top: number; left: number } | undefined;
    if (viewport && typeof viewport === 'object') {
      const point = viewport as Record<string, unknown>;
      if (typeof point.top === 'number' && typeof point.left === 'number' && Number.isFinite(point.top) && Number.isFinite(point.left)) scroll = { top: Math.max(0, point.top), left: Math.max(0, point.left) };
    }
    return { uri: session.context.uri, range: value as unknown as Range, label: path.basename(session.context.path), ...(scroll ? { viewport: scroll } : {}) };
  }

  async function openFile(session: Session, target: LocationSnapshot): Promise<void> {
    const file = await realpath(fileURLToPath(target.uri));
    if (!inside(session.context.workspace.root, file)) throw new Error('目标文件不在当前工作区');
    const destination = { ...target, navigationId: ++navigationId };
    pending.set(target.uri, destination);
    while (pending.size > 100) pending.delete(pending.keys().next().value!);
    await run(CLI, ['file', 'open', file, '--line', String(target.range.start.line + 1), '--column', String(target.range.start.character + 1), '--worktree', session.context.workspace.selector, '--focus', '--json'], { timeout: 12_000 });
    for (const [panel, other] of sessions) {
      if (other.context.uri === target.uri) orca.panels.post('reveal', { uri: target.uri, range: target.range, navigationId: destination.navigationId, ...(target.viewport ? { viewport: target.viewport } : {}) }, { panel });
    }
  }

  orca.panels.handle('attach', async (input, caller) => {
    const data = object(input);
    const text = source(data.text);
    const attachVersion = (attachVersions.get(caller.panel.id) ?? 0) + 1;
    attachVersions.set(caller.panel.id, attachVersion);
    orca.panels.post('progress', { message: '正在识别当前文件…' }, { panel: caller.panel.id });
    const workspace = await activeWorkspace();
    const candidates = await matchDocument(workspace.root, text);
    if (attachVersions.get(caller.panel.id) !== attachVersion) throw new Error('文件已切换，已取消过期的文件识别');
    sourceChoices.set(caller.panel.id, { workspace, candidates });
    const chosen = typeof data.path === 'string' ? data.path : candidates.length === 1 ? candidates[0] : undefined;
    if (!chosen) {
      if (!candidates.length) throw new Error('当前工作区未找到对应源码文件，请保存文件后重新连接');
      return { candidates: candidates.map((file) => ({ path: file, label: path.relative(workspace.root, file) })) };
    }
    if (!candidates.includes(chosen)) throw new Error('文件匹配已变化，请重新选择');
    const context = await documentContext(chosen, workspace);
    if (attachVersions.get(caller.panel.id) !== attachVersion) throw new Error('文件已切换，已取消过期的文件识别');
    const previous = sessions.get(caller.panel.id);
    const session = { context, text, lastUsed: Date.now() };
    sessions.set(caller.panel.id, session);
    orca.log(`Java 文件绑定：${context.path}`);
    if (previous && previous.context.uri !== context.uri && ![...sessions.values()].some((other) => other.context.uri === previous.context.uri)) {
      void servers.get(serverKey(previous.context))?.server.close(previous.context.uri).catch((error) => orca.log(errorMessage(error)));
    }
    permitted.set(caller.panel.id, new Set([context.uri]));
    const location = pending.get(context.uri);
    const selection = location?.range ?? null;
    if (location) orca.log(`Java 目标位置：${context.path}:${location.range.start.line + 1}${location.viewport ? '（恢复滚动位置）' : ''}`);
    void serverFor(session).then((server) => server.sync(context.uri, text)).catch((error) => { if (sessions.get(caller.panel.id) === session) orca.panels.post('progress', { message: errorMessage(error) }, { panel: caller.panel.id }); });
    return { uri: context.uri, path: context.path, root: context.root, selection, viewport: location?.viewport ?? null, navigationId: location?.navigationId ?? null };
  });

  orca.panels.handle('reveal-done', (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const destination = pending.get(session.context.uri);
    if (data.uri === session.context.uri && destination && destination.navigationId === data.navigationId) {
      pending.delete(session.context.uri);
      orca.log(`Java 已定位：${session.context.path}:${destination.range.start.line + 1}`);
    }
    return { ok: true };
  });

  async function targetText(session: Session, target: Target, signal?: AbortSignal): Promise<string> {
    const buffer = [...sessions.values()].find((other) => other.context.uri === target.uri);
    if (buffer) return buffer.text;
    if (target.uri.startsWith('file:')) return readFile(fileURLToPath(target.uri), 'utf8');
    if (target.uri.startsWith('jdt:')) return (await serverFor(session)).virtualText(target.uri, signal);
    throw new Error('目标文档类型不受支持');
  }

  orca.panels.handle('preview-source', async (input, caller) => {
    const selected = object(input).path;
    const choices = sourceChoices.get(caller.panel.id);
    if (typeof selected !== 'string' || !choices?.candidates.includes(selected)) throw new Error('当前文件候选已变化，请重新选择');
    return sourcePreview(await readFile(selected, 'utf8'), { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }, path.relative(choices.workspace.root, selected));
  });

  orca.panels.handle('preview', async (input, caller) => {
    const target = object(input) as unknown as Target;
    const session = sessionFor(caller);
    if (!permitted.get(caller.panel.id)?.has(target.uri)) throw new Error('预览目标已过期，请重新查询');
    return sourcePreview(await targetText(session, target, caller.signal), target.range, target.label);
  });

  orca.panels.handle('files', async (input, caller) => {
    const session = sessionFor(caller);
    const query = object(input).query;
    if (typeof query !== 'string' || query.length > 300) throw new Error('文件搜索条件无效');
    const files = await sourceFiles(session.context.workspace.root);
    const range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
    const targets = searchTargets(files.map((file) => ({ uri: pathToFileURL(file).href, label: path.relative(session.context.workspace.root, file), symbol: path.basename(file), range })), query);
    const shown = targets.slice(0, 100);
    const allowed = permitted.get(caller.panel.id)!;
    for (const target of shown) allowed.add(target.uri);
    return { targets: shown, total: targets.length };
  });

  orca.panels.handle('sync', async (input, caller) => {
    const session = sessionFor(caller);
    session.text = source(object(input).text);
    await (await serverFor(session)).sync(session.context.uri, session.text);
    return { ok: true };
  });

  orca.panels.handle('navigate', async (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const text = source(data.text);
    const position = object(data.position);
    const kind = data.kind as NavigationKind;
    if (!['definition', 'implementation', 'references', 'typeDefinition'].includes(kind) || !Number.isInteger(position.line) || !Number.isInteger(position.character) || Number(position.line) < 0 || Number(position.character) < 0) throw new Error('跳转位置无效');
    session.text = text;
    const server = await serverFor(session);
    const point = { line: Number(position.line), character: Number(position.character) };
    let effectiveKind = kind;
    let targets = uniqueTargets(await server.navigate(session.context.uri, text, point, kind, caller.signal));
    const only = targets.length === 1 ? targets[0] : undefined;
    if (kind === 'definition' && only?.uri === session.context.uri &&
        (point.line > only.range.start.line || point.line === only.range.start.line && point.character >= only.range.start.character) &&
        (point.line < only.range.end.line || point.line === only.range.end.line && point.character < only.range.end.character)) {
      effectiveKind = 'references';
      targets = uniqueTargets(await server.navigate(session.context.uri, text, point, 'references', caller.signal));
    }
    if (sessions.get(caller.panel.id) !== session) throw new Error('文件已切换，已取消过期的导航查询');
    orca.log(`Java ${kind}：${session.context.path}:${Number(position.line) + 1}:${Number(position.character) + 1} -> ${targets.length} 个结果`);
    const allowed = permitted.get(caller.panel.id)!;
    const texts = new Map<string, string>();
    for (let index = 0; index < targets.length; index++) {
      const target = targets[index];
      allowed.add(target.uri);
      if (target.uri.startsWith('file:')) {
        if (!texts.has(target.uri)) texts.set(target.uri, await targetText(session, target, caller.signal).catch(() => ''));
        targets[index] = describeTarget(target, texts.get(target.uri)!, session.context.workspace.root);
      } else targets[index] = describeVirtualTarget(target);
    }
    return { targets, kind: effectiveKind };
  });

  orca.panels.handle('open', async (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const target = data as unknown as Target;
    if (typeof target.uri !== 'string' || !permitted.get(caller.panel.id)?.has(target.uri)) throw new Error('目标不属于本次导航查询结果');
    const range = object(target.range);
    const start = object(range.start);
    if (!Number.isInteger(start.line) || !Number.isInteger(start.character) || Number(start.line) < 0 || Number(start.character) < 0) throw new Error('目标位置无效');
    if (target.uri.startsWith('jdt:')) {
      const text = await (await serverFor(session)).virtualText(target.uri, caller.signal);
      return { virtual: true, text, uri: target.uri, range: target.range, label: target.label };
    }
    if (!target.uri.startsWith('file:')) throw new Error('当前目标文档类型不受支持');
    const file = await realpath(fileURLToPath(target.uri));
    if (!inside(session.context.workspace.root, file)) {
      // Sources outside the workspace are read-only, never saved through the current tab.
      return { virtual: true, text: await readFile(file, 'utf8'), uri: target.uri, range: target.range, label: target.label };
    }
    const origin = originOf(session, data.origin, data.originViewport);
    await openFile(session, target);
    orca.log(`Java 已打开：${file}:${target.range.start.line + 1}`);
    historyFor(session).record(origin);
    for (const [panel, other] of sessions) {
      if (other.context.workspace.selector === session.context.workspace.selector) orca.panels.post('history', historyFor(session).state, { panel });
    }
    return { opened: true };
  });

  orca.panels.handle('history-state', (_input, caller) => historyFor(sessionFor(caller)).state);
  orca.panels.handle('history', async (input, caller) => {
    const data = object(input);
    if (data.direction !== 'back' && data.direction !== 'forward') throw new Error('导航方向无效');
    const session = sessionFor(caller);
    const history = historyFor(session);
    const destination = history.peek(data.direction);
    if (destination) await openFile(session, destination);
    const target = destination ? history.move(data.direction, originOf(session, data.origin, data.viewport)) : undefined;
    for (const [panel, other] of sessions) {
      if (other.context.workspace.selector === session.context.workspace.selector) orca.panels.post('history', history.state, { panel });
    }
    if (target) orca.log(`Java ${data.direction}：${target.uri}:${target.range.start.line + 1}`);
    return { target: target ?? null };
  });

  orca.panels.handle('restart', async (_input, caller) => {
    const session = sessionFor(caller);
    servers.get(serverKey(session.context))?.server.dispose();
    servers.delete(serverKey(session.context));
    runtime = undefined;
    await (await serverFor(session)).sync(session.context.uri, session.text);
    return { ok: true };
  });

  orca.panels.handle('detach', async (_input, caller) => {
    const session = sessions.get(caller.panel.id);
    sessions.delete(caller.panel.id);
    permitted.delete(caller.panel.id);
    attachVersions.delete(caller.panel.id);
    sourceChoices.delete(caller.panel.id);
    if (session && ![...sessions.values()].some((other) => other.context.uri === session.context.uri)) await servers.get(serverKey(session.context))?.server.close(session.context.uri);
    return { ok: true };
  });

  const timer = setInterval(() => {
    const cutoff = Date.now() - 20 * 60_000;
    for (const [root, entry] of servers) if (entry.lastUsed < cutoff) { entry.server.dispose(); servers.delete(root); }
  }, 60_000);
  timer.unref();
  cleanup = () => { clearInterval(timer); for (const { server } of servers.values()) server.dispose(); servers.clear(); sessions.clear(); };
}

export function deactivate(): void { cleanup?.(); cleanup = undefined; }
