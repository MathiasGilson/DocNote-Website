export const prerender = true;

const buildRobotsTxt = (site: string) => {
  const sitemaps = ['sitemap.xml', 'sitemap-landings.xml', 'sitemap-blog.xml', 'sitemap-categories.xml']
    .map((path) => `Sitemap: ${new URL(path, site).href}`)
    .join('\n');

  return `User-agent: *
Allow: /
Content-Signal: ai-train=yes, search=yes, ai-input=yes

# Curated index for AI agents (not used by Google Search ranking)
# https://docnote.care/llms.txt

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
