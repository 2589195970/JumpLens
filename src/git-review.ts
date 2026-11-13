import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CACHE, run } from './runtime';
import { inside } from './project';

export type CommitSummary = { revision: string; subject: string; date: string };
export type ChangedFile = { status: string; beforePath?: string; afterPath?: string };
export type ReviewCommit = CommitSummary & { parent?: string; files: ChangedFile[] };
export type RevisionDocument = { repository: string; revision: string; path: string; side: 'before' | 'after'; text: string };
const sourceFile = /\.(?:java|xml|properties|gradle|kts|json|vue|[cm]?[jt]sx?|css|scss|sass|html|ya?ml)$|(?:^|\/)lombok\.config$/i;
const ignored = /(?:^|\/)(?:node_modules|target|build|dist|package-output|\.git)\//;
const snapshots = new Map<string, Promise<string>>();

async function git(repository: string, args: string[], maxBuffer = 4 * 1024 * 1024): Promise<string> {
  return (await run('git', ['-C', repository, ...args], { encoding: 'utf8', maxBuffer, timeout: 30_000 })).stdout;
}

export async function gitRepositories(workspaceRoot: string): Promise<string[]> {
  workspaceRoot = await realpath(workspaceRoot);
  try { return [await realpath((await git(workspaceRoot, ['rev-parse', '--show-toplevel'])).trim())]; }
  catch { /* A folder workspace can contain independent repositories. */ }
  const repositories: string[] = [];
  for (const entry of (await readdir(workspaceRoot, { withFileTypes: true })).slice(0, 300)) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const candidate = await realpath(path.join(workspaceRoot, entry.name));
    if (!inside(workspaceRoot, candidate)) continue;
    try {
      const root = await realpath((await git(candidate, ['rev-parse', '--show-toplevel'])).trim());
      if (root === candidate) repositories.push(root);
    } catch { /* Ordinary subdirectories are not repositories. */ }
  }
  return repositories.sort();
}

export async function commitHistory(repository: string): Promise<CommitSummary[]> {
  const output = await git(repository, ['log', '-40', '--format=%H%x00%s%x00%aI']);
  return output.trim().split('\n').filter(Boolean).map((line) => { const [revision, subject, date] = line.split('\0'); return { revision, subject, date }; });
}

export function changedPaths(output: string): ChangedFile[] {
  const fields = output.split('\0');
  const files: ChangedFile[] = [];
  for (let i = 0; i < fields.length && fields[i];) {
    const status = fields[i++];
    const first = fields[i++];
    if (!first) throw new Error('Git 文件清单不完整');
    if (/^[RC]/.test(status)) {
      const afterPath = fields[i++];
      if (!afterPath) throw new Error('Git 重命名记录不完整');
      files.push({ status, beforePath: first, afterPath });
    } else files.push({ status, ...(status !== 'A' ? { beforePath: first } : {}), ...(status !== 'D' ? { afterPath: first } : {}) });
  }
  return files;
}

export async function reviewCommit(repository: string, ref: string): Promise<ReviewCommit> {
  if (!ref || ref.length > 200 || /[\0\r\n]/.test(ref) || ref.startsWith('-')) throw new Error('提交标识无效');
  const revision = (await git(repository, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`])).trim();
  const metadata = (await git(repository, ['show', '-s', '--format=%P%n%s%n%aI', revision])).trimEnd().split('\n');
  const parent = metadata[0].split(' ')[0] || undefined;
  const output = parent
    ? await git(repository, ['diff', '--name-status', '-z', '--find-renames', parent, revision, '--'])
    : await git(repository, ['diff-tree', '--root', '--no-commit-id', '-r', '--name-status', '-z', revision, '--']);
  return { revision, parent, subject: metadata[1], date: metadata[2], files: changedPaths(output) };
}

export async function revisionDocument(repository: string, commit: ReviewCommit, file: ChangedFile, side: 'before' | 'after'): Promise<RevisionDocument | undefined> {
  const revision = side === 'before' ? commit.parent : commit.revision;
  const filename = side === 'before' ? file.beforePath : file.afterPath;
  if (!revision || !filename) return;
  const contents = await run('git', ['-C', repository, 'show', `${revision}:${filename}`], { encoding: 'buffer', maxBuffer: 450_000, timeout: 15_000 });
  const buffer = contents.stdout as unknown as Buffer;
  if (buffer.includes(0)) throw new Error('当前文件是二进制文件，不能作为源码显示');
  // CodeMirror stores LF internally; LSP offsets must use that same document representation.
  return { repository, revision, path: filename, side, text: buffer.toString('utf8').replace(/\r\n?/g, '\n') };
}

type TreeFile = { path: string; object: string; size: number };
function readObjects(repository: string, objects: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = execFile('git', ['-C', repository, 'cat-file', '--batch'], { encoding: 'buffer', maxBuffer: 70 * 1024 * 1024, timeout: 60_000 }, (error, stdout) => error ? reject(error) : resolve(stdout));
    child.stdin?.on('error', reject);
    child.stdin?.end(objects.join('\n') + '\n');
  });
}

export async function revisionWorkspace(repository: string, revision: string, cacheRoot = path.join(CACHE, 'revisions')): Promise<string> {
  if (!/^[a-f0-9]{40,64}$/.test(revision)) throw new Error('历史分析需要完整提交哈希');
  const key = createHash('sha256').update(`${repository}\0${revision}`).digest('hex').slice(0, 32);
  const directory = path.join(cacheRoot, key);
  const old = snapshots.get(directory);
  if (old) return old;
  const prepare = async () => {
    if (await readFile(path.join(directory, '.jumplens-ready'), 'utf8').then((text) => text === revision, () => false)) return directory;
    const output = await git(repository, ['ls-tree', '-r', '-l', '-z', revision], 16 * 1024 * 1024);
    const files: TreeFile[] = [];
    for (const line of output.split('\0').filter(Boolean)) {
      const at = line.indexOf('\t');
      const [mode, type, object, size] = line.slice(0, at).trim().split(/\s+/);
      const filename = line.slice(at + 1);
      if (!/^100(?:644|755)$/.test(mode) || type !== 'blob' || !sourceFile.test(filename) || ignored.test(filename)) continue;
      if (!inside(directory, path.resolve(directory, filename))) throw new Error('历史源码路径无效');
      files.push({ path: filename, object, size: Number(size) });
    }
    if (files.length > 20_000 || files.reduce((total, file) => total + file.size, 0) > 64 * 1024 * 1024) throw new Error('历史工程源码超过分析缓存上限，可继续阅读语法高亮');
    const staging = `${directory}.partial-${process.pid}-${Date.now()}`;
    await mkdir(staging, { recursive: true });
    try {
      const contents = files.length ? await readObjects(repository, files.map((file) => file.object)) : Buffer.alloc(0);
      let offset = 0;
      for (const file of files) {
        const end = contents.indexOf(10, offset);
        const header = contents.subarray(offset, end).toString('ascii');
        if (end < 0 || header !== `${file.object} blob ${file.size}` || end + 1 + file.size >= contents.length) throw new Error('历史源码对象读取失败');
        const destination = path.join(staging, file.path);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, contents.subarray(end + 1, end + 1 + file.size));
        offset = end + 1 + file.size + 1;
      }
      await writeFile(path.join(staging, '.jumplens-ready'), revision);
      try { await rename(staging, directory); }
      catch (error) { if (!await readFile(path.join(directory, '.jumplens-ready'), 'utf8').then((text) => text === revision, () => false)) throw error; }
      return directory;
    } finally { await rm(staging, { recursive: true, force: true }); }
  };
  const pending = prepare().catch((error) => { snapshots.delete(directory); throw error; });
  snapshots.set(directory, pending);
  return pending;
}
