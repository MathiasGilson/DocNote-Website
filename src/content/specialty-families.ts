import { locales, type Locale } from '../utils/i18n'
import { specialtyFamiliesCopy, withEnFallback } from '../utils/inline-content'
import type { LandingSlug, SpecialtyLandingSlug } from './landings'

export const specialtyFamilySlugs = [
  'surgical',
  'medical-surgical',
  'medical',
  'primary-care',
  'acute-care',
  'diagnostics',
  'allied-health',
] as const

export type SpecialtyFamilySlug = (typeof specialtyFamilySlugs)[number]

export type FamilyLeadItem = { title: string; body: string }
export type FamilyToolkitLayer = { title: string; body: string; count: string }

export type SpecialtyFamilyCopy = {
  title: string
  description: string
  navLabel: string
  navDesc: string
  hero: { badge: string; title: string; subtitle: string; lead: string }
  toolkit: {
    badge: string
    title: string
    subtitle: string
    layers: FamilyToolkitLayer[]
    readyNote: string
  }
  leadWith: { badge: string; title: string; items: FamilyLeadItem[] }
  specialties: { badge: string; title: string; subtitle: string; items: string[] }
  setting?: { badge: string; title: string; body: string }
  highlight?: { badge: string; title: string; body: string }
  deepLinksLabel: string
  relatedLabel: string
  cta: { title: string; body: string; primary: string; secondary: string }
  statsLine: string
  /** Media band alt text + caption (see family-visuals.ts for the asset itself). */
  visual?: { imageAlt: string; mediaCaption: string }
}

export type SpecialtyFamilyMeta = {
  slug: SpecialtyFamilySlug
  specialtyCount: number
  setting: 'hospital' | 'practice' | 'both' | 'diagnostics'
  /** Deep specialty landings that belong in this family */
  deepLandings: SpecialtyLandingSlug[]
  /** Document-type / use-case landings to surface */
  relatedLandings: LandingSlug[]
}

export const specialtyFamilyMeta: Record<SpecialtyFamilySlug, SpecialtyFamilyMeta> = {
  surgical: {
    slug: 'surgical',
    specialtyCount: 10,
    setting: 'both',
    deepLandings: ['ai-scribe-surgery'],
    relatedLandings: ['operative-report-ai', 'ai-discharge-summary', 'hospital-documentation'],
  },
  'medical-surgical': {
    slug: 'medical-surgical',
    specialtyCount: 4,
    setting: 'both',
    deepLandings: [],
    relatedLandings: ['operative-report-ai', 'ai-soap-notes', 'hospital-documentation'],
  },
  medical: {
    slug: 'medical',
    specialtyCount: 26,
    setting: 'both',
    deepLandings: [
      'ai-scribe-cardiology',
      'ai-scribe-neurology',
      'ai-scribe-psychiatry',
      'ai-scribe-dermatology',
    ],
    relatedLandings: ['ai-soap-notes', 'clinical-context', 'ai-medical-scribe'],
  },
  'primary-care': {
    slug: 'primary-care',
    specialtyCount: 5,
    setting: 'practice',
    deepLandings: ['ai-scribe-general-practice', 'ai-scribe-pediatrics'],
    relatedLandings: ['ai-soap-notes', 'for-private-practice', 'ai-medical-scribe'],
  },
  'acute-care': {
    slug: 'acute-care',
    specialtyCount: 3,
    setting: 'hospital',
    deepLandings: ['ai-scribe-emergency-medicine'],
    relatedLandings: ['operative-report-ai', 'hospital-documentation', 'ehr-integration'],
  },
  diagnostics: {
    slug: 'diagnostics',
    specialtyCount: 4,
    setting: 'diagnostics',
    deepLandings: [],
    relatedLandings: ['ai-medical-transcription', 'clinical-context'],
  },
  'allied-health': {
    slug: 'allied-health',
    specialtyCount: 9,
    setting: 'practice',
    deepLandings: [],
    relatedLandings: ['for-private-practice', 'ai-medical-scribe'],
  },
}

/** Deep specialty landing → parent family (dermatology kept for back-link, not nav). */
export const familyBySpecialtyLanding: Record<SpecialtyLandingSlug, SpecialtyFamilySlug> = {
  'ai-scribe-surgery': 'surgical',
  'ai-scribe-cardiology': 'medical',
  'ai-scribe-neurology': 'medical',
  'ai-scribe-psychiatry': 'medical',
  'ai-scribe-dermatology': 'medical',
  'ai-scribe-general-practice': 'primary-care',
  'ai-scribe-pediatrics': 'primary-care',
  'ai-scribe-emergency-medicine': 'acute-care',
}

export const isSpecialtyFamilySlug = (value: string): value is SpecialtyFamilySlug =>
  (specialtyFamilySlugs as readonly string[]).includes(value)

export const getSpecialtyFamilyPath = (slug: SpecialtyFamilySlug): string =>
  `/specialties/${slug}`

function mergeCopy(locale: Locale): Record<SpecialtyFamilySlug, SpecialtyFamilyCopy> {
  const data = (specialtyFamiliesCopy[locale] ?? specialtyFamiliesCopy.en ?? {}) as Record<
    string,
    SpecialtyFamilyCopy
  >
  const en = (specialtyFamiliesCopy.en ?? {}) as Record<string, SpecialtyFamilyCopy>
  const out = {} as Record<SpecialtyFamilySlug, SpecialtyFamilyCopy>
  for (const slug of specialtyFamilySlugs) {
    if (!en[slug]) throw new Error(`Missing specialty family copy for ${slug} (en)`)
    // Per-leaf EN fallback so a partially translated locale never renders `undefined`.
    out[slug] = withEnFallback(en[slug], data[slug])
  }
  return out
}

function buildAll(): Record<SpecialtyFamilySlug, Record<Locale, SpecialtyFamilyCopy>> {
  const result = {} as Record<SpecialtyFamilySlug, Record<Locale, SpecialtyFamilyCopy>>
  for (const slug of specialtyFamilySlugs) {
    result[slug] = {} as Record<Locale, SpecialtyFamilyCopy>
  }
  for (const locale of locales) {
    const merged = mergeCopy(locale)
    for (const slug of specialtyFamilySlugs) {
      result[slug][locale] = merged[slug]
    }
  }
  return result
}

export const specialtyFamilies = buildAll()

export const getSpecialtyFamily = (
  slug: SpecialtyFamilySlug,
  locale: Locale
): SpecialtyFamilyCopy => specialtyFamilies[slug][locale] ?? specialtyFamilies[slug].en

export const getSpecialtyFamilyNavLabel = (
  slug: SpecialtyFamilySlug,
  locale: Locale
): string => getSpecialtyFamily(slug, locale).navLabel

export const getSpecialtyFamilyNavDesc = (
  slug: SpecialtyFamilySlug,
  locale: Locale
): string => getSpecialtyFamily(slug, locale).navDesc

/** Outline path markup for 24×24 family nav icons. */
const FAMILY_ICONS: Record<SpecialtyFamilySlug, string> = {
  surgical:
    '<path d="M14.5 4.5l5 5"/><path d="M16.5 6.5L8 15l-2 4 4-2 8.5-8.5"/><path d="M6 18l-1.5 1.5"/>',
  'medical-surgical':
    '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"/><path d="M14.5 14.5l3 3M16.5 15.5L13 19l-1.5 1.5 1.5-1.5"/>',
  medical:
    '<path d="M19.5 12.6l-7.1 7.1a.6.6 0 01-.8 0L4.5 12.6a5 5 0 117.1-7.1l.4.4.4-.4a5 5 0 017.1 7.1z"/>',
  'primary-care':
    '<path d="M11 4a2 2 0 114 0v4.5a1 1 0 001 1H19a2 2 0 110 4h-3a1 1 0 00-1 1V20a2 2 0 11-4 0v-5.5a1 1 0 00-1-1H7a2 2 0 110-4h3a1 1 0 001-1V4z"/>',
  'acute-care':
    '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  diagnostics:
    '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>',
  'allied-health':
    '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
}

export const specialtyFamilyIconMarkup = (slug: SpecialtyFamilySlug): string =>
  FAMILY_ICONS[slug]
