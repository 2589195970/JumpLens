import type { Range, SourcePreview, Target } from './types';

export function targetKey(target: Target): string {
  return `${target.uri}:${target.range.start.line}:${target.range.start.character}:${target.range.end.line}:${target.range.end.character}`;
}

/** File names are presentation, never identity: same-name items keep their URI and range. */
export function uniqueTargets(targets: Target[]): Target[] {
  return [...new Map(targets.map((target) => [targetKey(target), target])).values()];
}

export function matchScore(text: string, query: string): number {
  const haystack = text.normalize('NFKC').toLowerCase();
  const parts = query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const part of parts) {
    const direct = haystack.indexOf(part);
    if (direct >= 0) { score += direct; continue; }
    let at = 0;
    for (const character of part) {
      const found = haystack.indexOf(character, at);
      if (found < 0) return Infinity;
      score += 25 + found - at;
      at = found + 1;
    }
  }
  return score;
}

export function searchTargets(targets: Target[], query: string): Target[] {
  return targets.map((target, index) => ({ target, index, score: matchScore([target.label, target.symbol, target.packageName, target.module, target.signature].filter(Boolean).join(' '), query) }))
    .filter((item) => Number.isFinite(item.score)).sort((a, b) => a.score - b.score || a.index - b.index).map((item) => item.target);
}

export function sourcePreview(text: string, range: Range, file: string): SourcePreview {
  const lines = text.split(/\r?\n/);
  const firstLine = Math.max(0, Math.min(lines.length - 1, range.start.line) - 12);
  const lastLine = Math.min(lines.length, Math.max(range.end.line + 13, firstLine + 30));
  const snippet = lines.slice(firstLine, lastLine).join('\n').slice(0, 150_000);
  return { text: snippet, firstLine, path: file, range: { start: { ...range.start, line: range.start.line - firstLine }, end: { ...range.end, line: range.end.line - firstLine } } };
}
