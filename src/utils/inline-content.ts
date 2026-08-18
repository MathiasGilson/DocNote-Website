import type { Locale } from './i18n';
import { defaultLocale } from './i18n';

type JsonModule = { default: unknown };

const patientModules = import.meta.glob('../content/inline/patient/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const sondageModules = import.meta.glob('../content/inline/sondage/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const emploiModules = import.meta.glob('../content/inline/emploi/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const pillarsModules = import.meta.glob('../content/inline/pillars/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const landingsModules = import.meta.glob('../content/inline/landings/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const specialtyFamiliesModules = import.meta.glob(
  '../content/inline/specialty-families/*.json',
  { eager: true }
) as Record<string, JsonModule>;
const pillarNavModules = import.meta.glob('../content/inline/pillar-nav/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const seoModules = import.meta.glob('../content/inline/seo/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const solutionsHubModules = import.meta.glob('../content/inline/solutions-hub/*.json', {
  eager: true,
}) as Record<string, JsonModule>;
const specialtiesHubModules = import.meta.glob('../content/inline/specialties-hub/*.json', {
  eager: true,
}) as Record<string, JsonModule>;
const landingUiModules = import.meta.glob('../content/inline/landing-ui/*.json', {
  eager: true,
}) as Record<string, JsonModule>;
const siteUiModules = import.meta.glob('../content/inline/site-ui/*.json', {
  eager: true,
}) as Record<string, JsonModule>;
const familyUiModules = import.meta.glob('../content/inline/family-ui/*.json', {
  eager: true,
}) as Record<string, JsonModule>;

function localeFromPath(path: string): string {
  const base = path.split('/').pop() || '';
  return base.replace(/\.json$/, '');
}

function mapModules<T>(modules: Record<string, JsonModule>): Partial<Record<Locale, T>> & { en: T } {
  const out: Record<string, T> = {};
  for (const [path, mod] of Object.entries(modules)) {
    out[localeFromPath(path)] = (mod.default ?? mod) as T;
  }
  if (!out.en) throw new Error('Missing en.json in inline content bundle');
  return out as Partial<Record<Locale, T>> & { en: T };
}

export const patientCopy = mapModules<Record<string, unknown>>(patientModules);
export const sondageCopy = mapModules<Record<string, unknown>>(sondageModules);
export const emploiCopy = mapModules<Record<string, unknown>>(emploiModules);
export const pillarsCopy = mapModules<Record<string, unknown>>(pillarsModules);
export const landingsCopy = Object.keys(landingsModules).length
  ? mapModules<Record<string, unknown>>(landingsModules)
  : ({ en: {} } as Partial<Record<Locale, Record<string, unknown>>> & { en: Record<string, unknown> });
export const specialtyFamiliesCopy = Object.keys(specialtyFamiliesModules).length
  ? mapModules<Record<string, unknown>>(specialtyFamiliesModules)
  : ({ en: {} } as Partial<Record<Locale, Record<string, unknown>>> & { en: Record<string, unknown> });
export const pillarNavCopy = mapModules<Record<string, string>>(pillarNavModules);
export const seoCopy = mapModules<Record<string, { title: string; description: string }>>(seoModules);
export const solutionsHubCopy = mapModules<Record<string, unknown>>(solutionsHubModules);
export const specialtiesHubCopy = mapModules<Record<string, unknown>>(specialtiesHubModules);

/** Shared chrome of landing / hub templates: breadcrumbs, FAQ heading, related links, badges. */
export type LandingUiCopy = {
  home: string;
  faqHeading: string;
  faqSubtitle: string;
  depthBadge: string;
  depthTitle: string;
  familyHubLabel: string;
  familyHubSeeAll: string;
  pricing: string;
  news: string;
  open: string;
  fieldBadge: string;
  specialtiesCount: string;
};
export const landingUiCopy = mapModules<LandingUiCopy>(landingUiModules);

/** Per-key fallback to EN so a partially translated locale never renders `undefined`. */
export function getLandingUi(locale: Locale): LandingUiCopy {
  return { ...landingUiCopy.en, ...(landingUiCopy[locale] ?? {}) };
}

/** Site-wide chrome strings (header, footer, blog post chrome, misc a11y labels). */
export type SiteUiCopy = {
  breadcrumb: string;
  toggleMenu: string;
  selectLanguage: string;
  languages: string;
  products: string;
  resources: string;
  hostedInSwitzerland: string;
  switzerland: string;
  iosApp: string;
  androidApp: string;
  webApp: string;
  closeModal: string;
  demoVideo: string;
  heroImageAlt: string;
  aiMedicalDocumentation: string;
  save: string;
  teamMembers: string;
  openInBrowser: string;
  tutorialVideoTitle: string;
  step: string;
  tableOfContents: string;
  tableOfContentsMobile: string;
  shareOnX: string;
  shareOnLinkedIn: string;
  copyLink: string;
  previousTestimonial: string;
  nextTestimonial: string;
  legalNoticeEn: string;
  legalNoticeFr: string;
  ctaSampleReport: string;
  defaultDescription: string;
  you: string;
  careBadge: string;
  testimonial: string;
};
export const siteUiCopy = mapModules<SiteUiCopy>(siteUiModules);
export function getSiteUi(locale: Locale): SiteUiCopy {
  return { ...siteUiCopy.en, ...(siteUiCopy[locale] ?? {}) };
}

/** Short chrome labels of the specialty-family visual recipes (pathway rail, unit board, etc.). */
export type FamilyUiCopy = {
  preop: string;
  or: string;
  ward: string;
  discharge: string;
  consult: string;
  procedure: string;
  vocab: string;
  nextPatient: string;
  unitBoard: string;
  handoff: string;
  dictating: string;
  report: string;
  actPricing: string;
  ready: string;
};
export const familyUiCopy = mapModules<FamilyUiCopy>(familyUiModules);
export function getFamilyUi(locale: Locale): FamilyUiCopy {
  return { ...familyUiCopy.en, ...(familyUiCopy[locale] ?? {}) };
}

/** Deep per-leaf fallback to EN for nested content bundles (hubs, families). */
export function withEnFallback<T>(en: T, loc: unknown): T {
  if (loc === undefined || loc === null) return en;
  if (Array.isArray(en)) {
    if (!Array.isArray(loc)) return en;
    return en.map((item, i) => withEnFallback(item, loc[i])) as unknown as T;
  }
  if (typeof en === 'object' && en !== null) {
    if (typeof loc !== 'object' || Array.isArray(loc)) return en;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(en as Record<string, unknown>)) {
      out[k] = withEnFallback(v, (loc as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return (typeof loc === typeof en ? loc : en) as T;
}

export function getInline<T>(
  bundle: Partial<Record<Locale, T>> & { en: T },
  locale: Locale
): T {
  return bundle[locale] ?? bundle[defaultLocale];
}
