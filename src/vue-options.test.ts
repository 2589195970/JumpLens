import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { parse } from '@vue/compiler-dom';
import { vueOptionsNavigation } from './vue-options';

const uri = 'file:///demo/Card.vue';
const text = `<template>
  <button @click="toggleClick">{{ title }} {{ isActive }} {{ label }}</button>
  <div v-for="title in items">{{ title }}</div>
  <span>{{ other.title }}</span>
  <button @click="title => title()" />
</template>
<script>
export default {
  props: { isActive: Boolean },
  data() { return { title: 'Hello' } },
  computed: { label() { return this.title } },
  methods: { toggleClick() { this.$emit('toggleClick') } }
}
</script>`;
const point = (needle: string) => { const prefix = text.slice(0, text.indexOf(needle)).split('\n'); return { line: prefix.length - 1, character: prefix.at(-1)!.length + 1 }; };
test('Vue Options API template members resolve within the current component', () => {
  for (const name of ['toggleClick', 'title', 'isActive', 'label']) {
    const result = vueOptionsNavigation(ts, parse, uri, text, point(name), 'definition');
    assert.equal(result.length, 1, name);
    assert.equal(result[0].uri, uri);
    assert(result[0].range.start.line >= 8);
  }
});
test('template locals, nested object properties and arrow parameters do not resolve to component members', () => {
  for (const needle of ['title }}</div>', 'title }}</span>', 'title()']) assert.deepEqual(vueOptionsNavigation(ts, parse, uri, text, point(needle), 'definition'), [], needle);
  const references = vueOptionsNavigation(ts, parse, uri, text, point('title'), 'references');
  assert.equal(references.length, 1, 'only the component title expression is included');
});
