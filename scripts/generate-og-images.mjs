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

const clamp = (text, max) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
};

const card = (title, description, lang) => ({
  type: 'div',
  props: {
    style: { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: 'linear-gradient(135deg,#f5f3ff 0%,#eef2ff 100%)', fontFamily: 'Open Sans', color: '#111827', overflow: 'hidden' },
    children: [
      { type: 'div', props: { style: { fontSize: 34, color: '#6d28d9' }, children: 'DocNote' } },
      { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [
        { type: 'div', props: { style: { fontSize: title.length > 100 ? 44 : title.length > 70 ? 52 : 64, lineHeight: 1.1 }, children: clamp(title, 110) } },
        { type: 'div', props: { style: { fontSize: 28, color: '#4b5563', lineHeight: 1.35 }, children: clamp(description, 140) } },
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
