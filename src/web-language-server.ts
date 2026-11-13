import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, watch, type FSWatcher } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire as createRuntimeRequire } from 'node:module';
import { CancellationTokenSource, createMessageConnection, StreamMessageReader, StreamMessageWriter, type MessageConnection } from 'vscode-jsonrpc/node.js';
import { lspLanguage } from './languages';
import type { NavigationServer } from './navigation-server';
import { normalizeLocations, type NavigationKind, type Position, type Progress, type Target } from './types';
import { uniqueTargets } from './candidates';
import { vueOptionsNavigation } from './vue-options';

/** Vue's standalone service handles both SFC virtual documents and JS/TS projects. */
export class WebLanguageServer implements NavigationServer {
  private connection?: MessageConnection;
  private child?: ChildProcessWithoutNullStreams;
  private ready?: Promise<void>;
  private stopped = false;
  private documents = new Map<string, { text: string; version: number }>();
  private queue = Promise.resolve();
  private watcher?: FSWatcher;
  private stderr = '';
  private runtimeModules = '';

  constructor(readonly root: string, private progress: Progress, private log: Progress = () => {}) {}

  private async launch(): Promise<void> {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const dist = existsSync(path.join(moduleDir, 'web-runtime')) ? moduleDir : path.resolve(moduleDir, '../dist');
    const modules = path.join(dist, 'web-runtime/node_modules');
    this.runtimeModules = modules;
    this.progress('正在启动 Vue / TypeScript 分析服务…');
    const child = spawn(process.execPath, [path.join(modules, '@vue/language-server/bin/vue-language-server.js'), '--stdio'], { cwd: this.root, stdio: 'pipe' });
    this.child = child;
    child.stderr.on('data', (chunk) => { this.stderr = (this.stderr + String(chunk)).slice(-4000); });
    const connection = createMessageConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin));
    this.connection = connection;
    child.on('error', (error) => { this.log(error.message); this.stopped = true; connection.dispose(); });
    child.on('exit', (code) => { this.log(`Vue / TS 服务退出：${code ?? 'signal'} ${this.stderr}`); this.stopped = true; connection.dispose(); });
    connection.onError((error) => this.log(String(error)));
    connection.onRequest('workspace/configuration', (params: { items: { section?: string }[] }) => params.items.map(({ section }) => {
      if (section === 'typescript' || section === 'javascript') return { preferences: {}, implicitProjectConfig: { checkJs: true, allowJs: true } };
      return null;
    }));
    connection.onRequest('client/registerCapability', () => null);
    connection.onRequest('client/unregisterCapability', () => null);
    connection.onRequest('window/workDoneProgress/create', () => null);
    connection.onNotification('window/logMessage', (data: { message: string }) => this.log(data.message));
    connection.onNotification('window/showMessage', (data: { message: string }) => this.progress(data.message));
    connection.listen();
    const timeout = AbortSignal.timeout(60_000);
    try {
      await this.request('initialize', {
        processId: process.pid,
        clientInfo: { name: 'JumpLens', version: '0.4.0' },
        rootUri: pathToFileURL(this.root).href,
        workspaceFolders: [{ uri: pathToFileURL(this.root).href, name: path.basename(this.root) }],
        capabilities: {
          workspace: { configuration: true, workspaceFolders: true },
          textDocument: { synchronization: {}, definition: { linkSupport: true }, typeDefinition: { linkSupport: true }, implementation: { linkSupport: true }, references: {} },
          general: { positionEncodings: ['utf-16'] }
        },
        initializationOptions: { typescript: { tsdk: path.join(modules, 'typescript/lib') }, vue: { hybridMode: false } }
      }, timeout);
      await connection.sendNotification('initialized', {});
      try {
        this.watcher = watch(this.root, { recursive: true }, (_event, filename) => {
          if (!filename || /(^|[/\\])(node_modules|\.git|dist|build|coverage)([/\\]|$)/.test(filename)) return;
          const file = path.resolve(this.root, filename);
          void connection.sendNotification('workspace/didChangeWatchedFiles', { changes: [{ uri: pathToFileURL(file).href, type: existsSync(file) ? 2 : 3 }] }).catch(() => {});
        });
        this.watcher.on('error', (error) => this.log(error.message));
      } catch (error) { this.log(`文件监听不可用：${error}`); }
      this.progress('Vue / TypeScript · 分析已就绪');
    } catch (error) { this.dispose(); throw new Error(`Vue / TS 分析服务启动失败：${error}`); }
  }

  private async request<T>(method: string, params: unknown, signal?: AbortSignal): Promise<T> {
    if (!this.connection || this.stopped) throw new Error(`Vue / TS 分析服务不可用：${this.stderr.slice(-500)}`);
    const token = new CancellationTokenSource();
    const abort = () => token.cancel();
    if (signal?.aborted) throw new Error('请求已取消');
    signal?.addEventListener('abort', abort, { once: true });
    try { return await this.connection.sendRequest<T>(method, params, token.token); }
    finally { signal?.removeEventListener('abort', abort); token.dispose(); }
  }

  async sync(uri: string, text: string): Promise<void> {
    if (this.stopped) throw new Error('Vue / TS 分析服务已停止，请重新连接');
    await (this.ready ??= this.launch());
    const action = this.queue.then(async () => {
      const previous = this.documents.get(uri);
      if (previous?.text === text) return;
      const version = (previous?.version ?? 0) + 1;
      if (!previous) await this.connection!.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: lspLanguage(uri), version, text } });
      else await this.connection!.sendNotification('textDocument/didChange', { textDocument: { uri, version }, contentChanges: [{ text }] });
      this.documents.set(uri, { text, version });
    });
    this.queue = action.catch(() => {});
    await action;
  }

  async navigate(uri: string, text: string, position: Position, kind: NavigationKind, signal?: AbortSignal): Promise<Target[]> {
    await this.sync(uri, text);
    const targets = normalizeLocations(await this.request(`textDocument/${kind}`, { textDocument: { uri }, position, ...(kind === 'references' ? { context: { includeDeclaration: false } } : {}) }, signal));
    if (uri.endsWith('.vue') && (!targets.length || kind === 'references')) {
      const require = createRuntimeRequire(import.meta.url);
      const ts = require(path.join(this.runtimeModules, 'typescript'));
      const { parse } = require(path.join(this.runtimeModules, '@vue/compiler-dom'));
      return uniqueTargets([...targets, ...vueOptionsNavigation(ts, parse, uri, text, position, kind)]);
    }
    return targets;
  }
  async virtualText(): Promise<string> { throw new Error('此语言服务仅提供磁盘源码预览'); }
  async close(uri: string): Promise<void> {
    if (this.documents.delete(uri) && !this.stopped) await this.connection?.sendNotification('textDocument/didClose', { textDocument: { uri } });
  }
  get healthy(): boolean { return !this.stopped; }
  dispose(): void {
    this.stopped = true;
    this.watcher?.close();
    this.connection?.dispose();
    this.child?.kill();
    this.documents.clear();
  }
}
