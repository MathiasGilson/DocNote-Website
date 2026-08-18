/**
 * Production: Allow all + sitemap.
 * Preview (workers.dev / PUBLIC_IS_PREVIEW): Disallow all --- no sitemap pointer.
 */
import { IS_PREVIEW_DEPLOY, SITE_URL as SITE } from '../utils/seo';

export const prerender = true;

const body = IS_PREVIEW_DEPLOY
  ? `User-agent: *
Disallow: /
`
  : `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`;

export const GET = () =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      ...(IS_PREVIEW_DEPLOY ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
    },
  });
