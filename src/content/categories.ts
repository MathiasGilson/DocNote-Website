import type { Locale } from '../utils/i18n';
import type { PillarSlug } from './pillars';

export const CATEGORY_SLUGS = ['news', 'guides', 'compliance', 'ai-scribe', 'hospital-workflows', 'specialties'] as const;
export type BlogCategory = (typeof CATEGORY_SLUGS)[number];

export type CategoryDef = {
  slug: BlogCategory;
  pillar: PillarSlug | null;
  badge: string;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const CATEGORIES: Record<BlogCategory, CategoryDef> = {
  news: {
    slug: 'news',
    pillar: null,
    badge: 'bg-purple-100 text-purple-700',
    label: { en: 'News', fr: 'Actualités', de: 'News' },
    description: {
      en: 'Product releases, conferences, partnerships and press coverage of DocNote.',
      fr: 'Nouveautés produit, congrès, partenariats et couverture presse de DocNote.',
      de: 'Produktneuheiten, Kongresse, Partnerschaften und Presseberichte über DocNote.',
    },
  },
  guides: {
    slug: 'guides',
    pillar: 'ai-medical-scribe',
    badge: 'bg-green-100 text-green-700',
    label: { en: 'Guides', fr: 'Guides', de: 'Anleitungen' },
    description: {
      en: 'Step by step guides to clinical documentation: SOAP notes, discharge letters, templates and dictation workflows.',
      fr: 'Guides pas à pas sur la documentation clinique : notes SOAP, lettres de sortie, modèles et dictée.',
      de: 'Schritt für Schritt Anleitungen zur klinischen Dokumentation: SOAP-Notizen, Austrittsberichte, Vorlagen und Diktat.',
    },
  },
  compliance: {
    slug: 'compliance',
    pillar: 'clinical-compliance',
    badge: 'bg-amber-100 text-amber-700',
    label: { en: 'Compliance', fr: 'Conformité', de: 'Compliance' },
    description: {
      en: 'FADP, GDPR, HIPAA and ISO 27001 explained for doctors who want to use AI without risking patient data.',
      fr: 'nLPD, RGPD, HIPAA et ISO 27001 expliqués aux médecins qui veulent utiliser l’IA sans risque pour les données patients.',
      de: 'DSG, DSGVO, HIPAA und ISO 27001 erklärt für Ärztinnen und Ärzte, die KI ohne Risiko für Patientendaten nutzen wollen.',
    },
  },
  'ai-scribe': {
    slug: 'ai-scribe',
    pillar: 'ai-medical-scribe',
    badge: 'bg-blue-100 text-blue-700',
    label: { en: 'AI scribe', fr: 'Scribe IA', de: 'KI-Schreibassistent' },
    description: {
      en: 'How ambient AI scribes work, what they get wrong, and how to evaluate one for your practice.',
      fr: 'Comment fonctionnent les scribes IA, leurs limites, et comment en évaluer un pour votre cabinet.',
      de: 'Wie KI-Schreibassistenten funktionieren, wo sie Fehler machen und wie Sie einen für Ihre Praxis bewerten.',
    },
  },
  'hospital-workflows': {
    slug: 'hospital-workflows',
    pillar: 'hospital-documentation',
    badge: 'bg-orange-100 text-orange-700',
    label: { en: 'Hospital workflows', fr: 'Flux hospitaliers', de: 'Spitalprozesse' },
    description: {
      en: 'Ward rounds, operative reports, EHR integration and physician burnout: documentation at hospital scale.',
      fr: 'Visites, comptes rendus opératoires, intégration DPI et épuisement des médecins : la documentation à l’échelle de l’hôpital.',
      de: 'Visiten, OP-Berichte, KIS-Integration und Burnout: Dokumentation im Spitalalltag.',
    },
  },
  specialties: {
    slug: 'specialties',
    pillar: 'hospital-documentation',
    badge: 'bg-teal-100 text-teal-700',
    label: { en: 'Specialties', fr: 'Spécialités', de: 'Fachgebiete' },
    description: {
      en: 'Documentation practices by specialty: radiology, surgery, dentistry, general practice and more.',
      fr: 'La documentation par spécialité : radiologie, chirurgie, dentisterie, médecine générale et plus.',
      de: 'Dokumentation nach Fachgebiet: Radiologie, Chirurgie, Zahnmedizin, Allgemeinmedizin und mehr.',
    },
  },
};

export const CATEGORY_LIST = CATEGORY_SLUGS.map((slug) => CATEGORIES[slug]);

export const pillarCategories = (pillar: PillarSlug): CategoryDef[] => CATEGORY_LIST.filter((c) => c.pillar === pillar);
