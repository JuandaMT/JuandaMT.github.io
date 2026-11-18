import en from './en';
import es from './es';

export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';
export const locales = Object.keys(languages) as Lang[];

const dictionaries = { en, es } as const;

export function useTranslations(lang: Lang) {
  return dictionaries[lang];
}

/**
 * Turns a locale-independent path ('/', '/projects/foo/') into the URL for a language.
 * English lives at the root, Spanish under /es/.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'es' : 'en';
}
