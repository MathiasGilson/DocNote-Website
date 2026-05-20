import { Readable } from 'node:stream';
import { SitemapIndexStream, streamToPromise } from 'sitemap';

export const GET = async () => {
  const site = import.meta.env.SITE;
  const hostname = new URL('/', site).href;
  const indexStream = new SitemapIndexStream();
  const xml = await streamToPromise(
    Readable.from([{ url: new URL('sitemap-0.xml', hostname).href }]).pipe(indexStream)
  );

  return new Response(xml.toString(), {
    headers: { 'Content-Type': 'application/xml' },
  });
};
