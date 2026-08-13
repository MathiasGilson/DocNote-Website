import { type Locale } from '../utils/i18n'
import { specialtyLandingSlugs } from './landings'

export const SPECIALTIES_HUB_PATH = '/specialties'
export const SOLUTIONS_HUB_PATH = '/solutions'

export type HubStat = { value: string; label: string }

export type HubCopy = {
  title: string
  description: string
  hero: { badge: string; title: string; subtitle: string; lead: string }
  stats: HubStat[]
  statsLine: string
  familiesBadge: string
  familiesTitle: string
  familiesSubtitle: string
  deepBadge: string
  deepTitle: string
  deepSubtitle: string
  cta: { title: string; body: string; primary: string; secondary: string }
  viewAllLabel: string
  openMenuLabel: string
}

export type SolutionsHubCopy = {
  title: string
  description: string
  hero: { badge: string; title: string; subtitle: string; lead: string }
  columnsBadge: string
  columnsTitle: string
  columnsSubtitle: string
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
    stats: [
      { value: '61', label: 'Specialties' },
      { value: '227', label: 'Templates' },
      { value: '10', label: 'Cross-specialty' },
    ],
    statsLine: '61 specialties · 227 templates · 10 cross-specialty profiles',
    familiesBadge: 'Families',
    familiesTitle: 'Seven specialty families',
    familiesSubtitle: 'Atlas-aligned groups that mirror how DocNote ships templates and vocabulary.',
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
    stats: [
      { value: '61', label: 'Spécialités' },
      { value: '227', label: 'Modèles' },
      { value: '10', label: 'Transverses' },
    ],
    statsLine: '61 spécialités · 227 modèles · 10 profils transverses',
    familiesBadge: 'Familles',
    familiesTitle: 'Sept familles de spécialités',
    familiesSubtitle: 'Groupes alignés sur l’Atlas — comme DocNote livre les modèles et le vocabulaire.',
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

const solutionsHubByLocale: Partial<Record<Locale, SolutionsHubCopy>> & {
  en: SolutionsHubCopy
  fr: SolutionsHubCopy
} = {
  en: {
    title: 'DocNote solutions | Ambient clinical documentation',
    description:
      'Explore DocNote solutions — ambient clinical documentation, AI medical scribe, SOAP notes, operative reports, hospital documentation, and Swiss clinical compliance.',
    hero: {
      badge: 'Solutions',
      title: 'Clinical documentation that fits your workflow',
      subtitle: 'Platform, document types, and care & trust — the same structure as the product menu.',
      lead: 'Start from how you capture encounters, the documents you ship, or the trust layer hospitals need. Every card links to a live product page.',
    },
    columnsBadge: 'Browse',
    columnsTitle: 'Everything in Solutions',
    columnsSubtitle: 'Mirrored from the header mega-menu — choose a path, then open the full page.',
    cta: {
      title: 'Ready to try the note flow?',
      body: 'See ambient capture through to a structured draft you validate — or book a conversation with the team.',
      primary: 'Watch the tutorial',
      secondary: 'View pricing',
    },
    viewAllLabel: 'All solutions',
    openMenuLabel: 'Open solutions menu',
  },
  fr: {
    title: 'Solutions DocNote | Documentation clinique ambiante',
    description:
      'Explorez les solutions DocNote — documentation clinique ambiante, scribe médical IA, notes SOAP, comptes rendus opératoires, documentation hospitalière et conformité clinique suisse.',
    hero: {
      badge: 'Solutions',
      title: 'Une documentation clinique adaptée à votre flux',
      subtitle: 'Plateforme, types de documents, soins & confiance — la même structure que le menu produit.',
      lead: 'Partez de la capture des consultations, des documents que vous produisez, ou de la couche de confiance dont les hôpitaux ont besoin. Chaque carte mène à une page produit réelle.',
    },
    columnsBadge: 'Parcourir',
    columnsTitle: 'Tout le menu Solutions',
    columnsSubtitle: 'Aligné sur le méga-menu — choisissez un chemin, puis ouvrez la page complète.',
    cta: {
      title: 'Prêt à tester le flux de note ?',
      body: 'Voyez la capture ambiante jusqu’au brouillon structuré que vous validez — ou échangez avec l’équipe.',
      primary: 'Voir le tutoriel',
      secondary: 'Voir les tarifs',
    },
    viewAllLabel: 'Toutes les solutions',
    openMenuLabel: 'Ouvrir le menu solutions',
  },
}

export const getSpecialtiesHub = (locale: Locale): HubCopy =>
  specialtiesHubByLocale[locale] ?? specialtiesHubByLocale.en

export const getSolutionsHub = (locale: Locale): SolutionsHubCopy =>
  solutionsHubByLocale[locale] ?? solutionsHubByLocale.en

export const specialtiesHubDeepSlugs = specialtyLandingSlugs
