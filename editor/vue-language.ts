import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { sass, sassLanguage } from '@codemirror/lang-sass';
import { parseMixed } from '@lezer/common';
import { styleTags, tags } from '@lezer/highlight';
import { parser } from './vue-parser';

const expression = javascriptLanguage.parser.configure({ top: 'SingleExpression' });
const attributes = parser.configure({
  top: 'Attribute',
  props: [styleTags({
    'VueAttributeName SlotScopeName': tags.keyword,
    'ArgumentName ModifierName AttributeName': tags.attributeName,
    'AttributeValue ScriptAttributeValue': tags.attributeValue,
    Entity: tags.character,
    Is: tags.definitionOperator,
    '"@" ":" "#" "." "[" "]"': tags.punctuation
  })],
  wrap: parseMixed((node) => node.name === 'AttributeScript' || node.name === 'DynamicArgument' ? { parser: expression } : null)
});
const content = parser.configure({
  props: [styleTags({ Text: tags.content, Entity: tags.character, '"{{" "}}"': tags.brace })],
  wrap: parseMixed((node) => node.name === 'InterpolationContent' ? { parser: expression } : null)
});
const base = html({
  selfClosingTags: true,
  nestedLanguages: [
    { tag: 'style', attrs: (attrs) => attrs.lang?.toLowerCase() === 'scss', parser: sassLanguage.parser },
    { tag: 'style', attrs: (attrs) => attrs.lang?.toLowerCase() === 'sass', parser: sassLanguage.parser.configure({ dialect: 'indented' }) }
  ]
});

export const vueCode = new LanguageSupport((base.language as LRLanguage).configure({
  wrap: parseMixed((node, input) => {
    if (node.name === 'Attribute' && /^(?:[@:#.]|v-|slot-scope\b|scope\b)/.test(input.read(node.from, node.to))) return { parser: attributes };
    if (node.name === 'Text') return { parser: content };
    return null;
  })
}, 'vue'), [base.support, sass().support, base.language.data.of({ closeBrackets: { brackets: ['{', '"'] } })]);
