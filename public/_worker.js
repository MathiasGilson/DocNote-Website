/**
 * Cloudflare worker in front of the docnote.care static assets.
 *
 * Single job: Markdown for Agents content negotiation. A request carrying
 * `Accept: text/markdown` gets the page's markdown twin (`<dir>/index.md`,
 * written by scripts/generate-markdown.mjs at build time) instead of the HTML,
 * with `Content-Type: text/markdown` and `Vary: Accept`. Everything else —
 * including `_redirects` and `_headers`, which the assets service applies inside
 * the ASSETS binding — passes straight through to `env.ASSETS.fetch(request)`.
 *
 * Wired up in wrangler.jsonc as `main` with `assets.run_worker_first: true`,
 * so this runs before an asset is matched but redirects still surface as 301s.
 */

/** True when the Accept header lists text/markdown with a non-zero q. */
export function wantsMarkdown(accept) {
  if (!accept) return false;
  return accept.split(",").some((part) => {
    const [type, ...params] = part.trim().split(";");
    if (type.trim().toLowerCase() !== "text/markdown") return false;
    const q = params.map((p) => p.trim().toLowerCase()).find((p) => p.startsWith("q="));
    return !q || parseFloat(q.slice(2)) > 0;
  });
}

/** Rough token estimate (≈4 chars per token), same order as Cloudflare's x-markdown-tokens. */
export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function markdownAssetPath(pathname) {
  const dir = pathname.replace(/\/+$/, "");
  return `${dir}/index.md`;
}

async function fetchMarkdown(request, env, url) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const mdUrl = new URL(markdownAssetPath(url.pathname), url.origin);
  const asset = await env.ASSETS.fetch(new Request(mdUrl.href, { method: "GET" }));
  if (asset.status !== 200) return null;

  const markdown = await asset.text();
  const headers = new Headers(asset.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  headers.set("x-markdown-tokens", String(estimateTokens(markdown)));
  headers.delete("ETag");
  headers.delete("Content-Length");
  return new Response(request.method === "HEAD" ? null : markdown, { status: 200, headers });
}

function withVaryAccept(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;
  const varied = new Response(response.body, response);
  const vary = varied.headers.get("Vary");
  if (!vary) varied.headers.set("Vary", "Accept");
  else if (!/\bAccept\b/i.test(vary)) varied.headers.set("Vary", `${vary}, Accept`);
  return varied;
}

export default {
  async fetch(request, env) {
    if (wantsMarkdown(request.headers.get("Accept"))) {
      const url = new URL(request.url);
      const markdown = await fetchMarkdown(request, env, url);
      if (markdown) return markdown;
    }
    return withVaryAccept(await env.ASSETS.fetch(request));
  },
};
