/**
 * Tasksboard-style robots.txt:
 * Allow all, single sitemap index, Content-Signal for AI crawlers.
 */
export const prerender = true;

const SITE = 'https://docnote.care';

const body = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`;

export const GET = () =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
