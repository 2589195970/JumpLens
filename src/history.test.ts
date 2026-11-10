import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NavigationHistory } from './history';
import type { Target } from './types';

const target = (name: string, line: number): Target => ({ uri: `file:///project/${name}.java`, label: name, range: { start: { line, character: 3 }, end: { line, character: 8 } } });
test('return restores source cursor, forward restores target and a new jump replaces forward history', () => {
  const history = new NavigationHistory();
  const source = target('Controller', 12), destination = target('Service', 40), another = target('Mapper', 5);
  history.record(source);
  assert.deepEqual(history.move('back', destination), source);
  assert.deepEqual(history.move('forward', source), destination);
  history.move('back', destination);
  history.record(source);
  assert.deepEqual(history.state, { back: true, forward: false });
  assert.equal(history.move('forward', another), undefined);
});

test('looking up a history destination preserves the stack until opening succeeds, including its viewport', () => {
  const history = new NavigationHistory();
  const original = { ...target('Controller', 250), viewport: { top: 4700, left: 180 } };
  history.record(original);
  assert.deepEqual(history.peek('back'), original);
  assert.deepEqual(history.peek('back')?.viewport, original.viewport);
  assert.deepEqual(history.state, { back: true, forward: false });
  assert.deepEqual(history.move('back', target('Service', 60)), original);
  assert.deepEqual(history.state, { back: false, forward: true });
});
