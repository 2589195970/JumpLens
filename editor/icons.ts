const paths = {
  search: ['M10.5 10.5 14 14', 'M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0'],
  back: ['m9.5 3-5 5 5 5', 'M5 8h9'], forward: ['m6.5 3 5 5-5 5', 'M2 8h9'],
  definition: ['M4 12 12 4', 'M5 4h7v7'],
  implementation: ['M4 2v9a2 2 0 0 0 2 2h6', 'M4 6h8', 'm10 4 2 2-2 2', 'm10 11 2 2-2 2'],
  references: ['M6 5H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2', 'M9 2h5v5', 'm7 9 7-7'],
  type: ['M2 4V2h12v2', 'M8 2v12', 'M5 14h6'], code: ['m5 4-4 4 4 4', 'm11 4 4 4-4 4'],
  refresh: ['M13.5 6a5.5 5.5 0 1 0 0 4', 'M10 6h4V2'], more: ['M3 8h.01M8 8h.01M13 8h.01'],
  close: ['m4 4 8 8', 'm12 4-8 8'], file: ['M9 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5z', 'M9 1.5v4h4']
};
export type IconName = keyof typeof paths;
export function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('class', 'java-icon');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of paths[name]) {
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}
