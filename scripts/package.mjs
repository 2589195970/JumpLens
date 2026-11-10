import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
const manifest = JSON.parse(await readFile('orca-plugin.json', 'utf8'));
const output = path.resolve('releases', `jumplens-${manifest.version}`);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const item of ['orca-plugin.json', 'README.md', 'dist', 'docs', 'LICENSE']) await cp(item, path.join(output, item), { recursive: true });
console.log(output);
