/**
 * HTML → Markdown conversion for "Markdown for Agents" content negotiation.
 *
 * Mirrors the shape Cloudflare's zone-level converter emits:
 *   1. YAML frontmatter (title / description / image from <meta> tags)
 *   2. Body markdown from <main> (chrome like nav / header / footer stripped)
 *   3. Any JSON-LD blocks as fenced ```json code blocks
 *
 * Pure function — used by scripts/generate-markdown.mjs at build time.
 */
import TurndownService from "turndown";
import domino from "@mixmark-io/domino";

const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "iframe",
  "nav",
  "header",
  "footer",
  "aside",
  "button",
  "form",
  "[aria-hidden='true']",
  "[hidden]",
  "#ph-topbar",
];

function createTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });
  td.remove(["script", "style", "noscript"]);
  // Images without alt text are decorative; drop them rather than emitting `![](…)`.
  td.addRule("decorativeImage", {
    filter: (node) => node.nodeName === "IMG" && !node.getAttribute("alt"),
    replacement: () => "",
  });
  return td;
}

const turndown = createTurndown();

function metaContent(doc, selector) {
  const el = doc.querySelector(selector);
  return el ? el.getAttribute("content") || "" : "";
}

function yamlString(value) {
  return JSON.stringify(value);
}

function collapseBlankLines(md) {
  return md.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * @param {string} html full page HTML
 * @returns {string} markdown document
 */
export function htmlToMarkdown(html) {
  const doc = domino.createDocument(html);

  const title =
    metaContent(doc, "meta[property='og:title']") ||
    (doc.querySelector("title")?.textContent || "").trim();
  const description =
    metaContent(doc, "meta[name='description']") ||
    metaContent(doc, "meta[property='og:description']");
  const image = metaContent(doc, "meta[property='og:image']");

  const jsonLd = Array.from(doc.querySelectorAll("script[type='application/ld+json']"))
    .map((s) => s.textContent.trim())
    .filter(Boolean);

  const root = doc.querySelector("main") || doc.body;
  for (const selector of STRIP_SELECTORS) {
    for (const el of Array.from(root.querySelectorAll(selector))) el.remove();
  }

  const body = collapseBlankLines(turndown.turndown(root.innerHTML));

  const frontmatter = ["---"];
  if (title) frontmatter.push(`title: ${yamlString(title)}`);
  if (description) frontmatter.push(`description: ${yamlString(description)}`);
  if (image) frontmatter.push(`image: ${yamlString(image)}`);
  frontmatter.push("---");

  const parts = [frontmatter.join("\n"), body];
  for (const block of jsonLd) {
    parts.push("```json\n" + block + "\n```");
  }
  return parts.filter(Boolean).join("\n\n") + "\n";
}
