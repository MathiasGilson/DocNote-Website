import { buildLandingsUrlset, sitemapResponse } from '../utils/sitemap';

export const prerender = true;

export const GET = () => sitemapResponse(buildLandingsUrlset());
