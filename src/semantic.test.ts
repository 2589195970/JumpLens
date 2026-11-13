import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeSemanticTokens } from './semantic';

test('semantic tokens distinguish classes, methods, fields, parameters, variables and constants', () => {
  const text = 'Demo run field arg local VALUE';
  const legend = { tokenTypes: ['class', 'method', 'property', 'parameter', 'variable'], tokenModifiers: ['static', 'readonly', 'deprecated'] };
  const data = [0, 0, 4, 0, 0, 0, 5, 3, 1, 1, 0, 4, 5, 2, 0, 0, 6, 3, 3, 0, 0, 4, 5, 4, 0, 0, 6, 5, 2, 3];
  const spans = decodeSemanticTokens(text, data, legend);
  assert.deepEqual(spans.map((span) => [text.slice(span.from, span.to), span.kind]), [['Demo', 'type'], ['run', 'method'], ['field', 'field'], ['arg', 'parameter'], ['local', 'variable'], ['VALUE', 'constant']]);
  assert.equal(spans[1].static, true);
});

test('semantic positions use UTF-16 and preserve CRLF line offsets', () => {
  const text = '// 😀\r\nclass 中文 {}';
  const spans = decodeSemanticTokens(text, [1, 6, 2, 0, 0], { tokenTypes: ['class'], tokenModifiers: [] });
  assert.equal(text.slice(spans[0].from, spans[0].to), '中文');
});

test('out-of-range, incomplete and unknown semantic tokens do not color unrelated source', () => {
  assert.deepEqual(decodeSemanticTokens('abc', [0, 1, 9, 0, 0, 0, 1, 1, 8, 0, 1], { tokenTypes: ['class'], tokenModifiers: [] }), []);
});
