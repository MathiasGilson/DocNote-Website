import { getCollection } from 'astro:content';
import { getLocalizedPath, locales, type Locale } from './i18n';
import { getBlogAlternateUrls } from './blog-translations';

export type SitemapEntry = {
  url: string;
  links?: { lang: string; url: string }[];
};

const STATIC_PAGES = [
  '/blog',
  '/contact',
  '/pricing',
  '/team',
  '/tutorial',
  '/gtc',
  '/privacy',
  '/emploi',
  '/patient',
  '/sondage',
  '/ai-medical-scribe',
  '/hospital-documentation',
  '/clinical-compliance',
];

const toAbs = (site: string, path: string) => new URL(path, new URL('/', site)).href;

const localeLinks = (site: string, pathSuffix: string) => [
  ...locales.map((locale) => ({ lang: locale, url: toAbs(site, getLocalizedPath(pathSuffix, locale)) })),
  { lang: 'x-default', url: toAbs(site, getLocalizedPath(pathSuffix, 'en')) },
];

export const getLandingUrls = (site: string): SitemapEntry[] => {
  const entries: SitemapEntry[] = [];

  for (const path of ['/', ...STATIC_PAGES.map((p) => `${p}/`)]) {
    const links = localeLinks(site, path);
    for (const locale of locales) entries.push({ url: toAbs(site, getLocalizedPath(path, locale)), links });
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};

export const getBlogUrls = async (site: string): Promise<SitemapEntry[]> => {
  const posts = await getCollection('blog');
  const entries: SitemapEntry[] = [];

  for (const post of posts) {
    const [locale, ...slugParts] = post.slug.split('/');
    const slug = slugParts.join('/');
    const alternates = getBlogAlternateUrls(locale as Locale, slug);
    const links = [
      ...locales
        .filter((code) => alternates[code])
        .map((code) => ({ lang: code, url: alternates[code]! })),
      ...(alternates.en ? [{ lang: 'x-default', url: alternates.en }] : []),
    ];
    entries.push({
      url: toAbs(site, getLocalizedPath(`/blog/${slug}`, locale as Locale)),
      links,
    });
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};
