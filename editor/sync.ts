/** Orca owns saving and conflict prompts; never concatenate conflicting Java source. */
export function start() {
  const document = orca.document
  if (!document) {
    throw new Error('this file runs as a custom editor')
  }
  return document.session<string>()
}
