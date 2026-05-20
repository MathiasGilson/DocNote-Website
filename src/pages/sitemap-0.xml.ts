import { Readable } from 'node:stream';
import { SitemapStream, streamToPromise } from 'sitemap';
import { getSitemapUrls } from '../utils/sitemap-urls';

export const GET = async () => {
  const site = import.meta.env.SITE;
  const hostname = new URL('/', site).href;
  const urls = await getSitemapUrls(site);
  const sitemapStream = new SitemapStream({
    hostname,
    xmlns: { news: true, xhtml: true, image: true, video: true },
  });
  const xml = await streamToPromise(
    Readable.from(urls.map((url) => ({ url }))).pipe(sitemapStream)
  );

  return new Response(xml.toString(), {
    headers: { 'Content-Type': 'application/xml' },
  });
};
