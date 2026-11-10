import { basicSetup } from 'codemirror';
import { javaLanguage } from '@codemirror/lang-java';
import { indentUnit, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { classHighlighter, styleTags, tagHighlighter, tags } from '@lezer/highlight';
import { vueCode } from './vue-language';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { sass } from '@codemirror/lang-sass';
import type { CodeLanguage } from '../src/languages';
export { languageForPath } from '../src/languages';

export const javaNavigationLanguage = javaLanguage.configure({ props: [styleTags({
  'ClassDeclaration/Definition InterfaceDeclaration/Definition EnumDeclaration/Definition RecordDeclaration/Definition AnnotationTypeDeclaration/Definition': tags.definition(tags.className),
  'MethodDeclaration/Definition ConstructorDeclaration/Definition AnnotationTypeElementDeclaration/Definition': tags.definition(tags.function(tags.variableName)),
  'MarkerAnnotation/Identifier Annotation/Identifier': tags.annotation
})] });

export const memberHighlighter = tagHighlighter([
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'tok-method' },
  { tag: [tags.constant(tags.variableName), tags.constant(tags.propertyName)], class: 'tok-constant' },
  { tag: tags.tagName, class: 'tok-tagName' },
  { tag: tags.attributeName, class: 'tok-attributeName' }
]);
export const stylesheetHighlighter = tagHighlighter([
  { tag: tags.propertyName, class: 'tok-css-property' },
  { tag: tags.className, class: 'tok-css-class' },
  { tag: tags.constant(tags.className), class: 'tok-css-pseudo' },
  { tag: [tags.variableName, tags.special(tags.variableName)], class: 'tok-css-variable' },
  { tag: [tags.atom, tags.color], class: 'tok-css-value' },
  { tag: tags.unit, class: 'tok-css-unit' }
], { scope: (node) => node.name === 'StyleSheet' || node.name === 'Styles' });

/** Token classes use the editor's own light/dark syntax palette, independent of button colors. */
export const javaSyntax = [syntaxHighlighting(classHighlighter), syntaxHighlighting(memberHighlighter), syntaxHighlighting(stylesheetHighlighter)];
export function codeEditor(language: CodeLanguage) {
  const syntax = language === 'java' ? new LanguageSupport(javaNavigationLanguage)
    : language === 'vue' ? vueCode
    : language === 'scss' || language === 'sass' ? sass({ indented: language === 'sass' })
    : language === 'json' ? json() : language === 'css' ? css() : language === 'html' ? html()
    : javascript({ typescript: language === 'typescript' || language === 'tsx', jsx: language === 'jsx' || language === 'tsx' });
  return [basicSetup, syntax, indentUnit.of(language === 'java' ? '    ' : '  '), keymap.of([indentWithTab]), ...javaSyntax];
}
export const javaEditor = codeEditor('java');
