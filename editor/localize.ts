import { currentLocale, setLocale, t, type MessageKey } from '../src/i18n';

const documentLanguage = { zh: 'zh-CN', en: 'en', ko: 'ko' } as const;
const attributes = [['title', 'i18nTitle'], ['aria-label', 'i18nAriaLabel'], ['placeholder', 'i18nPlaceholder']] as const;

/** Replaces the label text but keeps the icons that main.ts prepends to buttons. */
function setLabel(element: HTMLElement, text: string): void {
  const label = Array.from(element.childNodes).find((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
  if (label) label.textContent = text;
  else element.textContent = text;
}

/** Call after `session()` resolves: `orca.locale` is only final once Orca has sent it. */
export async function localize(): Promise<void> {
  setLocale(orca.locale);
  document.documentElement.lang = documentLanguage[currentLocale()];
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('[data-i18n]'))) setLabel(element, t(element.dataset.i18n as MessageKey));
  for (const [attribute, key] of attributes) {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(`[data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}]`))) {
      element.setAttribute(attribute, t(element.dataset[key] as MessageKey));
    }
  }
  // The worker has no locale of its own; its errors and progress messages follow this frame.
  await orca.plugin.request('locale', { locale: orca.locale } as never, { timeoutMs: 10_000 }).catch(() => {});
}
