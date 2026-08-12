import { locales, type Locale } from '../utils/i18n'
import { landingsCopy, pillarNavCopy } from '../utils/inline-content'
import type { SpecialtyKey } from '../data/specialty-icons'

/** Existing pillars — keep H1/intent; do not cannibalize. */
export const pillarSlugs = [
  'ai-medical-scribe',
  'hospital-documentation',
  'clinical-compliance',
] as const

export type PillarSlug = (typeof pillarSlugs)[number]

/**
 * Batch A — use-case / category landings (HF, mid-KD targets).
 * Volumes/KD to re-check in Ahrefs (US/GB); seeds locked for v1.
 */
export const usecaseSlugs = [
  'ambient-clinical-documentation',
  'ai-clinical-documentation',
  'ai-soap-notes',
  'ai-medical-transcription',
  'ai-discharge-summary',
  'operative-report-ai',
  'ai-consultation-notes',
  'multilingual-ai-medical-scribe',
] as const

export type UsecaseSlug = (typeof usecaseSlugs)[number]

/** Batch B — specialty landings first wave */
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
  ...usecaseSlugs,
  ...specialtyLandingSlugs,
] as const

export type LandingSlug = (typeof landingSlugs)[number]

export type LandingType = 'pillar' | 'usecase' | 'specialty'

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
  hero: { badge: string; title: string; subtitle: string; lead: string }
  story: { badge: string; title: string; paragraphs: string[] }
  benefits: { badge: string; title: string; subtitle: string; items: LandingBlockItem[] }
  steps: { badge: string; title: string; subtitle: string; items: LandingBlockItem[] }
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
  primaryCta: 'tutorial' | 'pricing' | 'contact' | 'privacy'
  secondaryCta: 'tutorial' | 'pricing' | 'contact' | 'privacy'
}

export const landingMeta: Record<LandingSlug, LandingMeta> = {
  'ai-medical-scribe': {
    slug: 'ai-medical-scribe',
    type: 'pillar',
    primaryKeyword: 'ai medical scribe',
    related: [
      'ambient-clinical-documentation',
      'ai-soap-notes',
      'ai-discharge-summary',
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
      'ai-discharge-summary',
      'operative-report-ai',
      'ai-clinical-documentation',
      'clinical-compliance',
    ],
    primaryCta: 'contact',
    secondaryCta: 'tutorial',
  },
  'clinical-compliance': {
    slug: 'clinical-compliance',
    type: 'pillar',
    primaryKeyword: 'clinical AI compliance',
    related: [
      'ai-medical-scribe',
      'hospital-documentation',
      'multilingual-ai-medical-scribe',
    ],
    primaryCta: 'privacy',
    secondaryCta: 'contact',
  },
  'ambient-clinical-documentation': {
    slug: 'ambient-clinical-documentation',
    type: 'usecase',
    primaryKeyword: 'ambient clinical documentation',
    related: [
      'ai-medical-scribe',
      'ai-clinical-documentation',
      'ai-consultation-notes',
      'clinical-compliance',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-clinical-documentation': {
    slug: 'ai-clinical-documentation',
    type: 'usecase',
    primaryKeyword: 'AI clinical documentation',
    related: [
      'ambient-clinical-documentation',
      'hospital-documentation',
      'ai-medical-scribe',
      'ai-discharge-summary',
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
      'ai-consultation-notes',
      'ai-scribe-general-practice',
      'ambient-clinical-documentation',
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
      'ai-clinical-documentation',
      'ambient-clinical-documentation',
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
      'hospital-documentation',
      'operative-report-ai',
      'ai-clinical-documentation',
      'ai-medical-scribe',
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
      'ai-clinical-documentation',
    ],
    primaryCta: 'contact',
    secondaryCta: 'tutorial',
  },
  'ai-consultation-notes': {
    slug: 'ai-consultation-notes',
    type: 'usecase',
    primaryKeyword: 'AI consultation notes',
    related: [
      'ai-soap-notes',
      'ai-medical-scribe',
      'ai-scribe-general-practice',
      'multilingual-ai-medical-scribe',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'multilingual-ai-medical-scribe': {
    slug: 'multilingual-ai-medical-scribe',
    type: 'usecase',
    primaryKeyword: 'multilingual AI medical scribe',
    related: [
      'ai-medical-scribe',
      'clinical-compliance',
      'ai-consultation-notes',
      'hospital-documentation',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
  'ai-scribe-general-practice': {
    slug: 'ai-scribe-general-practice',
    type: 'specialty',
    primaryKeyword: 'AI medical scribe for general practice',
    specialtyKey: 'general-practice',
    related: [
      'ai-soap-notes',
      'ai-consultation-notes',
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
      'ai-consultation-notes',
      'ai-medical-scribe',
      'clinical-compliance',
      'multilingual-ai-medical-scribe',
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
      'ai-clinical-documentation',
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
      'ai-consultation-notes',
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
      'ai-clinical-documentation',
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
      'ai-consultation-notes',
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
      'ai-clinical-documentation',
      'hospital-documentation',
      'ai-consultation-notes',
      'ai-medical-scribe',
    ],
    primaryCta: 'tutorial',
    secondaryCta: 'pricing',
  },
}

/** Footer / resources: pillars + top use-cases only */
export const footerLandingSlugs: LandingSlug[] = [
  ...pillarSlugs,
  'ambient-clinical-documentation',
  'ai-clinical-documentation',
  'ai-discharge-summary',
]

/** Header dropdown 1 — pillars + category / use-case landings */
export const navSolutionsSlugs: LandingSlug[] = [...pillarSlugs, ...usecaseSlugs]

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

export type NavSolutionsColumnId = 'platform' | 'documents' | 'careTrust'

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
  'ambient-clinical-documentation',
  'ai-soap-notes',
  'ai-consultation-notes',
  'multilingual-ai-medical-scribe',
  'ai-scribe-general-practice',
  'ai-scribe-psychiatry',
  'ai-scribe-pediatrics',
])

export const landingFeatureKeys: Record<LandingSlug, LandingFeatureKey[]> = {
  'ai-medical-scribe': ['recording', 'summaries', 'security'],
  'hospital-documentation': ['summaries', 'integration', 'security'],
  'clinical-compliance': ['security', 'integration', 'languages'],
  'ambient-clinical-documentation': ['recording', 'summaries', 'security'],
  'ai-clinical-documentation': ['recording', 'summaries', 'integration'],
  'ai-soap-notes': ['recording', 'summaries', 'transcription'],
  'ai-medical-transcription': ['transcription', 'recording', 'summaries'],
  'ai-discharge-summary': ['summaries', 'integration', 'security'],
  'operative-report-ai': ['summaries', 'integration', 'recording'],
  'ai-consultation-notes': ['recording', 'summaries', 'transcription'],
  'multilingual-ai-medical-scribe': ['languages', 'recording', 'security'],
  'ai-scribe-general-practice': ['recording', 'summaries', 'languages'],
  'ai-scribe-psychiatry': ['recording', 'security', 'summaries'],
  'ai-scribe-cardiology': ['recording', 'summaries', 'integration'],
  'ai-scribe-pediatrics': ['recording', 'summaries', 'languages'],
  'ai-scribe-emergency-medicine': ['recording', 'summaries', 'integration'],
  'ai-scribe-surgery': ['summaries', 'integration', 'recording'],
  'ai-scribe-dermatology': ['recording', 'summaries', 'languages'],
  'ai-scribe-neurology': ['recording', 'summaries', 'security'],
}

/** Mega-menu columns for Solutions (3 groups). */
export const navSolutionsColumns: { id: NavSolutionsColumnId; slugs: LandingSlug[] }[] = [
  {
    id: 'platform',
    slugs: [
      'ai-medical-scribe',
      'ambient-clinical-documentation',
      'ai-clinical-documentation',
      'multilingual-ai-medical-scribe',
    ],
  },
  {
    id: 'documents',
    slugs: [
      'ai-soap-notes',
      'ai-consultation-notes',
      'ai-medical-transcription',
      'ai-discharge-summary',
      'operative-report-ai',
    ],
  },
  {
    id: 'careTrust',
    slugs: ['hospital-documentation', 'clinical-compliance'],
  },
]

const NAV_SOLUTIONS_COLUMN_LABELS: Record<
  NavSolutionsColumnId,
  Partial<Record<Locale, string>> & { en: string }
> = {
  platform: {
    en: 'Platform',
    fr: 'Plateforme',
    de: 'Plattform',
    es: 'Plataforma',
    it: 'Piattaforma',
    pt: 'Plataforma',
    nl: 'Platform',
    ru: 'Платформа',
    ja: 'プラットフォーム',
    ko: '플랫폼',
    zh: '平台',
    ar: 'المنصة',
    hi: 'प्लेटफ़ॉर्म',
    th: 'แพลตฟอร์ม',
    sv: 'Plattform',
    no: 'Plattform',
  },
  documents: {
    en: 'Document types',
    fr: 'Types de documents',
    de: 'Dokumenttypen',
    es: 'Tipos de documentos',
    it: 'Tipi di documenti',
    pt: 'Tipos de documentos',
    nl: 'Documenttypes',
    ru: 'Типы документов',
    ja: '文書タイプ',
    ko: '문서 유형',
    zh: '文档类型',
    ar: 'أنواع المستندات',
    hi: 'दस्तावेज़ प्रकार',
    th: 'ประเภทเอกสาร',
    sv: 'Dokumenttyper',
    no: 'Dokumenttyper',
  },
  careTrust: {
    en: 'Care & trust',
    fr: 'Soins & confiance',
    de: 'Versorgung & Vertrauen',
    es: 'Atención y confianza',
    it: 'Cura e fiducia',
    pt: 'Cuidado e confiança',
    nl: 'Zorg & vertrouwen',
    ru: 'Уход и доверие',
    ja: 'ケアと信頼',
    ko: '케어 & 신뢰',
    zh: '照护与信任',
    ar: 'الرعاية والثقة',
    hi: 'देखभाल और विश्वास',
    th: 'การดูแลและความเชื่อถือ',
    sv: 'Vård & förtroende',
    no: 'Omsorg & tillit',
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
    ko: '솔루션',
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
    zh: '专科',
    ar: 'التخصصات',
    hi: 'विशेषज्ञताएँ',
    th: 'สาขาเฉพาะทาง',
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
    const copy = landingData[slug] ?? enLanding[slug]
    if (!copy) {
      throw new Error(`Missing landing copy for ${slug} (${locale})`)
    }
    out[slug] = copy
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
  return `${(sp > 28 ? cut.slice(0, sp) : cut).trim()}…`
}

/** @deprecated use landingSlugs / getLanding — kept for existing imports */
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
