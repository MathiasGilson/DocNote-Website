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
