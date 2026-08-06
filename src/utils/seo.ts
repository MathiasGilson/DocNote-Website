import { defaultLocale, locales, type Locale, pickLocale, getLocalizedPath } from './i18n';
import { seoCopy } from './inline-content';

export const SITE_URL = 'https://docnote.care';
export const OG_IMAGE = `${SITE_URL}/images/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_CH',
  es: 'es_ES',
  it: 'it_IT',
  pt: 'pt_PT',
  nl: 'nl_NL',
  ru: 'ru_RU',
  ja: 'ja_JP',
  ko: 'ko_KR',
  zh: 'zh_CN',
  ar: 'ar_SA',
  hi: 'hi_IN',
  th: 'th_TH',
  sv: 'sv_SE',
  no: 'nb_NO',
};

export const formatPageTitle = (title: string) => {
  const cleaned = title.replace(/\s*[|—–-]\s*DocNote\s*$/i, '').trim();
  if (/docnote/i.test(cleaned)) return cleaned;
  return `${cleaned} | DocNote`;
};

export const withTrailingSlash = (pathname: string) => {
  if (!pathname || pathname === '/') return '/';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return path.endsWith('/') ? path : `${path}/`;
};

export const absoluteUrl = (pathname: string) =>
  new URL(withTrailingSlash(pathname), SITE_URL).href;

export const absoluteLocalizedUrl = (path: string, locale: Locale) =>
  absoluteUrl(getLocalizedPath(path, locale));

export const getOgLocale = (locale: Locale) => OG_LOCALES[locale];

export const buildBreadcrumbLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getDefaultAlternates = (pathname: string): Record<Locale, string> => {
  const segments = pathname.split('/').filter(Boolean);
  const rest =
    segments.length > 0 && locales.includes(segments[0] as Locale)
      ? segments.slice(1).join('/')
      : segments.join('/');
  const suffix = rest ? `/${rest}` : '/';
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteLocalizedUrl(suffix, locale)])
  ) as Record<Locale, string>;
};

type PageMeta = { title: string; description: string };
type PageKey = 'home' | 'pricing' | 'blog' | 'team' | 'tutorial' | 'contact' | 'privacy' | 'gtc';

export const getPageMeta = (page: PageKey, locale: Locale): PageMeta => {
  const byLocale = pickLocale(seoCopy, locale);
  return byLocale[page] ?? seoCopy.en[page];
};

export { defaultLocale };
