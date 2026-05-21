export const prerender = true;

const buildRobotsTxt = (site: string) => {
  const sitemaps = ['sitemap.xml', 'sitemap-landings.xml', 'sitemap-blog.xml']
    .map((path) => `Sitemap: ${new URL(path, site).href}`)
    .join('\n');

  return `Content-Signal: ai-train=yes, search=yes, ai-input=yes

User-agent: *
Allow: /

${sitemaps}
`;
};

export const GET = () => {
  const site = import.meta.env.SITE;
  return new Response(buildRobotsTxt(site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
