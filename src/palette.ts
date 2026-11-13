export const palettes = {
  onedark: { title: 'One Dark', background: '#282c34', foreground: '#abb2bf', keyword: '#c678dd', string: '#98c379', number: '#d19a66', type: '#e5c07b', method: '#61afef', field: '#e06c75', parameter: '#d19a66', variable: '#abb2bf', constant: '#d19a66', annotation: '#56b6c2', comment: '#7f848e' },
  idea: { title: 'IDEA Dark', background: '#1e1f22', foreground: '#bcbec4', keyword: '#cf8e6d', string: '#6aab73', number: '#2aacb8', type: '#56b6c2', method: '#e5c07b', field: '#c77dbb', parameter: '#d5b778', variable: '#bcbec4', constant: '#c77dbb', annotation: '#b3ae60', comment: '#92969e' }
} as const;
export type PaletteName = keyof typeof palettes;
export const paletteName = (value: unknown): PaletteName => value === 'idea' ? 'idea' : 'onedark';
