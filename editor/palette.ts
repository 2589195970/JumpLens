import { palettes, paletteName, type PaletteName } from '../src/palette';

export async function setupPalette(select: HTMLSelectElement) {
  for (const [value, palette] of Object.entries(palettes)) select.add(new Option(palette.title, value));
  const apply = (value: unknown) => {
    const name = paletteName(value);
    select.value = name;
    const palette = palettes[name];
    for (const [key, color] of Object.entries(palette)) if (key !== 'title') document.documentElement.style.setProperty(`--syntax-${key}`, color);
  };
  apply((await orca.settings.get()).syntaxPalette);
  const subscription = orca.settings.onDidChange(({ key }) => { if (key === 'syntaxPalette') void orca.settings.get(key).then(apply); });
  select.addEventListener('change', () => { apply(select.value); void orca.settings.set('syntaxPalette', select.value as PaletteName); });
  window.addEventListener('pagehide', () => subscription.dispose(), { once: true });
}
