import { mkdir, writeFile } from 'node:fs/promises';
import { palettes } from '../src/palette';

await mkdir('themes', { recursive: true });
const scopes = {
  keyword: ['keyword', 'storage.modifier', 'storage.type.primitive'], string: ['string'], number: ['constant.numeric', 'constant.language'],
  type: ['entity.name.type', 'entity.name.class', 'entity.name.interface', 'entity.name.enum', 'storage.type.java', 'support.class', 'support.type'],
  method: ['entity.name.function', 'meta.method-call', 'variable.function', 'support.function'],
  field: ['variable.other.object.property', 'variable.other.property', 'variable.other.member', 'variable.other.field'],
  parameter: ['variable.parameter'], variable: ['variable'], constant: ['variable.other.constant', 'constant.other'],
  annotation: ['storage.type.annotation', 'entity.name.type.annotation', 'punctuation.definition.annotation'], comment: ['comment']
} as const;
for (const [name, palette] of Object.entries(palettes)) {
  const tokenColors = Object.entries(scopes).map(([kind, scope]) => ({ scope, settings: { foreground: palette[kind as keyof typeof scopes] } }));
  await writeFile(`themes/${name}.json`, JSON.stringify({ schemaVersion: 1, base: 'dark', tokens: { '--background': palette.background, '--editor-surface': palette.background, '--foreground': palette.foreground }, tokenColors }, null, 2) + '\n');
}
const roles = Object.keys(scopes);
const aliases = roles.map((role) => `--java-${role}:var(--syntax-${role})`).join(';');
const semantic = roles.map((role) => `.cm-editor .symbol-${role},.cm-editor .symbol-${role} *{color:var(--syntax-${role})}`).join('\n');
await writeFile('dist/palette.css', `/* Generated from src/palette.ts; shared by source, previews and commit reading. */
:root,:root.light,:root.dark{${aliases};--ui-code:var(--syntax-background);--ui-text:var(--syntax-foreground)}
.cm-editor .tok-propertyName{color:var(--syntax-field)}
.cm-editor .tok-parameter{color:var(--syntax-parameter)}
${semantic}
.cm-editor .symbol-static{font-style:italic}.cm-editor .symbol-deprecated{text-decoration:line-through}
#syntax-palette{height:28px;max-width:140px;border:1px solid var(--ui-border);border-radius:5px;background:var(--ui-bg);color:var(--ui-text);font:inherit;font-size:12px;padding:0 6px}
`);
