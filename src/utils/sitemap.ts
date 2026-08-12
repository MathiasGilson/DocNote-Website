/**
 * Hand-rolled sitemap helpers (MailMerge / Mailtrack pattern).
 * DocNote keeps trailingSlash: 'always' — all locs end with /.
 */

import { getCollection } from 'astro:content';
import {
  defaultLocale,
  locales,
  type Locale,
  getLocalizedPath,
  getSurveyPath,
  getCareersPath,
  getCareersJobPath,
} from './i18n';
import { getBlogAlternateUrls, isCanonicalBlogPostId } from './blog-translations';
import { CAREER_JOB_SLUGS } from './careers';
import { landingSlugs } from '../content/landings';
import { specialtyFamilySlugs, getSpecialtyFamilyPath } from '../content/specialty-families';
import { SITE_URL } from './seo';

export const SITE = SITE_URL;

const toAbs = (path: string) => new URL(path, `${SITE}/`).href;

/** Absolute URL for a site path + locale (always trailing slash). */
export const buildUrl = (page: string, locale: Locale = defaultLocale): string => {
  const suffix = !page || page === '/' ? '/' : page.startsWith('/') ? page : `/${page}`;
  return toAbs(getLocalizedPath(suffix, locale));
};

/** Reciprocal hreflang block (MailMerge). Empty when fewer than 2 locales. */
export const buildAlternates = (
  pageLocales: readonly Locale[],
  href: (locale: Locale) => string
): string => {
  if (pageLocales.length < 2) return '';
  const links = pageLocales.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href(l)}" />`
  );
  const xDefault = pageLocales.includes(defaultLocale) ? defaultLocale : pageLocales[0];
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${href(xDefault)}" />`);
  return `\n${links.join('\n')}`;
};

const getSitemapMeta = (page: string): { priority: string; changefreq: string } => {
  if (!page || page === '/' || page === '') {
    return { priority: '1.0', changefreq: 'weekly' };
  }
  if (page === 'blog' || page === 'blog/') {
    return { priority: '0.7', changefreq: 'weekly' };
  }
  if (page.startsWith('blog/')) {
    return { priority: '0.6', changefreq: 'monthly' };
  }
  if (['privacy', 'gtc', 'privacy/', 'gtc/'].includes(page)) {
    return { priority: '0.3', changefreq: 'yearly' };
  }
  if (['pricing', 'tutorial', 'patient', 'contact', 'team'].some((p) => page === p || page === `${p}/`)) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (landingSlugs.some((slug) => page === slug || page === `${slug}/`)) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  if (page.startsWith('specialties/')) {
    return { priority: '0.8', changefreq: 'monthly' };
  }
  return { priority: '0.5', changefreq: 'monthly' };
};

const wrapUrlset = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${inner}
</urlset>`;

const pageEntries = (
  pages: string[],
  pageLocales: readonly Locale[] = locales,
  overrides?: { priority?: string; changefreq?: string }
): string[] => {
  const now = new Date().toISOString().split('T')[0];
  const entries: string[] = [];

  for (const page of pages) {
    const meta = getSitemapMeta(page);
    const priority = overrides?.priority ?? meta.priority;
    const changefreq = overrides?.changefreq ?? meta.changefreq;
    const alternates = buildAlternates(pageLocales, (l) => buildUrl(page, l));
    for (const locale of pageLocales) {
      const loc = buildUrl(page, locale);
      entries.push(`  <url>
    <loc>${loc}</loc>${alternates}
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }
  }
  return entries;
};

/** Paths that use locale-specific slugs (survey / careers). */
const specialPathEntries = (
  hrefFor: (locale: Locale) => string,
  priority: string,
  changefreq: string
): string[] => {
  const now = new Date().toISOString().split('T')[0];
  const alternates = buildAlternates(locales, hrefFor);
  return locales.map((locale) => {
    const loc = toAbs(hrefFor(locale));
    return `  <url>
    <loc>${loc}</loc>${alternates}
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });
};

/** Marketing + utility pages (not SEO landings, not blog posts). */
export const buildStaticUrlset = (): string => {
  const staticPages = [
    '',
    'blog',
    'contact',
    'pricing',
    'team',
    'tutorial',
    'gtc',
    'privacy',
    'patient',
  ];

  const parts = [
    ...pageEntries(staticPages),
    ...specialPathEntries((l) => getSurveyPath(l), '0.5', 'monthly'),
    ...specialPathEntries((l) => getCareersPath(l), '0.5', 'monthly'),
  ];

  for (const slug of CAREER_JOB_SLUGS) {
    parts.push(
      ...specialPathEntries((l) => getCareersJobPath(slug, l), '0.4', 'monthly')
    );
  }

  return wrapUrlset(parts.join('\n'));
};

/** SEO landing pages + specialty family hubs. */
export const buildLandingsUrlset = (): string => {
  const familyPages = specialtyFamilySlugs.map((slug) => getSpecialtyFamilyPath(slug).replace(/^\//, ''));
  return wrapUrlset(
    pageEntries([...landingSlugs, ...familyPages], locales, {
      priority: '0.8',
      changefreq: 'monthly',
    }).join('\n')
  );
};

/** Blog posts — one <url> per existing locale translation, reciprocal hreflang. */
export const buildBlogUrlset = async (): Promise<string> => {
  const posts = await getCollection('blog');
  const byCluster = new Map<
    string,
    { locales: Set<Locale>; lastmod: string; map: Record<Locale, string> }
  >();

  for (const post of posts) {
    if (!isCanonicalBlogPostId(post.id)) continue;
    const cleanId = post.id.replace(/\.mdx?$/, '');
    const [locale, ...slugParts] = cleanId.split('/');
    if (!locales.includes(locale as Locale)) continue;
    const slug = slugParts.join('/');
    const loc = locale as Locale;
    const map = getBlogAlternateUrls(loc, slug);
    const clusterKey = map.en;
    const dateRaw = (post.data as { date?: string | Date }).date;
    const lastmod = dateRaw
      ? new Date(dateRaw).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const existing = byCluster.get(clusterKey);
    if (existing) {
      existing.locales.add(loc);
      if (lastmod > existing.lastmod) existing.lastmod = lastmod;
    } else {
      byCluster.set(clusterKey, {
        locales: new Set([loc]),
        lastmod,
        map,
      });
    }
  }

  const entries: string[] = [];
  for (const cluster of byCluster.values()) {
    const available = [...cluster.locales].sort((a, b) =>
      a === defaultLocale ? -1 : b === defaultLocale ? 1 : a.localeCompare(b)
    );
    const href = (l: Locale) => cluster.map[l];
    const alternates = buildAlternates(available, href);
    for (const locale of available) {
      entries.push(`  <url>
    <loc>${href(locale)}</loc>${alternates}
    <lastmod>${cluster.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  entries.sort((a, b) => {
    const la = a.match(/<loc>([^<]+)<\/loc>/)?.[1] || '';
    const lb = b.match(/<loc>([^<]+)<\/loc>/)?.[1] || '';
    return la.localeCompare(lb, 'en', { numeric: true });
  });

  return wrapUrlset(entries.join('\n'));
};

export const buildSitemapIndex = (): string => {
  const now = new Date().toISOString().split('T')[0];
  const children = ['sitemap-static.xml', 'sitemap-landings.xml', 'sitemap-blog.xml'];
  const body = children
    .map(
      (path) => `  <sitemap>
    <loc>${SITE}/${path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
};

export const sitemapResponse = (xml: string): Response =>
  new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
