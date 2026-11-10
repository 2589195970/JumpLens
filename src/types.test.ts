import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocations } from './types';
test('both LSP location response shapes preserve symbol range and eliminate duplicate destinations', () => {
  const range = { start: { line: 3, character: 8 }, end: { line: 3, character: 12 } };
  const uri = 'file:///project/Thing.java';
  const locations = normalizeLocations([{ uri, range }, { targetUri: uri, targetRange: { start: { line: 1, character: 0 }, end: { line: 5, character: 0 } }, targetSelectionRange: range }]);
  assert.equal(locations.length, 1);
  assert.deepEqual(locations[0].range, range);
  assert.deepEqual(normalizeLocations(null), []);
});
