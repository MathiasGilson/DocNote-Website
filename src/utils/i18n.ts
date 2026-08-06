export const languages = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  ar: 'العربية',
  pt: 'Português',
  ja: '日本語',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  ko: '한국어',
  it: 'Italiano',
  hi: 'हिन्दी',
  nl: 'Nederlands',
  th: 'ไทย',
  sv: 'Svenska',
  no: 'Norsk',
} as const;

export type Locale = keyof typeof languages;
export const defaultLocale: Locale = 'en';
export const locales = Object.keys(languages) as Locale[];
export const nonDefaultLocales = locales.filter((l) => l !== defaultLocale);

export const localeNames: Record<Locale, string> = { ...languages };

/** Same SVG flag paths as Record Meeting website. */
export const flagSrcs: Record<Locale, string> = {
  en: '/images/flags/gb.svg',
  zh: '/images/flags/cn.svg',
  es: '/images/flags/es.svg',
  ar: '/images/flags/sa.svg',
  pt: '/images/flags/pt.svg',
  ja: '/images/flags/jp.svg',
  ru: '/images/flags/ru.svg',
  de: '/images/flags/de.svg',
  fr: '/images/flags/fr.svg',
  ko: '/images/flags/kr.svg',
  it: '/images/flags/it.svg',
  hi: '/images/flags/in.svg',
  nl: '/images/flags/nl.svg',
  th: '/images/flags/th.svg',
  sv: '/images/flags/se.svg',
  no: '/images/flags/no.svg',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (isValidLocale(locale)) return locale;
  return defaultLocale;
}

/** EN has no prefix; other locales use `/{locale}/…` (trailing slash). */
export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const withSlash =
    cleanPath === '/' ? '/' : cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  if (locale === defaultLocale) return withSlash;
  if (withSlash === '/') return `/${locale}/`;
  return `/${locale}${withSlash}`;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}/`.replace(/\/+$/, '/') || '/' : '/';
  }
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/** FR keeps /sondage/; EN + other locales use /survey/. */
export function getSurveySlug(locale: Locale): 'sondage' | 'survey' {
  return locale === 'fr' ? 'sondage' : 'survey';
}

export function getSurveyPath(locale: Locale): string {
  return getLocalizedPath(`/${getSurveySlug(locale)}`, locale);
}

export function isSurveyPath(pathname: string): boolean {
  const base = getPathWithoutLocale(pathname);
  return base === '/sondage/' || base === '/survey/';
}

export function getSurveyAlternatePaths(): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, getSurveyPath(locale)])) as Record<
    Locale,
    string
  >;
}

/** FR keeps /emploi/; EN + other locales use /careers/. */
export function getCareersSlug(locale: Locale): 'emploi' | 'careers' {
  return locale === 'fr' ? 'emploi' : 'careers';
}

export function getCareersPath(locale: Locale): string {
  return getLocalizedPath(`/${getCareersSlug(locale)}`, locale);
}

export function getCareersJobPath(slug: string, locale: Locale): string {
  return getLocalizedPath(`/${getCareersSlug(locale)}/${slug}`, locale);
}

export function isCareersPath(pathname: string): boolean {
  const base = getPathWithoutLocale(pathname);
  return (
    base === '/careers/' ||
    base === '/emploi/' ||
    base.startsWith('/careers/') ||
    base.startsWith('/emploi/')
  );
}

export function getCareersAlternatePaths(jobSlug?: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      jobSlug ? getCareersJobPath(jobSlug, locale) : getCareersPath(locale),
    ])
  ) as Record<Locale, string>;
}

const DATE_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  de: 'de-CH',
  fr: 'fr-CH',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
  hi: 'hi-IN',
  th: 'th-TH',
  sv: 'sv-SE',
  no: 'nb-NO',
};

export function formatDate(dateString: string, locale: Locale): string {
  return new Date(dateString).toLocaleDateString(DATE_LOCALES[locale] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Prefer locale copy; fall back to English when a translation is missing. */
export function pickLocale<T>(map: Partial<Record<Locale, T>> & { en: T }, locale: Locale): T {
  return map[locale] ?? map.en;
}
