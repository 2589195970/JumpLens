export const tokenTypes = ['namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter', 'parameter', 'variable', 'property', 'enumMember', 'event', 'function', 'method', 'macro', 'keyword', 'modifier', 'comment', 'string', 'number', 'regexp', 'operator', 'decorator'];
export const tokenModifiers = ['declaration', 'definition', 'readonly', 'static', 'deprecated', 'abstract', 'async', 'modification', 'documentation', 'defaultLibrary'];
export type SymbolKind = 'type' | 'method' | 'field' | 'parameter' | 'variable' | 'constant' | 'annotation' | 'keyword' | 'string' | 'number' | 'comment';
export type SemanticSpan = { from: number; to: number; kind: SymbolKind; static?: boolean; deprecated?: boolean };
export type TokenLegend = { tokenTypes: string[]; tokenModifiers: string[] };

export function decodeSemanticTokens(text: string, data: number[], legend: TokenLegend): SemanticSpan[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  const spans: SemanticSpan[] = [];
  let line = 0, character = 0;
  for (let i = 0; i + 4 < data.length; i += 5) {
    const [deltaLine, deltaCharacter, length, index, flags] = data.slice(i, i + 5);
    if (![deltaLine, deltaCharacter, length, index, flags].every((n) => Number.isInteger(n) && n >= 0)) continue;
    line += deltaLine;
    character = deltaLine ? deltaCharacter : character + deltaCharacter;
    if (line >= starts.length || !length) continue;
    const from = starts[line] + character;
    const end = (starts[line + 1] ?? text.length + 1) - 1;
    if (from + length > end) continue;
    const has = (name: string) => { const at = legend.tokenModifiers.indexOf(name); return at >= 0 && at < 31 && !!(flags & (1 << at)); };
    const type = legend.tokenTypes[index];
    const kind: SymbolKind | undefined = ['type', 'class', 'interface', 'enum', 'struct', 'typeParameter', 'record'].includes(type) ? 'type'
      : ['method', 'function', 'annotationMember'].includes(type) ? 'method'
      : ['decorator', 'annotation'].includes(type) ? 'annotation'
      : type === 'enumMember' || has('readonly') && has('static') ? 'constant'
      : type === 'property' || type === 'field' ? 'field'
      : type === 'parameter' || type === 'recordComponent' ? 'parameter'
      : type === 'variable' ? 'variable'
      : ['keyword', 'modifier'].includes(type) ? 'keyword'
      : ['string', 'number', 'comment'].includes(type) ? type as SymbolKind : undefined;
    if (kind) spans.push({ from, to: from + length, kind, ...(has('static') ? { static: true } : {}), ...(has('deprecated') ? { deprecated: true } : {}) });
  }
  return spans;
}
