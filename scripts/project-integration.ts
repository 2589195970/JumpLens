import assert from 'node:assert/strict';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ensureRuntime } from '../src/runtime';
import { LanguageServer } from '../src/language-server';

const [project, sourceFile, expression, expectedFile] = process.argv.slice(2);
if (!project || !sourceFile || !expression || !expectedFile) {
  throw new Error('Usage: tsx scripts/project-integration.ts <project-root> <source-file> <expression> <expected-file>');
}
const root = await realpath(project);
const file = await realpath(path.resolve(root, sourceFile));
const expected = await realpath(path.resolve(root, expectedFile));
const text = await readFile(file, 'utf8');
const offset = text.indexOf(expression);
assert(offset >= 0, 'The source must contain the requested expression');
const prefix = text.slice(0, offset + 1).split('\n');
const runtime = await ensureRuntime({}, console.log);
const server = new LanguageServer(root, runtime, console.log, (message) => { if (/exception|error/i.test(message)) console.error(message); });
try {
  const targets = await server.navigate(pathToFileURL(file).href, text, { line: prefix.length - 1, character: prefix.at(-1)!.length }, 'definition', AbortSignal.timeout(120_000));
  assert(targets.some((target) => target.uri === pathToFileURL(expected).href), 'The definition must resolve to the expected source file');
  console.log('PASS: project definition navigation', JSON.stringify(targets));
} finally { server.dispose(); }
