import { getCollection } from 'astro:content';
import { locales } from './i18n';

const STATIC_PAGES = ['', '/blog', '/contact', '/pricing', '/team', '/tutorial', '/gtc'];

export const getSitemapUrls = async (site: string, base = '/') => {
  const siteUrl = new URL(base, site);
  const urls = [new URL('/', siteUrl).href];

  for (const locale of locales) {
    for (const page of STATIC_PAGES) {
      const path = page === '' ? `/${locale}/` : `/${locale}${page}/`;
      urls.push(new URL(path, siteUrl).href);
    }
  }

  const posts = await getCollection('blog');
  for (const post of posts) {
    const [locale, ...slugParts] = post.slug.split('/');
    const slug = slugParts.join('/');
    urls.push(new URL(`/${locale}/blog/${slug}/`, siteUrl).href);
  }

  return [...new Set(urls)].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
};
