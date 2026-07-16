import { getCollection } from 'astro:content';
import { locales, type Locale } from './i18n';
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

const localeLinks = (site: string, pathSuffix: string) => {
  const links = locales.map((locale) => ({
    lang: locale,
    url: toAbs(site, `/${locale}${pathSuffix}`),
  }));
  links.push({ lang: 'x-default', url: toAbs(site, `/en${pathSuffix}`) });
  return links;
};

export const getLandingUrls = (site: string): SitemapEntry[] => {
  const entries: SitemapEntry[] = [];

  const homeLinks = [
    ...locales.map((locale) => ({ lang: locale, url: toAbs(site, `/${locale}/`) })),
    { lang: 'x-default', url: toAbs(site, '/en/') },
  ];
  entries.push({ url: toAbs(site, '/'), links: homeLinks });
  for (const locale of locales) {
    entries.push({ url: toAbs(site, `/${locale}/`), links: homeLinks });
  }

  for (const page of STATIC_PAGES) {
    const suffix = `${page}/`;
    const links = localeLinks(site, suffix);
    for (const locale of locales) {
      entries.push({ url: toAbs(site, `/${locale}${suffix}`), links });
    }
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
      url: toAbs(site, `/${locale}/blog/${slug}/`),
      links,
    });
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};
