import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { javaNavigationLanguage, memberHighlighter, stylesheetHighlighter } from './language';
import { codeEditor } from './language';
import { EditorState } from '@codemirror/state';
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language';

test('Java keywords, strings, numbers, types, annotations, comments and methods receive distinct token classes', () => {
  const sample = '@Deprecated\npublic class Demo {\n  // comment\n  String name = "Java";\n  int run() { return 42; }\n}';
  const tree = javaNavigationLanguage.parser.parse(sample);
  const tokens: { text: string; classes: string }[] = [];
  highlightTree(tree, [classHighlighter, memberHighlighter], (from, to, classes) => tokens.push({ text: sample.slice(from, to), classes }));
  for (const [text, kind] of [['public', 'tok-keyword'], ['"Java"', 'tok-string'], ['42', 'tok-number'], ['String', 'tok-typeName'], ['// comment', 'tok-comment'], ['Deprecated', 'tok-meta'], ['run', 'tok-method']]) {
    assert(tokens.some((token) => token.text === text && token.classes.includes(kind)), `${text} should use ${kind}`);
  }
});

function tokensFor(text: string) {
  const state = EditorState.create({ doc: text, extensions: codeEditor('vue') });
  const tree = ensureSyntaxTree(state, text.length, 1000)!;
  const tokens: { text: string; classes: string; from: number }[] = [];
  highlightTree(tree, [classHighlighter, memberHighlighter, stylesheetHighlighter], (from, to, classes) => tokens.push({ text: text.slice(from, to), classes, from }));
  return { tokens, tree };
}

test('Java syntax fallback separates class names, fields, parameters, locals and called methods', () => {
  const text = 'class Demo { String field; int run(int parameter) { int local = parameter; return field.length() + local; } }';
  const tokens: { text: string; classes: string }[] = [];
  highlightTree(javaNavigationLanguage.parser.parse(text), [classHighlighter, memberHighlighter], (from, to, classes) => tokens.push({ text: text.slice(from, to), classes }));
  for (const [name, kind] of [['Demo', 'tok-className'], ['field', 'tok-propertyName'], ['parameter', 'tok-parameter'], ['local', 'tok-variableName'], ['run', 'tok-method'], ['length', 'tok-method']]) {
    assert(tokens.some((token) => token.text === name && token.classes.includes(kind)), `${name} must have ${kind} fallback coloring`);
  }
});

test('Vue SCSS styles retain nested selectors, variables, units and line comments after a long script', () => {
  const text = `<template><div :style="containerStyle" /></template>
<script>\nexport default { methods: {\n${'  run() { return 1; },\n'.repeat(600)}} };\n</script>
<style scoped lang="scss">
@import "./tree-variables.scss";
::v-deep .el-tree-node__content:hover {
  background-color: $v-bgHoverColor !important;
  transition: all $v-transitionTime; // 增加 hover 效果
  .m-el-tree-box { height: calc(100% - 52px); }
}
</style>`;
  const { tokens, tree } = tokensFor(text);
  assert.equal(tree.length, text.length);
  for (const [text, kind] of [['el-tree-node__content', 'tok-css-class'], ['v-deep', 'tok-css-pseudo'], ['background-color', 'tok-css-property'], ['$v-bgHoverColor', 'tok-css-variable'], ['$v-transitionTime', 'tok-css-variable'], ['52', 'tok-number'], ['px', 'tok-css-unit'], ['// 增加 hover 效果', 'tok-comment']]) {
    assert(tokens.some((token) => token.text === text && token.classes.includes(kind)), `${text} should use ${kind}`);
  }
});

test('Vue directive arguments, modifiers, slots and bound JavaScript expressions have separate tokens', () => {
  const text = `<template><el-tree :filter-node-method="filterNode" @node-click.stop="nodeClick"
  v-on:update:model-value="onUpdate" v-custom-directive:some-arg="value"
  :[eventName]="handler" #default="{ node, data }" slot-scope="{ legacy }"
  :style="{'justify-content': active ? 'space-between' : 'none'}">
  {{ data.label.substring(0, 12) + '...' }}
</el-tree></template>`;
  const { tokens, tree } = tokensFor(text);
  const errors: number[] = [];
  tree.iterate({ enter: (node) => { if (node.type.isError) errors.push(node.from); } });
  assert.deepEqual(errors, [], 'valid Vue attributes must not produce recovery nodes');
  for (const name of ['filter-node-method', 'node-click', 'stop', 'update:model-value', 'some-arg', 'default']) {
    assert(tokens.some((token) => token.text === name && token.classes.includes('tok-attributeName')), name);
  }
  for (const name of ['filterNode', 'nodeClick', 'active', 'eventName']) {
    assert(tokens.some((token) => token.text === name && token.classes.includes('tok-variableName') && !token.classes.includes('tok-string')), name);
  }
  for (const name of ['node', 'data', 'legacy']) assert(tokens.some((token) => token.text === name && /tok-(variableName|propertyName)/.test(token.classes) && !token.classes.includes('tok-string')), name);
  assert(tokens.some((token) => token.text === "'space-between'" && token.classes.includes('tok-string')));
});

test('Vue supports indented Sass blocks alongside SCSS and plain CSS', () => {
  const text = '<template><div /></template>\n<style lang="sass">\n$space: 10px\n.card\n  padding: $space\n  // nested comment\n  .title\n    color: red\n</style>';
  const { tokens } = tokensFor(text);
  for (const [text, kind] of [['$space', 'tok-css-variable'], ['padding', 'tok-css-property'], ['title', 'tok-css-class'], ['// nested comment', 'tok-comment']]) assert(tokens.some((token) => token.text === text && token.classes.includes(kind)), text);
});

test('Vue SFC highlights template directives, TypeScript script and CSS independently', () => {
  const text = '<template><button v-if="ready">{{ title }}</button></template>\n<script setup lang="ts">\nconst ready: boolean = true;\nconst title = "你好";\n</script>\n<style>.button { color: red; }</style>';
  const state = EditorState.create({ doc: text, extensions: codeEditor('vue') });
  const tokens: { text: string; classes: string }[] = [];
  highlightTree(syntaxTree(state), [classHighlighter, memberHighlighter], (from, to, classes) => tokens.push({ text: text.slice(from, to), classes }));
  for (const [text, kind] of [['button', 'tok-tagName'], ['v-if', 'tok-keyword'], ['const', 'tok-keyword'], ['"你好"', 'tok-string'], ['color', 'tok-propertyName']]) {
    assert(tokens.some((token) => token.text === text && token.classes.includes(kind)), `${text} should use ${kind}`);
  }
});
