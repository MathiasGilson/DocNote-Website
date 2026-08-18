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

const solutionsHubByLocale: Partial<Record<Locale, SolutionsHubCopy>> & {
  en: SolutionsHubCopy
  fr: SolutionsHubCopy
} = {
  en: {
    title: 'DocNote solutions | Who it is for and what makes it different',
    description:
      'DocNote solutions for private practice, hospitals and departments, medical secretaries and clinic groups — plus what sets it apart: coding and billing suggestions, EHR integration, your Word templates, clinical context, day hospital, 61 specialties in 21 languages.',
    hero: {
      badge: 'Solutions',
      title: 'Built for someone like you — and different from the rest',
      subtitle: 'Two questions, one menu: is this made for my setup, and what does it do that the others don’t?',
      lead: 'Start from who you are — private practice, hospital department, secretary, group — or from the capabilities competitors cannot copy. Every card links to a live product page.',
    },
    media: {
      badge: 'Start here',
      title: 'The same record button, four very different desks',
      body: 'A solo physician, a department head, a medical secretary and a group director do not buy the same product. DocNote drafts a report you validate — then adapts the format, the coding slot and the delivery to how your setup actually works.',
      caption: 'Hospitals, practices, secretaries and groups — one product, four workflows.',
      imageAlt: 'Hospital and clinical campus exterior',
    },
    stats: [
      { value: '4', label: 'Audiences' },
      { value: '6', label: 'Differentiators' },
      { value: 'CH', label: 'Swiss-hosted' },
    ],
    statsLine: '4 audience pages · 6 differentiators · Swiss-hosted',
    featured: {
      badge: 'Featured',
      title: 'For hospitals and departments',
      body: 'Discharge letters, operative reports and ward notes — in your department’s format, with coding suggestions at the end and delivery into your EHR. Open the hospital page, or pick your own audience below.',
      primary: 'Open the hospital page',
      secondary: 'Find your audience',
    },
    columnsBadge: 'Browse',
    columnsTitle: 'Everything in Solutions',
    columnsSubtitle: 'Who it is for on the left, what makes us different on the right — the same two columns as the header menu.',
    columnExtras: {
      audiences: {
        badge: 'Who it’s for',
        subtitle: 'Pick the page that matches how you work — the decision cycle, the documents and the systems are different for each.',
      },
      differentiators: {
        badge: 'What makes us different',
        subtitle: 'The capabilities no generalist scribe can claim: coding suggestions, EHR delivery, your Word templates, clinical context, day hospital, specialties and languages.',
      },
    },
    more: {
      badge: 'Also on the site',
      title: 'More product pages',
      subtitle: 'The “what DocNote is” pillar and document-type pages, kept for people who search by document rather than by role.',
    },
    cta: {
      title: 'Ready to see the note flow?',
      body: 'Watch a consultation go from recording to a structured draft you validate — or book a conversation with the team.',
      primary: 'Watch the tutorial',
      secondary: 'View pricing',
    },
    viewAllLabel: 'All solutions',
    openMenuLabel: 'Open solutions menu',
  },
  fr: {
    title: 'Solutions DocNote | Pour qui, et ce qui nous distingue',
    description:
      'Les solutions DocNote pour le cabinet privé, les hôpitaux et services, les secrétaires médicales et les groupes de cliniques — et ce qui nous distingue : suggestions de codage et facturation, intégration DPI, vos modèles Word, contexte clinique, hôpital de jour, 61 spécialités en 21 langues.',
    hero: {
      badge: 'Solutions',
      title: 'Conçu pour quelqu’un comme vous — et différent des autres',
      subtitle: 'Deux questions, un menu : est-ce fait pour mon organisation, et que fait-il que les autres ne font pas ?',
      lead: 'Partez de qui vous êtes — cabinet privé, service hospitalier, secrétaire, groupe — ou des capacités que les concurrents ne peuvent pas copier. Chaque carte mène à une page produit réelle.',
    },
    media: {
      badge: 'Par ici',
      title: 'Le même bouton d’enregistrement, quatre bureaux très différents',
      body: 'Un médecin installé, un chef de service, une secrétaire médicale et un directeur de groupe n’achètent pas le même produit. DocNote rédige un compte rendu que vous validez — puis adapte le format, l’emplacement du codage et l’envoi à votre organisation réelle.',
      caption: 'Hôpitaux, cabinets, secrétaires et groupes — un produit, quatre flux de travail.',
      imageAlt: 'Campus hospitalier et clinique — vue extérieure',
    },
    stats: [
      { value: '4', label: 'Publics' },
      { value: '6', label: 'Différenciateurs' },
      { value: 'CH', label: 'Hébergé en CH' },
    ],
    statsLine: '4 pages par public · 6 différenciateurs · hébergement suisse',
    featured: {
      badge: 'À la une',
      title: 'Pour les hôpitaux et les services',
      body: 'Lettres de sortie, comptes rendus opératoires et notes de visite — au format de votre service, avec des suggestions de codage en fin de document et un envoi dans votre DPI. Ouvrez la page hôpital, ou choisissez votre public ci-dessous.',
      primary: 'Ouvrir la page hôpital',
      secondary: 'Trouver votre public',
    },
    columnsBadge: 'Parcourir',
    columnsTitle: 'Tout le menu Solutions',
    columnsSubtitle: 'Pour qui à gauche, ce qui nous distingue à droite — les deux mêmes colonnes que le menu principal.',
    columnExtras: {
      audiences: {
        badge: 'Pour qui',
        subtitle: 'Choisissez la page qui correspond à votre façon de travailler — le cycle de décision, les documents et les systèmes diffèrent pour chacun.',
      },
      differentiators: {
        badge: 'Ce qui nous distingue',
        subtitle: 'Les capacités qu’aucun scribe généraliste ne peut revendiquer : suggestions de codage, envoi vers le DPI, vos modèles Word, contexte clinique, hôpital de jour, spécialités et langues.',
      },
    },
    more: {
      badge: 'Aussi sur le site',
      title: 'Autres pages produit',
      subtitle: 'La page pilier « ce qu’est DocNote » et les pages par type de document, conservées pour ceux qui cherchent par document plutôt que par rôle.',
    },
    cta: {
      title: 'Prêt à voir le flux de note ?',
      body: 'Regardez une consultation passer de l’enregistrement à un brouillon structuré que vous validez — ou échangez avec l’équipe.',
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
export const SOLUTIONS_HUB_HERO_IMAGE = '/images/CHU Bordeaux.jpg'
export const SOLUTIONS_FEATURED_IMAGE = '/images/visite-medicale.jpg'
export const SPECIALTIES_FEATURED_IMAGE = '/images/CHUV.webp'
