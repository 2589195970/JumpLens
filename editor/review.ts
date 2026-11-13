import { EditorState, Prec } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { MergeView, goToNextChunk, goToPreviousChunk } from '@codemirror/merge';
import { codeEditor, languageForPath } from './language';
import { setupPalette } from './palette';
import { semanticHighlighting } from './semantic';
import type { SemanticSpan } from '../src/semantic';
import type { CommitSummary, ReviewCommit, RevisionDocument } from '../src/git-review';
import { errorMessage, type Range, type SourcePreview } from '../src/types';

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const repository = element<HTMLSelectElement>('repository');
const revision = element<HTMLInputElement>('revision');
const files = element('files');
const status = (message: string) => { element('status').textContent = message; };
const request = <T>(name: string, input: unknown = {}, signal?: AbortSignal) => orca.plugin.request(name, input as never, { timeoutMs: 120_000, signal }) as Promise<T>;
let merge: MergeView | undefined;
let preview: EditorView | undefined;
let generation = 0;
let loadId = 0;
let loading: AbortController | undefined;
let focused: EditorView | undefined;
let lastSide: 'before' | 'after' = 'after';
let documents: { before?: RevisionDocument; after?: RevisionDocument } = {};
let commit: ReviewCommit | undefined;
const documentSession = await orca.document!.session();
let preferences: { workspace?: string; repository?: string; revision?: string; file?: string } = {};
try {
  const value = JSON.parse(documentSession.value || '{}');
  for (const key of ['workspace', 'repository', 'revision', 'file'] as const) if (typeof value?.[key] === 'string') preferences[key] = value[key];
} catch { status('阅读配置无效，将使用当前工作区'); }
await setupPalette(element<HTMLSelectElement>('syntax-palette'));

function persist() {
  if (documentSession.readOnly) return;
  const text = JSON.stringify(preferences, null, 2) + '\n';
  if (text !== documentSession.value) documentSession.change(text);
}

function closePreview() { loading?.abort(); element('preview').hidden = true; preview?.destroy(); preview = undefined; focused?.focus(); }
const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--syntax-background)', color: 'var(--syntax-foreground)' },
  '.cm-gutters': { backgroundColor: 'var(--syntax-background)', color: 'var(--ui-muted)', border: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--syntax-foreground)' },
  '.cm-activeLine,.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb,var(--syntax-foreground) 5%,transparent)' },
  '.cm-selectionBackground,&.cm-focused .cm-selectionBackground': { backgroundColor: '#61afef30' }
});

function reveal(editor: EditorView, range: Range) {
  const line = editor.state.doc.line(Math.min(editor.state.doc.lines, range.start.line + 1));
  const at = line.from + Math.min(range.start.character, line.length);
  editor.dispatch({ selection: { anchor: at }, effects: EditorView.scrollIntoView(at, { y: 'center' }) });
}

async function definition(editor: EditorView, side: 'before' | 'after') {
  loading?.abort();
  const current = generation;
  const selected = editor.state.selection.main.head;
  const line = editor.state.doc.lineAt(selected);
  const controller = loading = new AbortController();
  status('正在查找同版本定义…');
  try {
    const results = await request<(SourcePreview & { revision: string })[]>('review-definition', { side, generation: current, position: { line: line.number - 1, character: selected - line.from } }, controller.signal);
    if (current !== generation || controller.signal.aborted) return;
    if (!results.length) { status('此版本没有可预览的定义'); return; }
    const target = element<HTMLSelectElement>('preview-target');
    target.replaceChildren(...results.map((result, i) => new Option(result.path, String(i))));
    target.hidden = results.length === 1;
    const show = () => {
      const result = results[Number(target.value)];
      preview?.destroy();
      element('preview').hidden = false;
      element('preview-title').textContent = `${result.revision.slice(0, 8)} · ${result.path}`;
      preview = new EditorView({ parent: element('preview-editor'), doc: result.text, extensions: [codeEditor(languageForPath(result.path)), theme, lineNumbers({ formatNumber: (n) => String(n + result.firstLine) }), EditorState.readOnly.of(true), EditorView.editable.of(false)] });
      reveal(preview, result.range);
      element('close-preview').focus();
    };
    target.onchange = show;
    show();
    status('定义来自当前提交侧的同版本源码');
  } catch (error) { if (!controller.signal.aborted && current === generation) status(errorMessage(error)); }
}

function extensions(document: RevisionDocument | undefined, side: 'before' | 'after', version: number) {
  const language = languageForPath(document?.path ?? 'unknown.txt');
  return [codeEditor(language), theme, EditorState.readOnly.of(true), EditorView.editable.of(false),
    EditorView.contentAttributes.of({ 'aria-label': side === 'before' ? '父提交只读源码' : '本次提交只读源码' }),
    ...(document && language === 'java' ? semanticHighlighting(async (_text, signal) => {
      try {
        const tokens = await request<SemanticSpan[]>('review-semantic', { side, generation: version }, signal);
        if (version === generation) status(tokens.length ? 'Java 语义着色已就绪 · Cmd/Ctrl+B 查看同版本定义' : 'Java 语法高亮 · Cmd/Ctrl+B 查看同版本定义');
        return tokens;
      } catch (error) {
        if (version === generation && !signal.aborted) status(`已显示语法高亮；符号分析暂不可用：${errorMessage(error)}`);
        throw error;
      }
    }) : []),
    Prec.highest(keymap.of([{ key: 'Mod-b', run: (view) => { void definition(view, side); return true; } }, { key: 'F12', run: (view) => { void definition(view, side); return true; } }])),
    EditorView.domEventHandlers({
      focus(_event, view) { focused = view; lastSide = side; return false; },
      mousedown(event, view) {
        focused = view; lastSide = side;
        if ((!event.metaKey && !event.ctrlKey) || event.button !== 0 || !document) return false;
        const at = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (at === null) return false;
        view.dispatch({ selection: { anchor: at } });
        void definition(view, side);
        return true;
      }
    })];
}

async function chooseFile(index: number) {
  const id = ++loadId;
  loading?.abort();
  closePreview();
  merge?.destroy(); merge = undefined;
  for (const child of Array.from(files.querySelectorAll<HTMLButtonElement>('button'))) child.setAttribute('aria-pressed', String(Number(child.dataset.index) === index));
  status('正在读取提交文件…');
  element('empty').hidden = false;
  try {
    const result = await request<{ before: RevisionDocument | null; after: RevisionDocument | null; generation: number }>('review-file', { index });
    if (id !== loadId) return;
    generation = result.generation;
    documents = { before: result.before ?? undefined, after: result.after ?? undefined };
    preferences.file = documents.after?.path ?? documents.before?.path;
    persist();
    const label = (doc: RevisionDocument | undefined) => doc ? `${doc.revision.slice(0, 8)} · ${doc.path}` : '此侧不存在文件';
    element('before-label').textContent = label(documents.before);
    element('after-label').textContent = label(documents.after);
    merge = new MergeView({ parent: element('merge'), a: { doc: documents.before?.text ?? '', extensions: extensions(documents.before, 'before', generation) }, b: { doc: documents.after?.text ?? '', extensions: extensions(documents.after, 'after', generation) }, collapseUnchanged: { margin: 5, minSize: 8 }, gutter: true });
    element('empty').hidden = true;
    element('chunks').textContent = `${merge.chunks.length} 处变更`;
    element<HTMLButtonElement>('previous').disabled = element<HTMLButtonElement>('next').disabled = !merge.chunks.length;
    focused = documents.after ? merge.b : merge.a;
    lastSide = documents.after ? 'after' : 'before';
    status('只读提交差异 · Java 符号分析在后台完成 · Cmd/Ctrl+B 查看定义');
    goToNextChunk(focused);
  } catch (error) { if (id === loadId) { status(errorMessage(error)); element('empty').textContent = errorMessage(error); } }
}

async function loadCommit() {
  const id = ++loadId;
  loading?.abort();
  closePreview();
  generation++;
  merge?.destroy(); merge = undefined;
  files.replaceChildren();
  element('empty').hidden = false;
  element('empty').textContent = '正在读取提交…';
  status('正在读取提交…');
  try {
    const selected = await request<ReviewCommit>('review-load', { repository: repository.value, revision: revision.value.trim() || 'HEAD' });
    if (id !== loadId) return;
    commit = selected;
    preferences.repository = repository.value;
    const previousFile = preferences.revision === selected.revision ? preferences.file : undefined;
    preferences.revision = selected.revision;
    delete preferences.file;
    persist();
    element('summary').textContent = `${selected.revision.slice(0, 8)} · ${selected.subject} · ${new Date(selected.date).toLocaleString()}`;
    element('file-count').textContent = `${selected.files.length} 个文件${selected.parent ? '' : ' · 根提交'}`;
    selected.files.forEach((file, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.index = String(index);
      const flag = document.createElement('span'); flag.className = 'file-status'; flag.dataset.status = file.status[0]; flag.textContent = file.status[0];
      const filename = file.afterPath ?? file.beforePath ?? '';
      const name = document.createElement('span'); name.className = 'file-label';
      const basename = document.createElement('strong'); basename.textContent = file.beforePath && file.afterPath && file.beforePath !== file.afterPath ? `${file.beforePath.split('/').pop()} → ${file.afterPath.split('/').pop()}` : filename.split('/').pop() ?? filename;
      const directory = document.createElement('small'); directory.textContent = filename.includes('/') ? filename.slice(0, filename.lastIndexOf('/')) : '';
      name.append(basename, directory);
      button.title = file.beforePath && file.afterPath && file.beforePath !== file.afterPath ? `${file.beforePath} → ${file.afterPath}` : filename; button.append(flag, name); button.onclick = () => { void chooseFile(index); }; files.append(button);
    });
    if (selected.files.length) await chooseFile(Math.max(0, selected.files.findIndex((file) => (file.afterPath ?? file.beforePath) === previousFile)));
    else { element('empty').textContent = '此提交没有相对第一父提交的文件变更'; status('没有文件变更'); }
  } catch (error) { if (id === loadId) { status(errorMessage(error)); element('empty').textContent = errorMessage(error); } }
}

async function selectRepository() {
  const name = repository.value;
  try {
    const history = await request<CommitSummary[]>('review-history', { repository: name });
    if (repository.value !== name) return;
    element('commits').replaceChildren(...history.map((entry) => { const option = document.createElement('option'); option.value = entry.revision; option.label = entry.subject; return option; }));
    revision.value = preferences.repository === name && preferences.revision ? preferences.revision : 'HEAD';
    await loadCommit();
  } catch (error) { status(errorMessage(error)); }
}
repository.onchange = () => { void selectRepository(); };
element('revision-form').onsubmit = (event) => { event.preventDefault(); void loadCommit(); };
element('previous').onclick = () => { if (merge) goToPreviousChunk(lastSide === 'before' ? merge.a : merge.b); };
element('next').onclick = () => { if (merge) goToNextChunk(lastSide === 'before' ? merge.a : merge.b); };
element('close-preview').onclick = closePreview;
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePreview(); });
orca.plugin.on('review-progress', (data) => { const progress = data as { generation: number; message: string }; if (progress.generation === generation) status(progress.message); });
window.addEventListener('pagehide', () => { loadId++; loading?.abort(); merge?.destroy(); preview?.destroy(); documentSession.dispose(); void request('review-detach').catch(() => {}); });
try {
  const result = await request<{ repositories: string[]; workspace: string; selector: string }>('review-initialize', preferences.workspace ? { workspace: preferences.workspace } : {});
  preferences.workspace = result.selector;
  repository.replaceChildren(...result.repositories.map((root) => new Option(root.split(/[\\/]/).pop() ?? root, root)));
  if (preferences.repository && result.repositories.includes(preferences.repository)) repository.value = preferences.repository;
  repository.title = result.workspace;
  if (result.repositories.length) await selectRepository();
  else { element('summary').textContent = '当前工作区没有 Git 仓库'; status('请在 Git 项目或包含子仓库的文件夹工作区打开提交阅读'); }
} catch (error) { status(errorMessage(error)); }
