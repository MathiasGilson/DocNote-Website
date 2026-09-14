import { getCollection } from 'astro:content';
import { getLocalizedPath, locales } from './i18n';
import { getBlogAlternateUrls, getPaginationPresence, getPostLocale } from './blog-collection';
import { getPostSlug } from './blog';
import { CATEGORY_SLUGS } from '../content/categories';

export type SitemapEntry = { url: string; lastmod?: string; links?: { lang: string; url: string }[] };

const STATIC_PAGES = [
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
  const posts = await getCollection('blog', ({ data }) => !data.noindex);
  const entries: SitemapEntry[] = [];
  for (const post of posts) {
    const locale = getPostLocale(post);
    const slug = getPostSlug(post.id);
    const alternates = await getBlogAlternateUrls(post.data.translationKey);
    const links = [
      ...locales.filter((code) => alternates[code]).map((code) => ({ lang: code, url: alternates[code]! })),
      ...(alternates.en ? [{ lang: 'x-default', url: alternates.en }] : []),
    ];
    entries.push({
      url: toAbs(site, getLocalizedPath(`/blog/${slug}`, locale)),
      lastmod: post.data.updatedDate ?? post.data.date,
      links,
    });
  }
  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};

export const getCategoryUrls = async (site: string): Promise<SitemapEntry[]> => {
  const entries: SitemapEntry[] = [];

  for (const path of ['/blog/', ...CATEGORY_SLUGS.map((c) => `/blog/category/${c}/`)]) {
    const links = localeLinks(site, path);
    for (const locale of locales) entries.push({ url: toAbs(site, getLocalizedPath(path, locale)), links });
  }

  // Pagination pages exist only where a locale has enough posts.
  const { pageCounts, maxPages } = await getPaginationPresence();
  for (let n = 2; n <= maxPages; n++) {
    const present = locales.filter((l) => pageCounts[l] >= n);
    const links = [
      ...present.map((l) => ({ lang: l, url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, l)) })),
      ...(present.includes('en') ? [{ lang: 'x-default', url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, 'en')) }] : []),
    ];
    for (const l of present) entries.push({ url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, l)), links });
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};
