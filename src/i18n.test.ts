import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { messages, resolveLocale, setLocale, t, type MessageKey } from './i18n';
import { reviewCommit } from './git-review';

test('Orca UI languages map to Chinese, Korean or English, and a missing language keeps Chinese', () => {
  for (const tag of ['zh', 'zh-CN', 'zh-TW', 'zh_Hans', undefined, '']) assert.equal(resolveLocale(tag), 'zh', String(tag));
  for (const tag of ['ko', 'ko-KR', 'KO']) assert.equal(resolveLocale(tag), 'ko', tag);
  for (const tag of ['en', 'en-US', 'ja', 'pt-BR']) assert.equal(resolveLocale(tag), 'en', tag);
});

test('every translation keeps the placeholders of the Chinese text', () => {
  const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const key of Object.keys(messages.zh) as MessageKey[]) {
    for (const locale of ['en', 'ko'] as const) assert.deepEqual(placeholders(messages[locale][key]), placeholders(messages.zh[key]), `${locale}.${key}`);
  }
});

test('messages follow the selected locale and fill their placeholders', () => {
  setLocale('ko-KR');
  assert.equal(t('foundReferences', { count: 3 }), '참조 3개를 찾았습니다');
  setLocale('en');
  assert.equal(t('connected', { language: 'TypeScript' }), 'TypeScript · connected');
  setLocale('zh-CN');
  assert.equal(t('changeCount', { count: 2 }), '2 处变更');
});

test('worker errors are raised in the language the editor reported', async () => {
  setLocale('ko');
  await assert.rejects(reviewCommit('/repository', '-bad'), { message: messages.ko.invalidRevision });
  setLocale('zh');
  await assert.rejects(reviewCommit('/repository', '-bad'), { message: messages.zh.invalidRevision });
});

test('every data-i18n key in the editor pages has a message', () => {
  for (const page of ['editor/index.html', 'editor/review.html']) {
    const html = readFileSync(page, 'utf8');
    const keys = [...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(keys.length > 10, page);
    for (const key of keys) assert.ok(key in messages.zh, `${page}: ${key}`);
  }
});
