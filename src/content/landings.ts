import { locales, type Locale } from '../utils/i18n'
import { landingsCopy, pillarNavCopy, withEnFallback } from '../utils/inline-content'
import type { SpecialtyKey } from '../data/specialty-icons'

/** Existing pillars --- keep H1/intent; do not cannibalize. */
export const pillarSlugs = [
  'ai-medical-scribe',
  'hospital-documentation',
  'clinical-compliance',
] as const

export type PillarSlug = (typeof pillarSlugs)[number]

/**
 * "Who it's for" audience landings (hospital-documentation is the pillar that
 * fills the hospital slot of this column).
 */
export const audienceSlugs = [
  'for-private-practice',
  'for-medical-secretaries',
  'for-clinic-groups',
] as const

export type AudienceSlug = (typeof audienceSlugs)[number]

/** "What makes us different" landings --- one per homepage specificity card. */
export const differentiatorSlugs = [
  'medical-coding-and-billing',
  'ehr-integration',
  'custom-word-templates',
  'clinical-context',
  'day-hospital-documentation',
  'multilingual-medical-documentation',
] as const

export type DifferentiatorSlug = (typeof differentiatorSlugs)[number]

/**
 * Use-case landings kept for search intent only --- out of the menu, canonical
 * on themselves. Retired duplicates live in landing-redirects.ts (301).
 */
export const usecaseSlugs = [
  'ai-soap-notes',
  'ai-medical-transcription',
  'ai-discharge-summary',
  'operative-report-ai',
] as const

export type UsecaseSlug = (typeof usecaseSlugs)[number]

/** Batch B --- specialty landings first wave */
export const specialtyLandingSlugs = [
  'ai-scribe-general-practice',
  'ai-scribe-psychiatry',
  'ai-scribe-cardiology',
  'ai-scribe-pediatrics',
  'ai-scribe-emergency-medicine',
  'ai-scribe-surgery',
  'ai-scribe-dermatology',
  'ai-scribe-neurology',
] as const

export type SpecialtyLandingSlug = (typeof specialtyLandingSlugs)[number]

export const landingSlugs = [
  ...pillarSlugs,
  ...audienceSlugs,
  ...differentiatorSlugs,
  ...usecaseSlugs,
  ...specialtyLandingSlugs,
] as const

export type LandingSlug = (typeof landingSlugs)[number]

export type LandingType = 'pillar' | 'audience' | 'differentiator' | 'usecase' | 'specialty'

export type LandingFaq = { q: string; a: string }
export type LandingBlockItem = { title: string; body: string }

/** Patient-page-depth content: hero, story, benefits, steps, proof, FAQ, CTA. */
export type LandingCopy = {
  title: string
  description: string
  /** Short label for nav / footer / related links */
  navLabel?: string
  /** One-line subtitle under navLabel in header dropdowns */
  navDesc?: string
  hero: { badge: string; title: string; subtitle: string; lead?: string }
  story: { badge: string; title: string; paragraphs: string[] }
  benefits: { badge: string; title: string; subtitle?: string; items: LandingBlockItem[] }
  steps?: { badge: string; title: string; subtitle: string; items: LandingBlockItem[] }
  proof: { badge: string; title: string; intro: string; points: LandingBlockItem[] }
  /** Optional extra SEO-depth sections beyond the fixed blocks above */
  sections?: { heading: string; body: string }[]
  faq: LandingFaq[]
  cta: { title: string; body: string; primary: string; secondary: string }
  relatedLabel: string
}

export type LandingMeta = {
  slug: LandingSlug
  type: LandingType
  primaryKeyword: string
  specialtyKey?: SpecialtyKey
  /** Related landing slugs for internal links */
  related: LandingSlug[]
  primaryCta: LandingCta
  secondaryCta: LandingCta
  /** Homepage specificity card reused as the hook of differentiator pages */
  specificityKey?: SpecificityKey
}

/** CTA targets: internal pages, the web app, or the demo booking link. */
export type LandingCta =
  | 'tutorial'
  | 'pricing'
  | 'contact'
  | 'privacy'
  | 'compliance'
  | 'app'
  | 'demo'

export type SpecificityKey =
  | 'coding'
  | 'tardoc'
  | 'ehr'
  | 'templates'
  | 'context'
  | 'hospital'
  | 'sync'
  | 'dayHospital'

export const landingMeta: Record<LandingSlug, LandingMeta> = {
  'ai-medical-scribe': {
    slug: 'ai-medical-scribe',
    type: 'pillar',
    primaryKeyword: 'ai medical scribe',
    related: [
      'for-private-practice',
      'ai-soap-notes',
      'ai-medical-transcription',
      'hospital-documentation',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'hospital-documentation': {
    slug: 'hospital-documentation',
    type: 'pillar',
    primaryKeyword: 'hospital documentation AI',
    related: [
      'medical-coding-and-billing',
      'ehr-integration',
      'custom-word-templates',
      'ai-discharge-summary',
      'operative-report-ai',
      'clinical-compliance',
    ],
    primaryCta: 'demo',
    secondaryCta: 'compliance',
  },
  'clinical-compliance': {
    slug: 'clinical-compliance',
    type: 'pillar',
    primaryKeyword: 'clinical AI compliance',
    related: [
      'ai-medical-scribe',
      'hospital-documentation',
      'for-clinic-groups',
      'ehr-integration',
    ],
    primaryCta: 'privacy',
    secondaryCta: 'contact',
  },
  'for-private-practice': {
    slug: 'for-private-practice',
    type: 'audience',
    primaryKeyword: 'AI medical scribe for private practice',
    related: [
      'ai-medical-scribe',
      'custom-word-templates',
      'medical-coding-and-billing',
      'multilingual-medical-documentation',
      'ai-soap-notes',
    ],
    primaryCta: 'app',
    secondaryCta: 'pricing',
  },
  'for-medical-secretaries': {
    slug: 'for-medical-secretaries',
    type: 'audience',
    primaryKeyword: 'AI documentation for medical secretaries',
    related: [
      'for-private-practice',
      'custom-word-templates',
      'clinical-context',
      'hospital-documentation',
    ],
    primaryCta: 'demo',
    secondaryCta: 'contact',
  },
  'for-clinic-groups': {
    slug: 'for-clinic-groups',
    type: 'audience',
    primaryKeyword: 'AI medical documentation for clinic groups',
    related: [
      'ehr-integration',
      'custom-word-templates',
      'day-hospital-documentation',
      'clinical-compliance',
      'hospital-documentation',
    ],
    primaryCta: 'contact',
    secondaryCta: 'demo',
  },
  'medical-coding-and-billing': {
    slug: 'medical-coding-and-billing',
    type: 'differentiator',
    primaryKeyword: 'medical coding and billing AI SwissDRG TARDOC',
    specificityKey: 'coding',
    related: [
      'hospital-documentation',
      'ai-discharge-summary',
      'custom-word-templates',
      'ehr-integration',
    ],
    primaryCta: 'demo',
    secondaryCta: 'pricing',
  },
  'ehr-integration': {
    slug: 'ehr-integration',
    type: 'differentiator',
    primaryKeyword: 'EHR integration AI medical scribe',
    specificityKey: 'ehr',
    related: [
      'hospital-documentation',
      'for-clinic-groups',
      'day-hospital-documentation',
      'clinical-compliance',
    ],
    primaryCta: 'demo',
    secondaryCta: 'contact',
  },
  'custom-word-templates': {
    slug: 'custom-word-templates',
    type: 'differentiator',
    primaryKeyword: 'custom Word templates medical reports',
    specificityKey: 'templates',
    related: [
      'hospital-documentation',
      'for-private-practice',
      'for-medical-secretaries',
      'medical-coding-and-billing',
    ],
    primaryCta: 'demo',
    secondaryCta: 'tutorial',
  },
  'clinical-context': {
    slug: 'clinical-context',
    type: 'differentiator',
    primaryKeyword: 'clinical context attachments medical report AI',
    specificityKey: 'context',
    related: [
      'ai-medical-scribe',
      'for-medical-secretaries',
      'ai-discharge-summary',
      'custom-word-templates',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'demo',
  },
  'day-hospital-documentation': {
    slug: 'day-hospital-documentation',
    type: 'differentiator',
    primaryKeyword: 'day hospital documentation collaborative',
    specificityKey: 'dayHospital',
    related: [
      'for-clinic-groups',
      'ehr-integration',
      'hospital-documentation',
      'clinical-compliance',
    ],
    primaryCta: 'demo',
    secondaryCta: 'contact',
  },
  'multilingual-medical-documentation': {
    slug: 'multilingual-medical-documentation',
    type: 'differentiator',
    primaryKeyword: 'multilingual medical documentation 61 specialties',
    related: [
      'ai-medical-scribe',
      'for-private-practice',
      'ai-soap-notes',
      'clinical-compliance',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-soap-notes': {
    slug: 'ai-soap-notes',
    type: 'usecase',
    primaryKeyword: 'AI SOAP notes',
    related: [
      'ai-medical-scribe',
      'for-private-practice',
      'ai-scribe-general-practice',
      'multilingual-medical-documentation',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-medical-transcription': {
    slug: 'ai-medical-transcription',
    type: 'usecase',
    primaryKeyword: 'AI medical transcription',
    related: [
      'ai-medical-scribe',
      'ai-soap-notes',
      'clinical-context',
      'clinical-compliance',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-discharge-summary': {
    slug: 'ai-discharge-summary',
    type: 'usecase',
    primaryKeyword: 'AI discharge summary',
    related: [
      'medical-coding-and-billing',
      'hospital-documentation',
      'operative-report-ai',
      'custom-word-templates',
    ],
    primaryCta: 'contact',
    secondaryCta: 'pricing',
  },
  'operative-report-ai': {
    slug: 'operative-report-ai',
    type: 'usecase',
    primaryKeyword: 'AI operative report',
    related: [
      'hospital-documentation',
      'ai-scribe-surgery',
      'ai-discharge-summary',
      'medical-coding-and-billing',
    ],
    primaryCta: 'contact',
    secondaryCta: 'tutorial',
  },
  'ai-scribe-general-practice': {
    slug: 'ai-scribe-general-practice',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for general practice',
    specialtyKey: 'general-practice',
    related: [
      'ai-soap-notes',
      'for-private-practice',
      'ai-medical-scribe',
      'ai-scribe-pediatrics',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-psychiatry': {
    slug: 'ai-scribe-psychiatry',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for psychiatry',
    specialtyKey: 'psychiatry',
    related: [
      'for-private-practice',
      'ai-medical-scribe',
      'clinical-compliance',
      'multilingual-medical-documentation',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-cardiology': {
    slug: 'ai-scribe-cardiology',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for cardiology',
    specialtyKey: 'cardiology',
    related: [
      'clinical-context',
      'hospital-documentation',
      'ai-medical-scribe',
      'ai-discharge-summary',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-pediatrics': {
    slug: 'ai-scribe-pediatrics',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for pediatrics',
    specialtyKey: 'pediatrics',
    related: [
      'ai-scribe-general-practice',
      'for-private-practice',
      'ai-soap-notes',
      'ai-medical-scribe',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-emergency-medicine': {
    slug: 'ai-scribe-emergency-medicine',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for emergency medicine',
    specialtyKey: 'emergency-medicine',
    related: [
      'hospital-documentation',
      'ehr-integration',
      'ai-discharge-summary',
      'ai-medical-scribe',
    ],
    primaryCta: 'contact',
    secondaryCta: 'tutorial',
  },
  'ai-scribe-surgery': {
    slug: 'ai-scribe-surgery',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for surgery',
    specialtyKey: 'surgery',
    related: [
      'operative-report-ai',
      'hospital-documentation',
      'ai-discharge-summary',
      'ai-medical-scribe',
    ],
    primaryCta: 'contact',
    secondaryCta: 'tutorial',
  },
  'ai-scribe-dermatology': {
    slug: 'ai-scribe-dermatology',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for dermatology',
    specialtyKey: 'dermatology',
    related: [
      'clinical-context',
      'ai-soap-notes',
      'ai-medical-scribe',
      'ai-scribe-general-practice',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-neurology': {
    slug: 'ai-scribe-neurology',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for neurology',
    specialtyKey: 'neurology',
    related: [
      'clinical-context',
      'hospital-documentation',
      'ai-soap-notes',
      'ai-medical-scribe',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
}

/**
 * Footer / resources: the "what DocNote is" pillar (out of the menu but linked
 * from here), the other pillars, and the strongest kept use-case landings.
 */
export const footerLandingSlugs: LandingSlug[] = [
  ...pillarSlugs,
  'ai-soap-notes',
  'ai-discharge-summary',
]

/** Header Solutions mega-menu --- audiences + differentiators (+ compliance). */
export const navSolutionsSlugs: LandingSlug[] = [
  'for-private-practice',
  'hospital-documentation',
  'for-medical-secretaries',
  'for-clinic-groups',
  ...differentiatorSlugs,
  'clinical-compliance',
]

/**
 * @deprecated Header Specialties nav now uses specialty family hubs
 * (`specialtyFamilySlugs` in specialty-families.ts). Kept for any legacy imports.
 */
export const navSpecialtiesSlugs: LandingSlug[] = [
  'ai-scribe-general-practice',
  'ai-scribe-psychiatry',
  'ai-scribe-cardiology',
  'ai-scribe-pediatrics',
  'ai-scribe-emergency-medicine',
  'ai-scribe-surgery',
  'ai-scribe-neurology',
]

export type NavSolutionsColumnId = 'audiences' | 'differentiators'

/** Homepage feature-card keys shown on each landing (after Story). */
export type LandingFeatureKey =
  | 'recording'
  | 'transcription'
  | 'summaries'
  | 'integration'
  | 'security'
  | 'languages'

/** Landings that use Patient-style zig-zag benefit rows (instead of 2×2 cards). */
export const landingZigZagSlugs = new Set<LandingSlug>([
  'ai-medical-scribe',
  'hospital-documentation',
  'for-private-practice',
  'for-medical-secretaries',
  'for-clinic-groups',
  'ai-soap-notes',
  'multilingual-medical-documentation',
  'ai-scribe-general-practice',
  'ai-scribe-psychiatry',
  'ai-scribe-pediatrics',
  'ai-scribe-surgery',
  'ai-scribe-cardiology',
  'ai-scribe-neurology',
  'ai-scribe-dermatology',
  'ai-scribe-emergency-medicine',
])

export const landingFeatureKeys: Record<LandingSlug, LandingFeatureKey[]> = {
  'ai-medical-scribe': ['recording', 'summaries', 'security'],
  'hospital-documentation': ['summaries', 'integration', 'security'],
  'clinical-compliance': ['security', 'integration', 'languages'],
  'for-private-practice': ['recording', 'summaries', 'languages'],
  'for-medical-secretaries': ['summaries', 'recording', 'security'],
  'for-clinic-groups': ['integration', 'security', 'summaries'],
  'medical-coding-and-billing': ['summaries', 'integration', 'security'],
  'ehr-integration': ['integration', 'summaries', 'security'],
  'custom-word-templates': ['summaries', 'recording', 'integration'],
  'clinical-context': ['summaries', 'recording', 'transcription'],
  'day-hospital-documentation': ['integration', 'summaries', 'security'],
  'multilingual-medical-documentation': ['languages', 'recording', 'summaries'],
  'ai-soap-notes': ['recording', 'summaries', 'transcription'],
  'ai-medical-transcription': ['transcription', 'recording', 'summaries'],
  'ai-discharge-summary': ['summaries', 'integration', 'security'],
  'operative-report-ai': ['summaries', 'integration', 'recording'],
  'ai-scribe-general-practice': ['recording', 'summaries', 'languages'],
  'ai-scribe-psychiatry': ['recording', 'security', 'summaries'],
  'ai-scribe-cardiology': ['recording', 'summaries', 'integration'],
  'ai-scribe-pediatrics': ['recording', 'summaries', 'languages'],
  'ai-scribe-emergency-medicine': ['recording', 'summaries', 'integration'],
  'ai-scribe-surgery': ['summaries', 'integration', 'recording'],
  'ai-scribe-dermatology': ['recording', 'summaries', 'languages'],
  'ai-scribe-neurology': ['recording', 'summaries', 'security'],
}

/** Mega-menu columns for Solutions --- "who it's for" × "what makes us different". */
export const navSolutionsColumns: { id: NavSolutionsColumnId; slugs: LandingSlug[] }[] = [
  {
    id: 'audiences',
    slugs: [
      'for-private-practice',
      'hospital-documentation',
      'for-medical-secretaries',
      'for-clinic-groups',
    ],
  },
  {
    id: 'differentiators',
    slugs: [...differentiatorSlugs, 'clinical-compliance'],
  },
]

const NAV_SOLUTIONS_COLUMN_LABELS: Record<
  NavSolutionsColumnId,
  Partial<Record<Locale, string>> & { en: string }
> = {
  audiences: {
    en: "Who it's for",
    fr: 'Pour qui',
    de: 'Für wen',
    es: 'Para quién',
    it: 'Per chi',
    pt: 'Para quem',
    nl: 'Voor wie',
    ru: '�-ля кого',
    ja: '対象�-�',
    ko: '누구를 위�-�',
    zh: '�-��-�对象',
    ar: 'لمن هذا الحل',
    hi: '�-िस�-े लिए',
    th: '�-หมาะสำหรับใคร',
    sv: 'För vem',
    no: 'For hvem',
  },
  differentiators: {
    en: 'What makes us different',
    fr: 'Ce qui nous distingue',
    de: 'Was uns unterscheidet',
    es: 'Lo que nos diferencia',
    it: 'Cosa ci distingue',
    pt: 'O que nos diferencia',
    nl: 'Wat ons onderscheidt',
    ru: 'Чем мы отличаемся',
    ja: '私たちの強み',
    ko: '차별점',
    zh: '我们的不同之处',
    ar: 'ما يميزنا',
    hi: 'हम अलग �-्यों हैं',
    th: 'สิ่งที่ทำให้�-ราแ�-ก�-่าง',
    sv: 'Det som skiljer oss',
    no: 'Det som skiller oss',
  },
}

export const getNavSolutionsColumnLabel = (
  id: NavSolutionsColumnId,
  locale: Locale
): string => NAV_SOLUTIONS_COLUMN_LABELS[id][locale] ?? NAV_SOLUTIONS_COLUMN_LABELS[id].en

const NAV_GROUP_LABELS: Record<'solutions' | 'specialties', Partial<Record<Locale, string>> & { en: string }> = {
  solutions: {
    en: 'Solutions',
    fr: 'Solutions',
    de: 'Lösungen',
    es: 'Soluciones',
    it: 'Soluzioni',
    pt: 'Soluções',
    nl: 'Oplossingen',
    ru: 'Решения',
    ja: 'ソリューション',
    ko: '�-루션',
    zh: '解决方案',
    ar: 'الحلول',
    hi: 'समाधान',
    th: 'โซลูชัน',
    sv: 'Lösningar',
    no: 'Løsninger',
  },
  specialties: {
    en: 'Specialties',
    fr: 'Spécialités',
    de: 'Fachgebiete',
    es: 'Especialidades',
    it: 'Specialità',
    pt: 'Especialidades',
    nl: 'Specialismen',
    ru: 'Специальности',
    ja: '診療科',
    ko: '전문과',
    zh: '�-科',
    ar: 'التخصصات',
    hi: 'विशेषज्ञताएँ',
    th: 'สาขา�-ฉพาะทาง',
    sv: 'Specialiteter',
    no: 'Spesialiteter',
  },
}

export const getNavGroupLabel = (
  group: 'solutions' | 'specialties',
  locale: Locale
): string => NAV_GROUP_LABELS[group][locale] ?? NAV_GROUP_LABELS[group].en

export const specialtySlugByKey: Partial<Record<SpecialtyKey, SpecialtyLandingSlug>> = {
  'general-practice': 'ai-scribe-general-practice',
  psychiatry: 'ai-scribe-psychiatry',
  cardiology: 'ai-scribe-cardiology',
  pediatrics: 'ai-scribe-pediatrics',
  'emergency-medicine': 'ai-scribe-emergency-medicine',
  surgery: 'ai-scribe-surgery',
  dermatology: 'ai-scribe-dermatology',
  neurology: 'ai-scribe-neurology',
}

export const isLandingSlug = (value: string): value is LandingSlug =>
  (landingSlugs as readonly string[]).includes(value)

function mergeCopy(locale: Locale): Record<LandingSlug, LandingCopy> {
  const landingData = (landingsCopy[locale] ?? landingsCopy.en ?? {}) as Record<string, LandingCopy>
  const enLanding = (landingsCopy.en ?? {}) as Record<string, LandingCopy>

  const out = {} as Record<LandingSlug, LandingCopy>
  for (const slug of landingSlugs) {
    if (!enLanding[slug]) {
      throw new Error(`Missing landing copy for ${slug} (en)`)
    }
    // Per-leaf EN fallback so a partially translated locale never renders `undefined`.
    out[slug] = withEnFallback(enLanding[slug], landingData[slug])
  }
  return out
}

function buildAll(): Record<LandingSlug, Record<Locale, LandingCopy>> {
  const result = {} as Record<LandingSlug, Record<Locale, LandingCopy>>
  for (const slug of landingSlugs) {
    result[slug] = {} as Record<Locale, LandingCopy>
  }
  for (const locale of locales) {
    const merged = mergeCopy(locale)
    for (const slug of landingSlugs) {
      result[slug][locale] = merged[slug]
    }
  }
  return result
}

export const landings = buildAll()

export const getLanding = (slug: LandingSlug, locale: Locale): LandingCopy =>
  landings[slug][locale] ?? landings[slug].en

export const getLandingNavLabel = (slug: LandingSlug, locale: Locale): string => {
  const copy = getLanding(slug, locale)
  if (copy.navLabel) return copy.navLabel
  const nav = (pillarNavCopy[locale] ?? pillarNavCopy.en) as Record<string, string>
  if (nav[slug]) return nav[slug]
  return copy.title
}

/** Short subtitle for nav dropdowns (navDesc, else clipped hero.subtitle). */
export const getLandingNavDesc = (slug: LandingSlug, locale: Locale): string => {
  const copy = getLanding(slug, locale)
  const dedicated = (copy.navDesc || '').trim()
  if (dedicated) return dedicated
  const raw = (copy.hero?.subtitle || copy.description || '').trim()
  if (!raw) return ''
  if (raw.length <= 52) return raw
  const cut = raw.slice(0, 52)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > 28 ? cut.slice(0, sp) : cut).trim()}--�`
}

/** @deprecated use landingSlugs / getLanding --- kept for existing imports */
export type PillarCopy = LandingCopy
export const pillars = landings as unknown as Record<PillarSlug, Record<Locale, LandingCopy>>
export const getPillar = (slug: PillarSlug, locale: Locale) => getLanding(slug, locale)

function buildPillarNav(): Record<Locale, Record<PillarSlug, string>> {
  const result = {} as Record<Locale, Record<PillarSlug, string>>
  for (const locale of locales) {
    result[locale] = {
      'ai-medical-scribe': getLandingNavLabel('ai-medical-scribe', locale),
      'hospital-documentation': getLandingNavLabel('hospital-documentation', locale),
      'clinical-compliance': getLandingNavLabel('clinical-compliance', locale),
    }
  }
  return result
}

export const pillarNavLabel = buildPillarNav()
