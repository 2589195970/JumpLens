import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import type { SemanticSpan } from '../src/semantic';

const setSymbols = StateEffect.define<SemanticSpan[]>();
const symbols = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, transaction) {
    if (transaction.docChanged) value = Decoration.none;
    for (const effect of transaction.effects) if (effect.is(setSymbols)) {
      value = Decoration.set(effect.value.filter((span) => span.from >= 0 && span.to <= transaction.newDoc.length && span.from < span.to).map((span) =>
        Decoration.mark({ class: `symbol-${span.kind}${span.static ? ' symbol-static' : ''}${span.deprecated ? ' symbol-deprecated' : ''}` }).range(span.from, span.to)), true);
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field)
});

export function semanticHighlighting(load: (text: string, signal: AbortSignal) => Promise<SemanticSpan[]>) {
  return [symbols, ViewPlugin.fromClass(class {
    timer?: ReturnType<typeof setTimeout>;
    pending?: AbortController;
    disposed = false;
    constructor(readonly view: EditorView) { this.schedule(); }
    update(update: ViewUpdate) { if (update.docChanged) this.schedule(); }
    schedule() {
      clearTimeout(this.timer);
      this.pending?.abort();
      this.timer = setTimeout(() => { void this.refresh(); }, 650);
    }
    async refresh() {
      const controller = this.pending = new AbortController();
      const document = this.view.state.doc;
      try {
        const result = await load(document.toString(), controller.signal);
        if (!this.disposed && !controller.signal.aborted && this.view.state.doc === document) this.view.dispatch({ effects: setSymbols.of(result) });
      } catch { /* Syntax colors remain available while the language server imports the project. */ }
    }
    destroy() { this.disposed = true; clearTimeout(this.timer); this.pending?.abort(); }
  })];
}
