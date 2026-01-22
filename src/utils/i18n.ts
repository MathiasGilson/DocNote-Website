export const locales = ['en', 'de', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Francais',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (isValidLocale(locale)) return locale;
  return defaultLocale;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return '/' + segments.slice(1).join('/') || '/';
  }
  return pathname;
}

export function formatDate(dateString: string, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    de: 'de-CH',
    fr: 'fr-CH',
  };
  return new Date(dateString).toLocaleDateString(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
