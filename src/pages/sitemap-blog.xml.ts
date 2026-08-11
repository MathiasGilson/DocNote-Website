import { buildBlogUrlset, sitemapResponse } from '../utils/sitemap';

export const prerender = true;

export const GET = async () => sitemapResponse(await buildBlogUrlset());
