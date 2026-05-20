import { getBlogUrls } from '../utils/sitemap-urls';
import { buildSitemapXml, sitemapXmlResponse } from '../utils/sitemap-response';

export const GET = async () => {
  const site = import.meta.env.SITE;
  const urls = await getBlogUrls(site);
  return sitemapXmlResponse(await buildSitemapXml(site, urls));
};
