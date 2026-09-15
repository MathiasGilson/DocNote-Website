# CLAUDE.md

Marketing site for DocNote, https://docnote.care. Astro 5 static build on Cloudflare Pages. Package manager: npm.

## Commands

- `npm run dev` local preview
- `npm test` vitest for `src/utils/*.test.ts`
- `npm run build` = astro build → OG cards → markdown twins (`index.md` next to every `index.html`) → `scripts/check-seo.mjs`. The validator fails the build on canonical, hreflang, title, h1, og:image or `/en/` regressions. Fix the page, do not weaken the check.

## URL and locale rules

- Locales: `en` (default, no prefix), `fr`, `de` (prefixed). Trailing slash always. `/en/*` 301s to `/*` (`public/_redirects`).
- Never build a URL with `/${locale}/`. Use `getLocalizedPath(path, locale)` from `src/utils/i18n.ts`.
- Never move a published URL without adding a 301 to `public/_redirects` (specific rules before wildcards).
- New page = one component under `src/components/pages/<Name>Page.astro` taking `{ locale }`, plus `src/pages/<name>.astro` (renders `locale="en"`) and `src/pages/[locale]/<name>.astro` (`getStaticPaths()` over `nonDefaultLocales`). Add it to `STATIC_PAGES` in `src/utils/sitemap-urls.ts` and to `pageMeta` in `src/utils/seo.ts`.

## Markdown twins

- Every page has a static markdown twin at `<url>index.md`, served with `X-Robots-Tag: noindex` via `public/_headers`.
- `Accept: text/markdown` content negotiation is NOT enabled: it needs a Cloudflare Worker (`_worker.js`) which breaks the `/en/*` 301s in Pages advanced mode. A working Workers-mode version (worker plus `wrangler.jsonc` with `main`, `assets.binding: ASSETS`, `run_worker_first: true`) exists in git history at commit `303f4eb` and can be restored once the deploy mode is decided.

## Blog

- One markdown file per locale under `src/content/blog/{en,fr,de}/`. Slugs may be translated; the three files share the same `translationKey` (the EN slug). The build throws if a key has two files for one locale or no EN file.
- Frontmatter schema: `src/content/config.ts`. `excerpt` is the meta description (50 to 200 chars). `category` must be one of `src/content/categories.ts`. Set `updatedDate` whenever you materially edit a post.
- Covers live in `src/assets/blog/` and are referenced relatively (`../../../assets/blog/x.jpg`).
- Categories map to pillars in `src/content/categories.ts`; that mapping drives related articles, the pillar CTA, pillar page listings and the footer.
- Specialty landings: `src/content/specialties.ts`, one entry with EN/FR/DE copy renders `/for/{slug}/` and `/{fr,de}/for/{slug}/`.
- Category hubs are unpaginated; a category that passes 12 posts should be split rather than paged.
- The `translationKey` must equal the EN slug.

## Copy rules

- No em dashes in user-facing copy. Contact email is contact@docnote.ch. Support site is https://support.docnote.care.
