import { getCollection } from 'astro:content';
import { locales } from './i18n';

const STATIC_PAGES = ['/blog', '/contact', '/pricing', '/team', '/tutorial', '/gtc', '/privacy', '/emploi'];

const buildUrls = (site: string, paths: string[]) => {
  const siteUrl = new URL('/', site);
  return [...new Set(paths.map((path) => new URL(path, siteUrl).href))].sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true })
  );
};

export const getLandingUrls = (site: string) => {
  const paths = [
    '/',
    ...locales.map((locale) => `/${locale}/`),
    ...locales.flatMap((locale) => STATIC_PAGES.map((page) => `/${locale}${page}/`)),
  ];
  return buildUrls(site, paths);
};

export const getBlogUrls = async (site: string) => {
  const posts = await getCollection('blog');
  const paths = posts.map((post) => {
    const [locale, ...slugParts] = post.slug.split('/');
    const slug = slugParts.join('/');
    return `/${locale}/blog/${slug}/`;
  });
  return buildUrls(site, paths);
};
