import { Readable } from 'node:stream';
import { SitemapStream, streamToPromise } from 'sitemap';

export const buildSitemapXml = async (site: string, urls: string[]) => {
  const hostname = new URL('/', site).href;
  const sitemapStream = new SitemapStream({
    hostname,
    xmlns: { news: true, xhtml: true, image: true, video: true },
  });
  const xml = await streamToPromise(
    Readable.from(urls.map((url) => ({ url }))).pipe(sitemapStream)
  );
  return xml.toString();
};

export const sitemapXmlResponse = (xml: string) =>
  new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
