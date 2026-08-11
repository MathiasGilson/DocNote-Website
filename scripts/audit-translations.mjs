#!/usr/bin/env node
/**
 * Audit DocNote translations across pages, inline bundles, and blog.
 *
 * Usage:
 *   node scripts/audit-translations.mjs
 *   node scripts/audit-translations.mjs --json > audit.json
 *   node scripts/audit-translations.mjs --only=fr,de,ru --bundle=pages,landings,blog
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LOCALES = [
  'ar', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'no', 'pt', 'ru', 'sv', 'th', 'zh',
];

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
};

const BLOG_DIR = path.join(ROOT, 'src/content/blog');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
let onlyLocales = null;
let onlyBundles = null;
for (const a of args) {
  if (a.startsWith('--only=')) onlyLocales = a.slice(7).split(',').filter(Boolean);
  if (a.startsWith('--bundle=')) onlyBundles = a.slice(9).split(',').filter(Boolean);
}

const locales = onlyLocales || LOCALES;
const bundleNames = onlyBundles
  ? onlyBundles.filter((b) => b === 'blog' || BUNDLES[b])
  : [...Object.keys(BUNDLES), 'blog'];

const BRAND_OK = /\b(DocNote|SOAP|Mediway|SOKLE|HIPAA|ISO|GDPR|nFADP|EHR|DPI|KIS|HCE|API|AI|OR|ED|MD)\b/i;
const EN_COMMON =
  /\b(the|and|with|from|your|for|that|this|what|when|how|patient|clinical|documentation|medical|consultation)\b/i;

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function walkLeaves(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined) {
    out.push({ path: prefix, value: obj, type: 'null' });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walkLeaves(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (isPlainObject(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      walkLeaves(v, p, out);
    }
    return out;
  }
  out.push({
    path: prefix,
    value: obj,
    type: typeof obj,
  });
  return out;
}

function leafMap(obj) {
  const m = new Map();
  for (const leaf of walkLeaves(obj)) {
    if (leaf.type === 'string' || leaf.type === 'number' || leaf.type === 'boolean') {
      m.set(leaf.path, leaf.value);
    } else if (leaf.type === 'null') {
      m.set(leaf.path, null);
    }
  }
  return m;
}

function cjkRatio(s) {
  const cjk = (s.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).join('').length;
  return s.length ? cjk / s.length : 0;
}

function arabicRatio(s) {
  const ar = (s.match(/[\u0600-\u06FF]/g) || []).join('').length;
  return s.length ? ar / s.length : 0;
}

function cyrillicRatio(s) {
  const cy = (s.match(/[\u0400-\u04FF]/g) || []).join('').length;
  return s.length ? cy / s.length : 0;
}

function looksEnglishHeavy(locale, s) {
  if (typeof s !== 'string' || s.length < 18) return false;
  if (BRAND_OK.test(s) && s.split(/\s+/).length <= 4) return false;
  const words = s.match(/[A-Za-z]{3,}/g) || [];
  if (words.length < 3) return false;
  if (['ja', 'ko', 'zh'].includes(locale) && cjkRatio(s) < 0.2 && EN_COMMON.test(s)) return true;
  if (locale === 'ar' && arabicRatio(s) < 0.25 && EN_COMMON.test(s)) return true;
  if (locale === 'ru' && cyrillicRatio(s) < 0.25 && EN_COMMON.test(s)) return true;
  if (['fr', 'de', 'es', 'it', 'pt', 'nl', 'sv', 'no'].includes(locale)) {
    // Allow short product terms; flag longer EN sentences left untranslated
    if (/^[A-Za-z0-9 ,.'’"()\-—–:/+%]+$/.test(s) && s.split(/\s+/).length >= 6 && EN_COMMON.test(s)) {
      return true;
    }
  }
  if (['hi', 'th'].includes(locale) && EN_COMMON.test(s) && /AI scribe for/i.test(s)) return true;
  return false;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function auditJsonBundle(name, dir) {
  const enPath = path.join(dir, 'en.json');
  if (!fs.existsSync(enPath)) {
    return { name, error: 'missing en.json', locales: {} };
  }
  const en = readJson(enPath);
  const enLeaves = leafMap(en);
  const result = { name, enLeaves: enLeaves.size, locales: {} };

  for (const locale of locales) {
    const locPath = path.join(dir, `${locale}.json`);
    const row = {
      missingFile: !fs.existsSync(locPath),
      missingKeys: [],
      extraKeys: [],
      empty: [],
      identicalToEn: [],
      truncated: [],
      englishLeftover: [],
      typeMismatch: [],
    };
    if (row.missingFile) {
      result.locales[locale] = row;
      continue;
    }
    const loc = readJson(locPath);
    const locLeaves = leafMap(loc);

    for (const [p, enVal] of enLeaves) {
      if (!locLeaves.has(p)) {
        row.missingKeys.push(p);
        continue;
      }
      const v = locLeaves.get(p);
      if (v === null || v === undefined || v === '') {
        row.empty.push(p);
        continue;
      }
      if (typeof v !== typeof enVal && !(enVal === null)) {
        row.typeMismatch.push(p);
      }
      if (typeof v === 'string' && typeof enVal === 'string') {
        const isAsset =
          /\.(png|jpe?g|webp|gif|svg)$/i.test(v) ||
          p.endsWith('.image') ||
          p.includes('.image') ||
          v.startsWith('/images/') ||
          v.startsWith('/assets/');
        const isProperNounPath =
          p.endsWith('.founders') ||
          p.includes('.role') ||
          p.includes('soapDemo.consultationTitle');

        if (
          !isAsset &&
          !isProperNounPath &&
          v === enVal &&
          enVal.length >= 24 &&
          !BRAND_OK.test(enVal)
        ) {
          row.identicalToEn.push(p);
        }
        if (v.includes('…') || v.endsWith('...')) {
          // EN recording demo ends with before... — allow matching ellipsis microcopy
          if (!String(enVal).includes('…') && !String(enVal).endsWith('...')) {
            row.truncated.push(p);
          }
        }
        if (!isAsset && looksEnglishHeavy(locale, v) && v === enVal) {
          row.englishLeftover.push(p);
        } else if (!isAsset && /AI scribe for/i.test(v)) {
          row.englishLeftover.push(p);
        }
      }
    }
    for (const p of locLeaves.keys()) {
      if (!enLeaves.has(p)) row.extraKeys.push(p);
    }

    // Cap sample lists for readability
    for (const key of Object.keys(row)) {
      if (Array.isArray(row[key]) && row[key].length > 40) {
        row[`${key}Total`] = row[key].length;
        row[key] = row[key].slice(0, 40);
      }
    }
    result.locales[locale] = row;
  }
  return result;
}

function parseFrontmatter(md) {
  if (!md.startsWith('---')) return { fm: {}, body: md };
  const end = md.indexOf('\n---', 3);
  if (end < 0) return { fm: {}, body: md };
  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 4).replace(/^\n/, '');
  const fm = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[m[1]] = val;
  }
  return { fm, body };
}

function auditBlog() {
  const enDir = path.join(BLOG_DIR, 'en');
  const enPosts = fs
    .readdirSync(enDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();

  const result = { name: 'blog', enPosts: enPosts.length, locales: {} };
  for (const locale of locales) {
    const dir = path.join(BLOG_DIR, locale);
    const row = {
      missingFile: !fs.existsSync(dir),
      missingPosts: [],
      emptyBody: [],
      identicalTitle: [],
      englishBody: [],
      shortBody: [],
    };
    if (row.missingFile) {
      result.locales[locale] = row;
      continue;
    }
    const present = new Set(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''))
    );
    for (const slug of enPosts) {
      if (!present.has(slug)) {
        row.missingPosts.push(slug);
        continue;
      }
      const enRaw = fs.readFileSync(path.join(enDir, `${slug}.md`), 'utf8');
      const locRaw = fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8');
      const en = parseFrontmatter(enRaw);
      const loc = parseFrontmatter(locRaw);
      if (!loc.body || loc.body.trim().length < 80) row.emptyBody.push(slug);
      if (loc.fm.title && en.fm.title && loc.fm.title === en.fm.title) row.identicalTitle.push(slug);
      const body = loc.body.trim();
      if (body.length > 0 && body.length < Math.max(200, Math.floor((en.body || '').length * 0.25))) {
        if (!['zh', 'ja', 'ko'].includes(locale)) row.shortBody.push(slug);
      }
      if (looksEnglishHeavy(locale, body.slice(0, 400)) && body.slice(0, 200) === (en.body || '').slice(0, 200)) {
        row.englishBody.push(slug);
      }
    }
    for (const key of Object.keys(row)) {
      if (Array.isArray(row[key]) && row[key].length > 40) {
        row[`${key}Total`] = row[key].length;
        row[key] = row[key].slice(0, 40);
      }
    }
    result.locales[locale] = row;
  }
  return result;
}

function severity(row) {
  const miss =
    (row.missingKeys?.length || row.missingKeysTotal || 0) +
    (row.missingPosts?.length || row.missingPostsTotal || 0) +
    (row.missingFile ? 1000 : 0);
  const empty = (row.empty?.length || row.emptyTotal || 0) + (row.emptyBody?.length || 0);
  const leftover =
    (row.englishLeftover?.length || row.englishLeftoverTotal || 0) +
    (row.englishBody?.length || 0) +
    (row.identicalToEn?.length || row.identicalToEnTotal || 0) +
    (row.identicalTitle?.length || 0);
  const trunc = row.truncated?.length || row.truncatedTotal || 0;
  return { miss, empty, leftover, trunc, total: miss * 5 + empty * 3 + leftover + trunc * 2 };
}

function summarize(report) {
  const lines = [];
  lines.push('# DocNote translation audit');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Locales: ${locales.join(', ')}`);
  lines.push('');

  let grand = { miss: 0, empty: 0, leftover: 0, trunc: 0, filesMissing: 0 };
  const hot = [];

  for (const bundle of report.bundles) {
    lines.push(`## ${bundle.name}`);
    if (bundle.error) {
      lines.push(`ERROR: ${bundle.error}`);
      lines.push('');
      continue;
    }
    if (bundle.name === 'blog') {
      lines.push(`EN posts: ${bundle.enPosts}`);
    } else {
      lines.push(`EN leaves: ${bundle.enLeaves}`);
    }

    for (const locale of locales) {
      const row = bundle.locales[locale];
      if (!row) continue;
      const sev = severity(row);
      grand.miss += sev.miss;
      grand.empty += sev.empty;
      grand.leftover += sev.leftover;
      grand.trunc += sev.trunc;
      if (row.missingFile) grand.filesMissing += 1;

      const parts = [];
      if (row.missingFile) parts.push('MISSING FILE');
      if (sev.miss) parts.push(`missing=${sev.miss}`);
      if (sev.empty) parts.push(`empty=${sev.empty}`);
      if (sev.leftover) parts.push(`en-leftover/identical=${sev.leftover}`);
      if (sev.trunc) parts.push(`truncated=${sev.trunc}`);
      if (row.typeMismatch?.length) parts.push(`typeMismatch=${row.typeMismatch.length}`);
      if (row.extraKeys?.length || row.extraKeysTotal) {
        parts.push(`extra=${row.extraKeysTotal || row.extraKeys.length}`);
      }
      const status = parts.length ? parts.join(', ') : 'OK';
      lines.push(`- ${locale}: ${status}`);
      if (sev.total > 0) hot.push({ bundle: bundle.name, locale, ...sev, samples: row });
    }
    lines.push('');
  }

  hot.sort((a, b) => b.total - a.total);
  lines.push('## Top issues');
  if (!hot.length) {
    lines.push('No structural issues found.');
  } else {
    for (const h of hot.slice(0, 40)) {
      lines.push(
        `- ${h.bundle}/${h.locale}: score=${h.total} (missing=${h.miss}, empty=${h.empty}, leftover=${h.leftover}, trunc=${h.trunc})`
      );
      const s = h.samples;
      const sample =
        (s.missingKeys && s.missingKeys[0]) ||
        (s.missingPosts && s.missingPosts[0]) ||
        (s.englishLeftover && s.englishLeftover[0]) ||
        (s.identicalToEn && s.identicalToEn[0]) ||
        (s.empty && s.empty[0]) ||
        (s.truncated && s.truncated[0]) ||
        (s.englishBody && s.englishBody[0]);
      if (sample) lines.push(`  sample: ${sample}`);
    }
  }

  lines.push('');
  lines.push('## Totals');
  lines.push(`- missing keys/posts (weighted count): ${grand.miss}`);
  lines.push(`- empty values: ${grand.empty}`);
  lines.push(`- English leftover / identical-to-EN: ${grand.leftover}`);
  lines.push(`- unexpected truncations: ${grand.trunc}`);
  lines.push(`- missing locale files: ${grand.filesMissing}`);
  lines.push('');
  lines.push(
    'Notes: identical-to-EN flags strings ≥24 chars matching EN (may include intentional proper nouns). English-leftover uses heuristics for script/locale.'
  );

  return { text: lines.join('\n'), grand, hot };
}

const report = { bundles: [] };
for (const name of bundleNames) {
  if (name === 'blog') report.bundles.push(auditBlog());
  else if (BUNDLES[name]) report.bundles.push(auditJsonBundle(name, BUNDLES[name]));
}

const summary = summarize(report);
const outDir = path.join(ROOT, 'scripts/output');
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const mdPath = path.join(outDir, `translation-audit-${stamp}.md`);
const jsonPath = path.join(outDir, `translation-audit-${stamp}.json`);
fs.writeFileSync(mdPath, summary.text);
fs.writeFileSync(jsonPath, JSON.stringify({ ...report, grand: summary.grand, hot: summary.hot }, null, 2));

if (asJson) {
  console.log(JSON.stringify({ grand: summary.grand, hot: summary.hot.slice(0, 50), paths: { mdPath, jsonPath } }, null, 2));
} else {
  console.log(summary.text);
  console.log(`\nWrote:\n  ${mdPath}\n  ${jsonPath}`);
}

const fail =
  summary.grand.miss > 0 ||
  summary.grand.empty > 0 ||
  summary.grand.filesMissing > 0 ||
  summary.grand.trunc > 0;
process.exit(fail ? 1 : 0);
