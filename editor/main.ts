import { EditorState, Compartment, Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { codeEditor, languageForPath } from './language';
import { languageName, type CodeLanguage } from '../src/languages';
import { icon, type IconName } from './icons';
import { start } from './sync';
import { setupPalette } from './palette';
import { semanticHighlighting } from './semantic';
import type { SemanticSpan } from '../src/semantic';
import { TargetPicker, type PickerItem } from './picker';
import { targetKey } from '../src/candidates';
import { errorMessage, type NavigationKind, type Range, type SourcePreview, type Target, type Viewport } from '../src/types';

const element = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
for (const target of Array.from(document.querySelectorAll<HTMLElement>('[data-icon]'))) target.prepend(icon(target.dataset.icon as IconName));
const more = element<HTMLDetailsElement>('more-actions');
document.addEventListener('pointerdown', (event) => { if (!more.contains(event.target as Node)) more.open = false; });
more.addEventListener('click', (event) => { if ((event.target as HTMLElement).closest('button')) more.open = false; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && more.open) { more.open = false; more.querySelector('summary')?.focus(); } });
const isMac = /Mac/.test(navigator.platform);
if (!isMac) { element('file-shortcut').textContent = 'Ctrl⇧N'; element('type-definition').querySelector('kbd')!.textContent = 'Ctrl⇧B'; element('quick-definition').querySelector('kbd')!.textContent = 'Alt+Space'; }
const buttons = ['definition', 'implementation', 'references', 'type-definition', 'quick-definition', 'find-file'].map((id) => element<HTMLButtonElement>(id));
let uri = '';
let displayedUri = '';
let connected = false;
let busy = false;
let requestId = 0;
let activeRequest: AbortController | undefined;
let synchronize: ReturnType<typeof setTimeout> | undefined;
let virtualView: EditorView | undefined;
let replacing = false;
let bindingVersion = 0;
const editMode = new Compartment();
const languageMode = new Compartment();
const semanticMode = new Compartment();
let language: CodeLanguage = 'java';
let picker: TargetPicker | undefined;

function virtualMode(open: boolean): void {
  for (const child of Array.from(document.body.children)) {
    if (child instanceof HTMLElement && child.id !== 'virtual' && child.tagName !== 'SCRIPT') child.inert = open;
  }
  element('virtual').classList.toggle('open', open);
}

function status(message: string, error = false): void {
  element('status-text').textContent = message;
  element('status').classList.toggle('error', error);
}
async function request<T>(name: string, input: unknown = {}, signal?: AbortSignal): Promise<T> {
  return await orca.plugin.request(name, input as never, { timeoutMs: 120_000, signal }) as T;
}
function enabled(): void {
  for (const button of buttons) button.disabled = !connected || busy;
  if (busy) { element<HTMLButtonElement>('back').disabled = true; element<HTMLButtonElement>('forward').disabled = true; }
}

const theme = EditorView.theme({
  '&': { color: 'var(--ui-text)', backgroundColor: 'var(--ui-code)' },
  '.cm-gutters': { backgroundColor: 'var(--ui-code)', color: 'var(--ui-faint)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--ui-hover) 65%, transparent)' },
  '.cm-cursor': { borderLeftColor: 'var(--ui-text)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'var(--ui-selected)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-panels': { backgroundColor: 'var(--orca-card)', color: 'var(--orca-foreground)' },
  '.cm-searchMatch': { backgroundColor: 'color-mix(in srgb, var(--orca-primary) 30%, transparent)' }
});

function position(offset: number): { line: number; character: number } {
  const line = view.state.doc.lineAt(offset);
  return { line: line.number - 1, character: offset - line.from };
}
function selection(): Range {
  const selected = view.state.selection.main;
  return { start: position(selected.from), end: position(selected.to) };
}
function viewport(): Viewport { return { top: view.scrollDOM.scrollTop, left: view.scrollDOM.scrollLeft }; }
function reveal(range: Range, editor = view, scroll?: Viewport, done?: () => void): void {
  const offset = (point: { line: number; character: number }) => {
    const line = editor.state.doc.line(Math.max(1, Math.min(editor.state.doc.lines, point.line + 1)));
    return line.from + Math.min(line.length, Math.max(0, point.character));
  };
  const anchor = offset(range.start), head = offset(range.end);
  editor.dispatch({ selection: { anchor, head }, effects: EditorView.scrollIntoView(anchor, { y: 'center' }) });
  // Orca may deliver a document before its isolated frame has completed layout.
  editor.requestMeasure({
    read: () => ({ top: editor.lineBlockAt(anchor).top, height: editor.scrollDOM.clientHeight }),
    write: ({ top, height }) => {
      editor.scrollDOM.scrollTop = scroll ? scroll.top : Math.max(0, top - height / 3);
      if (scroll) editor.scrollDOM.scrollLeft = scroll.left;
      done?.();
    }
  });
  editor.focus();
}

const doc = await start();
await setupPalette(element<HTMLSelectElement>('syntax-palette'));
if (/^\s*<(?:template|script|style)\b/m.test(doc.value)) language = 'vue';
else if (/^\s*(?:import\s+.+['"]|export\s|(?:const|let)\s)/m.test(doc.value)) language = 'typescript';
element('language-name').textContent = languageName(language);
const fileStates = new Map<string, { state: EditorState; viewport: Viewport }>();
function createState(text: string): EditorState {
  return EditorState.create({
    doc: text,
    extensions: [languageMode.of(codeEditor(language)), semanticMode.of([]), theme, editMode.of(EditorState.readOnly.of(doc.readOnly)),
      EditorView.contentAttributes.of({ 'aria-label': '代码', spellcheck: 'false' }),
      Prec.highest(keymap.of([
        { key: 'Mod-b', run: () => { void navigate('definition'); return true; } },
        { key: 'F12', run: () => { void navigate('definition'); return true; } },
        { key: 'Mod-Alt-b', run: () => { void navigate('implementation'); return true; } },
        { key: 'Mod-Shift-b', run: () => { void navigate('typeDefinition'); return true; } },
        { key: 'Alt-Space', run: () => { void navigate('definition', true); return true; } },
        { key: 'Mod-Shift-o', run: () => { findFile(); return true; } },
        { key: 'Ctrl-Shift-n', run: () => { findFile(); return true; } },
        { key: 'Shift-F12', run: () => { void navigate('references'); return true; } },
        { key: 'Alt-F7', run: () => { void navigate('references'); return true; } },
        { key: 'Ctrl-Alt-ArrowLeft', mac: 'Mod-[', run: () => { void history('back'); return true; } },
        { key: 'Ctrl-Alt-ArrowRight', mac: 'Mod-]', run: () => { void history('forward'); return true; } },
        { key: 'Alt-ArrowLeft', run: () => { void history('back'); return true; } },
        { key: 'Alt-ArrowRight', run: () => { void history('forward'); return true; } },
        { key: 'Escape', run: () => { closeResults(); return true; } }
      ])),
      EditorView.domEventHandlers({
        mousedown(event, editor) {
          if (event.button !== 0 || (!event.metaKey && !event.ctrlKey)) return false;
          const at = editor.posAtCoords({ x: event.clientX, y: event.clientY });
          if (at === null) return false;
          editor.dispatch({ selection: { anchor: at } });
          void navigate('definition');
          event.preventDefault();
          return true;
        }
      }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || replacing) return;
        doc.change(update.state.doc.toString());
        activeRequest?.abort();
        requestId++;
        if (synchronize) clearTimeout(synchronize);
        if (connected) synchronize = setTimeout(() => {
          void request('sync', { text: doc.value }).catch((error) => status(errorMessage(error), true));
        }, 600);
      })
    ]
  });
}
const view = new EditorView({ parent: element('editor'), state: createState(doc.value) });
doc.onReplace((text) => {
  picker?.close();
  activeRequest?.abort();
  activeRequest = undefined;
  busy = false;
  requestId++;
  if (synchronize) clearTimeout(synchronize);
  if (displayedUri) {
    fileStates.delete(displayedUri);
    fileStates.set(displayedUri, { state: view.state, viewport: viewport() });
    if (fileStates.size > 20) fileStates.delete(fileStates.keys().next().value!);
  }
  connected = false;
  uri = '';
  enabled();
  if (text !== view.state.doc.toString()) {
    // New contents start a fresh undo history; restore only after binding the document URI.
    view.setState(createState(text));
    displayedUri = '';
  }
  void connect();
});

async function connect(chosenPath?: string): Promise<void> {
  const version = ++bindingVersion;
  status('正在识别当前文件…');
  try {
    const result = await request<{ uri?: string; path?: string; root?: string; selection?: Range; viewport?: Viewport; navigationId?: number; candidates?: { path: string; label: string }[] }>('attach', { text: doc.value, readOnly: doc.readOnly, ...(chosenPath ? { path: chosenPath } : {}) });
    if (version !== bindingVersion) return;
    if (result.candidates) {
      picker?.close();
      picker = new TargetPicker({ title: '选择当前文件路径', onClose: () => view.focus(), onError: (error) => status(errorMessage(error), true), items: result.candidates.map((item) => ({
        id: item.path, title: item.path.split('/').pop()!, context: item.label, detail: '当前文档内容匹配到多个工程文件',
        preview: (signal) => request<SourcePreview>('preview-source', { path: item.path }, signal), choose: () => connect(item.path)
      })) });
      status('找到多个同名文件，请选择当前文件路径');
      return;
    }
    if (!result.uri || !result.path) throw new Error('无法识别当前文件');
    uri = result.uri;
    language = languageForPath(result.path);
    const cached = fileStates.get(uri);
    if (displayedUri !== uri && cached?.state.doc.toString() === doc.value) {
      view.setState(cached.state);
      view.dispatch({ effects: editMode.reconfigure(EditorState.readOnly.of(doc.readOnly)) });
      if (!result.selection) requestAnimationFrame(() => { view.scrollDOM.scrollTop = cached.viewport.top; view.scrollDOM.scrollLeft = cached.viewport.left; });
    } else if (displayedUri && displayedUri !== uri) view.setState(createState(doc.value));
    displayedUri = uri;
    view.dispatch({ effects: languageMode.reconfigure(codeEditor(language)) });
    view.dispatch({ effects: semanticMode.reconfigure(language === 'java' ? semanticHighlighting((text, signal) => request<SemanticSpan[]>('semantic', { text }, signal)) : []) });
    element('language-name').textContent = languageName(language);
    connected = true;
    enabled();
    element('path').textContent = `\u200e${result.path}`;
    element('path').title = result.path;
    status(`${languageName(language)} · 已连接`);
    if (result.selection) reveal(result.selection, view, result.viewport, () => { void request('reveal-done', { uri: result.uri, navigationId: result.navigationId }).catch(() => {}); });
    await updateHistory();
  } catch (error) { if (version === bindingVersion) status(errorMessage(error), true); }
}

function candidate(target: Target, previewOnly = false, grouped = false): PickerItem {
  const filename = target.label.split('/').pop() ?? target.label;
  const name = target.symbol || filename;
  const context = [target.packageName, target.module, `${target.label}:${target.range.start.line + 1}`].filter(Boolean).join(' · ');
  return {
    id: targetKey(target), title: name === filename ? filename : `${name} — ${filename}`, context, detail: target.signature,
    ...(grouped ? { group: target.label } : {}),
    preview: (signal) => request<SourcePreview>('preview', target, signal),
    choose: () => openTarget(target, previewOnly)
  };
}

function findFile(): void {
  if (!connected || busy) return;
  picker?.close();
  picker = new TargetPicker({ title: '文件', onClose: () => view.focus(), onError: (error) => status(errorMessage(error), true), load: async (query, signal) => {
    const result = await request<{ targets: Target[]; total: number }>('files', { query }, signal);
    return { items: result.targets.map((target) => candidate(target)), total: result.total };
  } });
}

async function navigate(kind: NavigationKind, previewOnly = false): Promise<void> {
  if (!connected || busy) return;
  if (synchronize) clearTimeout(synchronize);
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  const id = ++requestId;
  busy = true; enabled();
  status(kind === 'references' ? '正在查找引用…' : kind === 'implementation' ? '正在查找实现…' : '正在查找定义…');
  try {
    const result = await request<{ targets: Target[]; kind: NavigationKind }>('navigate', { text: view.state.doc.toString(), position: position(view.state.selection.main.head), kind }, controller.signal);
    if (id !== requestId || controller.signal.aborted) return;
    if (!result.targets.length) { status('没有找到结果。若工程正在首次分析，请稍后重试'); return; }
    const effective = result.kind ?? kind;
    if (result.targets.length === 1 && effective !== 'references') { await openTarget(result.targets[0], previewOnly); return; }
    const title = effective === 'references' ? '引用' : effective === 'implementation' ? '实现' : effective === 'typeDefinition' ? '类型' : '声明';
    const targets = effective === 'references' ? [...result.targets].sort((a, b) => a.label.localeCompare(b.label) || a.range.start.line - b.range.start.line) : result.targets;
    picker?.close();
    picker = new TargetPicker({ title: `选择${title}`, onClose: () => view.focus(), items: targets.map((target) => candidate(target, previewOnly, effective === 'references')), onError: (error) => status(errorMessage(error), true) });
    status(`找到 ${result.targets.length} 个${title}`);
  } catch (error) { if (!controller.signal.aborted) status(errorMessage(error), true); }
  finally {
    if (activeRequest === controller) {
      busy = false; enabled();
      if (connected) void updateHistory().catch(() => {});
    }
  }
}

function closeResults(): void { picker?.close(); view.focus(); }

async function openTarget(target: Target, previewOnly = false): Promise<void> {
  await doc.flush();
  const result = previewOnly
    ? await request<SourcePreview>('preview', target).then((source) => ({ virtual: true, text: source.text, label: source.path, range: source.range }))
    : await request<{ virtual?: boolean; text?: string; label?: string; range?: Range }>('open', { ...target, origin: selection(), originViewport: viewport() });
  if (result.virtual) {
    virtualView?.destroy();
    virtualMode(true);
    element('virtual-title').textContent = result.label ?? target.label;
    virtualView = new EditorView({ parent: element('virtual-editor'), doc: result.text ?? '', extensions: [codeEditor(languageForPath(result.label ?? target.label)), theme, EditorState.readOnly.of(true), EditorView.editable.of(false), EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': '只读依赖源码' })] });
    reveal(result.range ?? target.range, virtualView);
    element('close-virtual').focus();
  } else if (target.uri === uri) reveal(target.range);
  status('已定位目标');
  await updateHistory();
}

async function updateHistory(): Promise<void> {
  const result = await request<{ back: boolean; forward: boolean }>('history-state');
  element<HTMLButtonElement>('back').disabled = busy || !result.back;
  element<HTMLButtonElement>('forward').disabled = busy || !result.forward;
}
async function history(direction: 'back' | 'forward'): Promise<void> {
  if (!connected || busy) return;
  busy = true; enabled();
  try {
    await doc.flush();
    const result = await request<{ target?: Target & { viewport?: Viewport } }>('history', { direction, origin: selection(), viewport: viewport() });
    if (result.target?.uri === uri) reveal(result.target.range, view, result.target.viewport);
  } catch (error) { status(errorMessage(error), true); }
  finally { busy = false; enabled(); if (connected) await updateHistory().catch(() => {}); }
}

element('definition').addEventListener('click', () => { void navigate('definition'); });
element('implementation').addEventListener('click', () => { void navigate('implementation'); });
element('type-definition').addEventListener('click', () => { void navigate('typeDefinition'); });
element('quick-definition').addEventListener('click', () => { void navigate('definition', true); });
element('find-file').addEventListener('click', findFile);
element('references').addEventListener('click', () => { void navigate('references'); });
element('back').addEventListener('click', () => { void history('back'); });
element('forward').addEventListener('click', () => { void history('forward'); });
const closeVirtual = () => { virtualView?.destroy(); virtualView = undefined; virtualMode(false); view.focus(); };
element('close-virtual').addEventListener('click', closeVirtual);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && virtualView) { event.preventDefault(); closeVirtual(); }
  else if (event.key === 'Tab' && virtualView) {
    const close = element('close-virtual');
    const content = element('virtual-editor').querySelector<HTMLElement>('.cm-content')!;
    event.preventDefault();
    (document.activeElement === close ? content : close).focus();
  }
});
element('reconnect').addEventListener('click', () => {
  status('正在重新连接…');
  void connect().then(async () => { if (connected) { await request('restart'); status(`${languageName(language)} · 已重新连接`); } }).catch((error) => status(errorMessage(error), true));
});
orca.plugin.on('progress', (data) => { const message = (data as { message?: string }).message; if (message && !busy) status(message); });
orca.plugin.on('reveal', (data) => { const value = data as { uri: string; range: Range; viewport?: Viewport; navigationId?: number }; if (value.uri === uri) { reveal(value.range, view, value.viewport, () => { void request('reveal-done', { uri: value.uri, navigationId: value.navigationId }).catch(() => {}); }); void updateHistory(); } });
orca.plugin.on('history', () => { void updateHistory().catch(() => {}); });
window.addEventListener('pagehide', () => { activeRequest?.abort(); if (synchronize) clearTimeout(synchronize); void request('detach').catch(() => {}); doc.dispose(); });
void connect();
