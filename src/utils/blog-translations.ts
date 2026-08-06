import { locales, type Locale, getLocalizedPath } from './i18n';
import { absoluteUrl } from './seo';

/** FR/DE may use localized slugs; every other locale uses the EN slug. */
type ClusterSeed = { en: string; fr: string; de: string };

const seeds: ClusterSeed[] = [
  {
    en: 'less-time-documenting-ai-more-care',
    fr: 'moins-temps-documenter-ia-plus-soigner',
    de: 'weniger-zeit-dokumentieren-ki-mehr-pflegen',
  },
  {
    en: 'docnote-gdpr-nfadp-compliance',
    fr: 'docnote-conformite-rgpd-nlpd',
    de: 'docnote-dsgvo-ndsg-konformitaet',
  },
  {
    en: 'docnote-radiology-mode',
    fr: 'docnote-mode-radiologie',
    de: 'docnote-radiologie-modus',
  },
  {
    en: 'docnote-mediway-integration',
    fr: 'docnote-integration-mediway',
    de: 'docnote-mediway-integration',
  },
  {
    en: 'docnote-les-echos-european-ai-health',
    fr: 'docnote-les-echos-acteurs-ia-sante',
    de: 'docnote-les-echos-ki-gesundheit',
  },
  {
    en: 'sgaim-presentation-april-2025',
    fr: 'sgaim-presentation-avril-2025',
    de: 'sgaim-praesentation-april-2025',
  },
  {
    en: 'scs-lucerne-june-2026',
    fr: 'scs-lucerne-juin-2026',
    de: 'scs-luzern-juni-2026',
  },
  {
    en: 'scs-lausanne-may-2025',
    fr: 'scs-lausanne-mai-2025',
    de: 'scs-lausanne-mai-2025',
  },
  {
    en: 'medintechs-paris-march-2026',
    fr: 'medintechs-paris-mars-2026',
    de: 'medintechs-paris-maerz-2026',
  },
  {
    en: 'fongit-startup-support-march-2026',
    fr: 'fongit-initial-startup-support-mars-2026',
    de: 'fongit-startup-support-maerz-2026',
  },
  {
    en: 'ecc-st-gallen-december-2025',
    fr: 'ecc-st-gallen-decembre-2025',
    de: 'ecc-st-gallen-dezember-2025',
  },
  {
    en: 'chu-bordeaux-december-2025',
    fr: 'chu-bordeaux-decembre-2025',
    de: 'chu-bordeaux-dezember-2025',
  },
  {
    en: 'buzz-esante-feature-april-2026',
    fr: 'buzz-esante-avril-2026',
    de: 'buzz-esante-april-2026',
  },
  {
    en: 'adopt-ai-paris-november-2025',
    fr: 'adopt-ai-paris-novembre-2025',
    de: 'adopt-ai-paris-november-2025',
  },
  {
    en: 'soap-notes-best-practices',
    fr: 'soap-notes-best-practices',
    de: 'soap-notes-best-practices',
  },
  {
    en: 'reducing-physician-burnout',
    fr: 'reducing-physician-burnout',
    de: 'reducing-physician-burnout',
  },
  {
    en: 'hipaa-compliance-ai-tools',
    fr: 'hipaa-compliance-ai-tools',
    de: 'hipaa-compliance-ai-tools',
  },
  {
    en: 'future-of-ai-medical-documentation',
    fr: 'future-of-ai-medical-documentation',
    de: 'future-of-ai-medical-documentation',
  },
];

const expandCluster = (seed: ClusterSeed): Record<Locale, string> => {
  const map = {} as Record<Locale, string>;
  for (const locale of locales) {
    if (locale === 'fr') map[locale] = seed.fr;
    else if (locale === 'de') map[locale] = seed.de;
    else map[locale] = seed.en;
  }
  return map;
};

const bySlug = new Map<string, Record<Locale, string>>();
for (const seed of seeds) {
  const cluster = expandCluster(seed);
  for (const slug of new Set(Object.values(cluster))) {
    bySlug.set(slug, cluster);
  }
}

const resolveCluster = (slug: string): Record<Locale, string> => {
  const known = bySlug.get(slug);
  if (known) return known;
  return Object.fromEntries(locales.map((loc) => [loc, slug])) as Record<Locale, string>;
};

/** Relative localized paths for every locale (EN unprefixed). */
export const getBlogAlternatePaths = (
  _locale: Locale,
  slug: string
): Record<Locale, string> => {
  const cluster = resolveCluster(slug);
  return Object.fromEntries(
    locales.map((loc) => [loc, getLocalizedPath(`/blog/${cluster[loc]}`, loc)])
  ) as Record<Locale, string>;
};

export const getBlogAlternateUrls = (
  locale: Locale,
  slug: string
): Record<Locale, string> => {
  const paths = getBlogAlternatePaths(locale, slug);
  return Object.fromEntries(
    locales.map((loc) => [loc, absoluteUrl(paths[loc])])
  ) as Record<Locale, string>;
};
