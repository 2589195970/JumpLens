import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { matchDocument, projectRoot, sourceFiles } from './project';

test('separate front/back repositories and duplicate Java identities are resolved without guessing', async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'java-project-test-')));
  const text = 'package demo;\npublic class User { String name; }';
  try {
    for (const dir of ['backend/src/main/java/demo', 'another/src/main/java/demo', 'frontend']) await mkdir(path.join(root, dir), { recursive: true });
    await writeFile(path.join(root, 'backend/pom.xml'), '<project/>');
    const file = path.join(root, 'backend/src/main/java/demo/User.java');
    await writeFile(file, text);
    assert.deepEqual(await matchDocument(root, text), [file]);
    assert.equal(await projectRoot(file, root), path.join(root, 'backend'));
    assert.deepEqual(await matchDocument(root, text.replace('String name', 'String draft')), [file], 'unsaved changes preserve file identity');
    assert.deepEqual(await matchDocument(root, text.replace('String name', 'String historical'), true), [], 'read-only historical content must not bind to a different current version');
    const duplicate = path.join(root, 'another/src/main/java/demo/User.java');
    await writeFile(duplicate, text);
    assert.deepEqual(new Set(await matchDocument(root, text)), new Set([file, duplicate]), 'the caller must choose between identical documents');
    await symlink(file, path.join(root, 'another/User.java'));
    assert.equal((await matchDocument(root, text)).length, 2, 'symlink aliases do not create a third identity');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('Vue and TypeScript use their own project root and preserve duplicate file identities', async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'web-project-test-')));
  try {
    for (const folder of ['web/src/admin', 'web/src/student', 'web/node_modules/demo']) await mkdir(path.join(root, folder), { recursive: true });
    await writeFile(path.join(root, 'web/jsconfig.json'), '{}');
    const text = '<script setup lang="ts">\nconst title: string = "Hello";\n</script>\n<template><h1>{{ title }}</h1></template>';
    const admin = path.join(root, 'web/src/admin/index.vue');
    const student = path.join(root, 'web/src/student/index.vue');
    await writeFile(admin, text);
    await writeFile(student, text);
    await writeFile(path.join(root, 'web/src/service.ts'), 'export const value = 1;');
    await writeFile(path.join(root, 'web/node_modules/demo/hidden.vue'), text);
    assert.deepEqual(new Set(await matchDocument(root, text)), new Set([admin, student]));
    assert.equal(await projectRoot(admin, root), path.join(root, 'web'));
    assert.equal((await sourceFiles(root)).length, 3, 'dependency sources are excluded from file matching');
  } finally { await rm(root, { recursive: true, force: true }); }
});
