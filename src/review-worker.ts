import type { OrcaWorkerApi, PanelRequestContext } from 'orca/worker';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { activeWorkspace, workspaceBySelector, documentContext, inside } from './project';
import { commitHistory, gitRepositories, reviewCommit, revisionDocument, revisionWorkspace, type ReviewCommit, type RevisionDocument } from './git-review';
import type { DocumentContext, Position, Workspace } from './types';
import type { NavigationServer } from './navigation-server';
import { sourcePreview } from './candidates';

type ReviewState = { workspace: Workspace; repositories: string[]; repository?: string; commit?: ReviewCommit; documents?: { before?: RevisionDocument; after?: RevisionDocument }; generation: number };
export function registerReview(orca: OrcaWorkerApi, serverFor: (context: DocumentContext, text: string) => Promise<NavigationServer>): () => void {
  const sessions = new Map<string, ReviewState>();
  const stateFor = (caller: PanelRequestContext) => {
    const state = sessions.get(caller.panel.id);
    if (!state) throw new Error('请先打开提交阅读');
    return state;
  };
  const assertCurrent = (state: ReviewState, generation: number, signal?: AbortSignal) => {
    if (state.generation !== generation || signal?.aborted) throw new Error('已切换文件，当前分析已取消');
  };
  const repositoryFor = (state: ReviewState, input: unknown) => {
    if (typeof input !== 'string' || !state.repositories.includes(input)) throw new Error('请选择当前工作区中的 Git 仓库');
    return input;
  };
  orca.panels.handle('review-initialize', async (input, caller) => {
    let state = sessions.get(caller.panel.id);
    if (!state) {
      const selector = (input as { workspace?: unknown } | undefined)?.workspace;
      const workspace = typeof selector === 'string' ? await workspaceBySelector(selector) : await activeWorkspace();
      state = { workspace, repositories: await gitRepositories(workspace.root), generation: 0 };
      sessions.set(caller.panel.id, state);
    }
    return { repositories: state.repositories, workspace: state.workspace.root, selector: state.workspace.selector };
  });
  orca.panels.handle('review-history', async (input, caller) => {
    const state = stateFor(caller);
    return commitHistory(repositoryFor(state, (input as { repository?: unknown }).repository));
  });
  orca.panels.handle('review-load', async (input, caller) => {
    const data = input as { repository: unknown; revision: unknown };
    const state = stateFor(caller);
    const repository = repositoryFor(state, data.repository);
    if (typeof data.revision !== 'string') throw new Error('请选择提交');
    const generation = ++state.generation;
    state.commit = undefined;
    state.documents = undefined;
    const commit = await reviewCommit(repository, data.revision);
    assertCurrent(state, generation, caller.signal);
    state.repository = repository;
    state.commit = commit;
    return commit;
  });
  orca.panels.handle('review-file', async (input, caller) => {
    const state = stateFor(caller);
    const index = (input as { index?: unknown }).index;
    const commit = state.commit;
    if (!commit || !state.repository || !Number.isInteger(index) || !commit.files[Number(index)]) throw new Error('提交文件已变化，请重新选择');
    const generation = ++state.generation;
    state.documents = undefined;
    const file = commit.files[Number(index)];
    const [before, after] = await Promise.all(['before', 'after'].map((side) => revisionDocument(state.repository!, commit, file, side as 'before' | 'after')));
    assertCurrent(state, generation, caller.signal);
    state.documents = { before, after };
    return { before: before ?? null, after: after ?? null, generation };
  });
  async function analysis(input: unknown, caller: PanelRequestContext) {
    const data = input as { side?: unknown; generation?: unknown };
    const state = stateFor(caller);
    if (data.side !== 'before' && data.side !== 'after' || data.generation !== state.generation) throw new Error('提交侧已变化，请重试');
    const document = state.documents?.[data.side];
    if (!document) throw new Error('此提交侧没有源码');
    const generation = state.generation;
    orca.panels.post('review-progress', { generation, message: `正在分析 ${document.revision.slice(0, 8)} 的源码…` }, { panel: caller.panel.id });
    const root = await revisionWorkspace(document.repository, document.revision);
    assertCurrent(state, generation, caller.signal);
    const context = await documentContext(path.join(root, document.path), { root, selector: state.workspace.selector });
    const server = await serverFor(context, document.text);
    assertCurrent(state, generation, caller.signal);
    return { state, document, context, server, generation, root };
  }
  orca.panels.handle('review-semantic', async (input, caller) => {
    const current = await analysis(input, caller);
    const tokens = await current.server.semanticTokens?.(current.context.uri, current.document.text, caller.signal) ?? [];
    assertCurrent(current.state, current.generation, caller.signal);
    return tokens;
  });
  orca.panels.handle('review-definition', async (input, caller) => {
    const position = (input as { position?: Position }).position;
    if (!position || ![position.line, position.character].every((n) => Number.isInteger(n) && n >= 0)) throw new Error('源码位置无效');
    const current = await analysis(input, caller);
    const targets = await current.server.navigate(current.context.uri, current.document.text, position, 'definition', caller.signal);
    const results = [];
    for (const target of targets.slice(0, 5)) {
      let text: string;
      if (target.uri.startsWith('jdt:')) text = await current.server.virtualText(target.uri, caller.signal);
      else if (target.uri.startsWith('file:') && inside(current.root, fileURLToPath(target.uri))) text = await readFile(fileURLToPath(target.uri), 'utf8');
      else continue;
      if (text.length > 400_000) continue;
      results.push({ ...sourcePreview(text, target.range, target.uri.startsWith('file:') ? path.relative(current.root, fileURLToPath(target.uri)) : target.label), revision: current.document.revision });
    }
    assertCurrent(current.state, current.generation, caller.signal);
    return results;
  });
  orca.panels.handle('review-detach', (_input, caller) => { const state = sessions.get(caller.panel.id); if (state) state.generation++; sessions.delete(caller.panel.id); return { ok: true }; });
  return () => { for (const state of sessions.values()) state.generation++; sessions.clear(); };
}
