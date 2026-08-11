#!/usr/bin/env node
/**
 * Translate DocNote blog posts (EN → locale set) via OpenRouter DeepSeek.
 * Structure: src/content/blog/<locale>/<slug>.md
 *
 * Meta (title/excerpt/authorRole) via JSON; body via plain markdown (avoids truncation).
 *
 * Usage:
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-blog.mjs --posts soap-notes-best-practices --only=es,it
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-blog.mjs --force
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-blog.mjs --max-posts=2 --max-locales=2
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-blog.mjs --max-api-calls=50
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const EN_DIR = path.join(BLOG_DIR, 'en');

const API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPEN_ROUTER_API_KEY is not set.');
  process.exit(1);
}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.TRANSLATE_MODEL || 'deepseek/deepseek-chat-v3-0324';
const MAX_CONCURRENT = 4;
const DELAY_MS = 200;
const MAX_TOKENS_META = 1024;
const MAX_TOKENS_BODY = 16384;

const LOCALE_NAMES = {
  ar: 'Arabic',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  nl: 'Dutch',
  no: 'Norwegian',
  pt: 'Portuguese',
  ru: 'Russian',
  sv: 'Swedish',
  th: 'Thai',
  zh: 'Chinese (Simplified)',
};

const args = process.argv.slice(2);
const flags = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
  only: null,
  posts: null,
  maxPosts: null,
  maxLocales: null,
  maxApiCalls: null,
};
for (const a of args) {
  if (a.startsWith('--only=')) flags.only = a.slice(7).split(',');
  if (a.startsWith('--posts=')) flags.posts = a.slice(8).split(',');
  if (a.startsWith('--max-posts=')) flags.maxPosts = parseInt(a.slice(12), 10);
  if (a.startsWith('--max-locales=')) flags.maxLocales = parseInt(a.slice(14), 10);
  if (a.startsWith('--max-api-calls=')) flags.maxApiCalls = parseInt(a.slice(16), 10);
}

let apiCalls = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function createSemaphore(max) {
  let active = 0;
  const queue = [];
  return {
    async acquire() {
      if (active < max) {
        active++;
        return;
      }
      await new Promise((resolve) => queue.push(resolve));
      active++;
    },
    release() {
      active--;
      if (queue.length) queue.shift()();
    },
  };
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Invalid frontmatter');
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    else if (/^\d+$/.test(val)) val = Number(val);
    else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    fm[key] = val;
  }
  return { frontmatter: fm, body: m[2].trim() };
}

function buildFile(fm, body) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (typeof v === 'number' || typeof v === 'boolean') lines.push(`${k}: ${v}`);
    else lines.push(`${k}: ${JSON.stringify(String(v))}`);
  }
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

function stripFences(content) {
  let c = content.trim();
  if (c.startsWith('```')) {
    c = c.replace(/^```(?:json|markdown|md)?\n?/, '').replace(/\n?```$/, '');
  }
  return c.trim();
}

async function chat(messages, maxTokens) {
  if (flags.maxApiCalls != null && apiCalls >= flags.maxApiCalls) {
    throw new Error(`API call cap reached (${flags.maxApiCalls})`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 360_000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    apiCalls++;
    await sleep(DELAY_MS);
    return stripFences(data.choices[0].message.content || '');
  } finally {
    clearTimeout(timeout);
  }
}

function extractJsonObject(content) {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(`No JSON object in: ${content.slice(0, 120)}`);
  return JSON.parse(content.slice(start, end + 1));
}

async function translateMeta(lang, enFm) {
  const prompt = `Translate these DocNote blog fields from English to ${lang}.
Keep author names unchanged. Translate authorRole (job title). No em dashes.
Output ONLY a single JSON object (no markdown, no extra text):
{"title":"...","excerpt":"...","authorRole":"..."}

title: ${JSON.stringify(enFm.title)}
excerpt: ${JSON.stringify(enFm.excerpt)}
authorRole: ${JSON.stringify(enFm.authorRole || '')}`;

  const content = await chat([{ role: 'user', content: prompt }], MAX_TOKENS_META);
  const parsed = extractJsonObject(content);
  if (!parsed.title || !parsed.excerpt) throw new Error('Meta JSON missing title/excerpt');
  return parsed;
}

async function translateBody(locale, lang, enBody) {
  const prompt = `You are a professional translator localizing a DocNote medical-AI blog post from English to ${lang}.

Translate the FULL markdown body below into ${lang} only.

RULES:
1. Preserve markdown formatting, headings, lists, links, HTML <details>/<summary> tags, bold/italic.
2. Keep URLs and image paths unchanged.
3. Do NOT translate brand names: DocNote, Mediway, SOKLE, HIPAA, GDPR, FADP, nFADP, JAMA, SOAP, FONGIT, SCS, SGAIM.
4. No em dashes or en dashes. Use commas or periods.
5. Output ONLY the translated markdown. No preamble, no JSON, no code fences, no "Body:" label.
6. Use real newlines, never the two-character sequence backslash-n.
7. Keep every HTML <details> and <summary> tag exactly. Translate only the text inside them. Do not convert FAQ accordions to plain headings.

BODY:
${enBody}`;

  let body = await chat([{ role: 'user', content: prompt }], MAX_TOKENS_BODY);
  if (body.includes('\\n') && body.split('\\n').length > body.split('\n').length) {
    body = body.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }
  body = body
    .replace(/^\*\*ボディ：\*\*\s*/u, '')
    .replace(/^\*\*Body:\*\*\s*/i, '')
    .replace(/^BODY:\s*/i, '');
  const minRatio = ['zh', 'ja', 'ko'].includes(locale) ? 0.18 : 0.35;
  if (body.length < Math.min(800, enBody.length * minRatio)) {
    throw new Error(`Body too short (${body.length} chars vs en ${enBody.length})`);
  }
  const cjk = (body.match(/[\u3400-\u9fff]/g) || []).length;
  if (cjk > 120 && !['zh', 'ja', 'ko'].includes(locale)) {
    throw new Error(`Wrong script: CJK-heavy body for locale ${locale}`);
  }
  // Reject obvious garbage loops (same short token repeated).
  if (/(AI・医療・AI・ドキュノート・){8,}/.test(body)) {
    throw new Error('Garbage loop detected in body');
  }
  const enFaqCount = (enBody.match(/<details>/gi) || []).length;
  let faqCount = (body.match(/<details>/gi) || []).length;
  if (enFaqCount >= 4 && faqCount < 4) {
    const enFaq = enBody.match(/## FAQ[\s\S]*?(?=\n## |$)/)?.[0];
    if (!enFaq) throw new Error(`FAQ details lost (${faqCount} found)`);
    console.warn(`  [${locale}] splicing FAQ section separately`);
    const faqPrompt = `Translate this FAQ markdown/HTML from English to ${lang}.
Keep every <details> and <summary> tag. Translate only text. Output ONLY the translated FAQ section.

${enFaq}`;
    let faq = await chat([{ role: 'user', content: faqPrompt }], 4000);
    faq = faq.replace(/^```(?:markdown|md|html)?\n?/, '').replace(/\n?```$/, '');
    if ((faq.match(/<details>/gi) || []).length < 4) {
      throw new Error(`FAQ splice failed (${(faq.match(/<details>/gi) || []).length} details)`);
    }
    body = body.replace(/\n## (FAQ|Häufig gestellte Fragen|Häufige Fragen|Foire aux questions|Preguntas frecuentes)[\s\S]*?(?=\n## |$)/i, '\n');
    body = `${body.trim()}\n\n${faq.trim()}\n`;
    faqCount = (body.match(/<details>/gi) || []).length;
  }
  return body;
}

async function translatePost(slug, locale, enFm, enBody, semaphore) {
  const lang = LOCALE_NAMES[locale];
  await semaphore.acquire();
  try {
    let meta = {
      title: enFm.title,
      excerpt: enFm.excerpt,
      authorRole: enFm.authorRole,
    };
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        meta = await translateMeta(lang, enFm);
        break;
      } catch (err) {
        console.warn(`  [${slug}/${locale}] meta retry: ${err.message}`);
        if (attempt === 2) {
          console.warn(`  [${slug}/${locale}] meta fallback to EN`);
        } else {
          await sleep(2000 * (attempt + 1));
        }
      }
    }
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const body = await translateBody(locale, lang, enBody);
        return { ...meta, body };
      } catch (err) {
        if (attempt === 3) throw err;
        console.warn(`  [${slug}/${locale}] body retry: ${err.message}`);
        await sleep(3000 * (attempt + 1));
      }
    }
  } finally {
    semaphore.release();
  }
}

async function main() {
  let locales = flags.only || Object.keys(LOCALE_NAMES);
  if (flags.maxLocales != null) locales = locales.slice(0, flags.maxLocales);

  let posts = fs.readdirSync(EN_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  if (flags.posts) posts = posts.filter((p) => flags.posts.includes(p));
  if (flags.maxPosts != null) posts = posts.slice(0, flags.maxPosts);

  const tasks = [];
  for (const slug of posts) {
    for (const locale of locales) {
      const out = path.join(BLOG_DIR, locale, `${slug}.md`);
      if (!flags.force && fs.existsSync(out)) continue;
      tasks.push({ slug, locale, out });
    }
  }

  console.log(`Model: ${MODEL}`);
  console.log(`Posts: ${posts.length} | Locales: ${locales.join(', ')}`);
  console.log(`Tasks: ${tasks.length} | Est. API calls: ~${tasks.length * 2} (meta+body)`);
  if (flags.dryRun) {
    console.log('Dry-run — sample tasks:', tasks.slice(0, 10));
    return;
  }
  if (tasks.length === 0) {
    console.log('Nothing to translate.');
    return;
  }

  const semaphore = createSemaphore(MAX_CONCURRENT);
  let done = 0;
  let failed = 0;

  await Promise.all(
    tasks.map(async ({ slug, locale, out }) => {
      try {
        const raw = fs.readFileSync(path.join(EN_DIR, `${slug}.md`), 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        const tr = await translatePost(slug, locale, frontmatter, body, semaphore);
        const fm = {
          ...frontmatter,
          title: tr.title || frontmatter.title,
          excerpt: tr.excerpt || frontmatter.excerpt,
          authorRole: tr.authorRole || frontmatter.authorRole,
        };
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, buildFile(fm, tr.body || body));
        done++;
        console.log(`OK ${slug}/${locale} (${done}/${tasks.length})`);
      } catch (err) {
        failed++;
        console.error(`FAIL ${slug}/${locale}: ${err.message}`);
      }
    })
  );

  console.log(`\nDone. OK=${done} FAIL=${failed} API=${apiCalls}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
