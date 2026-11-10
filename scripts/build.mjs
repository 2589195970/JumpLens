import { build } from 'esbuild';
import { mkdir, copyFile, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
await import('./generate-syntax.mjs');
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/worker.ts'], bundle: true, platform: 'node', format: 'esm', target: 'node22', outfile: 'dist/worker.mjs', packages: 'bundle', banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' } });
execFileSync(process.execPath, ['--check', 'dist/worker.mjs']);
await build({ entryPoints: ['editor/main.ts'], bundle: true, platform: 'browser', format: 'esm', target: 'chrome130', outfile: 'dist/editor.js', minify: true });
await copyFile('editor/index.html', 'dist/editor.html');
await copyFile('editor/picker.css', 'dist/picker.css');
await copyFile('editor/style.css', 'dist/style.css');
// Volar's upstream services load modules dynamically; preserve their Node package layout.
await rm('dist/web-server.cjs', { force: true });
await rm('dist/typescript', { recursive: true, force: true });
await rm('dist/web-runtime', { recursive: true, force: true });
const runtimeModules = path.resolve('dist/web-runtime/node_modules');
const copied = new Map();
async function copyPackage(name, from, parentModules = runtimeModules) {
  const require = createRequire(path.join(from, 'package.json'));
  let packageFile;
  try { packageFile = require.resolve(`${name}/package.json`); }
  catch {
    let directory = path.dirname(require.resolve(name));
    while (true) {
      const candidate = path.join(directory, 'package.json');
      try { if (JSON.parse(await readFile(candidate, 'utf8')).name === name) { packageFile = candidate; break; } } catch {}
      const next = path.dirname(directory);
      if (next === directory) throw new Error(`Cannot locate runtime package ${name}`);
      directory = next;
    }
  }
  const metadata = JSON.parse(await readFile(packageFile, 'utf8'));
  const installed = copied.get(name);
  if (installed === metadata.version) return;
  const target = path.join(installed ? parentModules : runtimeModules, name);
  if (!installed) copied.set(name, metadata.version);
  await cp(path.dirname(packageFile), target, { recursive: true, filter: (file) => {
    if (path.basename(file) === 'node_modules' || file.endsWith('.map')) return false;
    if (/\.(?:md|markdown|tsbuildinfo|yml|yaml)$/.test(file) && !/licen[cs]e/i.test(path.basename(file))) return false;
    // Declarations are runtime input for TypeScript itself; other packages execute JS.
    if (name !== 'typescript' && /\.(?:ts|mts|cts)$/.test(file)) return false;
    return true;
  } });
  for (const dependency of Object.keys(metadata.dependencies ?? {})) await copyPackage(dependency, path.dirname(packageFile), path.join(target, 'node_modules'));
}
await copyPackage('@vue/language-server', process.cwd());
await copyPackage('typescript', process.cwd());
await writeFile('dist/THIRD-PARTY-NOTICES.txt', 'CodeMirror and Lezer: MIT license, https://github.com/codemirror\nvscode-jsonrpc: MIT license, https://github.com/microsoft/vscode-languageserver-node\nEclipse JDT LS and Eclipse Temurin are downloaded separately from their official distribution services.\n');
await copyFile('editor/VUE-SYNTAX-LICENSE.txt', 'dist/VUE-SYNTAX-LICENSE.txt');
