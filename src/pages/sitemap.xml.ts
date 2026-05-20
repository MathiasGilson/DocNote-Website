import { Readable } from 'node:stream';
import { SitemapIndexStream, streamToPromise } from 'sitemap';

export const GET = async () => {
  const site = import.meta.env.SITE;
  const hostname = new URL('/', site).href;
  const indexStream = new SitemapIndexStream();
  const childSitemaps = ['sitemap-landings.xml', 'sitemap-blog.xml'].map((path) => ({
    url: new URL(path, hostname).href,
  }));
  const xml = await streamToPromise(Readable.from(childSitemaps).pipe(indexStream));

  return new Response(xml.toString(), {
    headers: { 'Content-Type': 'application/xml' },
  });
};
