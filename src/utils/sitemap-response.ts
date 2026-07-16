import { Readable } from 'node:stream';
import { SitemapStream, streamToPromise } from 'sitemap';
import type { SitemapEntry } from './sitemap-urls';

export const buildSitemapXml = async (site: string, entries: SitemapEntry[]) => {
  const hostname = new URL('/', site).href;
  const lastmod = new Date().toISOString();
  const sitemapStream = new SitemapStream({
    hostname,
    xmlns: { news: true, xhtml: true, image: true, video: true },
  });
  const xml = await streamToPromise(
    Readable.from(
      entries.map((entry) => ({
        url: entry.url,
        lastmod,
        changefreq: 'weekly' as const,
        ...(entry.links?.length ? { links: entry.links } : {}),
      }))
    ).pipe(sitemapStream)
  );
  return xml.toString();
};

export const sitemapXmlResponse = (xml: string) =>
  new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
