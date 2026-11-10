import { assert, mockEditorHost, test } from 'orca/testing';
import { start } from './sync';

test('Java edits flush through Orca and conflicting outside writes stay intact', async () => {
  const host = mockEditorHost({ text: 'class User {}' });
  const doc = await start();
  doc.change('class User { int id; }');
  await host.flush();
  assert.equal(host.text, 'class User { int id; }');
  doc.change('class User { long id; }');
  host.conflictNext('class User { String name; }');
  await assert.rejects(host.flush(), /file changed outside/);
  assert.equal(host.text, 'class User { String name; }');
  assert.equal(doc.value, 'class User { String name; }');
  doc.dispose(); host.dispose();
});

test('read-only documents never send changes to Orca', async () => {
  const host = mockEditorHost({ text: 'class ReadOnly {}' }, { readOnly: true });
  const doc = await start();
  doc.change('class Changed {}');
  await host.flush();
  assert.equal(host.edits.length, 0);
  assert.equal(host.text, 'class ReadOnly {}');
  doc.dispose(); host.dispose();
});
