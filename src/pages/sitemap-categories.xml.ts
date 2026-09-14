import { getCategoryUrls } from '../utils/sitemap-urls';
import { buildSitemapXml, sitemapXmlResponse } from '../utils/sitemap-response';

export const GET = async () => {
  const site = import.meta.env.SITE;
  return sitemapXmlResponse(await buildSitemapXml(site, await getCategoryUrls(site)));
};
