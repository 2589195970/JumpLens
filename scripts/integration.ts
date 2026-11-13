import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LanguageServer } from '../src/language-server';
import { ensureRuntime } from '../src/runtime';
import type { Position } from '../src/types';

const runtime = await ensureRuntime({}, console.log);
const root = await realpath(await mkdtemp(path.join(tmpdir(), 'orca-java-integration-')));
const directory = path.join(root, 'src/main/java/demo');
await mkdir(directory, { recursive: true });
await writeFile(path.join(root, 'pom.xml'), '<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>demo</groupId><artifactId>navigation-test</artifactId><version>1.0</version><properties><maven.compiler.source>1.8</maven.compiler.source><maven.compiler.target>1.8</maven.compiler.target></properties></project>');
const files: Record<string, string> = {
  'Thing.java': 'package demo;\npublic class Thing {\n  public int pick(int x) { return x; }\n  public String pick(String x) { return x; }\n}\n',
  'Counter.java': 'package demo;\npublic interface Counter { int count(); }\n',
  'First.java': 'package demo;\npublic class First implements Counter { public int count() { return 1; } }\n',
  'Second.java': 'package demo;\npublic class Second implements Counter { public int count() { return 2; } }\n',
  'Use.java': 'package demo;\npublic class Use {\n  int run(Thing thing, Counter counter) {\n    String note = "中文😀"; return thing.pick(1) + counter.count() + note.length();\n  }\n}\n',
  'a/UserService.java': 'package demo.a;\npublic class UserService { public int load() { return 1; } }\n',
  'b/UserService.java': 'package demo.b;\npublic class UserService { public int load() { return 2; } }\n',
  'Choose.java': 'package demo;\nimport demo.b.UserService;\npublic class Choose { int run(UserService service) { return service.load(); } }\n',
  'Colors.java': 'package demo;\npublic class Colors {\n  private int field;\n  private static final int LIMIT = 7;\n  int compute(int parameter) { int local = parameter; return field + local + LIMIT; }\n}\n'
};
for (const [name, content] of Object.entries(files)) { await mkdir(path.dirname(path.join(directory, name)), { recursive: true }); await writeFile(path.join(directory, name), content); }
const server = new LanguageServer(root, runtime, console.log, (message) => { if (/error|exception/i.test(message)) console.error(message); });
const position = (text: string, token: string): Position => {
  const offset = text.indexOf(token) + 1;
  const before = text.slice(0, offset).split('\n');
  return { line: before.length - 1, character: before.at(-1)!.length };
};
const uri = pathToFileURL(path.join(directory, 'Use.java')).href;
const signal = AbortSignal.timeout(120_000);
try {
  await server.start();
  for (const [name, content] of Object.entries(files)) await server.sync(pathToFileURL(path.join(directory, name)).href, content);
  const definitions = await server.navigate(uri, files['Use.java'], position(files['Use.java'], 'pick(1)'), 'definition', signal);
  assert.equal(definitions.length, 1, 'integer overload resolves');
  assert.equal(definitions[0].uri, pathToFileURL(path.join(directory, 'Thing.java')).href);
  assert.equal(definitions[0].range.start.line, 2);
  console.log('PASS: cross-file definitions, overload resolution, Chinese and emoji columns');
  const unsaved = files['Use.java'].replace('thing.pick(1)', 'thing.pick("unsaved").length()');
  const changed = await server.navigate(uri, unsaved, position(unsaved, 'pick("unsaved")'), 'definition', signal);
  assert.equal(changed[0].range.start.line, 3);
  console.log('PASS: unsaved buffer selects the String overload');
  const implementations = await server.navigate(uri, files['Use.java'], position(files['Use.java'], 'count()'), 'implementation', signal);
  assert.equal(implementations.length, 2);
  console.log('PASS: multiple interface implementations');
  const counterUri = pathToFileURL(path.join(directory, 'Counter.java')).href;
  const references = await server.navigate(counterUri, files['Counter.java'], position(files['Counter.java'], 'count()'), 'references', signal);
  assert(references.some((target) => target.uri === uri), 'references include caller');
  console.log('PASS: semantic references');
  const library = await server.navigate(uri, files['Use.java'], position(files['Use.java'], 'length()'), 'definition', signal);
  assert(library[0]?.uri.startsWith('jdt:'), 'JDK source is a virtual document');
  const virtual = await server.virtualText(library[0].uri, signal);
  assert(virtual.includes('class String'), 'virtual source can be read');
  console.log('PASS: read-only JDK virtual source');
  const chooseUri = pathToFileURL(path.join(directory, 'Choose.java')).href;
  const sameName = await server.navigate(chooseUri, files['Choose.java'], position(files['Choose.java'], 'load()'), 'definition', signal);
  assert.equal(sameName.length, 1);
  assert(sameName[0].uri.endsWith('/demo/b/UserService.java'));
  console.log('PASS: same-name files resolve by imported package');
  const type = await server.navigate(uri, files['Use.java'], position(files['Use.java'], 'counter.count()'), 'typeDefinition', signal);
  assert(type.some((target) => target.uri.endsWith('/demo/Counter.java')));
  console.log('PASS: variable type navigation');
  const colorText = files['Colors.java'];
  const tokens = await server.semanticTokens(pathToFileURL(path.join(directory, 'Colors.java')).href, colorText, signal);
  for (const [name, kind] of [['Colors', 'type'], ['compute', 'method'], ['field', 'field'], ['parameter', 'parameter'], ['local', 'variable'], ['LIMIT', 'constant']]) {
    assert(tokens.some((token) => colorText.slice(token.from, token.to) === name && token.kind === kind), `${name} must receive semantic ${kind} coloring`);
  }
  console.log('PASS: real JDT LS semantic tokens distinguish classes, methods, fields, parameters, locals and constants');
} finally {
  server.dispose();
  await rm(root, { recursive: true, force: true });
}
