import { readFile, writeFile } from 'node:fs/promises';
import { buildParserFile } from '@lezer/generator';
const grammar = await readFile('editor/vue-syntax.grammar', 'utf8');
const result = buildParserFile(grammar, { fileName: 'editor/vue-syntax.grammar', typeScript: true });
await writeFile('editor/vue-parser.ts', result.parser);
