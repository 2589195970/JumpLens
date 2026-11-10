import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { access, mkdir, readdir, readFile, rename, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import type { Progress, Settings } from './types';

export const run = promisify(execFile);
export const CACHE = path.join(homedir(), '.cache', 'orca-java-navigation');
export const JDT_VERSION = '1.63.0';
const JDT_ARCHIVE = 'jdt-language-server-1.63.0-202610191322.tar.gz';
const JDT_URL = `https://download.eclipse.org/jdtls/milestones/${JDT_VERSION}/${JDT_ARCHIVE}`;
export type Runtime = { java: string; server: string; projectJavaHome?: string; projectJavaName?: string; lombok?: string };

async function exists(file: string): Promise<boolean> {
  return access(file).then(() => true, () => false);
}

async function download(url: string, destination: string, sha256: string, progress: Progress): Promise<void> {
  const response = await fetch(url, { signal: AbortSignal.timeout(600_000) });
  if (!response.ok || !response.body) throw new Error(`下载失败（HTTP ${response.status}）：${url}`);
  const size = Number(response.headers.get('content-length'));
  const hash = createHash('sha256');
  let received = 0;
  let lastUpdate = 0;
  const meter = new Transform({ transform(chunk, _encoding, callback) {
    received += chunk.length;
    if (received > 600 * 1024 * 1024) return callback(new Error('下载文件超出大小限制'));
    hash.update(chunk);
    if (Date.now() - lastUpdate > 1000) {
      lastUpdate = Date.now();
      progress(`正在下载运行组件：${Math.round(received / 1024 / 1024)} MB${size ? ` / ${Math.round(size / 1024 / 1024)} MB` : ''}`);
    }
    callback(null, chunk);
  }});
  await pipeline(Readable.fromWeb(response.body as never), meter, createWriteStream(destination, { flags: 'wx' }));
  if (hash.digest('hex') !== sha256.toLowerCase()) throw new Error('下载校验失败，请重试');
}

async function extract(url: string, checksum: string, destination: string, progress: Progress): Promise<void> {
  await mkdir(CACHE, { recursive: true });
  const staging = `${destination}.partial-${randomUUID()}`;
  const archive = `${staging}.tar.gz`;
  await mkdir(staging, { recursive: true });
  try {
    await download(url, archive, checksum, progress);
    progress('校验通过，正在解压运行组件…');
    await run('tar', ['-xzf', archive, '-C', staging], { timeout: 120_000 });
    try { await rename(staging, destination); }
    catch (error) { if (!await exists(destination)) throw error; }
  } finally {
    await rm(archive, { force: true });
    await rm(staging, { force: true, recursive: true });
  }
}

async function findJava(directory: string): Promise<string | null> {
  for (const suffix of ['bin/java', 'Contents/Home/bin/java']) {
    const file = path.join(directory, suffix);
    if (await exists(file)) return file;
  }
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isDirectory()) continue;
    for (const suffix of ['bin/java', 'Contents/Home/bin/java']) {
      const file = path.join(directory, entry.name, suffix);
      if (await exists(file)) return file;
    }
  }
  return null;
}

async function validJava(file: string): Promise<boolean> {
  try {
    const { stderr, stdout } = await run(file, ['-version'], { timeout: 10_000 });
    return Number(`${stderr}${stdout}`.match(/version "(\d+)/)?.[1] ?? 0) >= 25;
  } catch { return false; }
}

async function ensureJava(settings: Settings, progress: Progress): Promise<string> {
  if (settings.javaHome) {
    const java = await findJava(settings.javaHome);
    if (!java || !await validJava(java)) throw new Error('语言服务器 JDK 需要 Java 25 或更高版本，请检查插件设置');
    return java;
  }
  const cached = path.join(CACHE, 'jdk-25');
  if (await exists(cached)) {
    const java = await findJava(cached);
    if (java && await validJava(java)) return java;
  }
  const candidates = [process.env.JAVA_HOME && path.join(process.env.JAVA_HOME, 'bin/java'), 'java'];
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await run('/usr/libexec/java_home', ['-v', '25'], { timeout: 8000 });
      candidates.unshift(path.join(stdout.trim(), 'bin/java'));
    } catch { /* A managed runtime is available below. */ }
  }
  for (const java of candidates) if (java && await validJava(java)) return java;
  const os = process.platform === 'darwin' ? 'mac' : process.platform === 'linux' ? 'linux' : null;
  const architecture = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x64' : null;
  if (!os || !architecture) throw new Error('请在插件设置中指定 Java 25 的安装目录');
  progress('首次使用：准备 Java 语言服务运行环境…');
  const response = await fetch(`https://api.adoptium.net/v3/assets/latest/25/hotspot?architecture=${architecture}&image_type=jdk&os=${os}&vendor=eclipse`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`无法读取 Java 运行环境信息（HTTP ${response.status}）`);
  const assets = await response.json() as { binary: { package: { link: string; checksum: string } } }[];
  const pkg = assets[0]?.binary.package;
  if (!pkg || !pkg.link.startsWith('https://github.com/adoptium/') || !/^[a-f\d]{64}$/i.test(pkg.checksum)) throw new Error('Java 运行环境下载信息无效');
  await extract(pkg.link, pkg.checksum, cached, progress);
  const java = await findJava(cached);
  if (!java || !await validJava(java)) throw new Error('Java 运行环境安装失败');
  return java;
}

export async function ensureRuntime(settings: Settings = {}, progress: Progress = () => {}): Promise<Runtime> {
  const java = await ensureJava(settings, progress);
  const server = settings.languageServerHome || path.join(CACHE, `jdtls-${JDT_VERSION}`);
  if (!await exists(path.join(server, 'plugins'))) {
    if (settings.languageServerHome) throw new Error('JDT LS 目录中缺少 plugins，请检查插件设置');
    progress('首次使用：准备 Java 语言服务器…');
    const response = await fetch(`${JDT_URL}.sha256`, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error('无法读取 JDT LS 校验信息');
    const checksum = (await response.text()).match(/\b[a-f\d]{64}\b/i)?.[0];
    if (!checksum) throw new Error('JDT LS 校验信息无效');
    await extract(JDT_URL, checksum, server, progress);
  }
  let projectJavaHome = settings.projectJavaHome;
  if (!projectJavaHome && process.platform === 'darwin') {
    try { projectJavaHome = (await run('/usr/libexec/java_home', ['-v', '1.8'], { timeout: 8000 })).stdout.trim(); }
    catch { /* JDT LS can also use its configured default runtime. */ }
  }
  let projectJavaName: string | undefined;
  if (projectJavaHome) {
    const release = await readFile(path.join(projectJavaHome, 'release'), 'utf8').catch(() => '');
    let major = release.match(/JAVA_VERSION="(1\.8|\d+)/)?.[1];
    if (!major) {
      const version = await run(path.join(projectJavaHome, 'bin/java'), ['-version'], { timeout: 10_000 });
      major = `${version.stderr}${version.stdout}`.match(/version "(1\.8|\d+)/)?.[1];
    }
    if (!major) throw new Error('无法识别项目 JDK 版本，请检查插件设置中的项目 JDK 目录');
    projectJavaName = `JavaSE-${major}`;
  }
  const lombok = path.join(CACHE, 'lombok-1.18.42.jar');
  if (!await exists(lombok)) {
    progress('正在准备 Lombok 分析支持…');
    const temporary = `${lombok}.${randomUUID()}.part`;
    try {
      await download('https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.42/lombok-1.18.42.jar', temporary, '3488a4e9994c26596baaceebee58cad36a50e3bdaec5be72b5834d3c3b560306', progress);
      await rename(temporary, lombok);
    } finally { await rm(temporary, { force: true }); }
  }
  progress('Java 运行环境已就绪');
  return { java, server, projectJavaHome, projectJavaName, lombok };
}
