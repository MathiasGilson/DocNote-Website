/**
 * Fails the build when the built site violates the SEO invariants:
 *  - nothing is built under dist/en/ (English lives at the root)
 *  - exactly one <link rel=canonical>, equal to the page's own URL
 *  - a non-empty meta description
 *  - exactly one <h1>
 *  - unique <title> across the site
 *  - every hreflang href resolves to a page in dist, and that page links back (reciprocity)
 *  - og:image resolves to a file in dist
 *  - dist/404.html exists (Cloudflare Pages needs it to answer unknown URLs with a 404)
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
    // Only index.html pages are validated, which already excludes the 404.html shell.
    else if (e.name === 'index.html') yield full;
  }
}
const exists = async (p) => stat(p).then(() => true, () => false);
const toPath = (url) => new URL(url).pathname;

if (await exists(join(DIST, 'en'))) errors.push('dist/en/ exists: English must be built at the root');
if (!(await exists(join(DIST, '404.html')))) errors.push('dist/404.html missing: unknown URLs would be served as soft 404s');

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
