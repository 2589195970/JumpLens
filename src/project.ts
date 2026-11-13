import { existsSync } from 'node:fs';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { run } from './runtime';
import type { DocumentContext, Workspace } from './types';
import { languageForPath, sourceExtensions } from './languages';

function bundled(...parts: string[]): string | undefined {
  const marker = '.app/Contents/';
  const at = process.execPath.indexOf(marker);
  if (at < 0) return;
  const file = path.join(process.execPath.slice(0, at + marker.length), 'Resources', ...parts);
  return existsSync(file) ? file : undefined;
}
export const CLI = bundled('bin', 'orca') ?? 'orca';
const RG = bundled('ripgrep', `${process.platform}-${process.arch}`, 'rg') ?? 'rg';

export async function activeWorkspace(): Promise<Workspace> {
  const { stdout } = await run(CLI, ['worktree', 'ps', '--limit', '10000', '--json'], { timeout: 12_000, maxBuffer: 16 * 1024 * 1024 });
  const response = JSON.parse(stdout);
  if (!response.ok) throw new Error(response.error?.message ?? '无法读取 Orca 工作区');
  const active = response.result.worktrees.filter((row: { isActive: boolean }) => row.isActive);
  if (active.length !== 1) throw new Error('请先在 Orca 中选择当前工程的工作区');
  const row = active[0];
  if ((row.hostId && row.hostId !== 'local') || row.address?.environment !== 'local') throw new Error('代码导航目前支持本机工作区');
  if (!row.address?.worktree) throw new Error('当前工作区地址不可用');
  return { root: await realpath(row.path), selector: row.address.worktree };
}

export async function workspaceBySelector(selector: string): Promise<Workspace> {
  if (!selector || selector.length > 2000 || selector.includes('\0')) throw new Error('工作区标识无效');
  const { stdout } = await run(CLI, ['worktree', 'show', '--worktree', selector, '--json'], { timeout: 12_000, maxBuffer: 1024 * 1024 });
  const response = JSON.parse(stdout);
  const row = response.result?.worktree;
  if (!response.ok || !row || row.hostId && row.hostId !== 'local' || row.address?.environment !== 'local') throw new Error('提交阅读的本机工作区不可用');
  return { root: await realpath(row.path), selector: row.address.worktree };
}

export function inside(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function sourceIdentity(text: string): { packageName: string; names: string[] } {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '');
  const packageName = clean.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1] ?? '';
  const names = [...clean.matchAll(/^\s*(?:(?:public|abstract|final|sealed|non-sealed|static|strictfp)\s+)*(?:class|interface|enum|record|@interface)\s+([\w$]+)/gm)].map((match) => match[1]);
  return { packageName, names };
}

export async function javaFiles(root: string): Promise<string[]> {
  return sourceFiles(root, ['java']);
}

export async function sourceFiles(root: string, extensions = sourceExtensions): Promise<string[]> {
  const { stdout } = await run(RG, ['--files', '--hidden', ...extensions.flatMap((extension) => ['-g', `*.${extension}`]), '-g', '!**/{.git,node_modules,.gradle,.idea,target,build,dist,.nuxt,.next,coverage}/**', root], { timeout: 15_000, maxBuffer: 16 * 1024 * 1024 }).catch((error) => {
    if (error.code === 1) return { stdout: '' };
    throw error;
  });
  return stdout.split(/\r?\n/).filter(Boolean);
}

export async function matchDocument(root: string, text: string, exactOnly = false): Promise<string[]> {
  const identity = sourceIdentity(text);
  const java = /^\s*(?:package\s+[\w.]+\s*;|import\s+(?:static\s+)?[\w.*]+\s*;|public\s+(?:(?:abstract|final|sealed)\s+)*(?:class|interface|enum|record)\s)/m.test(text);
  const files = await sourceFiles(root);
  if (files.length > 50_000) throw new Error('工作区源码文件过多，请打开具体工程后重试');
  const named = java && identity.names.length ? files.filter((file) => file.endsWith('.java') && identity.names.includes(path.basename(file, '.java'))) : files;
  const candidates = named.length ? named : files;
  const exact: string[] = [];
  const semantic: string[] = [];
  const similar: { path: string; score: number }[] = [];
  const lines = new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  // Sequential, bounded reads keep big monorepos from exhausting file descriptors.
  for (const file of candidates) {
    const canonical = await realpath(file).catch(() => null);
    if (!canonical || !inside(root, canonical)) continue;
    const source = await readFile(canonical, 'utf8').catch(() => null);
    if (source === null) continue;
    if (source.replace(/\r\n/g, '\n') === text.replace(/\r\n/g, '\n')) exact.push(canonical);
    else if (java && identity.names.length && canonical.endsWith('.java')) {
      const other = sourceIdentity(source);
      if (other.packageName === identity.packageName && other.names.some((name) => identity.names.includes(name))) semantic.push(canonical);
    } else if (text.length > 80) {
      const otherLines = new Set(source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
      const common = [...lines].filter((line) => otherLines.has(line)).length;
      const score = common / Math.max(lines.size, otherLines.size, 1);
      if (score >= .8 && Math.min(text.length, source.length) / Math.max(text.length, source.length) > .7) similar.push({ path: canonical, score });
    }
  }
  const best = Math.max(...similar.map((item) => item.score));
  return [...new Set(exactOnly ? exact : exact.length ? exact : semantic.length ? semantic : similar.filter((item) => item.score >= best - .02).map((item) => item.path))].sort();
}

export async function projectRoot(file: string, workspaceRoot: string): Promise<string> {
  let current = path.dirname(file);
  let result: string | undefined;
  while (inside(workspaceRoot, current)) {
    if (languageForPath(file) !== 'java' && ['tsconfig.json', 'jsconfig.json', 'package.json'].some((name) => existsSync(path.join(current, name)))) return current;
    const buildFile = ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts'].find((name) => existsSync(path.join(current, name)));
    if (buildFile) result = current;
    if (current === workspaceRoot) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return result ?? workspaceRoot;
}

export async function documentContext(file: string, workspace: Workspace): Promise<DocumentContext> {
  const canonical = await realpath(file);
  if (!inside(workspace.root, canonical) || !sourceExtensions.includes(path.extname(canonical).slice(1))) throw new Error('请选择当前工作区内的 Java、Vue 或 JS/TS 文件');
  return { uri: pathToFileURL(canonical).href, path: canonical, root: await projectRoot(canonical, workspace.root), workspace };
}
