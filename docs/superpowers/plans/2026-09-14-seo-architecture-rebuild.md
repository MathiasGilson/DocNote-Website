# DocNote Website SEO Architecture Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild docnote.care's information architecture so English lives at the root (`/pricing/`) with French and German under a prefix (`/fr/pricing/`, `/de/pricing/`), every URL has one canonical and complete hreflang reciprocity, freshness signals are real, internal linking is hub-and-spoke (pillars → categories → articles → specialties), every page has its own social card, and the build fails when any of that regresses.

**Architecture:** Keep the existing Astro 5 static site, Tailwind 3 and trailing slashes. Adopt the RecordMeeting routing pattern: each page's content is a component that takes `locale`; a root page file renders English and a `[locale]` page file renders the non-default locales. `/en/*` is 301-redirected to `/*`. Replace the hand-maintained blog translation table with a `translationKey` frontmatter field, add category hubs and pagination, compute derived data (reading time, TOC, related posts) at build time, generate OG images and markdown twins after `astro build`, and add a dist-level SEO validator that runs on every build.

**Tech Stack:** Astro 5 (legacy `type: 'content'` collections), Tailwind 3, `sitemap` npm package, satori + @resvg/resvg-js (OG images), node-html-parser (dist validator), vitest (pure utilities), Cloudflare Pages (`_redirects`, `_headers`, `_worker.js`).

**Spec:** This document's "Design decisions" section is the spec. It was derived from comparing [DocNote-Website](/Users/mathias/Documents/Projects/DocNote-Website) against the more mature [RecordMeeting website](/Users/mathias/Documents/Projects/RecordMeeting/src/website), plus the owner's decision that English is the unprefixed default.

## Global Constraints

- Repo: `/Users/mathias/Documents/Projects/DocNote-Website`. Package manager is **npm** (`packageManager: npm@10.9.2`). Never use yarn here.
- Astro `trailingSlash: 'always'` stays. Every internal href ends with `/`.
- Locales stay exactly `['en', 'de', 'fr']` from `src/utils/i18n.ts`. `en` is the default locale and `x-default`.
- English URLs have **no** prefix. French and German URLs are prefixed `/fr/` and `/de/`. `/en` and `/en/*` are 301s to the unprefixed path.
- Contact email in any copy stays `contact@docnote.ch`. Support link stays `https://support.docnote.care`.
- No em dashes in user-facing copy (EN, FR, DE). Use a comma, colon, or full stop instead.
- Commit only at the commit steps below, with conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`), and end each commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Do not deploy. `npm run build` is the verification gate for every task.
- Existing blog post slugs (`src/content/blog/{en,fr,de}/*.md` filenames) do not change. French and German article URLs do not move. English article URLs move from `/en/blog/x/` to `/blog/x/` and are covered by the `/en/*` redirect.
- Never build a page URL by string-concatenating `/${locale}/`. Always go through `getLocalizedPath(path, locale)`.

---

## Design decisions (spec)

### URL scheme

| Surface | English | French / German | Notes |
|---|---|---|---|
| Home | `/` | `/fr/`, `/de/` | `/en/` → 301 `/` |
| Static page | `/pricing/` | `/fr/pricing/` | same for team, tutorial, contact, privacy, gtc, order, emploi, patient, sondage |
| Pillar | `/ai-medical-scribe/` | `/fr/ai-medical-scribe/` | slugs unchanged |
| Blog index | `/blog/` | `/fr/blog/` | page 1, 12 posts |
| Blog pagination | `/blog/page/2/` | `/fr/blog/page/2/` | n ≥ 2, distinct title and description |
| Category hub | `/blog/category/guides/` | `/fr/blog/category/guides/` | one per category |
| Article | `/blog/{slug}/` | `/fr/blog/{slug-fr}/` | translated slugs kept |
| Specialty landing | `/for/radiology/` | `/fr/for/radiology/` | new, data-driven |
| OG image | `/og/{path}og.png` | `/og/fr/{path}og.png` | generated post-build |
| Markdown twin | same URL, `Accept: text/markdown` | same | served by `_worker.js` |

Redirects (`public/_redirects`, Cloudflare Pages format, in this order):

```text
/en /  301
/en/* /:splat 301
```

### Routing pattern

Every page has three files:

1. `src/components/pages/<Name>Page.astro`: all content, `interface Props { locale: Locale }`.
2. `src/pages/<name>.astro`: renders the component with `locale="en"`.
3. `src/pages/[locale]/<name>.astro`: `getStaticPaths()` over `nonDefaultLocales`, renders the component with the param.

Dynamic pages (`[pillar]`, `blog/[slug]`, `blog/category/[category]`, `blog/page/[page]`, `for/[specialty]`) follow the same split, with the dynamic param appended.

### Content model (blog frontmatter v2)

```yaml
title: string                      # required
excerpt: string                    # required, 50 to 200 chars, used as meta description
translationKey: string             # required, the EN slug; identical across the 3 locale files
category: news | guides | compliance | ai-scribe | hospital-workflows | specialties
tags: string[]                     # optional, lowercase kebab-case
author: string
authorRole: string
authorImage: string
image: image()                     # relative path into src/assets/blog/
imagePosition: string              # optional
fullImage: boolean                 # optional
date: string                       # YYYY-MM-DD, datePublished
updatedDate: string                # optional, YYYY-MM-DD, dateModified
faq: { q: string, a: string }[]   # optional, renders FAQ block + FAQPage schema
canonical: string                  # optional, absolute URL override
seoKeywords: string[]              # optional, internal tracking only, never rendered
noindex: boolean                   # optional
```

`readTime` is removed and computed from the body.

Category migration map for the existing 54 files: `ai` → `ai-scribe`, `documentation` → `guides`, `practice` → `hospital-workflows`, `news` → `news`.

### Hub-and-spoke linking

| Category | Pillar it feeds |
|---|---|
| `ai-scribe` | `ai-medical-scribe` |
| `guides` | `ai-medical-scribe` |
| `hospital-workflows` | `hospital-documentation` |
| `specialties` | `hospital-documentation` |
| `compliance` | `clinical-compliance` |
| `news` | none (links to `/team/`) |

- Pillar page lists the 6 latest articles from its categories and links its category hubs.
- Article page shows 3 related articles (same category first, then shared tags), and a CTA to its pillar.
- Category hub links its pillar in the intro.
- Footer links the 3 pillars (already there) and the 6 category hubs.

### Structured data

- Site-wide (unchanged): `Organization`, `WebSite`, `SoftwareApplication`.
- Article: `BlogPosting` with real `dateModified`, `wordCount`, `keywords` from tags, `articleSection` from category, plus `BreadcrumbList`, plus `FAQPage` when `faq` is set.
- Category hub, blog index, pagination: `CollectionPage` + `BreadcrumbList`.
- Specialty: `WebPage` + `BreadcrumbList` + `FAQPage`.

### Sitemaps

`sitemap.xml` index → `sitemap-landings.xml` (home, static, pillars, specialties), `sitemap-blog.xml` (articles, `lastmod` = `updatedDate ?? date`), `sitemap-categories.xml` (blog index, pagination, category hubs). No `/en/` URL is ever listed. Every entry carries `xhtml:link` alternates for the locales that exist plus `x-default` (the English URL).

### Build gate

`npm run build` = `astro build` → `generate-og-images.mjs` → `generate-markdown.mjs` → `check-seo.mjs`. The validator fails the build on: any built page under `dist/en/`, missing or non-self canonical, missing meta description, duplicate `<title>` across pages, more or fewer than one `<h1>`, hreflang pointing at a URL that does not exist in `dist/`, non-reciprocal hreflang, `og:image` pointing at a file that does not exist in `dist/`.

---

## File map

**Create**
- `public/_redirects` : `/en` and `/en/*` 301s.
- `src/components/pages/*Page.astro` : one per existing page (Home, Pricing, Team, Tutorial, Contact, Privacy, Gtc, Order, Emploi, Patient, Sondage, Pillar) plus `BlogIndexPage`, `BlogPostLayout`, `SpecialtyPage`.
- `src/pages/{pricing,team,tutorial,contact,privacy,gtc,order,emploi,patient,sondage}.astro`, `src/pages/[pillar].astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/blog/page/[page].astro`, `src/pages/blog/category/[category].astro`, `src/pages/for/[specialty].astro` : English thin pages.
- Mirrors of all of the above under `src/pages/[locale]/` : non-default thin pages.
- `src/content/categories.ts`, `src/content/specialties.ts`.
- `src/utils/blog.ts` (pure, tested), `src/utils/blog-collection.ts` (needs `astro:content`), `src/utils/blog.test.ts`, `src/utils/i18n.test.ts`, `src/utils/seo.test.ts`.
- `src/components/BlogCard.astro`, `src/components/TableOfContents.astro`.
- `src/pages/sitemap-categories.xml.ts`.
- `scripts/migrate-blog-frontmatter.mjs`, `scripts/generate-og-images.mjs`, `scripts/generate-markdown.mjs`, `scripts/html-to-markdown.mjs`, `scripts/check-seo.mjs`.
- `public/_worker.js`, `vitest.config.ts`, `CLAUDE.md`.

**Modify**
- `src/utils/i18n.ts` : `getLocalizedPath`, `getLocaleFromUrl`, add `nonDefaultLocales`.
- `src/utils/seo.ts` : `getDefaultAlternates`.
- `src/utils/sitemap-urls.ts`, `src/utils/sitemap-response.ts`, `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `public/_headers`, `public/llms.txt`.
- `src/layouts/Layout.astro` : x-default fallback, default `og:image`, `noindex`, `canonicalOverride`, article times.
- `src/content/config.ts`, `src/content/pages/{en,fr,de}.json`, `src/components/Footer.astro`, `package.json`.
- 54 files under `src/content/blog/` (frontmatter only, by script).

**Delete**
- `src/utils/blog-translations.ts`.
- Blog cover images under `public/images/` (moved to `src/assets/blog/`).

---

### Task 1: Test tooling and locale helpers for English at root

**Files:**
- Create: `vitest.config.ts`, `src/utils/i18n.test.ts`, `src/utils/seo.test.ts`, `public/_redirects`
- Modify: `src/utils/i18n.ts`, `src/utils/seo.ts`, `src/utils/sitemap-urls.ts`, `src/layouts/Layout.astro:193`, `package.json`

**Interfaces:**
- Produces (from `src/utils/i18n.ts`): `nonDefaultLocales: readonly Locale[]` (`['de', 'fr']`); `getLocalizedPath(path, locale)` returns `/pricing/` for `en` and `/fr/pricing/` for `fr`; `getLocaleFromUrl(url)` returns `en` for any unprefixed path; `getPathWithoutLocale` unchanged.
- Produces (from `src/utils/seo.ts`): `getDefaultAlternates(pathname)` returns `{ en: 'https://docnote.care/pricing/', fr: '.../fr/pricing/', de: '.../de/pricing/' }`.

- [ ] **Step 1: Install vitest**

```bash
npm install --save-dev vitest@^3
```

Add to `package.json` scripts: `"test": "vitest run"`.

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 2: Write the failing tests**

`src/utils/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getLocaleFromUrl, getLocalizedPath, getPathWithoutLocale, nonDefaultLocales } from './i18n';

describe('nonDefaultLocales', () => {
  it('excludes en', () => {
    expect([...nonDefaultLocales].sort()).toEqual(['de', 'fr']);
  });
});

describe('getLocalizedPath', () => {
  it('leaves English unprefixed with a trailing slash', () => {
    expect(getLocalizedPath('/', 'en')).toBe('/');
    expect(getLocalizedPath('/pricing', 'en')).toBe('/pricing/');
    expect(getLocalizedPath('blog/soap-notes', 'en')).toBe('/blog/soap-notes/');
  });
  it('prefixes other locales', () => {
    expect(getLocalizedPath('/', 'fr')).toBe('/fr/');
    expect(getLocalizedPath('/pricing', 'de')).toBe('/de/pricing/');
  });
});

describe('getLocaleFromUrl', () => {
  it('detects prefixed locales', () => {
    expect(getLocaleFromUrl(new URL('https://docnote.care/fr/pricing/'))).toBe('fr');
  });
  it('falls back to en for unprefixed paths', () => {
    expect(getLocaleFromUrl(new URL('https://docnote.care/'))).toBe('en');
    expect(getLocaleFromUrl(new URL('https://docnote.care/pricing/'))).toBe('en');
  });
});

describe('getPathWithoutLocale', () => {
  it('strips a locale prefix and leaves other paths alone', () => {
    expect(getPathWithoutLocale('/fr/pricing/')).toBe('/pricing/');
    expect(getPathWithoutLocale('/pricing/')).toBe('/pricing/');
    expect(getPathWithoutLocale('/de/')).toBe('/');
  });
});
```

`src/utils/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getDefaultAlternates } from './seo';

describe('getDefaultAlternates', () => {
  it('maps an English path to all locales', () => {
    expect(getDefaultAlternates('/pricing/')).toEqual({
      en: 'https://docnote.care/pricing/',
      fr: 'https://docnote.care/fr/pricing/',
      de: 'https://docnote.care/de/pricing/',
    });
  });
  it('maps a prefixed path to all locales', () => {
    expect(getDefaultAlternates('/de/team/').en).toBe('https://docnote.care/team/');
  });
  it('handles the home page', () => {
    expect(getDefaultAlternates('/fr/')).toEqual({
      en: 'https://docnote.care/',
      fr: 'https://docnote.care/fr/',
      de: 'https://docnote.care/de/',
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL. `nonDefaultLocales` is not exported, and `getLocalizedPath('/pricing', 'en')` returns `/en/pricing/`.

- [ ] **Step 4: Update `src/utils/i18n.ts`**

Replace `getLocalizedPath` and `getPathWithoutLocale`, and add `nonDefaultLocales`:

```ts
export const nonDefaultLocales = locales.filter((l) => l !== defaultLocale) as readonly Locale[];

export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const withSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  if (locale === defaultLocale) return withSlash;
  return withSlash === '/' ? `/${locale}/` : `/${locale}${withSlash}`;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) segments.shift();
  return segments.length ? `/${segments.join('/')}/` : '/';
}
```

`getLocaleFromUrl` already returns `defaultLocale` for unprefixed paths; leave it.

- [ ] **Step 5: Update `getDefaultAlternates` in `src/utils/seo.ts`**

```ts
import { getLocalizedPath, locales, type Locale } from './i18n';

export const getDefaultAlternates = (pathname: string): Record<Locale, string> => {
  const segments = pathname.split('/').filter(Boolean);
  const rest =
    segments.length > 0 && locales.includes(segments[0] as Locale)
      ? segments.slice(1).join('/')
      : segments.join('/');
  const suffix = rest ? `/${rest}` : '/';
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(getLocalizedPath(suffix, locale))])
  ) as Record<Locale, string>;
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 9 tests.

- [ ] **Step 7: Sitemap helper, Layout fallback, redirects**

In `src/utils/sitemap-urls.ts`:
- Replace `localeLinks` with

```ts
const localeLinks = (site: string, pathSuffix: string) => [
  ...locales.map((locale) => ({ lang: locale, url: toAbs(site, getLocalizedPath(pathSuffix, locale)) })),
  { lang: 'x-default', url: toAbs(site, getLocalizedPath(pathSuffix, 'en')) },
];
```

- In `getLandingUrls`, replace the whole home block and the static loop with

```ts
  for (const path of ['/', ...STATIC_PAGES.map((p) => `${p}/`)]) {
    const links = localeLinks(site, path);
    for (const locale of locales) entries.push({ url: toAbs(site, getLocalizedPath(path, locale)), links });
  }
```

- Import `getLocalizedPath` from `./i18n`. Leave `getBlogUrls` for Task 4, except: replace `` toAbs(site, `/${locale}/blog/${slug}/`) `` with `` toAbs(site, getLocalizedPath(`/blog/${slug}`, locale as Locale)) `` so English articles are listed at `/blog/`.

In `src/utils/blog-translations.ts` (still alive until Task 4), change the URL construction to `absoluteUrl(getLocalizedPath(\`/blog/${slug}\`, locale))`.

In `src/layouts/Layout.astro` line 193, change the fallback `absoluteUrl('/en/')` to `absoluteUrl('/')`.

Create `public/_redirects`:

```text
# Cloudflare Pages redirects. Specific rules first.
# English moved from /en/... to the root; keep old links and Google's index alive.
/en /  301
/en/* /:splat 301
```

- [ ] **Step 8: Commit**

The site does not build cleanly yet (pages still emit `/en/`); that is fixed in Task 2. Commit the helpers now because they are tested in isolation.

```bash
git add package.json package-lock.json vitest.config.ts src/utils/i18n.ts src/utils/i18n.test.ts src/utils/seo.ts src/utils/seo.test.ts src/utils/sitemap-urls.ts src/utils/blog-translations.ts src/layouts/Layout.astro public/_redirects
git commit -m "feat(i18n): English is the unprefixed default locale in path helpers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Move every page to the component + root + `[locale]` pattern

**Files:**
- Create: `src/components/pages/{Home,Pricing,Team,Tutorial,Contact,Privacy,Gtc,Order,Emploi,Patient,Sondage,Pillar,BlogIndex,BlogPost}Page.astro`
- Create: `src/pages/{pricing,team,tutorial,contact,privacy,gtc,order,emploi,patient,sondage}.astro`, `src/pages/[pillar].astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`
- Modify: every file under `src/pages/[locale]/` (becomes thin), `src/pages/index.astro`, `public/llms.txt`
- Modify: any component that reads `Astro.params.locale` or builds `/${locale}/` strings (`grep -rn '\${locale}/' src`)

**Interfaces:**
- Produces: each `src/components/pages/<Name>Page.astro` exports `interface Props { locale: Locale }` and nothing else. `PillarPage` takes `{ locale: Locale; pillar: PillarSlug }`. `BlogPostPage` takes `{ locale: Locale; post: CollectionEntry<'blog'> }`.

- [ ] **Step 1: Convert the ten simple static pages**

For each `name` in `pricing team tutorial contact privacy gtc order emploi patient sondage`, do the following (shown for `pricing`; repeat verbatim for the others, matching the file's own quote style):

1. `git mv "src/pages/[locale]/pricing.astro" src/components/pages/PricingPage.astro`.
2. In the moved file, delete the `export function getStaticPaths() { ... }` block and the `if (!isValidLocale(locale)) { return Astro.redirect(...) }` block.
3. Replace `const { locale } = Astro.params;` with

```ts
interface Props { locale: Locale }
const { locale } = Astro.props;
```

4. Fix relative imports (they were two levels deep, now `../../` still resolves from `src/components/pages/`; components imported as `../../components/X.astro` become `../X.astro`).
5. Replace every `` absoluteUrl(`/${locale}/…`) `` with `` absoluteUrl(getLocalizedPath('/…', locale)) `` (import `getLocalizedPath` if missing). `pricing.astro` and `order.astro` have breadcrumb URLs built this way.
6. Create `src/pages/pricing.astro`:

```astro
---
import PricingPage from '../components/pages/PricingPage.astro';
---
<PricingPage locale="en" />
```

7. Create `src/pages/[locale]/pricing.astro`:

```astro
---
import PricingPage from '../../components/pages/PricingPage.astro';
import { nonDefaultLocales, type Locale } from '../../utils/i18n';

export function getStaticPaths() {
  return nonDefaultLocales.map((locale) => ({ params: { locale } }));
}
const locale = Astro.params.locale as Locale;
---
<PricingPage locale={locale} />
```

- [ ] **Step 2: Convert the home page**

`src/pages/index.astro` already renders `<Main locale="en" variant="default" />`; keep it. In `src/pages/[locale]/index.astro`, change `locales.map` to `nonDefaultLocales.map`, delete the `isValidLocale` redirect, and keep `variant="locale"`. No component split is needed because `Main.astro` already is the component.

- [ ] **Step 3: Convert the pillar page**

1. `git mv "src/pages/[locale]/[pillar].astro" src/components/pages/PillarPage.astro`.
2. Delete `getStaticPaths` and the redirect guard. Replace `const { locale, pillar } = Astro.params;` and the `lang`/`slug` casts with

```ts
interface Props { locale: Locale; pillar: PillarSlug }
const { locale: lang, pillar: slug } = Astro.props;
```

3. Replace `` absoluteUrl(`/${lang}/`) `` with `absoluteUrl(getLocalizedPath('/', lang))` and `` absoluteUrl(`/${lang}/${slug}/`) `` with `` absoluteUrl(getLocalizedPath(`/${slug}`, lang)) ``.
4. `src/pages/[pillar].astro`:

```astro
---
import PillarPage from '../components/pages/PillarPage.astro';
import { pillarSlugs, type PillarSlug } from '../content/pillars';

export function getStaticPaths() {
  return pillarSlugs.map((pillar) => ({ params: { pillar } }));
}
const pillar = Astro.params.pillar as PillarSlug;
---
<PillarPage locale="en" pillar={pillar} />
```

5. `src/pages/[locale]/[pillar].astro`:

```astro
---
import PillarPage from '../../components/pages/PillarPage.astro';
import { pillarSlugs, type PillarSlug } from '../../content/pillars';
import { nonDefaultLocales, type Locale } from '../../utils/i18n';

export function getStaticPaths() {
  return nonDefaultLocales.flatMap((locale) => pillarSlugs.map((pillar) => ({ params: { locale, pillar } })));
}
const { locale, pillar } = Astro.params as { locale: Locale; pillar: PillarSlug };
---
<PillarPage locale={locale} pillar={pillar} />
```

Astro's route priority puts static routes (`/pricing/`) ahead of `[pillar]`, and `[locale]/[pillar]` only generates paths for `fr`/`de`, so `/fr/pricing/` and `/fr/ai-medical-scribe/` do not collide.

- [ ] **Step 4: Convert the blog index and article pages**

Blog index: `git mv "src/pages/[locale]/blog/index.astro" src/components/pages/BlogIndexPage.astro`, apply the same three edits (drop `getStaticPaths`, drop the guard, `Props { locale }`), replace `` absoluteUrl(`/${locale}/`) `` and `` absoluteUrl(`/${locale}/blog/`) `` with `getLocalizedPath` calls, and keep everything else. This file is rewritten again in Task 6, so do not polish it.

`src/pages/blog/index.astro`:

```astro
---
import BlogIndexPage from '../../components/pages/BlogIndexPage.astro';
---
<BlogIndexPage locale="en" />
```

`src/pages/[locale]/blog/index.astro`:

```astro
---
import BlogIndexPage from '../../../components/pages/BlogIndexPage.astro';
import { nonDefaultLocales, type Locale } from '../../../utils/i18n';

export function getStaticPaths() {
  return nonDefaultLocales.map((locale) => ({ params: { locale } }));
}
---
<BlogIndexPage locale={Astro.params.locale as Locale} />
```

Article: `git mv "src/pages/[locale]/blog/[slug].astro" src/components/pages/BlogPostPage.astro`. Drop `getStaticPaths` and the guard. Its frontmatter currently derives `post` from params; change to

```ts
import type { CollectionEntry } from 'astro:content';
interface Props { locale: Locale; post: CollectionEntry<'blog'> }
const { locale, post } = Astro.props;
const slug = post.slug.split('/').slice(1).join('/');
```

and replace `` absoluteUrl(`/${locale}/blog/${slug}`) `` with `` absoluteUrl(getLocalizedPath(`/blog/${slug}`, locale)) `` (and the same for the breadcrumb URLs).

`src/pages/blog/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BlogPostPage from '../../components/pages/BlogPostPage.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ id }) => id.startsWith('en/'));
  return posts.map((post) => ({ params: { slug: post.slug.split('/').slice(1).join('/') }, props: { post } }));
}
---
<BlogPostPage locale="en" post={Astro.props.post} />
```

`src/pages/[locale]/blog/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BlogPostPage from '../../../components/pages/BlogPostPage.astro';
import { nonDefaultLocales, type Locale } from '../../../utils/i18n';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ id }) => nonDefaultLocales.some((l) => id.startsWith(`${l}/`)));
  return posts.map((post) => {
    const [locale, ...rest] = post.slug.split('/');
    return { params: { locale, slug: rest.join('/') }, props: { post } };
  });
}
const locale = Astro.params.locale as Locale;
---
<BlogPostPage locale={locale} post={Astro.props.post} />
```

- [ ] **Step 5: Sweep the remaining hardcoded locale paths**

Run: `grep -rn '\${locale}/\|\${lang}/\|/en/' src --include='*.astro' --include='*.ts' | grep -v content/blog | grep -v hug.ch`
Expected after fixes: no output. Fix each hit with `getLocalizedPath`. Known ones: `Testimonials.astro` (external hug.ch link, leave it), `sitemap-urls.ts` x-default (already handled in Task 1).

In `public/llms.txt`, replace every `https://docnote.care/en/` with `https://docnote.care/` (20 occurrences).

- [ ] **Step 6: Build and verify**

Run: `npm run build && test ! -d dist/en && ls dist/pricing/index.html dist/fr/pricing/index.html dist/blog/soap-notes-best-practices/index.html dist/de/blog/soap-notes-best-practices/index.html && grep -o 'hreflang="[^"]*" href="[^"]*"' dist/de/pricing/index.html && grep -c '/en/' dist/sitemap-landings.xml dist/sitemap-blog.xml`
Expected: build passes, no `dist/en`, all four files exist, hreflang shows `en` → `https://docnote.care/pricing/`, `fr` → `/fr/pricing/`, `de` → `/de/pricing/`, `x-default` → `/pricing/`; both sitemap greps print `0`.

Run: `npx wrangler pages dev dist --port 8788 & sleep 4; curl -sI http://localhost:8788/en/pricing/ | grep -iE '^(HTTP|location)'; curl -sI http://localhost:8788/en/ | grep -iE '^(HTTP|location)'; kill %1`
Expected: `301` with `location: /pricing/`, and `301` with `location: /`.

- [ ] **Step 7: Commit**

```bash
git add -A src/pages src/components/pages public/llms.txt src/components
git commit -m "refactor(routing): English pages at the root, fr/de under a prefix, /en/* redirected

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Pure blog utilities

**Files:**
- Create: `src/utils/blog.ts`, `src/utils/blog.test.ts`

**Interfaces:**
- Produces (all exported from `src/utils/blog.ts`):
  - `PAGE_SIZE = 12`.
  - `getPostSlug(id: string): string` : `"en/foo.md"` → `"foo"`.
  - `estimateReadingTime(markdown: string): number` : minutes, 200 wpm, minimum 1.
  - `paginatePosts<T>(items: T[], pageSize: number): T[][]`.
  - `pickRelatedPosts<T extends RelatedInput>(current: T, all: T[], limit?: number): T[]` where `RelatedInput = { slug: string; category: string; tags?: string[]; date: string }`.
  - `buildTranslationMap(entries: TranslationInput[]): Map<string, Partial<Record<Locale, string>>>` where `TranslationInput = { locale: Locale; slug: string; translationKey: string }`. Throws on a duplicate `(translationKey, locale)` pair and on a key with no `en` entry.

- [ ] **Step 1: Write the failing tests**

`src/utils/blog.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildTranslationMap, estimateReadingTime, getPostSlug, paginatePosts, pickRelatedPosts } from './blog';

describe('getPostSlug', () => {
  it('strips the locale folder and extension', () => {
    expect(getPostSlug('en/soap-notes-best-practices.md')).toBe('soap-notes-best-practices');
    expect(getPostSlug('fr/docnote-mode-radiologie')).toBe('docnote-mode-radiologie');
  });
});

describe('estimateReadingTime', () => {
  it('rounds up at 200 words per minute with a floor of 1', () => {
    expect(estimateReadingTime('one two three')).toBe(1);
    expect(estimateReadingTime(Array(401).fill('word').join(' '))).toBe(3);
  });
  it('ignores markdown syntax and image lines', () => {
    expect(estimateReadingTime('# Title\n\n![alt](/images/x.jpg)\n\n**bold** text here')).toBe(1);
  });
});

describe('paginatePosts', () => {
  it('splits into fixed-size pages, last page shorter', () => {
    expect(paginatePosts([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('returns one empty page for no items', () => {
    expect(paginatePosts([], 12)).toEqual([[]]);
  });
});

describe('pickRelatedPosts', () => {
  const posts = [
    { slug: 'a', category: 'guides', tags: ['soap', 'notes'], date: '2026-01-01' },
    { slug: 'b', category: 'guides', tags: ['soap'], date: '2026-02-01' },
    { slug: 'c', category: 'news', tags: ['soap', 'notes'], date: '2026-03-01' },
    { slug: 'd', category: 'compliance', tags: [], date: '2026-04-01' },
    { slug: 'e', category: 'guides', tags: [], date: '2026-05-01' },
  ];
  it('prefers same category, then shared tags, then recency, and excludes itself', () => {
    expect(pickRelatedPosts(posts[0], posts, 3).map((p) => p.slug)).toEqual(['b', 'e', 'c']);
  });
  it('respects the limit', () => {
    expect(pickRelatedPosts(posts[0], posts, 1)).toHaveLength(1);
  });
});

describe('buildTranslationMap', () => {
  it('groups slugs by translationKey', () => {
    const map = buildTranslationMap([
      { locale: 'en', slug: 'soap-notes', translationKey: 'soap-notes' },
      { locale: 'fr', slug: 'notes-soap', translationKey: 'soap-notes' },
    ]);
    expect(map.get('soap-notes')).toEqual({ en: 'soap-notes', fr: 'notes-soap' });
  });
  it('throws on duplicate locale for a key', () => {
    expect(() =>
      buildTranslationMap([
        { locale: 'en', slug: 'a', translationKey: 'k' },
        { locale: 'en', slug: 'b', translationKey: 'k' },
      ])
    ).toThrow(/duplicate/);
  });
  it('throws when a key has no English entry', () => {
    expect(() => buildTranslationMap([{ locale: 'fr', slug: 'a', translationKey: 'k' }])).toThrow(/no English/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, `Cannot find module './blog'`.

- [ ] **Step 3: Implement `src/utils/blog.ts`**

```ts
import type { Locale } from './i18n';

export const PAGE_SIZE = 12;

export function getPostSlug(id: string): string {
  return id.split('/').slice(1).join('/').replace(/\.mdx?$/, '');
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(markdown: string): number {
  const text = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/[#>*_`~\-|]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function paginatePosts<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
  return pages;
}

export type RelatedInput = { slug: string; category: string; tags?: string[]; date: string };

export function pickRelatedPosts<T extends RelatedInput>(current: T, all: T[], limit = 3): T[] {
  const currentTags = new Set(current.tags ?? []);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const sharedTags = (p.tags ?? []).filter((t) => currentTags.has(t)).length;
      return { p, score: (p.category === current.category ? 10 : 0) + sharedTags };
    })
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map(({ p }) => p);
}

export type TranslationInput = { locale: Locale; slug: string; translationKey: string };

export function buildTranslationMap(entries: TranslationInput[]): Map<string, Partial<Record<Locale, string>>> {
  const map = new Map<string, Partial<Record<Locale, string>>>();
  for (const { locale, slug, translationKey } of entries) {
    const group = map.get(translationKey) ?? {};
    if (group[locale]) {
      throw new Error(`Blog: duplicate translationKey "${translationKey}" for locale ${locale} (${group[locale]} and ${slug})`);
    }
    group[locale] = slug;
    map.set(translationKey, group);
  }
  for (const [key, group] of map) {
    if (!group.en) throw new Error(`Blog: translationKey "${key}" has no English entry (x-default needs one)`);
  }
  return map;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 19 tests total.

- [ ] **Step 5: Commit**

```bash
git add src/utils/blog.ts src/utils/blog.test.ts
git commit -m "feat(blog): pure utilities for reading time, pagination, related posts, translation map

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Blog frontmatter v2 and one-shot migration

**Files:**
- Create: `src/content/categories.ts`, `src/utils/blog-collection.ts`, `scripts/migrate-blog-frontmatter.mjs`, `src/assets/blog/`
- Modify: `src/content/config.ts`, `src/content/pages/{en,fr,de}.json`, all 54 files under `src/content/blog/`, `src/utils/sitemap-urls.ts`, `src/utils/sitemap-response.ts`, `src/components/pages/BlogPostPage.astro`, `src/components/pages/BlogIndexPage.astro`
- Delete: `src/utils/blog-translations.ts`

**Interfaces:**
- Produces: `CATEGORIES`, `CATEGORY_SLUGS`, `CATEGORY_LIST`, `pillarCategories(pillar)` from `src/content/categories.ts`; type `BlogCategory`. From `src/utils/blog-collection.ts`: `type BlogEntry = CollectionEntry<'blog'>`, `getPostLocale(entry): Locale`, `getPostsForLocale(locale): Promise<BlogEntry[]>` (sorted newest first, `noindex` excluded), `getBlogAlternateUrls(translationKey): Promise<Partial<Record<Locale, string>>>` (absolute URLs via `getLocalizedPath`).
- Consumes: `buildTranslationMap`, `getPostSlug` (Task 3), `getLocalizedPath` (Task 1).

- [ ] **Step 1: Define categories**

`src/content/categories.ts`:

```ts
import type { Locale } from '../utils/i18n';
import type { PillarSlug } from './pillars';

export const CATEGORY_SLUGS = ['news', 'guides', 'compliance', 'ai-scribe', 'hospital-workflows', 'specialties'] as const;
export type BlogCategory = (typeof CATEGORY_SLUGS)[number];

export type CategoryDef = {
  slug: BlogCategory;
  pillar: PillarSlug | null;
  badge: string;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const CATEGORIES: Record<BlogCategory, CategoryDef> = {
  news: {
    slug: 'news',
    pillar: null,
    badge: 'bg-purple-100 text-purple-700',
    label: { en: 'News', fr: 'Actualités', de: 'News' },
    description: {
      en: 'Product releases, conferences, partnerships and press coverage of DocNote.',
      fr: 'Nouveautés produit, congrès, partenariats et couverture presse de DocNote.',
      de: 'Produktneuheiten, Kongresse, Partnerschaften und Presseberichte über DocNote.',
    },
  },
  guides: {
    slug: 'guides',
    pillar: 'ai-medical-scribe',
    badge: 'bg-green-100 text-green-700',
    label: { en: 'Guides', fr: 'Guides', de: 'Anleitungen' },
    description: {
      en: 'Step by step guides to clinical documentation: SOAP notes, discharge letters, templates and dictation workflows.',
      fr: 'Guides pas à pas sur la documentation clinique : notes SOAP, lettres de sortie, modèles et dictée.',
      de: 'Schritt für Schritt Anleitungen zur klinischen Dokumentation: SOAP-Notizen, Austrittsberichte, Vorlagen und Diktat.',
    },
  },
  compliance: {
    slug: 'compliance',
    pillar: 'clinical-compliance',
    badge: 'bg-amber-100 text-amber-700',
    label: { en: 'Compliance', fr: 'Conformité', de: 'Compliance' },
    description: {
      en: 'FADP, GDPR, HIPAA and ISO 27001 explained for doctors who want to use AI without risking patient data.',
      fr: 'nLPD, RGPD, HIPAA et ISO 27001 expliqués aux médecins qui veulent utiliser l’IA sans risque pour les données patients.',
      de: 'DSG, DSGVO, HIPAA und ISO 27001 erklärt für Ärztinnen und Ärzte, die KI ohne Risiko für Patientendaten nutzen wollen.',
    },
  },
  'ai-scribe': {
    slug: 'ai-scribe',
    pillar: 'ai-medical-scribe',
    badge: 'bg-blue-100 text-blue-700',
    label: { en: 'AI scribe', fr: 'Scribe IA', de: 'KI-Schreibassistent' },
    description: {
      en: 'How ambient AI scribes work, what they get wrong, and how to evaluate one for your practice.',
      fr: 'Comment fonctionnent les scribes IA, leurs limites, et comment en évaluer un pour votre cabinet.',
      de: 'Wie KI-Schreibassistenten funktionieren, wo sie Fehler machen und wie Sie einen für Ihre Praxis bewerten.',
    },
  },
  'hospital-workflows': {
    slug: 'hospital-workflows',
    pillar: 'hospital-documentation',
    badge: 'bg-orange-100 text-orange-700',
    label: { en: 'Hospital workflows', fr: 'Flux hospitaliers', de: 'Spitalprozesse' },
    description: {
      en: 'Ward rounds, operative reports, EHR integration and physician burnout: documentation at hospital scale.',
      fr: 'Visites, comptes rendus opératoires, intégration DPI et épuisement des médecins : la documentation à l’échelle de l’hôpital.',
      de: 'Visiten, OP-Berichte, KIS-Integration und Burnout: Dokumentation im Spitalalltag.',
    },
  },
  specialties: {
    slug: 'specialties',
    pillar: 'hospital-documentation',
    badge: 'bg-teal-100 text-teal-700',
    label: { en: 'Specialties', fr: 'Spécialités', de: 'Fachgebiete' },
    description: {
      en: 'Documentation practices by specialty: radiology, surgery, dentistry, general practice and more.',
      fr: 'La documentation par spécialité : radiologie, chirurgie, dentisterie, médecine générale et plus.',
      de: 'Dokumentation nach Fachgebiet: Radiologie, Chirurgie, Zahnmedizin, Allgemeinmedizin und mehr.',
    },
  },
};

export const CATEGORY_LIST = CATEGORY_SLUGS.map((slug) => CATEGORIES[slug]);

export const pillarCategories = (pillar: PillarSlug): CategoryDef[] => CATEGORY_LIST.filter((c) => c.pillar === pillar);
```

- [ ] **Step 2: Update the blog schema in `src/content/config.ts`**

Replace the `blogCollection` definition with:

```ts
import { CATEGORY_SLUGS } from './categories';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string().min(50).max(200),
      translationKey: z.string().regex(/^[a-z0-9-]+$/),
      category: z.enum(CATEGORY_SLUGS),
      tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
      author: z.string(),
      authorRole: z.string(),
      authorImage: z.string(),
      image: image(),
      imagePosition: z.string().optional(),
      fullImage: z.boolean().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      updatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      canonical: z.string().url().optional(),
      seoKeywords: z.array(z.string()).optional(),
      noindex: z.boolean().default(false),
    }),
});
```

In `pagesCollection`, replace the `blog: z.object({...})` block with:

```ts
    blog: z.object({
      title: z.string(),
      subtitle: z.string(),
      readMore: z.string(),
      backToBlog: z.string(),
      recentPosts: z.string(),
      minRead: z.string(),
      shareArticle: z.string(),
      allPosts: z.string(),
      pageLabel: z.string(),
      previousPage: z.string(),
      nextPage: z.string(),
      relatedTitle: z.string(),
      faqTitle: z.string(),
      updatedLabel: z.string(),
      onThisPage: z.string(),
      pillarCta: z.string(),
    }),
```

- [ ] **Step 3: Add the new pages copy**

In `src/content/pages/en.json`, inside `"blog"`, remove the `"categories"` object and add:

```json
"allPosts": "All articles",
"pageLabel": "Page {n}",
"previousPage": "Newer articles",
"nextPage": "Older articles",
"relatedTitle": "Related articles",
"faqTitle": "Frequently asked questions",
"updatedLabel": "Updated",
"onThisPage": "On this page",
"pillarCta": "Read the full guide"
```

`fr.json`:

```json
"allPosts": "Tous les articles",
"pageLabel": "Page {n}",
"previousPage": "Articles plus récents",
"nextPage": "Articles plus anciens",
"relatedTitle": "Articles liés",
"faqTitle": "Questions fréquentes",
"updatedLabel": "Mis à jour",
"onThisPage": "Sur cette page",
"pillarCta": "Lire le guide complet"
```

`de.json`:

```json
"allPosts": "Alle Artikel",
"pageLabel": "Seite {n}",
"previousPage": "Neuere Artikel",
"nextPage": "Ältere Artikel",
"relatedTitle": "Verwandte Artikel",
"faqTitle": "Häufige Fragen",
"updatedLabel": "Aktualisiert",
"onThisPage": "Auf dieser Seite",
"pillarCta": "Zum vollständigen Leitfaden"
```

- [ ] **Step 4: Move blog cover images into `src/assets/blog/`**

```bash
mkdir -p src/assets/blog
for f in $(grep -h '^image:' src/content/blog/*/*.md | sed -E 's/^image: *"?\/images\/([^"]+)"?/\1/' | sort -u); do
  git mv "public/images/$f" "src/assets/blog/$f"
done
```

Inline images inside article bodies (`![...](/images/...)`) stay in `public/images/`.

- [ ] **Step 5: Write the migration script**

`scripts/migrate-blog-frontmatter.mjs`:

```js
/**
 * One-shot migration to blog frontmatter v2.
 *  - category: ai -> ai-scribe, documentation -> guides, practice -> hospital-workflows
 *  - translationKey: from the legacy cluster table (EN slug), fallback to the file's own slug
 *  - image: /images/x.jpg -> ../../../assets/blog/x.jpg
 *  - readTime: removed
 * Run once: node scripts/migrate-blog-frontmatter.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CATEGORY_MAP = { ai: 'ai-scribe', documentation: 'guides', practice: 'hospital-workflows', news: 'news' };

// Copied verbatim from src/utils/blog-translations.ts before deleting it.
const CLUSTERS = [
  { en: 'less-time-documenting-ai-more-care', fr: 'moins-temps-documenter-ia-plus-soigner', de: 'weniger-zeit-dokumentieren-ki-mehr-pflegen' },
  { en: 'docnote-gdpr-nfadp-compliance', fr: 'docnote-conformite-rgpd-nlpd', de: 'docnote-dsgvo-ndsg-konformitaet' },
  { en: 'docnote-radiology-mode', fr: 'docnote-mode-radiologie', de: 'docnote-radiologie-modus' },
  { en: 'docnote-mediway-integration', fr: 'docnote-integration-mediway', de: 'docnote-mediway-integration' },
  { en: 'docnote-les-echos-european-ai-health', fr: 'docnote-les-echos-acteurs-ia-sante', de: 'docnote-les-echos-ki-gesundheit' },
  { en: 'sgaim-presentation-april-2025', fr: 'sgaim-presentation-avril-2025', de: 'sgaim-praesentation-april-2025' },
  { en: 'scs-lucerne-june-2026', fr: 'scs-lucerne-juin-2026', de: 'scs-luzern-juni-2026' },
  { en: 'scs-lausanne-may-2025', fr: 'scs-lausanne-mai-2025', de: 'scs-lausanne-mai-2025' },
  { en: 'medintechs-paris-march-2026', fr: 'medintechs-paris-mars-2026', de: 'medintechs-paris-maerz-2026' },
  { en: 'fongit-startup-support-march-2026', fr: 'fongit-initial-startup-support-mars-2026', de: 'fongit-startup-support-maerz-2026' },
  { en: 'ecc-st-gallen-december-2025', fr: 'ecc-st-gallen-decembre-2025', de: 'ecc-st-gallen-dezember-2025' },
  { en: 'chu-bordeaux-december-2025', fr: 'chu-bordeaux-decembre-2025', de: 'chu-bordeaux-dezember-2025' },
  { en: 'buzz-esante-feature-april-2026', fr: 'buzz-esante-avril-2026', de: 'buzz-esante-april-2026' },
  { en: 'adopt-ai-paris-november-2025', fr: 'adopt-ai-paris-novembre-2025', de: 'adopt-ai-paris-november-2025' },
  { en: 'soap-notes-best-practices', fr: 'soap-notes-best-practices', de: 'soap-notes-best-practices' },
  { en: 'future-of-ai-medical-documentation', fr: 'future-of-ai-medical-documentation', de: 'future-of-ai-medical-documentation' },
  { en: 'hipaa-compliance-ai-tools', fr: 'hipaa-compliance-ai-tools', de: 'hipaa-compliance-ai-tools' },
  { en: 'reducing-physician-burnout', fr: 'reducing-physician-burnout', de: 'reducing-physician-burnout' },
];

const keyFor = (locale, slug) => CLUSTERS.find((c) => c[locale] === slug)?.en ?? slug;

const root = 'src/content/blog';
for (const locale of ['en', 'fr', 'de']) {
  for (const file of await readdir(join(root, locale))) {
    if (!file.endsWith('.md')) continue;
    const path = join(root, locale, file);
    const slug = file.replace(/\.md$/, '');
    const src = await readFile(path, 'utf8');
    const match = src.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) throw new Error(`No frontmatter in ${path}`);
    let fm = match[1];

    fm = fm.replace(/^category: *"?(\w+)"?$/m, (_, c) => `category: "${CATEGORY_MAP[c] ?? c}"`);
    fm = fm.replace(/^image: *"?\/images\/([^"\n]+)"?$/m, (_, f) => `image: "../../../assets/blog/${f}"`);
    fm = fm.replace(/^readTime:.*\n?/m, '');
    if (!/^translationKey:/m.test(fm)) fm = fm.replace(/^title:.*$/m, (line) => `${line}\ntranslationKey: "${keyFor(locale, slug)}"`);

    await writeFile(path, `---\n${fm}\n---\n${src.slice(match[0].length)}`);
    console.log(`migrated ${path}`);
  }
}
```

- [ ] **Step 6: Run the migration**

Run: `node scripts/migrate-blog-frontmatter.mjs && grep -L translationKey src/content/blog/*/*.md; grep -l readTime src/content/blog/*/*.md; grep -h '^category:' src/content/blog/*/*.md | sort | uniq -c`
Expected: 54 `migrated` lines, both `grep -l`/`grep -L` print nothing, categories are only `news`, `guides`, `ai-scribe`, `hospital-workflows`.

Review `git diff --stat src/content/blog` and spot-check three files. Any excerpt over 200 characters now fails the schema; shorten those by hand.

- [ ] **Step 7: Create `src/utils/blog-collection.ts` and delete the old table**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { buildTranslationMap, getPostSlug } from './blog';
import { getLocalizedPath, locales, type Locale } from './i18n';
import { absoluteUrl } from './seo';

export type BlogEntry = CollectionEntry<'blog'>;

export function getPostLocale(entry: BlogEntry): Locale {
  return entry.id.split('/')[0] as Locale;
}

export async function getPostsForLocale(locale: Locale): Promise<BlogEntry[]> {
  const all = await getCollection('blog', ({ id, data }) => id.startsWith(`${locale}/`) && !data.noindex);
  return all.sort((a, b) => b.data.date.localeCompare(a.data.date));
}

let translationMapPromise: Promise<Map<string, Partial<Record<Locale, string>>>> | null = null;

function getTranslationMap() {
  translationMapPromise ??= getCollection('blog').then((entries) =>
    buildTranslationMap(
      entries.map((e) => ({ locale: getPostLocale(e), slug: getPostSlug(e.id), translationKey: e.data.translationKey }))
    )
  );
  return translationMapPromise;
}

export async function getBlogAlternateUrls(translationKey: string): Promise<Partial<Record<Locale, string>>> {
  const group = (await getTranslationMap()).get(translationKey) ?? {};
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    const slug = group[locale];
    if (slug) out[locale] = absoluteUrl(getLocalizedPath(`/blog/${slug}`, locale));
  }
  return out;
}
```

```bash
git rm src/utils/blog-translations.ts
```

- [ ] **Step 8: Update the consumers**

`src/utils/sitemap-urls.ts`: replace `getBlogUrls` with

```ts
export const getBlogUrls = async (site: string): Promise<SitemapEntry[]> => {
  const posts = await getCollection('blog', ({ data }) => !data.noindex);
  const entries: SitemapEntry[] = [];
  for (const post of posts) {
    const locale = getPostLocale(post);
    const slug = getPostSlug(post.id);
    const alternates = await getBlogAlternateUrls(post.data.translationKey);
    const links = [
      ...locales.filter((code) => alternates[code]).map((code) => ({ lang: code, url: alternates[code]! })),
      ...(alternates.en ? [{ lang: 'x-default', url: alternates.en }] : []),
    ];
    entries.push({
      url: toAbs(site, getLocalizedPath(`/blog/${slug}`, locale)),
      lastmod: post.data.updatedDate ?? post.data.date,
      links,
    });
  }
  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};
```

Imports: `import { getBlogAlternateUrls, getPostLocale } from './blog-collection'; import { getPostSlug } from './blog';`. Extend the type: `export type SitemapEntry = { url: string; lastmod?: string; links?: { lang: string; url: string }[] };`.

`src/utils/sitemap-response.ts`: delete `const lastmod = new Date().toISOString();`, replace the per-entry `lastmod,` with `...(entry.lastmod ? { lastmod: entry.lastmod } : {}),`, and delete `changefreq` (Google ignores it).

`src/components/pages/BlogPostPage.astro`: import `getBlogAlternateUrls` from `../../utils/blog-collection` and call `await getBlogAlternateUrls(post.data.translationKey)`. `postImage` becomes `` `${SITE_URL}${post.data.image.src}` ``; the `<img src={post.data.image}>` becomes `<img src={post.data.image.src} width={post.data.image.width} height={post.data.image.height} ...>`. Replace `post.data.readTime` with `estimateReadingTime(post.body)` from `../../utils/blog`. Replace the `t.blog.categories[...]` badge with `CATEGORIES[post.data.category].label[locale]` and `categoryColors[...]` with `CATEGORIES[post.data.category].badge`.

`src/components/pages/BlogIndexPage.astro`: same image/badge/readTime replacements; replace the `researchPosts` filter with `posts.filter((p) => p.data.category !== 'news')` and its heading with `t.blog.allPosts`. This file is rewritten in Task 6; only make it build.

- [ ] **Step 9: Build, test, verify**

Run: `npm test && npm run build && grep -o '<lastmod>[^<]*' dist/sitemap-blog.xml | head -3 && ls dist/_astro/*.webp | head -3 && grep -o 'hreflang="fr" href="[^"]*"' dist/blog/docnote-radiology-mode/index.html`
Expected: tests pass, build passes with zero schema errors, lastmod values are frontmatter dates, Astro emitted WebP covers, the EN radiology post links `https://docnote.care/fr/blog/docnote-mode-radiologie/`.

- [ ] **Step 10: Commit**

```bash
git add -A src/content src/assets src/utils scripts/migrate-blog-frontmatter.mjs src/components/pages public/images
git commit -m "refactor(blog): frontmatter v2 with translationKey, categories, updatedDate and optimized covers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Article layout with TOC, FAQ, related posts and full schema

**Files:**
- Create: `src/components/BlogCard.astro`, `src/components/TableOfContents.astro`
- Rewrite: `src/components/pages/BlogPostPage.astro`
- Modify: `src/layouts/Layout.astro` (add `noindex`, `canonicalOverride`, `publishedTime`, `modifiedTime` props)

**Interfaces:**
- Consumes: `pickRelatedPosts`, `estimateReadingTime`, `getPostSlug` (Task 3); `getPostsForLocale`, `getBlogAlternateUrls`, `BlogEntry` (Task 4); `CATEGORIES` (Task 4); `getLocalizedPath` (Task 1).
- Produces: `BlogCard` props `{ post: BlogEntry; locale: Locale; headingLevel?: 'h2' | 'h3' }`. `BlogPostPage` keeps props `{ locale: Locale; post: BlogEntry }` so the two thin pages from Task 2 do not change.

- [ ] **Step 1: Extend `Layout.astro` props**

Add to `Props`:

```ts
  noindex?: boolean;
  canonicalOverride?: string;
  publishedTime?: string;
  modifiedTime?: string;
```

Destructure them (`noindex = false`), then `const canonicalUrl = canonicalOverride ?? absoluteUrl(withTrailingSlash(Astro.url.pathname));`. In `<head>`, replace the fixed robots meta with:

```astro
<meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
{modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
```

- [ ] **Step 2: Create `BlogCard.astro`**

```astro
---
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';
import { CATEGORIES } from '../content/categories';
import { formatDate, getLocalizedPath, type Locale } from '../utils/i18n';
import { estimateReadingTime, getPostSlug } from '../utils/blog';
import type { BlogEntry } from '../utils/blog-collection';

interface Props { post: BlogEntry; locale: Locale; headingLevel?: 'h2' | 'h3' }
const { post, locale, headingLevel = 'h3' } = Astro.props;
const t = (await getEntry('pages', locale)).data;
const category = CATEGORIES[post.data.category];
const href = getLocalizedPath(`/blog/${getPostSlug(post.id)}`, locale);
const Heading = headingLevel;
---

<article class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group flex flex-col">
  <a href={href} class="block">
    <div class="relative h-48 overflow-hidden">
      <Image src={post.data.image} alt={post.data.title} width={640} height={360} format="webp" loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        style={`object-position: ${post.data.imagePosition ?? 'center'};`} />
    </div>
  </a>
  <div class="p-6 flex-1 flex flex-col">
    <div class="flex items-center gap-3 text-sm text-gray-500 mb-3">
      <a href={getLocalizedPath(`/blog/category/${category.slug}`, locale)} class={`px-2.5 py-0.5 rounded-full text-xs font-medium ${category.badge}`}>{category.label[locale]}</a>
      <time datetime={post.data.date}>{formatDate(post.data.date, locale)}</time>
      <span>{estimateReadingTime(post.body)} {t.blog.minRead}</span>
    </div>
    <Heading class="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors"><a href={href}>{post.data.title}</a></Heading>
    <p class="mt-2 text-gray-600 line-clamp-3">{post.data.excerpt}</p>
  </div>
</article>
```

- [ ] **Step 3: Create `TableOfContents.astro`**

```astro
---
interface Props { headings: { depth: number; slug: string; text: string }[]; title: string }
const { headings, title } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---
{items.length >= 3 && (
  <nav aria-label={title} class="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-5">
    <p class="text-sm font-semibold text-gray-900 mb-3">{title}</p>
    <ol class="space-y-1.5 text-sm">
      {items.map((h) => (
        <li class={h.depth === 3 ? 'pl-4' : ''}><a href={`#${h.slug}`} class="text-gray-600 hover:text-violet-700">{h.text}</a></li>
      ))}
    </ol>
  </nav>
)}
```

- [ ] **Step 4: Rewrite `src/components/pages/BlogPostPage.astro`**

Keep the existing client `<script>` at the bottom of the current file (the one that wraps images in figures) and place it after `</Layout>` in the new file. Replace everything else with:

```astro
---
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import BlogCard from '../BlogCard.astro';
import TableOfContents from '../TableOfContents.astro';
import { CATEGORIES } from '../../content/categories';
import { pillarNavLabel } from '../../content/pillars';
import { formatDate, getLocalizedPath, type Locale } from '../../utils/i18n';
import { estimateReadingTime, getPostSlug, pickRelatedPosts } from '../../utils/blog';
import { getBlogAlternateUrls, getPostsForLocale, type BlogEntry } from '../../utils/blog-collection';
import { absoluteUrl, buildBreadcrumbLd, SITE_URL } from '../../utils/seo';

interface Props { locale: Locale; post: BlogEntry }
const { locale, post } = Astro.props;
const t = (await getEntry('pages', locale)).data;
const { Content, headings } = await post.render();
const category = CATEGORIES[post.data.category];
const slug = getPostSlug(post.id);
const postPath = getLocalizedPath(`/blog/${slug}`, locale);
const postUrl = absoluteUrl(postPath);
const modified = post.data.updatedDate ?? post.data.date;
const words = post.body.split(/\s+/).filter(Boolean).length;
const ogImage = `${SITE_URL}/og${postPath}og.png`;

const all = await getPostsForLocale(locale);
const asRelated = (p: BlogEntry) => ({ slug: getPostSlug(p.id), category: p.data.category, tags: p.data.tags, date: p.data.date, entry: p });
const related = pickRelatedPosts(asRelated(post), all.map(asRelated), 3).map((r) => r.entry);
const alternates = await getBlogAlternateUrls(post.data.translationKey);

const blogPostingLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.data.title,
  description: post.data.excerpt,
  image: `${SITE_URL}${post.data.image.src}`,
  datePublished: post.data.date,
  dateModified: modified,
  inLanguage: locale,
  wordCount: words,
  articleSection: category.label.en,
  keywords: post.data.tags.join(', '),
  author: { '@type': 'Person', name: post.data.author, jobTitle: post.data.authorRole },
  publisher: { '@type': 'Organization', name: 'DocNote', logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` } },
  mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  url: postUrl,
};
const breadcrumbLd = buildBreadcrumbLd([
  { name: 'DocNote', url: absoluteUrl(getLocalizedPath('/', locale)) },
  { name: t.blog.title, url: absoluteUrl(getLocalizedPath('/blog', locale)) },
  { name: category.label[locale], url: absoluteUrl(getLocalizedPath(`/blog/category/${category.slug}`, locale)) },
  { name: post.data.title, url: postUrl },
]);
const faqLd = post.data.faq?.length
  ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.data.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  : null;
const jsonLd = [blogPostingLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];
const pillarHref = category.pillar ? getLocalizedPath(`/${category.pillar}`, locale) : getLocalizedPath('/team', locale);
const pillarLabel = category.pillar ? pillarNavLabel[locale][category.pillar] : t.nav.team;
---

<Layout title={post.data.title} description={post.data.excerpt} alternates={alternates} ogType="article" ogImage={ogImage}
  jsonLd={jsonLd} noindex={post.data.noindex} canonicalOverride={post.data.canonical} publishedTime={post.data.date} modifiedTime={modified}>
  <article class="pt-32 pb-20 bg-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-2">
          <li><a href={getLocalizedPath('/', locale)} class="hover:text-gray-900">DocNote</a></li>
          <li aria-hidden="true">/</li>
          <li><a href={getLocalizedPath('/blog', locale)} class="hover:text-gray-900">{t.blog.title}</a></li>
          <li aria-hidden="true">/</li>
          <li><a href={getLocalizedPath(`/blog/category/${category.slug}`, locale)} class="hover:text-gray-900">{category.label[locale]}</a></li>
        </ol>
      </nav>

      <header class="mb-10">
        <a href={getLocalizedPath(`/blog/category/${category.slug}`, locale)} class={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-6 ${category.badge}`}>{category.label[locale]}</a>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">{post.data.title}</h1>
        <p class="mt-4 text-xl text-gray-600">{post.data.excerpt}</p>
        <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span class="flex items-center gap-2">
            <img src={post.data.authorImage} alt="" width="32" height="32" class="w-8 h-8 rounded-full object-cover" loading="lazy" />
            <span class="text-gray-800 font-medium">{post.data.author}</span><span>·</span><span>{post.data.authorRole}</span>
          </span>
          <time datetime={post.data.date}>{formatDate(post.data.date, locale)}</time>
          {post.data.updatedDate && <span>{t.blog.updatedLabel} <time datetime={post.data.updatedDate}>{formatDate(post.data.updatedDate, locale)}</time></span>}
          <span>{estimateReadingTime(post.body)} {t.blog.minRead}</span>
        </div>
      </header>

      <Image src={post.data.image} alt={post.data.title} width={1280} height={720} format="webp" loading="eager" fetchpriority="high"
        class={`w-full rounded-2xl mb-10 ${post.data.fullImage ? '' : 'aspect-video object-cover'}`}
        style={`object-position: ${post.data.imagePosition ?? 'center'};`} />

      <TableOfContents headings={headings} title={t.blog.onThisPage} />

      <div class="prose prose-lg prose-violet max-w-none"><Content /></div>

      {post.data.faq?.length && (
        <section class="mt-14" aria-labelledby="faq-heading">
          <h2 id="faq-heading" class="text-2xl font-bold text-gray-900 mb-6">{t.blog.faqTitle}</h2>
          <dl class="space-y-6">
            {post.data.faq.map(({ q, a }) => (
              <div><dt class="font-semibold text-gray-900">{q}</dt><dd class="mt-1 text-gray-600">{a}</dd></div>
            ))}
          </dl>
        </section>
      )}

      <aside class="mt-14 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-8">
        <p class="text-lg font-semibold text-gray-900">{pillarLabel}</p>
        <a href={pillarHref} class="mt-3 inline-block text-violet-700 font-medium hover:underline">{t.blog.pillarCta} →</a>
      </aside>
    </div>

    {related.length > 0 && (
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20" aria-labelledby="related-heading">
        <h2 id="related-heading" class="text-2xl font-bold text-gray-900 mb-8">{t.blog.relatedTitle}</h2>
        <div class="grid md:grid-cols-3 gap-8">{related.map((p) => <BlogCard post={p} locale={locale} />)}</div>
      </section>
    )}
  </article>
</Layout>
```

`pillarNavLabel` in `src/content/pillars.ts` is `Record<Locale, Record<PillarSlug, string>>`, matching the index order above.

- [ ] **Step 5: Build and verify**

Run: `npm run build && grep -o '"dateModified":"[^"]*"' dist/blog/soap-notes-best-practices/index.html && grep -c 'hreflang' dist/fr/blog/docnote-mode-radiologie/index.html && grep -o 'Related articles' dist/blog/soap-notes-best-practices/index.html && grep -o 'href="/blog/category/[^"]*"' dist/blog/soap-notes-best-practices/index.html | head -1`
Expected: build passes, `dateModified` printed, hreflang count is 4, "Related articles" present, category link is unprefixed.

- [ ] **Step 6: Commit**

```bash
git add src/components/BlogCard.astro src/components/TableOfContents.astro src/components/pages/BlogPostPage.astro src/layouts/Layout.astro
git commit -m "feat(blog): article layout with TOC, FAQ schema, related posts and pillar CTA

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Category hubs, paginated index, categories sitemap

**Files:**
- Rewrite: `src/components/pages/BlogIndexPage.astro`
- Create: `src/pages/blog/page/[page].astro`, `src/pages/[locale]/blog/page/[page].astro`, `src/pages/blog/category/[category].astro`, `src/pages/[locale]/blog/category/[category].astro`, `src/pages/sitemap-categories.xml.ts`
- Modify: `src/pages/blog/index.astro`, `src/pages/[locale]/blog/index.astro`, `src/utils/sitemap-urls.ts`, `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `public/_headers`

**Interfaces:**
- Consumes: `paginatePosts`, `PAGE_SIZE`, `getPostsForLocale`, `CATEGORY_LIST`, `CATEGORIES`, `BlogCard`, `getLocalizedPath`.
- Produces: `BlogIndexPage` props `{ locale: Locale; posts: BlogEntry[]; page: number; totalPages: number; category?: CategoryDef; basePath: string; alternates?: Partial<Record<Locale, string>> }`. Helper `getPaginationPresence(): Promise<{ pageCounts: Record<Locale, number>; maxPages: number }>` exported from `src/utils/blog-collection.ts`.

- [ ] **Step 1: Pagination presence helper**

Append to `src/utils/blog-collection.ts`:

```ts
import { PAGE_SIZE, paginatePosts } from './blog';

export async function getPaginationPresence() {
  const pageCounts = Object.fromEntries(
    await Promise.all(locales.map(async (l) => [l, paginatePosts(await getPostsForLocale(l), PAGE_SIZE).length] as const))
  ) as Record<Locale, number>;
  return { pageCounts, maxPages: Math.max(...Object.values(pageCounts)) };
}

export function paginationAlternates(page: number, pageCounts: Record<Locale, number>): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of locales) if (pageCounts[l] >= page) out[l] = absoluteUrl(getLocalizedPath(`/blog/page/${page}`, l));
  return out;
}
```

Merge the import of `PAGE_SIZE, paginatePosts` into the existing `./blog` import line.

- [ ] **Step 2: Rewrite `BlogIndexPage.astro`**

```astro
---
import { getEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import BlogCard from '../BlogCard.astro';
import { CATEGORY_LIST, type CategoryDef } from '../../content/categories';
import { pillarNavLabel } from '../../content/pillars';
import { getLocalizedPath, type Locale } from '../../utils/i18n';
import type { BlogEntry } from '../../utils/blog-collection';
import { absoluteUrl, buildBreadcrumbLd, getPageMeta } from '../../utils/seo';

interface Props {
  locale: Locale;
  posts: BlogEntry[];
  page: number;
  totalPages: number;
  category?: CategoryDef;
  basePath: string; // "/blog" or "/blog/category/guides"
  alternates?: Partial<Record<Locale, string>>;
}
const { locale, posts, page, totalPages, category, basePath, alternates } = Astro.props;
const t = (await getEntry('pages', locale)).data;
const meta = getPageMeta('blog', locale);
const pageLabel = t.blog.pageLabel.replace('{n}', String(page));
const title = (category ? `${category.label[locale]} · ${meta.title}` : meta.title) + (page > 1 ? ` · ${pageLabel}` : '');
const description = (category ? category.description[locale] : meta.description) + (page > 1 ? ` (${pageLabel})` : '');
const pageHref = (n: number) => getLocalizedPath(n === 1 ? basePath : `${basePath}/page/${n}`, locale);

const crumbs = [
  { name: 'DocNote', url: absoluteUrl(getLocalizedPath('/', locale)) },
  { name: meta.title, url: absoluteUrl(getLocalizedPath('/blog', locale)) },
  ...(category ? [{ name: category.label[locale], url: absoluteUrl(getLocalizedPath(basePath, locale)) }] : []),
];
const collectionLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: absoluteUrl(pageHref(page)), inLanguage: locale };
---

<Layout title={title} description={description} jsonLd={[collectionLd, buildBreadcrumbLd(crumbs)]} alternates={alternates}>
  <section class="pt-32 pb-8 bg-gradient-to-br from-violet-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">{category ? category.label[locale] : meta.title}{page > 1 && <span class="text-gray-400"> · {pageLabel}</span>}</h1>
      <p class="mt-3 text-lg text-gray-600 max-w-2xl">{category ? category.description[locale] : meta.description}</p>
      {category?.pillar && (
        <a href={getLocalizedPath(`/${category.pillar}`, locale)} class="mt-4 inline-block text-violet-700 font-medium hover:underline">{pillarNavLabel[locale][category.pillar]} →</a>
      )}
      <nav class="mt-8 flex flex-wrap gap-2" aria-label="Categories">
        <a href={getLocalizedPath('/blog', locale)} class={`px-3 py-1 rounded-full text-sm font-medium border ${category ? 'bg-white text-gray-700 border-gray-200' : 'bg-gray-900 text-white border-gray-900'}`}>{t.blog.allPosts}</a>
        {CATEGORY_LIST.map((c) => (
          <a href={getLocalizedPath(`/blog/category/${c.slug}`, locale)} class={`px-3 py-1 rounded-full text-sm font-medium border ${category?.slug === c.slug ? 'bg-gray-900 text-white border-gray-900' : `${c.badge} border-transparent`}`}>{c.label[locale]}</a>
        ))}
      </nav>
    </div>
  </section>

  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => <BlogCard post={post} locale={locale} headingLevel="h2" />)}
      </div>
      {totalPages > 1 && (
        <nav class="mt-14 flex items-center justify-between text-sm" aria-label="Pagination">
          {page > 1 ? <a href={pageHref(page - 1)} rel="prev" class="text-violet-700 hover:underline">← {t.blog.previousPage}</a> : <span />}
          <span class="text-gray-500">{pageLabel} / {totalPages}</span>
          {page < totalPages ? <a href={pageHref(page + 1)} rel="next" class="text-violet-700 hover:underline">{t.blog.nextPage} →</a> : <span />}
        </nav>
      )}
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Index thin pages**

`src/pages/blog/index.astro`:

```astro
---
import BlogIndexPage from '../../components/pages/BlogIndexPage.astro';
import { PAGE_SIZE, paginatePosts } from '../../utils/blog';
import { getPostsForLocale } from '../../utils/blog-collection';
const pages = paginatePosts(await getPostsForLocale('en'), PAGE_SIZE);
---
<BlogIndexPage locale="en" posts={pages[0]} page={1} totalPages={pages.length} basePath="/blog" />
```

`src/pages/[locale]/blog/index.astro`:

```astro
---
import BlogIndexPage from '../../../components/pages/BlogIndexPage.astro';
import { nonDefaultLocales, type Locale } from '../../../utils/i18n';
import { PAGE_SIZE, paginatePosts } from '../../../utils/blog';
import { getPostsForLocale } from '../../../utils/blog-collection';

export function getStaticPaths() {
  return nonDefaultLocales.map((locale) => ({ params: { locale } }));
}
const locale = Astro.params.locale as Locale;
const pages = paginatePosts(await getPostsForLocale(locale), PAGE_SIZE);
---
<BlogIndexPage locale={locale} posts={pages[0]} page={1} totalPages={pages.length} basePath="/blog" />
```

- [ ] **Step 4: Pagination thin pages**

`src/pages/blog/page/[page].astro`:

```astro
---
import BlogIndexPage from '../../../components/pages/BlogIndexPage.astro';
import { PAGE_SIZE, paginatePosts } from '../../../utils/blog';
import { getPaginationPresence, getPostsForLocale, paginationAlternates } from '../../../utils/blog-collection';

export async function getStaticPaths() {
  const pages = paginatePosts(await getPostsForLocale('en'), PAGE_SIZE);
  const { pageCounts } = await getPaginationPresence();
  return pages.slice(1).map((posts, i) => ({
    params: { page: String(i + 2) },
    props: { posts, totalPages: pages.length, alternates: paginationAlternates(i + 2, pageCounts) },
  }));
}
const page = Number(Astro.params.page);
const { posts, totalPages, alternates } = Astro.props;
---
<BlogIndexPage locale="en" posts={posts} page={page} totalPages={totalPages} basePath="/blog" alternates={alternates} />
```

`src/pages/[locale]/blog/page/[page].astro`:

```astro
---
import BlogIndexPage from '../../../../components/pages/BlogIndexPage.astro';
import { nonDefaultLocales, type Locale } from '../../../../utils/i18n';
import { PAGE_SIZE, paginatePosts } from '../../../../utils/blog';
import { getPaginationPresence, getPostsForLocale, paginationAlternates } from '../../../../utils/blog-collection';

export async function getStaticPaths() {
  const { pageCounts } = await getPaginationPresence();
  const paths = [];
  for (const locale of nonDefaultLocales) {
    const pages = paginatePosts(await getPostsForLocale(locale), PAGE_SIZE);
    for (let n = 2; n <= pages.length; n++) {
      paths.push({ params: { locale, page: String(n) }, props: { posts: pages[n - 1], totalPages: pages.length, alternates: paginationAlternates(n, pageCounts) } });
    }
  }
  return paths;
}
const locale = Astro.params.locale as Locale;
const page = Number(Astro.params.page);
const { posts, totalPages, alternates } = Astro.props;
---
<BlogIndexPage locale={locale} posts={posts} page={page} totalPages={totalPages} basePath="/blog" alternates={alternates} />
```

- [ ] **Step 5: Category thin pages**

Category hubs are not paginated. A hub with more than 12 posts should be split into a new category rather than paged. An empty hub still renders so its URL and hreflang stay stable.

`src/pages/blog/category/[category].astro`:

```astro
---
import BlogIndexPage from '../../../components/pages/BlogIndexPage.astro';
import { CATEGORIES, CATEGORY_SLUGS, type BlogCategory } from '../../../content/categories';
import { getPostsForLocale } from '../../../utils/blog-collection';

export function getStaticPaths() {
  return CATEGORY_SLUGS.map((category) => ({ params: { category } }));
}
const category = CATEGORIES[Astro.params.category as BlogCategory];
const posts = (await getPostsForLocale('en')).filter((p) => p.data.category === category.slug);
---
<BlogIndexPage locale="en" posts={posts} page={1} totalPages={1} category={category} basePath={`/blog/category/${category.slug}`} />
```

`src/pages/[locale]/blog/category/[category].astro`:

```astro
---
import BlogIndexPage from '../../../../components/pages/BlogIndexPage.astro';
import { CATEGORIES, CATEGORY_SLUGS, type BlogCategory } from '../../../../content/categories';
import { nonDefaultLocales, type Locale } from '../../../../utils/i18n';
import { getPostsForLocale } from '../../../../utils/blog-collection';

export function getStaticPaths() {
  return nonDefaultLocales.flatMap((locale) => CATEGORY_SLUGS.map((category) => ({ params: { locale, category } })));
}
const locale = Astro.params.locale as Locale;
const category = CATEGORIES[Astro.params.category as BlogCategory];
const posts = (await getPostsForLocale(locale)).filter((p) => p.data.category === category.slug);
---
<BlogIndexPage locale={locale} posts={posts} page={1} totalPages={1} category={category} basePath={`/blog/category/${category.slug}`} />
```

- [ ] **Step 6: Categories sitemap**

Append to `src/utils/sitemap-urls.ts`:

```ts
import { CATEGORY_SLUGS } from '../content/categories';
import { getPaginationPresence } from './blog-collection';

export const getCategoryUrls = async (site: string): Promise<SitemapEntry[]> => {
  const entries: SitemapEntry[] = [];

  for (const path of ['/blog/', ...CATEGORY_SLUGS.map((c) => `/blog/category/${c}/`)]) {
    const links = localeLinks(site, path);
    for (const locale of locales) entries.push({ url: toAbs(site, getLocalizedPath(path, locale)), links });
  }

  // Pagination pages exist only where a locale has enough posts.
  const { pageCounts, maxPages } = await getPaginationPresence();
  for (let n = 2; n <= maxPages; n++) {
    const present = locales.filter((l) => pageCounts[l] >= n);
    const links = [
      ...present.map((l) => ({ lang: l, url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, l)) })),
      ...(present.includes('en') ? [{ lang: 'x-default', url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, 'en')) }] : []),
    ];
    for (const l of present) entries.push({ url: toAbs(site, getLocalizedPath(`/blog/page/${n}`, l)), links });
  }

  return entries.sort((a, b) => a.url.localeCompare(b.url, 'en', { numeric: true }));
};
```

Remove `'/blog'` from `STATIC_PAGES`.

`src/pages/sitemap-categories.xml.ts`:

```ts
import { getCategoryUrls } from '../utils/sitemap-urls';
import { buildSitemapXml, sitemapXmlResponse } from '../utils/sitemap-response';

export const GET = async () => {
  const site = import.meta.env.SITE;
  return sitemapXmlResponse(await buildSitemapXml(site, await getCategoryUrls(site)));
};
```

`src/pages/sitemap.xml.ts`: child list becomes `['sitemap-landings.xml', 'sitemap-blog.xml', 'sitemap-categories.xml']`. `src/pages/robots.txt.ts`: add `'sitemap-categories.xml'`. `public/_headers`: add

```text
/sitemap-categories.xml
  Content-Type: application/xml; charset=utf-8
```

- [ ] **Step 7: Build and verify**

Run: `npm run build && ls dist/blog/category/ dist/fr/blog/category/ && ls dist/blog/page/ && grep -c '<url>' dist/sitemap-categories.xml && grep -o '<title>[^<]*' dist/blog/page/2/index.html && grep -o 'hreflang="[^"]*" href="[^"]*"' dist/blog/page/2/index.html`
Expected: 6 category folders per locale; `page/2` exists (18 posts / 12); the sitemap has 24 URLs (3 locales × 7 + 3 page-2 URLs); page 2's title ends with `· Page 2 | DocNote`; page 2 hreflang lists exactly the locales that have a page 2 (all three today) plus x-default at `/blog/page/2/`.

- [ ] **Step 8: Commit**

```bash
git add src/components/pages/BlogIndexPage.astro src/pages/blog "src/pages/[locale]/blog" src/pages/sitemap-categories.xml.ts src/pages/sitemap.xml.ts src/pages/robots.txt.ts src/utils/sitemap-urls.ts src/utils/blog-collection.ts public/_headers
git commit -m "feat(blog): category hubs, paginated index and categories sitemap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Pillar and footer internal linking

**Files:**
- Modify: `src/components/pages/PillarPage.astro`, `src/components/Footer.astro`

**Interfaces:**
- Consumes: `pillarCategories`, `CATEGORY_LIST` (Task 4), `getPostsForLocale`, `BlogCard`.

- [ ] **Step 1: Add a "latest articles" section to the pillar page**

In `src/components/pages/PillarPage.astro` frontmatter add:

```ts
import BlogCard from '../BlogCard.astro';
import { pillarCategories } from '../../content/categories';
import { getPostsForLocale } from '../../utils/blog-collection';

const cats = pillarCategories(slug);
const catSlugs = new Set(cats.map((c) => c.slug));
const latest = (await getPostsForLocale(lang)).filter((p) => catSlugs.has(p.data.category)).slice(0, 6);
```

Before the closing `</article>`, after the existing CTA block, add:

```astro
{latest.length > 0 && (
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20" aria-labelledby="pillar-articles">
    <div class="flex flex-wrap items-baseline justify-between gap-4 mb-8">
      <h2 id="pillar-articles" class="text-2xl font-bold text-gray-900">{p.relatedLabel}</h2>
      <div class="flex gap-2">
        {cats.map((c) => (
          <a href={getLocalizedPath(`/blog/category/${c.slug}`, lang)} class={`px-3 py-1 rounded-full text-sm font-medium ${c.badge}`}>{c.label[lang]}</a>
        ))}
      </div>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {latest.map((post) => <BlogCard post={post} locale={lang} />)}
    </div>
  </section>
)}
```

`p.relatedLabel` exists on every pillar entry in all three locales ("Related guides" / "Guides associés" / "Verwandte Guides").

- [ ] **Step 2: Footer category links**

`src/components/Footer.astro` already imports `pillarSlugs` and `pillarNavLabel` and links the three pillars. It is a dark footer. Add one column for the blog categories next to the "Company" column (line ~66), with the same classes:

```ts
import { CATEGORY_LIST } from "../content/categories"
```

```astro
<div>
    <h4 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">{t.nav.blog}</h4>
    <ul class="space-y-3">
        {CATEGORY_LIST.map((c) => (
            <li>
                <a href={getLocalizedPath(`/blog/category/${c.slug}`, locale)} class="text-sm text-white hover:text-white/70 transition-colors">{c.label[locale]}</a>
            </li>
        ))}
    </ul>
</div>
```

If the footer grid is `grid-cols-N`, bump N by one so the new column does not wrap.

- [ ] **Step 3: Build and verify**

Run: `npm run build && grep -c 'blog/category/' dist/de/ai-medical-scribe/index.html && grep -c 'href="/blog/category/' dist/pricing/index.html`
Expected: build passes; the German pillar page has ≥ 2 category links plus card links; the English pricing footer has 6 unprefixed category links.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/PillarPage.astro src/components/Footer.astro
git commit -m "feat(seo): pillar pages list cluster articles, footer links category hubs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Per-page OG images

**Files:**
- Create: `scripts/generate-og-images.mjs`
- Modify: `src/layouts/Layout.astro` (default `ogImage`), `package.json`

**Interfaces:**
- Produces: `dist/og/<page path>/og.png` for every `dist/**/index.html` (`/pricing/` → `dist/og/pricing/og.png`, `/` → `dist/og/og.png`, `/fr/pricing/` → `dist/og/fr/pricing/og.png`). `Layout.astro` defaults `og:image` to `${SITE_URL}/og${pathname}og.png`.

- [ ] **Step 1: Install deps**

```bash
npm install --save-dev satori@^0.25 @resvg/resvg-js@^2.6 node-html-parser@^7
```

- [ ] **Step 2: Write the generator**

`scripts/generate-og-images.mjs`:

```js
/**
 * Post-build: render a 1200x630 PNG card per page from its <title> and meta description.
 * Output: dist/og/<page path>/og.png. Layout.astro points og:image there by default.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { parse } from 'node-html-parser';

const DIST = process.argv[2] ?? 'dist';
const font = await readFile('public/fonts/Open-Sans-Bold.ttf');

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory() && e.name !== 'og' && e.name !== '_astro') yield* walk(full);
    else if (e.name === 'index.html') yield full;
  }
}

const card = (title, description, lang) => ({
  type: 'div',
  props: {
    style: { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: 'linear-gradient(135deg,#f5f3ff 0%,#eef2ff 100%)', fontFamily: 'Open Sans', color: '#111827' },
    children: [
      { type: 'div', props: { style: { fontSize: 34, color: '#6d28d9' }, children: 'DocNote' } },
      { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [
        { type: 'div', props: { style: { fontSize: title.length > 70 ? 52 : 64, lineHeight: 1.1 }, children: title } },
        { type: 'div', props: { style: { fontSize: 28, color: '#4b5563', lineHeight: 1.35 }, children: description.slice(0, 160) } },
      ] } },
      { type: 'div', props: { style: { fontSize: 24, color: '#6b7280' }, children: `docnote.care · ${lang.toUpperCase()}` } },
    ],
  },
});

let count = 0;
for await (const htmlPath of walk(DIST)) {
  const doc = parse(await readFile(htmlPath, 'utf8'));
  const title = (doc.querySelector('title')?.text ?? 'DocNote').replace(/\s*\|\s*DocNote$/, '');
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const lang = doc.querySelector('html')?.getAttribute('lang') ?? 'en';
  const svg = await satori(card(title, description, lang), { width: 1200, height: 630, fonts: [{ name: 'Open Sans', data: font, weight: 700, style: 'normal' }] });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const out = join(DIST, 'og', relative(DIST, dirname(htmlPath)), 'og.png');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, png);
  count++;
}
console.log(`og: ${count} images`);
```

- [ ] **Step 3: Default `og:image` in `Layout.astro`**

Change the destructure default from `ogImage = OG_IMAGE` to `` ogImage = `${SITE_URL}/og${withTrailingSlash(Astro.url.pathname)}og.png` `` and add `<meta property="og:image:type" content="image/png" />` next to the width/height metas. Remove the `OG_IMAGE` import if nothing else uses it.

- [ ] **Step 4: Wire into build**

`package.json`: `"build": "astro build && node scripts/generate-og-images.mjs"`.

- [ ] **Step 5: Build and verify**

Run: `npm run build && file dist/og/pricing/og.png dist/og/og.png && grep -o 'og:image" content="[^"]*' dist/fr/blog/docnote-mode-radiologie/index.html`
Expected: both are `PNG image data, 1200 x 630`; the meta points at `https://docnote.care/og/fr/blog/docnote-mode-radiologie/og.png`. Open two PNGs and confirm the text is readable and not clipped.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-og-images.mjs src/layouts/Layout.astro package.json package-lock.json
git commit -m "feat(seo): generate a per-page OG card at build time

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Dist-level SEO validator in the build

**Files:**
- Create: `scripts/check-seo.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `node scripts/check-seo.mjs [dist]` exits 1 with a list of violations, 0 with a summary. Runs last in `npm run build`.

- [ ] **Step 1: Write the validator**

```js
/**
 * Fails the build when the built site violates the SEO invariants:
 *  - nothing is built under dist/en/ (English lives at the root)
 *  - exactly one <link rel=canonical>, equal to the page's own URL
 *  - a non-empty meta description
 *  - exactly one <h1>
 *  - unique <title> across the site
 *  - every hreflang href resolves to a page in dist, and that page links back (reciprocity)
 *  - og:image resolves to a file in dist
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = process.argv[2] ?? 'dist';
const SITE = 'https://docnote.care';
const errors = [];
const pages = new Map(); // path -> { title, hreflangs: Map<lang, path> }

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory() && !['og', '_astro'].includes(e.name)) yield* walk(full);
    else if (e.name === 'index.html') yield full;
  }
}
const exists = async (p) => stat(p).then(() => true, () => false);
const toPath = (url) => new URL(url).pathname;

if (await exists(join(DIST, 'en'))) errors.push('dist/en/ exists: English must be built at the root');

for await (const file of walk(DIST)) {
  const path = '/' + relative(DIST, file).replace(/index\.html$/, '');
  if (path === '/404/') continue;
  const doc = parse(await readFile(file, 'utf8'));
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  if (robots.includes('noindex')) continue;

  const canonicals = doc.querySelectorAll('link[rel="canonical"]');
  if (canonicals.length !== 1) errors.push(`${path}: ${canonicals.length} canonical tags`);
  else if (canonicals[0].getAttribute('href') !== `${SITE}${path}`) errors.push(`${path}: canonical is ${canonicals[0].getAttribute('href')}`);

  if (!doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()) errors.push(`${path}: missing meta description`);

  const h1s = doc.querySelectorAll('h1');
  if (h1s.length !== 1) errors.push(`${path}: ${h1s.length} h1 elements`);

  const og = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  if (!og) errors.push(`${path}: missing og:image`);
  else if (og.startsWith(SITE) && !(await exists(join(DIST, toPath(og))))) errors.push(`${path}: og:image not in dist (${og})`);

  const hreflangs = new Map();
  for (const l of doc.querySelectorAll('link[rel="alternate"][hreflang]')) hreflangs.set(l.getAttribute('hreflang'), toPath(l.getAttribute('href')));
  pages.set(path, { title: doc.querySelector('title')?.text.trim() ?? '', hreflangs });
}

const titles = new Map();
for (const [path, { title, hreflangs }] of pages) {
  if (!title) errors.push(`${path}: empty title`);
  else {
    if (titles.has(title)) errors.push(`${path}: duplicate title "${title}" (also ${titles.get(title)})`);
    titles.set(title, path);
  }
  for (const [lang, target] of hreflangs) {
    if (target.startsWith('/en/')) errors.push(`${path}: hreflang ${lang} points at a /en/ URL (${target})`);
    if (!(await exists(join(DIST, target, 'index.html')))) { errors.push(`${path}: hreflang ${lang} -> ${target} does not exist`); continue; }
    if (lang === 'x-default') continue;
    const back = pages.get(target)?.hreflangs;
    if (back && ![...back.values()].includes(path)) errors.push(`${path}: hreflang ${lang} -> ${target} is not reciprocal`);
  }
}

if (errors.length) {
  console.error(`check-seo: ${errors.length} violation(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`check-seo: ${pages.size} pages OK`);
```

- [ ] **Step 2: Run it against the current build and fix what it finds**

Run: `npm run build && node scripts/check-seo.mjs`
Expected on first run: probable violations. Likely candidates and their fixes:
- Pages with two `<h1>` (for example the home hero plus a section in `Main.astro`): demote the second to `<h2>`.
- Pages with no description (`emploi`, `patient`, `sondage`, `order` if not in `pageMeta`): add entries to `pageMeta` in `src/utils/seo.ts` and pass `description` from the page component.
- Any `<title>` shared between two pages: make them distinct.

Iterate until the script prints `check-seo: N pages OK`.

- [ ] **Step 3: Wire it in last**

`package.json`: `"build": "astro build && node scripts/generate-og-images.mjs && node scripts/check-seo.mjs"`.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-seo.mjs package.json src
git commit -m "chore(seo): build-time validator for canonicals, hreflang reciprocity, titles and h1

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Specialty landing pages (data-driven)

**Files:**
- Create: `src/content/specialties.ts`, `src/components/pages/SpecialtyPage.astro`, `src/pages/for/[specialty].astro`, `src/pages/[locale]/for/[specialty].astro`
- Modify: `src/utils/sitemap-urls.ts` (`getLandingUrls`), `src/components/Footer.astro`, `public/llms.txt`, the three `docnote-radiology-mode` post files

**Interfaces:**
- Produces: `SPECIALTY_SLUGS`, `specialtyNavLabel`, `specialties: Record<SpecialtySlug, Record<Locale, SpecialtyCopy>>` where

```ts
type SpecialtyCopy = {
  title: string;        // <title>, ≤ 60 chars
  description: string;  // meta description, 120 to 160 chars
  h1: string;
  intro: string;
  documents: { name: string; body: string }[];
  benefits: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  categories: BlogCategory[];  // blog categories feeding the related block
};
```

`SpecialtyPage` props `{ locale: Locale; specialty: SpecialtySlug }`.

- [ ] **Step 1: Define the first specialty (radiology) in all three locales**

`src/content/specialties.ts`:

```ts
import type { Locale } from '../utils/i18n';
import type { BlogCategory } from './categories';

export const SPECIALTY_SLUGS = ['radiology'] as const;
export type SpecialtySlug = (typeof SPECIALTY_SLUGS)[number];

export type SpecialtyCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  documents: { name: string; body: string }[];
  benefits: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  categories: BlogCategory[];
};

export const specialtyNavLabel: Record<Locale, Record<SpecialtySlug, string>> = {
  en: { radiology: 'DocNote for radiology' },
  fr: { radiology: 'DocNote pour la radiologie' },
  de: { radiology: 'DocNote für die Radiologie' },
};

export const specialties: Record<SpecialtySlug, Record<Locale, SpecialtyCopy>> = {
  radiology: {
    en: {
      title: 'AI radiology report dictation',
      description: 'Dictate radiology reports live with DocNote: realtime transcription, SpeechMike support, structured findings and impression, RIS integration. Swiss-hosted, FADP and GDPR compliant.',
      h1: 'Radiology reports dictated live, structured in seconds',
      intro: 'DocNote radiology mode transcribes as you read the images, turns the dictation into a structured report with technique, findings and impression, and hands the text back to your RIS. It runs in the browser, works with a Philips SpeechMike, and never stores audio longer than needed to generate the report.',
      documents: [
        { name: 'CT and MRI reports', body: 'Structured by region with your own template, including comparison to prior exams when you mention them.' },
        { name: 'Ultrasound and X-ray', body: 'Short-form reports that keep your standard normal phrases and only expand where you dictate a finding.' },
        { name: 'Interventional procedure notes', body: 'Procedure, materials, complications and post-procedure instructions from one continuous dictation.' },
      ],
      benefits: [
        { heading: 'Realtime, not batch', body: 'Text appears while you speak, so you correct on the fly instead of proofreading a full report at the end.' },
        { heading: 'Hold-to-record on a SpeechMike', body: 'Push-to-talk on the device you already use. No new hardware, no bot joining a call.' },
        { heading: 'Embedded in your RIS', body: 'DocNote runs inside the RIS as a panel and returns the report through a standard message, so nothing is copied by hand.' },
        { heading: 'Swiss hosting, short retention', body: 'Audio and text are processed in Switzerland. Audio is deleted after the report is generated.' },
      ],
      faq: [
        { q: 'Does DocNote replace my radiology templates?', a: 'No. You import your existing templates and DocNote fills them from the dictation. Normal phrases stay exactly as you wrote them.' },
        { q: 'Which dictation microphones are supported?', a: 'Any microphone the browser can access, plus Philips SpeechMike push-to-talk on the web app through WebHID.' },
        { q: 'Can it run inside our RIS?', a: 'Yes. The web app can be embedded as an iframe and exchanges context and the finished report with the RIS through postMessage. Contact us for the integration guide.' },
        { q: 'Where is the data processed?', a: 'In Switzerland. DocNote is FADP, GDPR and HIPAA compliant and ISO 27001 certified. Health data is never used to train models.' },
      ],
      categories: ['specialties', 'guides'],
    },
    fr: {
      title: 'Dictée de comptes rendus de radiologie par IA',
      description: 'Dictez vos comptes rendus de radiologie en direct avec DocNote : transcription en temps réel, SpeechMike, résultats et conclusion structurés, intégration RIS. Hébergé en Suisse, conforme nLPD et RGPD.',
      h1: 'Des comptes rendus de radiologie dictés en direct, structurés en quelques secondes',
      intro: 'Le mode radiologie de DocNote transcrit pendant que vous lisez les images, transforme la dictée en compte rendu structuré avec technique, résultats et conclusion, puis renvoie le texte à votre RIS. Il fonctionne dans le navigateur, avec un SpeechMike Philips, et ne conserve l’audio que le temps de générer le compte rendu.',
      documents: [
        { name: 'Comptes rendus de scanner et IRM', body: 'Structurés par région selon votre propre modèle, avec comparaison aux examens antérieurs si vous la dictez.' },
        { name: 'Échographie et radiographie', body: 'Comptes rendus courts qui conservent vos formules de normalité et ne se développent que sur les anomalies dictées.' },
        { name: 'Comptes rendus d’interventionnel', body: 'Procédure, matériel, complications et consignes post-intervention à partir d’une seule dictée continue.' },
      ],
      benefits: [
        { heading: 'En temps réel, pas en différé', body: 'Le texte apparaît pendant que vous parlez : vous corrigez au fil de l’eau au lieu de relire un compte rendu entier à la fin.' },
        { heading: 'Appui-pour-parler sur SpeechMike', body: 'Le bouton de l’appareil que vous utilisez déjà. Aucun nouveau matériel, aucun robot dans un appel.' },
        { heading: 'Intégré à votre RIS', body: 'DocNote s’ouvre dans le RIS sous forme de panneau et renvoie le compte rendu par un message standard : rien n’est recopié à la main.' },
        { heading: 'Hébergement suisse, rétention courte', body: 'L’audio et le texte sont traités en Suisse. L’audio est supprimé une fois le compte rendu généré.' },
      ],
      faq: [
        { q: 'DocNote remplace-t-il mes modèles de compte rendu ?', a: 'Non. Vous importez vos modèles existants et DocNote les remplit à partir de la dictée. Vos formules de normalité restent inchangées.' },
        { q: 'Quels micros de dictée sont compatibles ?', a: 'Tout micro accessible par le navigateur, ainsi que le SpeechMike Philips en appui-pour-parler sur l’application web via WebHID.' },
        { q: 'Peut-il fonctionner dans notre RIS ?', a: 'Oui. L’application web s’intègre en iframe et échange le contexte et le compte rendu final avec le RIS par postMessage. Contactez-nous pour le guide d’intégration.' },
        { q: 'Où sont traitées les données ?', a: 'En Suisse. DocNote est conforme nLPD, RGPD et HIPAA et certifié ISO 27001. Les données de santé ne servent jamais à entraîner des modèles.' },
      ],
      categories: ['specialties', 'guides'],
    },
    de: {
      title: 'KI-Diktat für radiologische Befunde',
      description: 'Radiologische Befunde live diktieren mit DocNote: Echtzeit-Transkription, SpeechMike, strukturierte Befunde und Beurteilung, RIS-Integration. In der Schweiz gehostet, DSG- und DSGVO-konform.',
      h1: 'Radiologische Befunde live diktiert, in Sekunden strukturiert',
      intro: 'Der Radiologie-Modus von DocNote transkribiert, während Sie die Bilder befunden, wandelt das Diktat in einen strukturierten Befund mit Technik, Befund und Beurteilung um und gibt den Text an Ihr RIS zurück. Er läuft im Browser, funktioniert mit einem Philips SpeechMike und speichert Audio nur so lange, wie die Befunderstellung dauert.',
      documents: [
        { name: 'CT- und MRT-Befunde', body: 'Nach Region strukturiert mit Ihrer eigenen Vorlage, inklusive Vergleich mit Voraufnahmen, wenn Sie ihn diktieren.' },
        { name: 'Ultraschall und Röntgen', body: 'Kurzbefunde, die Ihre Normalformulierungen behalten und nur bei diktierten Auffälligkeiten ausführlicher werden.' },
        { name: 'Interventionelle Prozedurberichte', body: 'Prozedur, Material, Komplikationen und Anweisungen nach dem Eingriff aus einem durchgehenden Diktat.' },
      ],
      benefits: [
        { heading: 'Echtzeit statt Stapelverarbeitung', body: 'Der Text erscheint, während Sie sprechen. Sie korrigieren sofort, statt am Ende den ganzen Befund gegenzulesen.' },
        { heading: 'Push-to-Talk am SpeechMike', body: 'Die Taste des Geräts, das Sie bereits nutzen. Keine neue Hardware, kein Bot in einem Anruf.' },
        { heading: 'Eingebettet in Ihr RIS', body: 'DocNote läuft als Panel im RIS und liefert den Befund über eine Standardnachricht zurück. Nichts wird von Hand kopiert.' },
        { heading: 'Schweizer Hosting, kurze Aufbewahrung', body: 'Audio und Text werden in der Schweiz verarbeitet. Audio wird nach der Befunderstellung gelöscht.' },
      ],
      faq: [
        { q: 'Ersetzt DocNote meine Befundvorlagen?', a: 'Nein. Sie importieren Ihre bestehenden Vorlagen und DocNote füllt sie aus dem Diktat. Normalformulierungen bleiben exakt erhalten.' },
        { q: 'Welche Diktiermikrofone werden unterstützt?', a: 'Jedes Mikrofon, auf das der Browser zugreifen kann, sowie Philips SpeechMike Push-to-Talk in der Web-App über WebHID.' },
        { q: 'Läuft es in unserem RIS?', a: 'Ja. Die Web-App lässt sich als iframe einbetten und tauscht Kontext und fertigen Befund per postMessage mit dem RIS aus. Kontaktieren Sie uns für die Integrationsanleitung.' },
        { q: 'Wo werden die Daten verarbeitet?', a: 'In der Schweiz. DocNote ist DSG-, DSGVO- und HIPAA-konform und ISO 27001 zertifiziert. Gesundheitsdaten werden nie für das Training von Modellen verwendet.' },
      ],
      categories: ['specialties', 'guides'],
    },
  },
};
```

- [ ] **Step 2: Create the page component**

`src/components/pages/SpecialtyPage.astro`:

```astro
---
import { getEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import BlogCard from '../BlogCard.astro';
import { specialties, type SpecialtySlug } from '../../content/specialties';
import { getLocalizedPath, type Locale } from '../../utils/i18n';
import { getPostsForLocale } from '../../utils/blog-collection';
import { absoluteUrl, buildBreadcrumbLd } from '../../utils/seo';
import { DEMO_BOOKING_URL } from '../../utils/links';

interface Props { locale: Locale; specialty: SpecialtySlug }
const { locale, specialty } = Astro.props;
const s = specialties[specialty][locale];
const t = (await getEntry('pages', locale)).data;
const cats = new Set(s.categories);
const latest = (await getPostsForLocale(locale)).filter((p) => cats.has(p.data.category)).slice(0, 3);
const url = absoluteUrl(getLocalizedPath(`/for/${specialty}`, locale));
const jsonLd = [
  { '@context': 'https://schema.org', '@type': 'WebPage', name: s.title, description: s.description, url, inLanguage: locale },
  buildBreadcrumbLd([{ name: 'DocNote', url: absoluteUrl(getLocalizedPath('/', locale)) }, { name: s.title, url }]),
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
];
---

<Layout title={s.title} description={s.description} jsonLd={jsonLd}>
  <article class="pt-32 pb-20 bg-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">{s.h1}</h1>
      <p class="mt-6 text-xl text-gray-600">{s.intro}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href={DEMO_BOOKING_URL} class="px-5 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700">{t.contact.bookDemo}</a>
        <a href={getLocalizedPath('/pricing', locale)} class="px-5 py-3 rounded-xl border border-gray-300 text-gray-800 font-medium hover:bg-gray-50">{t.nav.pricing}</a>
      </div>

      <section class="mt-16">
        <div class="grid sm:grid-cols-3 gap-6">
          {s.documents.map((d) => (
            <div class="rounded-2xl border border-gray-100 p-6">
              <h2 class="text-lg font-semibold text-gray-900">{d.name}</h2>
              <p class="mt-2 text-gray-600">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="mt-16 space-y-10">
        {s.benefits.map((b) => (
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{b.heading}</h2>
            <p class="mt-3 text-gray-600 text-lg">{b.body}</p>
          </div>
        ))}
      </section>

      <section class="mt-16" aria-labelledby="faq">
        <h2 id="faq" class="text-2xl font-bold text-gray-900 mb-6">{t.blog.faqTitle}</h2>
        <dl class="space-y-6">
          {s.faq.map(({ q, a }) => (
            <div><dt class="font-semibold text-gray-900">{q}</dt><dd class="mt-1 text-gray-600">{a}</dd></div>
          ))}
        </dl>
      </section>
    </div>

    {latest.length > 0 && (
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">{t.blog.relatedTitle}</h2>
        <div class="grid md:grid-cols-3 gap-8">{latest.map((p) => <BlogCard post={p} locale={locale} />)}</div>
      </section>
    )}
  </article>
</Layout>
```

- [ ] **Step 3: Thin pages**

`src/pages/for/[specialty].astro`:

```astro
---
import SpecialtyPage from '../../components/pages/SpecialtyPage.astro';
import { SPECIALTY_SLUGS, type SpecialtySlug } from '../../content/specialties';

export function getStaticPaths() {
  return SPECIALTY_SLUGS.map((specialty) => ({ params: { specialty } }));
}
---
<SpecialtyPage locale="en" specialty={Astro.params.specialty as SpecialtySlug} />
```

`src/pages/[locale]/for/[specialty].astro`:

```astro
---
import SpecialtyPage from '../../../components/pages/SpecialtyPage.astro';
import { SPECIALTY_SLUGS, type SpecialtySlug } from '../../../content/specialties';
import { nonDefaultLocales, type Locale } from '../../../utils/i18n';

export function getStaticPaths() {
  return nonDefaultLocales.flatMap((locale) => SPECIALTY_SLUGS.map((specialty) => ({ params: { locale, specialty } })));
}
const { locale, specialty } = Astro.params as { locale: Locale; specialty: SpecialtySlug };
---
<SpecialtyPage locale={locale} specialty={specialty} />
```

- [ ] **Step 4: Sitemap, footer, llms.txt, tags**

In `src/utils/sitemap-urls.ts` `getLandingUrls`, extend the path list: `['/', ...STATIC_PAGES.map((p) => \`${p}/\`), ...SPECIALTY_SLUGS.map((s) => \`/for/${s}/\`)]` with `import { SPECIALTY_SLUGS } from '../content/specialties';`.

In `src/components/Footer.astro`, in the column that lists the pillars, append after the pillar `<li>`s:

```astro
{SPECIALTY_SLUGS.map((s) => (
    <li><a href={getLocalizedPath(`/for/${s}`, locale)} class="text-sm text-white hover:text-white/70 transition-colors">{specialtyNavLabel[locale][s]}</a></li>
))}
```

with `import { SPECIALTY_SLUGS, specialtyNavLabel } from "../content/specialties"`.

In `public/llms.txt` under `## Product` add:

```text
- [DocNote for radiology](https://docnote.care/for/radiology/): Live radiology dictation, SpeechMike push-to-talk, structured findings and impression, RIS embedding
```

In the three `docnote-radiology-mode` post files (`en/docnote-radiology-mode.md`, `fr/docnote-mode-radiologie.md`, `de/docnote-radiologie-modus.md`), set `category: "specialties"` and add `tags: ["radiology", "dictation", "ris"]`.

- [ ] **Step 5: Build and verify**

Run: `npm run build && grep -c 'FAQPage' dist/for/radiology/index.html dist/de/for/radiology/index.html && grep -o '<loc>[^<]*for/radiology/' dist/sitemap-landings.xml`
Expected: build and check-seo pass, FAQPage present in both, three `<loc>` entries (`/for/radiology/`, `/fr/for/radiology/`, `/de/for/radiology/`).

- [ ] **Step 6: Commit**

```bash
git add src/content/specialties.ts src/components/pages/SpecialtyPage.astro src/pages/for "src/pages/[locale]/for" src/utils/sitemap-urls.ts src/components/Footer.astro public/llms.txt src/content/blog
git commit -m "feat(seo): data-driven specialty landing pages, starting with radiology

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Markdown twins for AI agents

**Files:**
- Create: `scripts/html-to-markdown.mjs`, `scripts/generate-markdown.mjs`, `public/_worker.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `dist/**/index.md` next to each `index.html`; `_worker.js` serves the `.md` when the request has `Accept: text/markdown`, otherwise falls through to static assets.

- [ ] **Step 1: Copy the proven scripts from RecordMeeting**

```bash
cp /Users/mathias/Documents/Projects/RecordMeeting/src/website/scripts/html-to-markdown.mjs scripts/
cp /Users/mathias/Documents/Projects/RecordMeeting/src/website/scripts/generate-markdown.mjs scripts/
cp /Users/mathias/Documents/Projects/RecordMeeting/src/website/_worker.js public/_worker.js
npm install --save-dev turndown@^7
```

In `scripts/html-to-markdown.mjs` replace every `recordmeeting.com` / `RecordMeeting` string with `docnote.care` / `DocNote`. In `public/_worker.js` keep only the `Accept: text/markdown` negotiation and the `env.ASSETS.fetch(request)` fallthrough; delete any RecordMeeting-specific route (for example `/agent-setup`). Make sure the worker does not intercept `/en/*`, so the `_redirects` rules still apply (Cloudflare applies `_redirects` before the worker only when the worker calls `env.ASSETS.fetch`; verify in Step 3).

- [ ] **Step 2: Wire into build**

`package.json`: `"build": "astro build && node scripts/generate-og-images.mjs && node scripts/generate-markdown.mjs dist && node scripts/check-seo.mjs"`.

- [ ] **Step 3: Build and verify**

Run: `npm run build && head -12 dist/for/radiology/index.md && npx wrangler pages dev dist --port 8788 & sleep 4; curl -s -H 'Accept: text/markdown' http://localhost:8788/pricing/ | head -5; curl -sI http://localhost:8788/pricing/ | grep -i content-type; curl -sI http://localhost:8788/en/pricing/ | grep -iE '^(HTTP|location)'; kill %1`
Expected: a readable markdown file starting with the H1; the negotiated response is markdown; the default one is `text/html`; `/en/pricing/` still 301s to `/pricing/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/html-to-markdown.mjs scripts/generate-markdown.mjs public/_worker.js package.json package-lock.json
git commit -m "feat(seo): serve markdown twins to agents via Accept negotiation

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Repo conventions doc and cleanup

**Files:**
- Create: `CLAUDE.md`
- Modify: `README.md`
- Delete: `scripts/migrate-blog-frontmatter.mjs`

- [ ] **Step 1: Write `CLAUDE.md`**

```markdown
# CLAUDE.md

Marketing site for DocNote, https://docnote.care. Astro 5 static build on Cloudflare Pages. Package manager: npm.

## Commands

- `npm run dev` local preview
- `npm test` vitest for `src/utils/*.test.ts`
- `npm run build` = astro build → OG cards → markdown twins → `scripts/check-seo.mjs`. The validator fails the build on canonical, hreflang, title, h1, og:image or `/en/` regressions. Fix the page, do not weaken the check.

## URL and locale rules

- Locales: `en` (default, no prefix), `fr`, `de` (prefixed). Trailing slash always. `/en/*` 301s to `/*` (`public/_redirects`).
- Never build a URL with `/${locale}/`. Use `getLocalizedPath(path, locale)` from `src/utils/i18n.ts`.
- Never move a published URL without adding a 301 to `public/_redirects` (specific rules before wildcards).
- New page = one component under `src/components/pages/<Name>Page.astro` taking `{ locale }`, plus `src/pages/<name>.astro` (renders `locale="en"`) and `src/pages/[locale]/<name>.astro` (`getStaticPaths()` over `nonDefaultLocales`). Add it to `STATIC_PAGES` in `src/utils/sitemap-urls.ts` and to `pageMeta` in `src/utils/seo.ts`.

## Blog

- One markdown file per locale under `src/content/blog/{en,fr,de}/`. Slugs may be translated; the three files share the same `translationKey` (the EN slug). The build throws if a key has two files for one locale or no EN file.
- Frontmatter schema: `src/content/config.ts`. `excerpt` is the meta description (50 to 200 chars). `category` must be one of `src/content/categories.ts`. Set `updatedDate` whenever you materially edit a post.
- Covers live in `src/assets/blog/` and are referenced relatively (`../../../assets/blog/x.jpg`).
- Categories map to pillars in `src/content/categories.ts`; that mapping drives related articles, the pillar CTA, pillar page listings and the footer.
- Specialty landings: `src/content/specialties.ts`, one entry with EN/FR/DE copy renders `/for/{slug}/` and `/{fr,de}/for/{slug}/`.

## Copy rules

- No em dashes in user-facing copy. Contact email is contact@docnote.ch. Support site is https://support.docnote.care.
```

- [ ] **Step 2: Replace README**

Overwrite `README.md` with the same content as `CLAUDE.md` minus the first heading line, plus a `## Deploy` section: `npm run build` then Cloudflare Pages deploys `dist/` (see `wrangler.jsonc`).

- [ ] **Step 3: Remove the one-shot migration script**

```bash
git rm scripts/migrate-blog-frontmatter.mjs
```

- [ ] **Step 4: Final full verification**

Run: `npm test && npm run build`
Expected: tests pass, build ends with `check-seo: N pages OK`. Record N.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: repo conventions for the SEO architecture

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Appendix A: Post-launch checklist (manual, outside this plan)

1. Google Search Console: submit `https://docnote.care/sitemap.xml` again; use "Validate fix" on any "Page with redirect" report that appears for the old `/en/` URLs. Request indexing of `/`, the 6 English category hubs and `/for/radiology/`.
2. Update any external links you control (App Store listing, LinkedIn, support.docnote.care, email signatures) from `/en/...` to the unprefixed URL so they stop passing through the redirect.
3. Watch "Duplicate, Google chose different canonical" and "Alternate page with proper canonical tag" for two weeks; both should shrink to zero.
4. Run Screaming Frog once against production and confirm 0 hreflang errors and 0 internal links to `/en/`.

## Appendix B: Content backlog the architecture is built for

Each item is one `specialties.ts` entry or one blog post in three locales. Target queries in brackets are the EN head terms; FR and DE equivalents should be chosen from Search Console once the EN page ranks.

Specialty landings (`src/content/specialties.ts`): `general-practice` [AI scribe for GPs], `surgery` [AI operative report], `dentistry` [dental AI scribe, DENTOTAR], `intensive-care` [ICU documentation AI], `psychiatry` [psychiatry note AI].

Guides category: "How to write a discharge letter in under 10 minutes", "SOAP vs DAP vs APSO notes", "Dictation vs ambient scribe: which one for a Swiss practice", "Swiss DRG coding from a discharge letter".

Compliance category: "Is an AI scribe allowed under Swiss medical secrecy (Art. 321 StGB)", "GDPR checklist for AI documentation in France", "nFADP: what changed for medical practices in 2023".

AI scribe category: "How ambient AI scribes work", "What an AI scribe gets wrong and how to catch it", "DocNote vs generic transcription", "Evaluating an AI scribe: 12 questions to ask the vendor".

Hospital workflows category: "Ward round notes at scale", "EHR integration: Mediway, SOKLE, Axenita", "Physician burnout and documentation time: the data".

Each new post must set `translationKey`, a category, at least two tags, and `faq` with 3 entries. The related-posts and pillar links come for free.
