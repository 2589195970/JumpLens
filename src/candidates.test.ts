import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchTargets, sourcePreview, targetKey, uniqueTargets } from './candidates';
import { describeTarget } from './target-source';
import type { Target } from './types';

const range = { start: { line: 2, character: 9 }, end: { line: 2, character: 13 } };
const candidate = (module: string, pkg: string): Target => ({ uri: `file:///project/${module}/src/main/java/${pkg.replaceAll('.', '/')}/UserService.java`, label: `${module}/src/main/java/${pkg.replaceAll('.', '/')}/UserService.java`, range });

test('Vue target metadata remains a valid Orca JSON response without Java package fields', () => {
  const target = describeTarget({ uri: 'file:///project/web/Card.vue', label: 'Card.vue', range }, '<script>\nexport default {\nmethods: { load() {} }\n}\n</script>', '/project');
  assert.deepEqual(target, JSON.parse(JSON.stringify(target)), 'optional fields must be omitted instead of undefined');
  assert(!Object.hasOwn(target, 'packageName'));
});

test('same-name files in distinct packages and modules remain distinct and can be filtered independently', () => {
  const first = candidate('admin', 'com.admin');
  const second = candidate('student', 'com.student');
  const all = uniqueTargets([first, second, first]);
  assert.equal(all.length, 2);
  assert.notEqual(targetKey(first), targetKey(second));
  assert.deepEqual(searchTargets(all, 'student UserService'), [second]);
  assert.deepEqual(searchTargets(all, 'UserService'), all);
  assert.deepEqual(searchTargets(all, 'notfound'), []);
  assert.equal(searchTargets(all, 'UsrSvc').length, 2, 'abbreviated names match both files');
});

test('candidate metadata gives package, module, method signature and precise source range', () => {
  const item = candidate('admin', 'com.admin');
  const result = describeTarget(item, 'package com.admin;\nclass UserService {\n  String load(int id) { return "ok"; }\n}', '/project');
  assert.equal(result.module, 'admin');
  assert.equal(result.packageName, 'com.admin');
  assert.equal(result.symbol, 'load');
  assert(result.signature?.includes('load(int id)'));
});

test('preview crops code without losing original line numbers or target coordinates', () => {
  const text = Array.from({ length: 100 }, (_, index) => `line ${index}`).join('\n');
  const point = { start: { line: 50, character: 2 }, end: { line: 50, character: 5 } };
  const preview = sourcePreview(text, point, 'UserService.java');
  assert.equal(preview.firstLine + preview.range.start.line, 50);
  assert.equal(preview.text.split('\n')[preview.range.start.line], 'line 50');
  assert.equal(preview.range.start.character, 2);
});
