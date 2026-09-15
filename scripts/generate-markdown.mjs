/**
 * Build step: write a markdown twin (`index.md`) next to every built
 * `index.html` in dist/. The twins are plain static files at `<url>index.md`,
 * served with `X-Robots-Tag: noindex` via `public/_headers`. `Accept` content
 * negotiation is not enabled (see CLAUDE.md).
 *
 * Wired into `npm run build` as a standalone step:
 *
 *   node scripts/generate-markdown.mjs [distDir]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { htmlToMarkdown } from "./html-to-markdown.mjs";

async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(full);
    else if (entry.name === "index.html") yield full;
  }
}

/** @returns {Promise<number>} number of markdown files written */
export async function generateMarkdown(distDir) {
  let count = 0;
  for await (const htmlPath of walkHtml(distDir)) {
    const html = await readFile(htmlPath, "utf8");
    await writeFile(join(dirname(htmlPath), "index.md"), htmlToMarkdown(html));
    count += 1;
  }
  return count;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCli) {
  const here = dirname(fileURLToPath(import.meta.url));
  const distDir = resolve(process.argv[2] || join(here, "..", "dist"));
  const count = await generateMarkdown(distDir);
  console.log(`[markdown] wrote ${count} index.md files under ${distDir}`);
}
