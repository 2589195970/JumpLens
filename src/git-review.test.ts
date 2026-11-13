import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { run } from './runtime';
import { changedPaths, gitRepositories, reviewCommit, revisionDocument, revisionWorkspace } from './git-review';

test('Git status parser preserves renamed paths, spaces, tabs and newlines', () => {
  assert.deepEqual(changedPaths('R100\0old name.java\0new\tname.java\0D\0gone\nname.java\0A\0added.java\0'), [
    { status: 'R100', beforePath: 'old name.java', afterPath: 'new\tname.java' },
    { status: 'D', beforePath: 'gone\nname.java' }, { status: 'A', afterPath: 'added.java' }
  ]);
});

test('root commits, renames, deletion and historical analysis stay bound to Git objects', async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), 'jumplens-review-'));
  const repository = path.join(workspace, 'repo');
  await mkdir(repository);
  const git = async (...args: string[]) => (await run('git', ['-C', repository, ...args], { env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' } })).stdout.trim();
  try {
    await git('init', '-q');
    await git('config', 'user.name', 'JumpLens Test'); await git('config', 'user.email', 'test@example.invalid');
    await writeFile(path.join(repository, 'Demo.java'), 'class Demo {\r\n int oldMethod() { return 1; }\r\n}\r\n');
    await symlink('/outside/Secret.java', path.join(repository, 'Link.java'));
    await git('add', '.'); await git('commit', '-qm', 'root');
    const root = await reviewCommit(repository, 'HEAD');
    assert.equal(root.parent, undefined);
    const original = root.files.find((file) => file.afterPath === 'Demo.java')!;
    assert.equal(await revisionDocument(repository, root, original, 'before'), undefined);
    assert.match((await revisionDocument(repository, root, original, 'after'))!.text, /oldMethod/);
    assert.equal((await revisionDocument(repository, root, original, 'after'))!.text.includes('\r'), false, 'display text and LSP use the same LF offsets');
    await git('mv', 'Demo.java', 'Renamed.java'); await git('commit', '-qm', 'rename');
    const renamed = await reviewCommit(repository, 'HEAD');
    assert.deepEqual(renamed.files, [{ status: 'R100', beforePath: 'Demo.java', afterPath: 'Renamed.java' }]);
    await writeFile(path.join(repository, 'Renamed.java'), 'class Demo { int currentMethod() { return 2; } }\n');
    const snapshot = await revisionWorkspace(repository, root.revision, path.join(workspace, 'cache'));
    assert.match(await readFile(path.join(snapshot, 'Demo.java'), 'utf8'), /oldMethod/);
    await assert.rejects(readFile(path.join(snapshot, 'Link.java')));
    assert.match(await readFile(path.join(repository, 'Renamed.java'), 'utf8'), /currentMethod/);
    assert.deepEqual(await gitRepositories(workspace), [await realpath(repository)]);
    await git('rm', '-f', 'Renamed.java'); await git('commit', '-qm', 'delete');
    const removed = await reviewCommit(repository, 'HEAD');
    assert.equal(removed.files[0].afterPath, undefined);
    assert.match((await revisionDocument(repository, removed, removed.files[0], 'before'))!.text, /oldMethod/);
    assert.equal(await revisionDocument(repository, removed, removed.files[0], 'after'), undefined);
    const branch = await git('symbolic-ref', '--short', 'HEAD');
    await git('checkout', '-qb', 'review-side', root.revision);
    await writeFile(path.join(repository, 'Side.java'), 'class Side {}\n');
    await git('add', 'Side.java'); await git('commit', '-qm', 'side');
    await git('checkout', '-q', branch); await git('merge', '--no-ff', '-m', 'merge side', 'review-side');
    const merged = await reviewCommit(repository, 'HEAD');
    assert.equal(merged.parent, removed.revision, 'merge reviews compare against the first parent');
    assert.deepEqual(merged.files, [{ status: 'A', afterPath: 'Side.java' }]);
    await assert.rejects(reviewCommit(repository, '--all'));
  } finally { await rm(workspace, { recursive: true, force: true }); }
});
