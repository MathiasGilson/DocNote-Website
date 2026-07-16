// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://docnote.care',
  trailingSlash: 'always',
  integrations: [tailwind()],
});
