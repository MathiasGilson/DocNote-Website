import { type Locale } from '../utils/i18n'
import { specialtyLandingSlugs } from './landings'
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
    platform: SolutionsColumnExtra
    documents: SolutionsColumnExtra
    careTrust: SolutionsColumnExtra
  }
  featuredInPlatform: string
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
    media: {
      badge: 'Start here',
      title: 'Ambient capture is the product spine',
      body: 'Listen in the room, draft after the visit, validate before the record sticks — then branch into SOAP, CRO, discharge, or hospital files.',
      caption: 'Ambient clinical documentation — the path most teams open first.',
      imageAlt: 'Clinicians reviewing documentation on a laptop',
    },
    stats: [
      { value: '11', label: 'Solution pages' },
      { value: '3', label: 'Menu groups' },
      { value: 'CH', label: 'Swiss-hosted' },
    ],
    statsLine: '11 solution pages · 3 menu groups · Swiss-hosted',
    featured: {
      badge: 'Featured',
      title: 'Ambient clinical documentation',
      body: 'Passive capture during the visit, a structured draft right after — no typing in between. Open the full ambient landing, or browse the platform group below.',
      primary: 'Open ambient page',
      secondary: 'Browse platform',
    },
    columnsBadge: 'Browse',
    columnsTitle: 'Everything in Solutions',
    columnsSubtitle: 'Three distinct paths — not one flat grid. Same groups as the header mega-menu.',
    columnExtras: {
      platform: {
        badge: 'Platform',
        subtitle: 'How DocNote captures and drafts — ambient, scribe, multilingual.',
      },
      documents: {
        badge: 'Document types',
        subtitle: 'The notes and reports clinicians actually ship after an encounter.',
      },
      careTrust: {
        badge: 'Care & trust',
        subtitle: 'Hospital workflow and the compliance layer procurement reviews.',
      },
    },
    featuredInPlatform: 'Highlight',
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
    media: {
      badge: 'Par ici',
      title: 'La capture ambiante est la colonne vertébrale',
      body: 'Écouter en salle, rédiger après la visite, valider avant l’enregistrement — puis brancher vers SOAP, CRO, sortie ou dossiers hospitaliers.',
      caption: 'Documentation clinique ambiante — le chemin que la plupart des équipes ouvrent en premier.',
      imageAlt: 'Cliniciens consultant la documentation sur un ordinateur',
    },
    stats: [
      { value: '11', label: 'Pages solutions' },
      { value: '3', label: 'Groupes menu' },
      { value: 'CH', label: 'Hébergé en CH' },
    ],
    statsLine: '11 pages solutions · 3 groupes menu · hébergement suisse',
    featured: {
      badge: 'À la une',
      title: 'Documentation clinique ambiante',
      body: 'Capture passive pendant la visite, brouillon structuré juste après — sans taper entre-temps. Ouvrez la page ambiante, ou parcourez le groupe plateforme ci-dessous.',
      primary: 'Ouvrir la page ambiante',
      secondary: 'Voir la plateforme',
    },
    columnsBadge: 'Parcourir',
    columnsTitle: 'Tout le menu Solutions',
    columnsSubtitle: 'Trois chemins distincts — pas une grille plate. Les mêmes groupes que le méga-menu.',
    columnExtras: {
      platform: {
        badge: 'Plateforme',
        subtitle: 'Comment DocNote capture et rédige — ambiant, scribe, multilingue.',
      },
      documents: {
        badge: 'Types de documents',
        subtitle: 'Les notes et rapports que les cliniciens produisent vraiment après une rencontre.',
      },
      careTrust: {
        badge: 'Soins & confiance',
        subtitle: 'Le flux hospitalier et la couche conformité que regarde l’achat.',
      },
    },
    featuredInPlatform: 'À la une',
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

/** Public assets reused on hub heroes (no new generation). */
export const SPECIALTIES_HUB_HERO_IMAGE = '/images/CHUV.webp'
export const SOLUTIONS_HUB_HERO_IMAGE = '/images/adopt_ai_11.25_-_3.jpg'
export const SOLUTIONS_FEATURED_IMAGE = '/images/visite-medicale.jpg'
export const SPECIALTIES_FEATURED_IMAGE = '/images/CHUV.webp'
