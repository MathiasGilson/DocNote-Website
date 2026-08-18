import { type Locale } from '../utils/i18n'
import { specialtyLandingSlugs } from './landings'
import { solutionsHubCopy, specialtiesHubCopy, withEnFallback } from '../utils/inline-content'
import type { FamilyRecipe } from './family-visuals'

export const SPECIALTIES_HUB_PATH = '/specialties'
export const SOLUTIONS_HUB_PATH = '/solutions'

export type HubStat = { value: string; label: string }

export type HubFeatured = {
  badge: string
  title: string
  body: string
  primary: string
  secondary: string
}

export type HubMedia = {
  badge: string
  title: string
  body: string
  caption: string
  imageAlt: string
}

export type HubCopy = {
  title: string
  description: string
  hero: { badge: string; title: string; subtitle: string; lead: string }
  media: HubMedia
  stats: HubStat[]
  statsLine: string
  featured: HubFeatured
  familiesBadge: string
  familiesTitle: string
  familiesSubtitle: string
  recipeLabels: Record<FamilyRecipe, string>
  exploreFamily: string
  deepBadge: string
  deepTitle: string
  deepSubtitle: string
  cta: { title: string; body: string; primary: string; secondary: string }
  viewAllLabel: string
  openMenuLabel: string
}

export type SolutionsColumnExtra = {
  badge: string
  subtitle: string
}

export type SolutionsHubCopy = {
  title: string
  description: string
  hero: { badge: string; title: string; subtitle: string; lead: string }
  media: HubMedia
  stats: HubStat[]
  statsLine: string
  featured: HubFeatured
  columnsBadge: string
  columnsTitle: string
  columnsSubtitle: string
  columnExtras: {
    audiences: SolutionsColumnExtra
    differentiators: SolutionsColumnExtra
  }
  /** Out-of-menu product pages kept for search (pillar + use cases). */
  more: { badge: string; title: string; subtitle: string }
  cta: { title: string; body: string; primary: string; secondary: string }
  viewAllLabel: string
  openMenuLabel: string
}

/**
 * Specialties hub copy lives in src/content/inline/specialties-hub/<locale>.json so
 * the translate-locales pipeline (--bundle=specialties-hub) can localize it.
 */
const specialtiesHubByLocale = specialtiesHubCopy as Partial<Record<Locale, HubCopy>> & {
  en: HubCopy
}

/**
 * Solutions hub copy lives in src/content/inline/solutions-hub/<locale>.json so
 * the translate-locales pipeline (--bundle=solutions-hub) can localize it.
 */
const solutionsHubByLocale = solutionsHubCopy as Partial<Record<Locale, SolutionsHubCopy>> & {
  en: SolutionsHubCopy
}

export const getSpecialtiesHub = (locale: Locale): HubCopy =>
  withEnFallback(specialtiesHubByLocale.en, specialtiesHubByLocale[locale])

export const getSolutionsHub = (locale: Locale): SolutionsHubCopy =>
  withEnFallback(solutionsHubByLocale.en, solutionsHubByLocale[locale])

export const specialtiesHubDeepSlugs = specialtyLandingSlugs

/** Public assets reused on hub heroes (no new generation). */
export const SPECIALTIES_HUB_HERO_IMAGE = '/images/CHUV.webp'
export const SOLUTIONS_HUB_HERO_IMAGE = '/images/CHU Bordeaux.jpg'
export const SOLUTIONS_FEATURED_IMAGE = '/images/visite-medicale.jpg'
export const SPECIALTIES_FEATURED_IMAGE = '/images/CHUV.webp'
