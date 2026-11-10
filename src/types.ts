export type Position = { line: number; character: number };
export type Range = { start: Position; end: Position };
export type Target = { uri: string; range: Range; label: string; preview?: string; symbol?: string; packageName?: string; module?: string; signature?: string; source?: 'project' | 'library' };
export type NavigationKind = 'definition' | 'implementation' | 'references' | 'typeDefinition';
export type SourcePreview = { text: string; firstLine: number; range: Range; path: string };
export type Viewport = { top: number; left: number };
export type LocationSnapshot = Target & { viewport?: Viewport };
export type Workspace = { root: string; selector: string };
export type Progress = (message: string) => void;
export type Settings = { javaHome?: string; projectJavaHome?: string; languageServerHome?: string };
export type DocumentContext = { uri: string; path: string; root: string; workspace: Workspace };

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function normalizeLocations(value: unknown): Target[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  const unique = new Map<string, Target>();
  for (const item of items) {
    const uri = item.targetUri ?? item.uri;
    const range = item.targetSelectionRange ?? item.range ?? item.targetRange;
    if (typeof uri !== 'string' || !range?.start || !range?.end) continue;
    const key = `${uri}:${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}`;
    unique.set(key, { uri, range, label: decodeURIComponent(uri.split('/').pop()?.split('?')[0] ?? uri) });
  }
  return [...unique.values()];
}
