import { type Locale } from '../utils/i18n'
import { specialtyLandingSlugs } from './landings'
import { solutionsHubCopy } from '../utils/inline-content'
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

const specialtiesHubByLocale: Partial<Record<Locale, HubCopy>> & { en: HubCopy; fr: HubCopy } = {
  en: {
    title: 'AI medical scribe by specialty | DocNote',
    description:
      'Browse DocNote specialty families — surgical, medical, primary care, acute care, diagnostics, and allied health. 61 specialties, 227 templates, Swiss-hosted.',
    hero: {
      badge: 'Specialty Atlas',
      title: 'Documentation written for your specialty',
      subtitle: 'Seven family hubs — not one generic note repainted for every trade.',
      lead: 'Pick the family that matches how you work. Each hub lists the specialty vocabulary, templates, and deep landings built for that path of care.',
    },
    media: {
      badge: 'In the atlas',
      title: 'Families mirror how care actually runs',
      body: 'Surgical pathways, clinic pace, unit handoffs, diagnostic dictation — each family page uses a different visual recipe so the docs match the job.',
      caption: '61 specialties · 7 families · templates that follow the path of care.',
      imageAlt: 'Hospital corridor and clinical setting',
    },
    stats: [
      { value: '61', label: 'Specialties' },
      { value: '227', label: 'Templates' },
      { value: '7', label: 'Families' },
    ],
    statsLine: '61 specialties · 227 templates · 7 specialty families',
    featured: {
      badge: 'Featured path',
      title: 'Surgical family + AI operative report',
      body: 'Theatre to coded discharge in one pathway — then open the operative-report landing when the case ends.',
      primary: 'Open Surgical family',
      secondary: 'AI operative report',
    },
    familiesBadge: 'Families',
    familiesTitle: 'Seven specialty families',
    familiesSubtitle: 'Atlas-aligned groups that mirror how DocNote ships templates and vocabulary.',
    recipeLabels: {
      pathway: 'Pathway',
      'split-duo': 'Dual track',
      vocab: 'Vocabulary',
      pace: 'Pace',
      unit: 'Unit',
      dictation: 'Dictation',
      pricing: 'Pricing',
    },
    exploreFamily: 'Explore family',
    deepBadge: 'Deep landings',
    deepTitle: 'Specialty-focused AI scribe pages',
    deepSubtitle: 'Go deeper on high-traffic specialties with dedicated ambient documentation pages.',
    cta: {
      title: 'See DocNote on your specialty path',
      body: 'Walk through a real note flow, or talk to us about hospital and practice rollouts.',
      primary: 'Watch the tutorial',
      secondary: 'Contact us',
    },
    viewAllLabel: 'All specialties',
    openMenuLabel: 'Open specialties menu',
  },
  fr: {
    title: 'Scribe médical IA par spécialité | DocNote',
    description:
      'Parcourez les familles de spécialités DocNote — chirurgicales, médicales, soins primaires, soins aigus, diagnostics et paramédical. 61 spécialités, 227 modèles, hébergement suisse.',
    hero: {
      badge: 'Atlas des spécialités',
      title: 'Une documentation écrite pour votre spécialité',
      subtitle: 'Sept hubs familiaux — pas une note générique repeinte pour chaque métier.',
      lead: 'Choisissez la famille qui correspond à votre pratique. Chaque hub regroupe le vocabulaire, les modèles et les pages dédiées de ce parcours de soins.',
    },
    media: {
      badge: 'Dans l’atlas',
      title: 'Des familles calées sur le réel du soin',
      body: 'Parcours chirurgical, rythme de cabinet, transmissions d’unité, dictée diagnostique — chaque page familiale a sa propre recette visuelle.',
      caption: '61 spécialités · 7 familles · des modèles qui suivent le parcours de soins.',
      imageAlt: 'Couloir d’hôpital et environnement clinique',
    },
    stats: [
      { value: '61', label: 'Spécialités' },
      { value: '227', label: 'Modèles' },
      { value: '7', label: 'Familles' },
    ],
    statsLine: '61 spécialités · 227 modèles · 7 familles de spécialités',
    featured: {
      badge: 'Parcours mis en avant',
      title: 'Famille chirurgicale + compte rendu opératoire IA',
      body: 'Du bloc à la sortie codée en un parcours — puis la page CRO quand le cas est terminé.',
      primary: 'Ouvrir la famille Chirurgicale',
      secondary: 'Compte rendu opératoire IA',
    },
    familiesBadge: 'Familles',
    familiesTitle: 'Sept familles de spécialités',
    familiesSubtitle: 'Groupes alignés sur l’Atlas — comme DocNote livre les modèles et le vocabulaire.',
    recipeLabels: {
      pathway: 'Parcours',
      'split-duo': 'Double voie',
      vocab: 'Vocabulaire',
      pace: 'Rythme',
      unit: 'Unité',
      dictation: 'Dictée',
      pricing: 'Tarification',
    },
    exploreFamily: 'Explorer la famille',
    deepBadge: 'Pages dédiées',
    deepTitle: 'Pages scribe IA par spécialité',
    deepSubtitle: 'Approfondissez les spécialités à fort volume avec des pages de documentation ambiante dédiées.',
    cta: {
      title: 'Voir DocNote sur votre parcours',
      body: 'Parcourez un flux de note réel, ou parlons déploiement hôpital et cabinet.',
      primary: 'Voir le tutoriel',
      secondary: 'Nous contacter',
    },
    viewAllLabel: 'Toutes les spécialités',
    openMenuLabel: 'Ouvrir le menu spécialités',
  },
}

/**
 * Solutions hub copy lives in src/content/inline/solutions-hub/<locale>.json so
 * the translate-locales pipeline (--bundle=solutions-hub) can localize it.
 */
const solutionsHubByLocale = solutionsHubCopy as Partial<Record<Locale, SolutionsHubCopy>> & {
  en: SolutionsHubCopy
}

export const getSpecialtiesHub = (locale: Locale): HubCopy =>
  specialtiesHubByLocale[locale] ?? specialtiesHubByLocale.en

export const getSolutionsHub = (locale: Locale): SolutionsHubCopy =>
  solutionsHubByLocale[locale] ?? solutionsHubByLocale.en

export const specialtiesHubDeepSlugs = specialtyLandingSlugs

/** Public assets reused on hub heroes (no new generation). */
export const SPECIALTIES_HUB_HERO_IMAGE = '/images/CHUV.webp'
export const SOLUTIONS_HUB_HERO_IMAGE = '/images/CHU Bordeaux.jpg'
export const SOLUTIONS_FEATURED_IMAGE = '/images/visite-medicale.jpg'
export const SPECIALTIES_FEATURED_IMAGE = '/images/CHUV.webp'
