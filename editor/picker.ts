import { EditorState } from '@codemirror/state';
import { Decoration, EditorView, lineNumbers } from '@codemirror/view';
import { codeEditor, languageForPath } from './language';
import { icon } from './icons';
import { matchScore } from '../src/candidates';
import type { SourcePreview } from '../src/types';

export type PickerItem = {
  id: string;
  title: string;
  context: string;
  detail?: string;
  group?: string;
  preview: (signal: AbortSignal) => Promise<SourcePreview>;
  choose: () => void | Promise<void>;
};
type PickerOptions = {
  title: string;
  items?: PickerItem[];
  load?: (query: string, signal: AbortSignal) => Promise<{ items: PickerItem[]; total: number }>;
  onError: (error: unknown) => void;
  onClose?: () => void;
};

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] => {
  const value = document.createElement(tag);
  value.className = className;
  if (text !== undefined) value.textContent = text;
  return value;
};

/** One selection flow for source identity, navigation targets, references, and file search. */
export class TargetPicker {
  private overlay = node('div', 'java-picker-overlay');
  private input = node('input', 'java-picker-search');
  private list = node('div', 'java-picker-list');
  private count = node('span', 'java-picker-count');
  private progress = node('div', 'java-picker-progress');
  private previewHost = node('div', 'java-picker-code');
  private previewPath = node('div', 'java-picker-preview-path', '选择候选以预览源码');
  private previewView?: EditorView;
  private items: PickerItem[] = [];
  private selected = -1;
  private closed = false;
  private previewRequest?: AbortController;
  private queryRequest?: AbortController;
  private queryTimer?: ReturnType<typeof setTimeout>;
  private previousInert = new Map<HTMLElement, boolean>();
  private returnFocus = document.activeElement as HTMLElement | null;
  private rowElements: HTMLDivElement[] = [];

  constructor(private options: PickerOptions) {
    const dialog = node('section', 'java-picker');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', options.title);
    const heading = node('header', 'java-picker-header');
    heading.append(icon('search'), this.input, node('span', 'java-picker-mode', options.title), this.count);
    const close = node('button', 'java-picker-close');
    close.append(icon('close'));
    close.title = '关闭（Esc）';
    close.setAttribute('aria-label', '关闭候选选择');
    close.addEventListener('click', () => this.close());
    heading.append(close);
    this.input.placeholder = options.load ? '搜索文件名或路径…' : '筛选名称、包名或路径…';
    this.input.spellcheck = false;
    this.input.autocomplete = 'off';
    this.input.setAttribute('aria-label', '筛选导航候选');
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'true');
    this.input.setAttribute('aria-controls', 'java-picker-candidates');
    this.list.id = 'java-picker-candidates';
    this.list.setAttribute('role', 'listbox');
    this.list.setAttribute('aria-label', '导航候选');
    const body = node('div', 'java-picker-body');
    const preview = node('section', 'java-picker-preview');
    preview.setAttribute('aria-label', '候选代码预览');
    const previewHeader = node('div', 'java-picker-preview-header');
    previewHeader.append(this.previewPath, node('span', 'readonly-label', '只读'));
    preview.append(previewHeader, this.previewHost);
    body.append(this.list, preview);
    const footer = node('footer', 'java-picker-footer');
    const keys = node('div', 'java-picker-keys');
    for (const [key, label] of [['↑↓', '选择'], ['↵', '打开'], ['esc', '关闭']]) {
      const hint = node('span', ''); hint.append(node('kbd', '', key), document.createTextNode(label)); keys.append(hint);
    }
    footer.append(keys, node('span', 'java-picker-footer-hint', '输入路径可区分同名文件'));
    dialog.append(heading, this.progress, body, footer);
    this.overlay.append(dialog);
    for (const child of Array.from(document.body.children)) {
      if (child instanceof HTMLElement && child.tagName !== 'SCRIPT') { this.previousInert.set(child, child.inert); child.inert = true; }
    }
    document.body.append(this.overlay);
    this.overlay.addEventListener('mousedown', (event) => { if (event.target === this.overlay) this.close(); });
    this.overlay.addEventListener('keydown', (event) => this.keydown(event));
    this.input.addEventListener('input', () => {
      if (options.load) {
        if (this.queryTimer) clearTimeout(this.queryTimer);
        this.queryRequest?.abort();
        this.queryTimer = setTimeout(() => { void this.load(); }, 150);
      } else this.filter();
    });
    this.input.focus();
    if (options.load) void this.load(); else this.filter();
  }

  private filter(): void {
    const query = this.input.value;
    const all = this.options.items ?? [];
    const results = all.map((item, index) => ({ item, index, score: matchScore(`${item.title} ${item.context} ${item.detail ?? ''}`, query) }))
      .filter((item) => Number.isFinite(item.score)).sort((a, b) => a.score - b.score || a.index - b.index).map((item) => item.item);
    this.render(results, results.length);
  }

  private async load(): Promise<void> {
    this.queryRequest?.abort();
    const request = new AbortController();
    this.queryRequest = request;
    this.count.textContent = '正在搜索…';
    this.progress.classList.add('busy');
    this.list.setAttribute('aria-busy', 'true');
    try {
      const result = await this.options.load!(this.input.value, request.signal);
      if (!request.signal.aborted && !this.closed) this.render(result.items, result.total);
    } catch (error) { if (!request.signal.aborted && !this.closed) { this.count.textContent = '搜索失败'; this.options.onError(error); } }
    finally { if (this.queryRequest === request) { this.progress.classList.remove('busy'); this.list.setAttribute('aria-busy', 'false'); } }
  }

  private render(items: PickerItem[], total: number): void {
    const previous = this.items[this.selected]?.id;
    this.items = items;
    this.list.replaceChildren();
    this.rowElements = [];
    this.count.textContent = items.length < total ? `${items.length} / ${total}` : `${total}`;
    this.count.title = items.length < total ? '继续输入可缩小范围' : `${total} 个候选`;
    let group: string | undefined;
    for (const [index, item] of items.entries()) {
      if (item.group && item.group !== group) { this.list.append(node('div', 'java-picker-group', item.group)); group = item.group; }
      const row = node('div', 'java-picker-row');
      row.id = `java-picker-item-${index}`;
      row.setAttribute('role', 'option');
      row.setAttribute('aria-label', `${item.title} ${item.context}`);
      row.title = [item.title, item.context, item.detail].filter(Boolean).join('\n');
      const top = node('div', 'java-picker-row-top');
      const name = node('strong', 'java-picker-name');
      const query = this.input.value.trim().toLowerCase();
      const match = query ? item.title.toLowerCase().indexOf(query) : -1;
      if (match >= 0) name.append(document.createTextNode(item.title.slice(0, match)), node('b', '', item.title.slice(match, match + query.length)), document.createTextNode(item.title.slice(match + query.length)));
      else name.textContent = item.title;
      top.append(name, node('span', 'java-picker-context', `\u200e${item.context}`));
      row.append(top);
      if (item.detail) row.append(node('code', 'java-picker-detail', item.detail));
      row.addEventListener('mousedown', (event) => event.preventDefault());
      row.addEventListener('mousemove', () => { if (index !== this.selected) this.select(index); });
      row.addEventListener('click', () => { this.select(index); void this.commit(); });
      this.list.append(row);
      this.rowElements.push(row);
    }
    if (!items.length) {
      this.selected = -1;
      this.input.removeAttribute('aria-activedescendant');
      this.list.append(node('p', 'java-picker-empty', '没有匹配的候选，请修改筛选条件'));
      this.previewRequest?.abort();
      this.previewView?.destroy(); this.previewView = undefined;
      this.previewPath.textContent = '没有可预览的候选';
      return;
    }
    const preserved = items.findIndex((item) => item.id === previous);
    this.select(preserved >= 0 ? preserved : 0);
  }

  private select(index: number): void {
    if (!this.items.length) return;
    this.selected = Math.max(0, Math.min(this.items.length - 1, index));
    for (const [at, row] of this.rowElements.entries()) {
      row.classList.toggle('selected', at === this.selected);
      row.setAttribute('aria-selected', String(at === this.selected));
    }
    const row = this.rowElements[this.selected];
    this.input.setAttribute('aria-activedescendant', row.id);
    row.scrollIntoView({ block: 'nearest' });
    void this.preview(this.items[this.selected]);
  }

  private async preview(item: PickerItem): Promise<void> {
    this.previewRequest?.abort();
    const request = new AbortController();
    this.previewRequest = request;
    this.previewPath.textContent = '正在加载源码预览…';
    try {
      const source = await item.preview(request.signal);
      if (request.signal.aborted || this.closed || this.items[this.selected]?.id !== item.id) return;
      this.previewPath.textContent = `\u200e${source.path}`;
      this.previewPath.title = source.path;
      const previewDoc = EditorState.create({ doc: source.text }).doc;
      const lineNumber = Math.max(1, Math.min(previewDoc.lines, source.range.start.line + 1));
      const targetLine = previewDoc.line(lineNumber);
      const state = EditorState.create({ doc: previewDoc, extensions: [lineNumbers({ formatNumber: (line) => String(line + source.firstLine) }), codeEditor(languageForPath(source.path)), EditorView.decorations.of(Decoration.set([Decoration.line({ class: 'java-preview-target' }).range(targetLine.from)])), EditorState.readOnly.of(true), EditorView.editable.of(false), EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': '候选只读源码' })] });
      if (this.previewView) this.previewView.setState(state);
      else this.previewView = new EditorView({ parent: this.previewHost, state });
      const point = source.range.start;
      const line = this.previewView.state.doc.line(Math.max(1, Math.min(this.previewView.state.doc.lines, point.line + 1)));
      const offset = line.from + Math.min(line.length, point.character);
      this.previewView.dispatch({ selection: { anchor: offset }, effects: EditorView.scrollIntoView(offset, { y: 'center' }) });
    } catch (error) {
      if (!request.signal.aborted && !this.closed) this.previewPath.textContent = `无法预览：${error instanceof Error ? error.message : error}`;
    }
  }

  private async commit(): Promise<void> {
    const item = this.items[this.selected];
    if (!item) return;
    this.close();
    try { await item.choose(); } catch (error) { this.options.onError(error); }
  }

  private keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); event.stopPropagation(); this.select(this.selected + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && event.target === this.input) { event.preventDefault(); void this.commit(); }
    else if (event.key === 'Tab') {
      const controls = [this.input, ...Array.from(this.overlay.querySelectorAll<HTMLElement>('button, .cm-content[tabindex="0"]'))];
      const at = controls.indexOf(document.activeElement as HTMLElement);
      event.preventDefault(); controls[(at + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.previewRequest?.abort(); this.queryRequest?.abort();
    if (this.queryTimer) clearTimeout(this.queryTimer);
    this.previewView?.destroy();
    this.overlay.remove();
    for (const [child, inert] of this.previousInert) child.inert = inert;
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
    this.options.onClose?.();
  }
}
