import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CancellationTokenSource, createMessageConnection, StreamMessageReader, StreamMessageWriter, type MessageConnection } from 'vscode-jsonrpc/node.js';
import { CACHE, type Runtime } from './runtime';
import { normalizeLocations, type NavigationKind, type Position, type Progress, type Target } from './types';

export class LanguageServer {
  private connection?: MessageConnection;
  private child?: ChildProcessWithoutNullStreams;
  private ready?: Promise<void>;
  private documents = new Map<string, { text: string; version: number }>();
  private queue = Promise.resolve();
  private initialization?: Promise<void>;
  private resolveInitialized?: () => void;
  private stderr = '';
  private stopped = false;

  constructor(readonly root: string, private runtime: Runtime, private progress: Progress, private log: Progress = () => {}) {}

  start(): Promise<void> {
    if (this.stopped) return Promise.reject(new Error('Java 语言服务已停止，请重试'));
    return this.ready ??= this.launch();
  }

  private async launch(): Promise<void> {
    const workspace = path.join(CACHE, 'workspaces', createHash('sha256').update(this.root).digest('hex').slice(0, 24));
    await mkdir(workspace, { recursive: true });
    const plugins = await readdir(path.join(this.runtime.server, 'plugins'));
    const launcher = plugins.find((file) => /^org\.eclipse\.equinox\.launcher_[^/]+\.jar$/.test(file));
    if (!launcher) throw new Error('JDT LS 缺少启动组件');
    const platform = process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux';
    const configNames = process.arch === 'arm64' ? [`config_${platform}_arm`, `config_${platform}`] : [`config_${platform}`];
    let template: string | undefined;
    for (const name of configNames) {
      const location = path.join(this.runtime.server, name);
      if (await stat(location).then((s) => s.isDirectory(), () => false)) { template = location; break; }
    }
    if (!template) throw new Error('JDT LS 缺少当前平台配置');
    const config = path.join(workspace, 'configuration');
    await cp(template, config, { recursive: true, force: false });
    const args = ['-Declipse.application=org.eclipse.jdt.ls.core.id1', '-Dosgi.bundles.defaultStartLevel=4', '-Declipse.product=org.eclipse.jdt.ls.core.product', '-Djava.import.generatesMetadataFilesAtProjectRoot=false', '-Dlog.level=WARNING', '-Dfile.encoding=UTF-8', '-Xmx1G', '--add-modules=ALL-SYSTEM', '--add-opens', 'java.base/java.util=ALL-UNNAMED', '--add-opens', 'java.base/java.lang=ALL-UNNAMED'];
    const lombok = plugins.find((name) => /lombok.*\.jar$/i.test(name));
    if (this.runtime.lombok) args.push(`-javaagent:${this.runtime.lombok}`);
    else if (lombok) args.push(`-javaagent:${path.join(this.runtime.server, 'plugins', lombok)}`);
    args.push('-jar', path.join(this.runtime.server, 'plugins', launcher), '-configuration', config, '-data', path.join(workspace, 'data'));
    this.progress('正在启动 Java 分析服务…');
    const env = { ...process.env };
    delete env.CLIENT_PORT;
    delete env.CLIENT_HOST;
    const child = spawn(this.runtime.java, args, { cwd: this.root, env, stdio: 'pipe' });
    this.child = child;
    child.stderr.on('data', (chunk) => { this.stderr = (this.stderr + String(chunk)).slice(-6000); });
    const connection = createMessageConnection(new StreamMessageReader(child.stdout), new StreamMessageWriter(child.stdin));
    this.connection = connection;
    child.on('error', (error) => { this.log(error.message); connection.dispose(); this.stopped = true; this.resolveInitialized?.(); });
    child.on('exit', (code) => { this.log(`JDT LS 退出：${code ?? 'signal'} ${this.stderr}`); this.stopped = true; connection.dispose(); this.resolveInitialized?.(); });
    connection.onError((error) => this.log(String(error)));
    connection.onRequest('workspace/configuration', (params: { items: { section?: string }[] }) => params.items.map((item) => item.section === 'java' ? this.javaSettings() : null));
    connection.onRequest('client/registerCapability', () => null);
    connection.onRequest('client/unregisterCapability', () => null);
    connection.onRequest('window/workDoneProgress/create', () => null);
    connection.onRequest('window/showMessageRequest', () => null);
    connection.onNotification('window/logMessage', (params: { message: string }) => this.log(params.message));
    connection.onNotification('window/showMessage', (params: { message: string }) => this.progress(params.message));
    this.initialization = new Promise((resolve) => { this.resolveInitialized = resolve; });
    connection.onNotification('language/status', (status: { type: string; message: string }) => {
      if (status.type === 'ServiceReady') { this.resolveInitialized?.(); this.progress('Java 分析已就绪'); }
      else this.progress(status.message || '正在分析 Java 工程…');
    });
    connection.onNotification('$/progress', (params: { value?: { title?: string; message?: string; kind?: string } }) => {
      const message = params.value?.message ?? params.value?.title;
      if (message) this.progress(message);
    });
    connection.onNotification('language/progressReport', (params: { task?: string; subTask?: string }) => { if (params.subTask || params.task) this.progress(params.subTask || params.task!); });
    connection.listen();
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 120_000);
    try {
      await this.request('initialize', {
        processId: process.pid,
        clientInfo: { name: 'JumpLens', version: '0.3.2' },
        rootUri: pathToFileURL(this.root).href,
        workspaceFolders: [{ uri: pathToFileURL(this.root).href, name: path.basename(this.root) }],
        capabilities: {
          workspace: { configuration: true, workspaceFolders: true },
          textDocument: { synchronization: { didSave: true }, definition: { linkSupport: true }, implementation: { linkSupport: true }, references: {} },
          window: { workDoneProgress: true },
          general: { positionEncodings: ['utf-16'] }
        },
        initializationOptions: { settings: { java: this.javaSettings() }, extendedClientCapabilities: { classFileContentsSupport: true, progressReportProvider: true } }
      }, timeout.signal);
      await connection.sendNotification('initialized', {});
      await connection.sendNotification('workspace/didChangeConfiguration', { settings: { java: this.javaSettings() } });
    } catch (error) {
      this.dispose();
      throw new Error(`Java 分析服务启动失败：${error instanceof Error ? error.message : error}`);
    } finally { clearTimeout(timer); }
  }

  private javaSettings(): Record<string, unknown> {
    return {
      home: this.runtime.projectJavaHome,
      configuration: { updateBuildConfiguration: 'automatic', ...(this.runtime.projectJavaHome ? { runtimes: [{ name: this.runtime.projectJavaName ?? 'JavaSE-1.8', path: this.runtime.projectJavaHome, default: true }] } : {}) },
      import: { maven: { enabled: true }, gradle: { enabled: true }, generatesMetadataFilesAtProjectRoot: false, exclusions: ['**/node_modules/**', '**/.git/**'] },
      maven: { downloadSources: true },
      referencesCodeLens: { enabled: false },
      implementationCodeLens: { enabled: false }
    };
  }

  private async request<T>(method: string, params: unknown, signal?: AbortSignal): Promise<T> {
    if (!this.connection || this.stopped) throw new Error(`Java 分析服务不可用${this.stderr ? `：${this.stderr.slice(-500)}` : ''}`);
    const cancellation = new CancellationTokenSource();
    const abort = () => cancellation.cancel();
    if (signal?.aborted) throw new Error('请求已取消');
    signal?.addEventListener('abort', abort, { once: true });
    try { return await this.connection.sendRequest<T>(method, params, cancellation.token); }
    finally { signal?.removeEventListener('abort', abort); cancellation.dispose(); }
  }

  async sync(uri: string, text: string): Promise<void> {
    await this.start();
    const action = this.queue.then(async () => {
      const old = this.documents.get(uri);
      if (old?.text === text) return;
      const version = (old?.version ?? 0) + 1;
      if (!old) await this.connection!.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'java', version, text } });
      else await this.connection!.sendNotification('textDocument/didChange', { textDocument: { uri, version }, contentChanges: [{ text }] });
      this.documents.set(uri, { text, version });
    });
    this.queue = action.catch(() => {});
    return action;
  }

  async navigate(uri: string, text: string, position: Position, kind: NavigationKind, signal?: AbortSignal): Promise<Target[]> {
    await this.sync(uri, text);
    const params = { textDocument: { uri }, position, ...(kind === 'references' ? { context: { includeDeclaration: false } } : {}) };
    let targets = normalizeLocations(await this.request(`textDocument/${kind}`, params, signal));
    if (!targets.length && this.initialization) {
      this.progress('正在完成工程分析，请稍候…');
      // Wait only on the first import; later requests should return an honest empty result.
      const imported = this.initialization;
      this.initialization = undefined;
      const timeout = new Promise<void>((resolve) => { const timer = setTimeout(resolve, 30_000); timer.unref(); });
      await Promise.race([imported, timeout]);
      if (signal?.aborted) throw new Error('请求已取消');
      targets = normalizeLocations(await this.request(`textDocument/${kind}`, params, signal));
    }
    return targets;
  }

  async virtualText(uri: string, signal?: AbortSignal): Promise<string> {
    await this.start();
    try {
      const result = await this.request<{ text: string }>('workspace/textDocumentContent', { uri }, signal);
      return result.text;
    } catch (error) {
      if (signal?.aborted) throw error;
      return this.request<string>('java/classFileContents', { uri }, signal);
    }
  }

  async close(uri: string): Promise<void> {
    if (!this.documents.delete(uri) || this.stopped) return;
    await this.connection?.sendNotification('textDocument/didClose', { textDocument: { uri } });
  }

  get healthy(): boolean { return !this.stopped; }

  dispose(): void {
    this.stopped = true;
    this.resolveInitialized?.();
    this.connection?.dispose();
    this.child?.kill();
    const child = this.child;
    const kill = setTimeout(() => { if (child && child.exitCode === null) child.kill('SIGKILL'); }, 3000);
    kill.unref();
    this.documents.clear();
  }
}
