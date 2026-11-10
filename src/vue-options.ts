import type * as TypeScript from 'typescript';
import type { parse as ParseVue } from '@vue/compiler-dom';
import type { NavigationKind, Position, Target } from './types';

/** Component-local Options API navigation for legacy Vue templates. */
export function vueOptionsNavigation(ts: typeof TypeScript, parse: typeof ParseVue, uri: string, text: string, position: Position, kind: NavigationKind): Target[] {
  if (kind !== 'definition' && kind !== 'references') return [];
  try {
    const ast = parse(text, { parseMode: 'sfc' });
    const script = ast.children.find((node) => node.type === 1 && node.tag === 'script' && !node.props.some((prop) => prop.type === 6 && prop.name === 'setup'));
    const template = ast.children.find((node) => node.type === 1 && node.tag === 'template');
    if (!script || script.type !== 1 || !template || template.type !== 1) return [];
    const scriptText = script.children.find((node) => node.type === 2);
    if (!scriptText || scriptText.type !== 2) return [];
    const source = ts.createSourceFile('component.ts', scriptText.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const exported = source.statements.find(ts.isExportAssignment);
    if (!exported) return [];
    let options = exported.expression;
    if (ts.isCallExpression(options) && options.arguments[0]) options = options.arguments[0];
    if (!ts.isObjectLiteralExpression(options)) return [];
    const members = new Map<string, TypeScript.PropertyName[]>();
    const nameOf = (name: TypeScript.PropertyName | undefined) => name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
    const add = (name: TypeScript.PropertyName | undefined) => {
      const key = nameOf(name);
      if (key && name) members.set(key, [...(members.get(key) ?? []), name]);
    };
    for (const property of options.properties) {
      const key = nameOf(property.name);
      if (ts.isPropertyAssignment(property) && ['methods', 'computed', 'props'].includes(key ?? '') && ts.isObjectLiteralExpression(property.initializer)) {
        for (const member of property.initializer.properties) add(member.name);
      } else if (key === 'data' || key === 'setup') {
        const fn = ts.isMethodDeclaration(property) ? property : ts.isPropertyAssignment(property) && (ts.isFunctionExpression(property.initializer) || ts.isArrowFunction(property.initializer)) ? property.initializer : undefined;
        if (!fn?.body) continue;
        if (ts.isBlock(fn.body)) {
          for (const statement of fn.body.statements) if (ts.isReturnStatement(statement) && statement.expression && ts.isObjectLiteralExpression(statement.expression)) for (const member of statement.expression.properties) add(member.name);
        }
      }
    }
    const uses: { name: string; start: number; end: number }[] = [];
    const expression = (content: string, base: number) => {
      const expressionSource = ts.createSourceFile('expression.ts', content, ts.ScriptTarget.Latest, true);
      const locals = new Set<string>();
      const bindings = (node: TypeScript.Node) => {
        if ((ts.isParameter(node) || ts.isVariableDeclaration(node)) && ts.isIdentifier(node.name)) locals.add(node.name.text);
        ts.forEachChild(node, bindings);
      };
      bindings(expressionSource);
      const identifiers = (node: TypeScript.Node) => {
        if (ts.isIdentifier(node) && members.has(node.text) && !locals.has(node.text)) {
          const parent = node.parent;
          const propertyName = ts.isPropertyAccessExpression(parent) && parent.name === node;
          const objectKey = ts.isPropertyAssignment(parent) && parent.name === node;
          if ((!propertyName || parent.expression.kind === ts.SyntaxKind.ThisKeyword) && !objectKey) uses.push({ name: node.text, start: base + node.getStart(expressionSource), end: base + node.end });
        }
        ts.forEachChild(node, identifiers);
      };
      identifiers(expressionSource);
    };
    const visit = (node: typeof template.children[number], scoped = false): void => {
      if (node.type === 1) {
        // Slot and loop bindings belong to their local template scope.
        scoped ||= node.props.some((prop) => prop.type === 7 && (prop.name === 'for' || prop.name === 'slot'));
        if (!scoped) for (const prop of node.props) if (prop.type === 7 && prop.exp?.type === 4) expression(prop.exp.content, prop.exp.loc.start.offset);
        for (const child of node.children) visit(child, scoped);
      } else if (node.type === 5 && node.content.type === 4 && !scoped) expression(node.content.content, node.content.loc.start.offset);
    };
    for (const node of template.children) visit(node);
    const lines = text.split('\n');
    const offset = lines.slice(0, position.line).reduce((sum, line) => sum + line.length + 1, 0) + position.character;
    const name = uses.find((use) => offset >= use.start && offset < use.end)?.name ?? [...members].find(([, nodes]) => nodes.some((node) => offset >= scriptText.loc.start.offset + node.getStart(source) && offset < scriptText.loc.start.offset + node.end))?.[0];
    if (!name || members.get(name)?.length !== 1) return [];
    const point = (offset: number): Position => { const prefix = text.slice(0, offset).split('\n'); return { line: prefix.length - 1, character: prefix.at(-1)!.length }; };
    const result = (start: number, end: number): Target => ({ uri, label: uri.split('/').pop() ?? uri, symbol: name, range: { start: point(start), end: point(end) } });
    if (kind === 'references') return uses.filter((use) => use.name === name).map((use) => result(use.start, use.end));
    const declaration = members.get(name)![0];
    return [result(scriptText.loc.start.offset + declaration.getStart(source), scriptText.loc.start.offset + declaration.end)];
  } catch { return []; }
}
