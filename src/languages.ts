export type CodeLanguage = 'java' | 'vue' | 'typescript' | 'tsx' | 'javascript' | 'jsx' | 'json' | 'html' | 'css' | 'scss' | 'sass' | 'text';
export const sourceExtensions = ['java', 'vue', 'ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs'];
export function languageForPath(file: string): CodeLanguage {
  const extension = file.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'vue' || extension === 'java' || extension === 'tsx' || extension === 'jsx' || extension === 'json' || extension === 'html' || extension === 'css' || extension === 'scss' || extension === 'sass') return extension;
  if (extension === 'js' || extension === 'mjs' || extension === 'cjs') return 'javascript';
  if (extension === 'ts' || extension === 'mts' || extension === 'cts') return 'typescript';
  return 'text';
}
export function lspLanguage(file: string): string {
  const language = languageForPath(file);
  return language === 'tsx' ? 'typescriptreact' : language === 'jsx' ? 'javascriptreact' : language;
}
export function languageName(language: CodeLanguage): string {
  return ({ java: 'Java', vue: 'Vue', typescript: 'TypeScript', tsx: 'TSX', javascript: 'JavaScript', jsx: 'JSX', json: 'JSON', html: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'Sass', text: '文本' })[language];
}
