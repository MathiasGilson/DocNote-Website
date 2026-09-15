// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://docnote.care',
  trailingSlash: 'always',
  integrations: [tailwind()],
  // One shared Tailwind bundle instead of per-route chunks. Route chunking was
  // emitting three near-identical stylesheets, all render-blocking on every page.
  vite: { build: { cssCodeSplit: false } },
});
