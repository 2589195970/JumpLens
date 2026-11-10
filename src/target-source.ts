import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Target } from './types';

export function describeTarget(target: Target, text: string, workspaceRoot: string): Target {
  const lines = text.split(/\r?\n/);
  const line = lines[target.range.start.line] ?? '';
  const symbol = target.range.start.line === target.range.end.line ? line.slice(target.range.start.character, target.range.end.character) : undefined;
  const packageName = text.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1];
  const file = target.uri.startsWith('file:') ? fileURLToPath(target.uri) : undefined;
  const relative = file ? path.relative(workspaceRoot, file) : target.label;
  const projectSource = !!file && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  const segments = relative.split(path.sep);
  const sourceIndex = segments.indexOf('src');
  const module = projectSource ? (sourceIndex > 0 ? segments.slice(0, sourceIndex).join('/') : path.basename(workspaceRoot)) : '依赖库';
  const symbolName = symbol?.trim() || target.symbol;
  return { ...target, label: projectSource ? relative : target.label, ...(symbolName ? { symbol: symbolName } : {}), ...(packageName ? { packageName } : {}), module, source: projectSource ? 'project' : 'library', signature: line.trim(), preview: line.trim() };
}

export function describeVirtualTarget(target: Target): Target {
  try {
    const segments = new URL(target.uri).pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const name = segments.at(-1) ?? target.label;
    return { ...target, symbol: name.replace(/\.class$/, ''), packageName: segments.slice(1, -1).join('.'), module: segments[0] ?? '依赖库', source: 'library' };
  } catch { return { ...target, source: 'library', module: '依赖库' }; }
}
