#!/usr/bin/env node
/**
 * Translate DocNote locale JSON using OpenRouter DeepSeek.
 * Adapted from Record-meeting / Tasksboard translate-locales.mjs.
 *
 * Targets:
 *   - src/content/pages/<locale>.json  (main UI store)
 *   - src/content/inline/<bundle>/<locale>.json  (patient, sondage, emploi, pillars, pillar-nav, seo, landings,
 *     solutions-hub, landing-ui, specialty-families, specialties-hub, site-ui, family-ui)
 *
 * Usage:
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --dry-run
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --only=es --bundle=pages
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --only=es,it --bundle=pages,patient
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --max-locales=2
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --force
 *   OPEN_ROUTER_API_KEY=… node scripts/translate-locales.mjs --only=zh --bundle=landings --keys=ehr-integration,clinical-context
 *     (--keys: force-retranslate only these top-level keys of the bundle, even if present)
 *
 * Env: OPEN_ROUTER_API_KEY (Keychain: openrouter-qualtir)
 *      TRANSLATE_MODEL (default: deepseek/deepseek-chat-v3-0324)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const API_KEY = process.env.OPEN_ROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPEN_ROUTER_API_KEY is not set.');
  console.error(
    'Load: OPEN_ROUTER_API_KEY=$(security find-generic-password -s openrouter-qualtir -w) node scripts/translate-locales.mjs'
  );
  process.exit(1);
}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.TRANSLATE_MODEL || 'deepseek/deepseek-chat-v3-0324';

const MAX_CHUNK_BYTES = Number(process.env.TRANSLATE_CHUNK_BYTES || 18000);
const MAX_CONCURRENT_API = 6;
const DELAY_BETWEEN_CALLS_MS = 150;

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

const BUNDLES = {
  pages: path.join(ROOT, 'src/content/pages'),
  patient: path.join(ROOT, 'src/content/inline/patient'),
  sondage: path.join(ROOT, 'src/content/inline/sondage'),
  emploi: path.join(ROOT, 'src/content/inline/emploi'),
  pillars: path.join(ROOT, 'src/content/inline/pillars'),
  'pillar-nav': path.join(ROOT, 'src/content/inline/pillar-nav'),
  seo: path.join(ROOT, 'src/content/inline/seo'),
  'seo-content': path.join(ROOT, 'src/content/inline/seo-content'),
  landings: path.join(ROOT, 'src/content/inline/landings'),
  'solutions-hub': path.join(ROOT, 'src/content/inline/solutions-hub'),
  'landing-ui': path.join(ROOT, 'src/content/inline/landing-ui'),
  'specialty-families': path.join(ROOT, 'src/content/inline/specialty-families'),
  'specialties-hub': path.join(ROOT, 'src/content/inline/specialties-hub'),
  'site-ui': path.join(ROOT, 'src/content/inline/site-ui'),
  'family-ui': path.join(ROOT, 'src/content/inline/family-ui'),
};

/* Target-script sanity check: a "translation" that comes back in Latin script for
 * these locales is almost certainly untranslated English (seen with zh in Aug 2026). */
const LOCALE_SCRIPT = {
  ar: /[\u0600-\u06FF]/,
  hi: /[\u0900-\u097F]/,
  ja: /[\u3040-\u30FF\u4E00-\u9FFF]/,
  ko: /[\uAC00-\uD7AF]/,
  ru: /[\u0400-\u04FF]/,
  th: /[\u0E00-\u0E7F]/,
  zh: /[\u4E00-\u9FFF]/,
};

function collectStrings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => collectStrings(v, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => collectStrings(v, out));
  return out;
}

/** Fraction of "translatable" strings (has 4+ latin letters) that carry no target-script char. */
function untranslatedRatio(translated, locale) {
  const re = LOCALE_SCRIPT[locale];
  if (!re) return 0;
  const strings = collectStrings(translated).filter((s) => /[a-zA-Z]{4,}/.test(s) && s.length > 12);
  if (!strings.length) return 0;
  const bad = strings.filter((s) => !re.test(s)).length;
  return bad / strings.length;
}

const rawArgs = process.argv.slice(2);
const flags = {
  force: rawArgs.includes('--force'),
  dryRun: rawArgs.includes('--dry-run'),
  only: null,
  bundles: null,
  keys: null,
  maxLocales: null,
  maxApiCalls: null,
};

for (const arg of rawArgs) {
  if (arg.startsWith('--only=')) flags.only = arg.slice(7).split(',').filter(Boolean);
  if (arg.startsWith('--bundle=')) flags.bundles = arg.slice(9).split(',').filter(Boolean);
  if (arg.startsWith('--keys=')) flags.keys = arg.slice(7).split(',').filter(Boolean);
  if (arg.startsWith('--max-locales=')) flags.maxLocales = parseInt(arg.slice(14), 10);
  if (arg.startsWith('--max-api-calls=')) flags.maxApiCalls = parseInt(arg.slice(16), 10);
}

const positionalLocales = rawArgs.filter((a) => !a.startsWith('--') && LOCALE_NAMES[a]);

let apiCallCount = 0;
const usageTotals = { prompt: 0, completion: 0, cost: 0 };

function countLeaves(obj) {
  if (obj === null || obj === undefined) return 0;
  if (Array.isArray(obj)) return obj.reduce((s, v) => s + countLeaves(v), 0);
  if (typeof obj === 'object') return Object.values(obj).reduce((s, v) => s + countLeaves(v), 0);
  return 1;
}

function findMissingSubtree(source, target) {
  if (target === undefined || target === null) return source;
  if (Array.isArray(source)) {
    if (!Array.isArray(target) || flags.force) return source;
    const diff = [];
    let any = false;
    for (let i = 0; i < source.length; i++) {
      const child = findMissingSubtree(source[i], target[i]);
      if (child !== undefined) {
        // Translate the full source item at this index (cleaner than partial patches).
        diff.push({ __i: i, __v: source[i] });
        any = true;
      }
    }
    return any ? { __arr: true, __items: diff } : undefined;
  }
  if (typeof source === 'object' && source !== null) {
    if (typeof target !== 'object' || Array.isArray(target)) return source;
    const diff = {};
    for (const [k, v] of Object.entries(source)) {
      const childDiff = findMissingSubtree(v, flags.force ? undefined : target[k]);
      if (childDiff !== undefined) diff[k] = childDiff;
    }
    return Object.keys(diff).length > 0 ? diff : undefined;
  }
  if (flags.force) return source;
  return undefined;
}

/** Diff for a bundle/locale: normal missing-leaves diff, or forced subset when --keys is set. */
function computeMissing(enData, locData) {
  if (flags.keys) {
    const subset = {};
    for (const k of flags.keys) {
      if (!(k in enData)) {
        console.error(`--keys: unknown top-level key "${k}" in EN source`);
        process.exit(1);
      }
      subset[k] = enData[k];
    }
    return Object.keys(subset).length ? subset : undefined;
  }
  return findMissingSubtree(enData, flags.force ? undefined : locData);
}

function unwrapArrPatches(node) {
  if (Array.isArray(node)) return node.map(unwrapArrPatches);
  if (typeof node !== 'object' || node === null) return node;
  if (node.__arr && Array.isArray(node.__items)) {
    // Expand to a real array sized to max index for the model / merge.
    const maxI = node.__items.reduce((m, it) => Math.max(m, it.__i), -1);
    const arr = Array.from({ length: maxI + 1 });
    for (const it of node.__items) arr[it.__i] = unwrapArrPatches(it.__v);
    return arr;
  }
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = unwrapArrPatches(v);
  return out;
}

function deepMerge(target, translated) {
  translated = unwrapArrPatches(translated);
  if (Array.isArray(translated)) {
    const base = Array.isArray(target) ? [...target] : [];
    for (let i = 0; i < translated.length; i++) {
      // Skip holes/nulls from sparse array patches so good items are not wiped.
      if (translated[i] === undefined || translated[i] === null) continue;
      base[i] = deepMerge(base[i], translated[i]);
    }
    return base;
  }
  if (typeof translated !== 'object' || translated === null) {
    return translated;
  }
  const result = typeof target === 'object' && target !== null && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(translated)) {
    result[k] = deepMerge(result[k], v);
  }
  return result;
}

function reorderKeys(enData, locData) {
  const ordered = {};
  for (const key of Object.keys(enData)) {
    if (key in locData) ordered[key] = locData[key];
  }
  for (const key of Object.keys(locData)) {
    if (!(key in ordered)) ordered[key] = locData[key];
  }
  return ordered;
}

function chunkNestedObject(obj) {
  const fullSize = JSON.stringify(obj).length;
  if (fullSize <= MAX_CHUNK_BYTES * 1.25) return [obj];
  const chunks = [];
  let current = {};
  let currentSize = 2;
  for (const [key, val] of Object.entries(obj)) {
    const entrySize = JSON.stringify({ [key]: val }).length + 1;
    if (currentSize + entrySize > MAX_CHUNK_BYTES && Object.keys(current).length > 0) {
      chunks.push(current);
      current = {};
      currentSize = 2;
    }
    current[key] = val;
    currentSize += entrySize;
  }
  if (Object.keys(current).length > 0) chunks.push(current);
  return chunks;
}

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
      if (queue.length > 0) queue.shift()();
    },
  };
}

async function translateJSON(enChunk, locale, retries = 3) {
  if (flags.maxApiCalls != null && apiCallCount >= flags.maxApiCalls) {
    throw new Error(`API call cap reached (--max-api-calls=${flags.maxApiCalls})`);
  }
  const langName = LOCALE_NAMES[locale] || locale;
  const jsonStr = JSON.stringify(enChunk, null, 2);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180_000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator localizing "DocNote" — an AI medical documentation product for physicians and hospitals in Switzerland and Europe (Swiss-hosted clinical scribe).

Translate the JSON values from English to ${langName}.

TRANSLATION RULES:
1. Translate every value. Preserve meaning and structure.
2. Do NOT shorten, summarize, or drop details.
3. Preserve placeholders exactly: {variable}, {{variable}}, %s, {pct}, {min}, etc.
4. Do NOT translate brand/product names or tariff/system names: DocNote, Mediway, SOKLE, Axenita, EDL, Elsan, Ramsay, Ardentis, SwissDRG, TARDOC, Tarif 222, PMSI, CHOP, ICD-10, OAuth2, Word (Microsoft Word), SOAP, HIPAA, GDPR, FADP, nFADP, nLPD, ISO, EHR, DPI, KIS, Dragon, Reply.io, Looker Studio, FONGIT, HUG, AP-HP, Web3Forms. "EHR" may be rendered by the usual local term (e.g. DPI in French, KIS in German) when the target language has one.
4b. Keep claims exactly as cautious as the source: coding is a "suggestion/proposal to validate" (never automatic coding), the EHR flow is one-way (never bidirectional/two-way), compliance is described, never guaranteed.
5. Keep medical acronyms when commonly used in the target language (SOAP, OR, BP, HR).
6. Keep JSON keys EXACTLY as-is — including top-level landing slugs like "ai-medical-scribe", "ai-scribe-general-practice". NEVER translate, rename, or localize keys.
7. Keep structure, arrays, nesting identical to the input.
8. Output ONLY valid JSON — no markdown fences, no commentary, no preamble.
9. Natural fluent ${langName}. No em dashes (—). Avoid marketing clichés.
10. Glossary: "specialty family" = a group of related medical specialties (surgical, medical, primary care, acute care, diagnostics, allied health); pick one natural term for it and use it consistently. "template" = document template in the app. "operative report" = surgical operation report. Keep the "Dentotar®" name as-is.`,
            },
            { role: 'user', content: jsonStr },
          ],
          temperature: 0.2,
          usage: { include: true },
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status}: ${err}`);
      }

      const data = await response.json();
      let content = (data.choices?.[0]?.message?.content || '').trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      // Models sometimes add a short English preamble before the JSON object.
      if (!content.startsWith('{') && !content.startsWith('[')) {
        const start = content.search(/[\{\[]/);
        if (start >= 0) content = content.slice(start);
      }
      const endObj = content.lastIndexOf('}');
      const endArr = content.lastIndexOf(']');
      const end = Math.max(endObj, endArr);
      if (end >= 0) content = content.slice(0, end + 1);

      apiCallCount++;
      if (data.usage) {
        usageTotals.prompt += data.usage.prompt_tokens || 0;
        usageTotals.completion += data.usage.completion_tokens || 0;
        usageTotals.cost += Number(data.usage.cost || 0);
      }
      await sleep(DELAY_BETWEEN_CALLS_MS);
      const parsed = JSON.parse(content);
      const ratio = untranslatedRatio(parsed, locale);
      if (ratio > 0.3) {
        throw new Error(
          `output looks untranslated (${Math.round(ratio * 100)}% of strings without ${langName} script)`
        );
      }
      return parsed;
    } catch (err) {
      if (attempt < retries) {
        const backoff = 2000 * (attempt + 1);
        console.warn(`  [${locale}] retry ${attempt + 1}/${retries}: ${err.message}`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

async function processBundleLocale(bundleName, dir, locale, enData, semaphore) {
  const locPath = path.join(dir, `${locale}.json`);
  let locData = {};
  if (fs.existsSync(locPath)) {
    locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
  }

  const missing = computeMissing(enData, locData);
  if (
    missing === undefined ||
    (typeof missing === 'object' && !Array.isArray(missing) && Object.keys(missing).length === 0)
  ) {
    return { bundle: bundleName, locale, translated: 0, failed: 0, changed: false };
  }

  const keyCount = countLeaves(missing);
  if (flags.dryRun) {
    console.log(`[${bundleName}/${locale}] dry-run: ${keyCount} leaves`);
    return { bundle: bundleName, locale, translated: 0, failed: 0, changed: false, keyCount };
  }

  const payload = unwrapArrPatches(missing);
  const chunks = chunkNestedObject(
    typeof payload === 'object' && !Array.isArray(payload) ? payload : { _root: payload }
  );
  let translated = 0;
  let failed = 0;

  const persist = () => {
    const ordered = reorderKeys(enData, locData);
    fs.writeFileSync(locPath, JSON.stringify(ordered, null, 2) + '\n');
  };

  for (let i = 0; i < chunks.length; i++) {
    const leaves = countLeaves(chunks[i]);
    await semaphore.acquire();
    try {
      const part = await translateJSON(chunks[i], locale);
      locData = deepMerge(locData, part);
      translated += leaves;
      persist();
      console.log(`  [${bundleName}/${locale}] chunk ${i + 1}/${chunks.length} OK (${leaves} leaves)`);
    } catch (err) {
      console.error(`  [${bundleName}/${locale}] chunk ${i + 1} FAILED: ${err.message}`);
      failed += leaves;
    } finally {
      semaphore.release();
    }
  }

  return { bundle: bundleName, locale, translated, failed, changed: translated > 0 };
}

async function main() {
  let targetLocales;
  if (flags.only) {
    targetLocales = flags.only.filter((l) => LOCALE_NAMES[l]);
  } else if (positionalLocales.length > 0) {
    targetLocales = positionalLocales;
  } else {
    targetLocales = Object.keys(LOCALE_NAMES);
  }

  if (flags.maxLocales != null) {
    targetLocales = targetLocales.slice(0, flags.maxLocales);
  }

  const bundleNames = flags.bundles || Object.keys(BUNDLES);
  for (const b of bundleNames) {
    if (!BUNDLES[b]) {
      console.error(`Unknown bundle: ${b}. Available: ${Object.keys(BUNDLES).join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`Model: ${MODEL}`);
  console.log(`Bundles: ${bundleNames.join(', ')}`);
  console.log(`Locales: ${targetLocales.join(', ')}`);
  if (flags.dryRun) console.log('Dry-run mode');
  if (flags.force) console.log('Force retranslate');
  if (flags.keys) console.log(`Forced keys: ${flags.keys.join(', ')}`);
  if (flags.maxApiCalls != null) console.log(`API call cap: ${flags.maxApiCalls}`);
  console.log();

  let totalMissing = 0;
  const tasks = [];

  for (const bundleName of bundleNames) {
    const dir = BUNDLES[bundleName];
    const enPath = path.join(dir, 'en.json');
    if (!fs.existsSync(enPath)) {
      console.error(`Missing EN source: ${enPath}`);
      process.exit(1);
    }
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    for (const locale of targetLocales) {
      const locPath = path.join(dir, `${locale}.json`);
      let locData = {};
      if (fs.existsSync(locPath)) {
        locData = JSON.parse(fs.readFileSync(locPath, 'utf8'));
      }
      const missing = computeMissing(enData, locData);
      const count =
        missing === undefined
          ? 0
          : countLeaves(missing);
      if (count > 0) {
        console.log(`  ${bundleName}/${locale}: ${count} leaves`);
        totalMissing += count;
        tasks.push({ bundleName, dir, locale, enData, count });
      }
    }
  }

  console.log(`\nTotal leaves to translate: ${totalMissing}`);
  console.log(`Tasks (bundle×locale): ${tasks.length}`);
  const estCalls = tasks.reduce((s, t) => {
    const enPath = path.join(t.dir, 'en.json');
    // rough: 1+ chunks from missing size
    const locPath = path.join(t.dir, `${t.locale}.json`);
    let locData = fs.existsSync(locPath) ? JSON.parse(fs.readFileSync(locPath, 'utf8')) : {};
    const missing = computeMissing(t.enData, locData);
    const chunks = missing ? chunkNestedObject(missing) : [];
    return s + chunks.length;
  }, 0);
  console.log(`Estimated API calls: ~${estCalls}`);

  if (totalMissing === 0) {
    console.log('Nothing to do.');
    return;
  }

  if (flags.dryRun) {
    console.log('Dry-run complete — no API calls.');
    return;
  }

  const semaphore = createSemaphore(MAX_CONCURRENT_API);
  const results = await Promise.all(
    tasks.map((t) => processBundleLocale(t.bundleName, t.dir, t.locale, t.enData, semaphore))
  );

  console.log('\n' + '='.repeat(50));
  console.log(`API calls used: ${apiCallCount}`);
  console.log(
    `Tokens: ${usageTotals.prompt} prompt + ${usageTotals.completion} completion` +
      (usageTotals.cost ? ` · cost ≈ $${usageTotals.cost.toFixed(4)}` : '')
  );
  let anyFailed = false;
  for (const r of results) {
    if (r.translated || r.failed) {
      console.log(
        `  ${r.bundle}/${r.locale}: ${r.translated} ok${r.failed ? `, ${r.failed} FAILED` : ''}`
      );
    }
    if (r.failed) anyFailed = true;
  }
  console.log('='.repeat(50));
  if (anyFailed) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
