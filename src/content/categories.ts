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
    badge: 'bg-gray-100 text-gray-700',
    label: { en: 'News', fr: 'Actualités', de: 'News' },
    description: {
      en: 'DocNote news: product releases, talks at medical conferences, partnerships with hospitals and software vendors, and press coverage.',
      fr: 'Actualités DocNote : nouveautés produit, interventions en congrès médicaux, partenariats avec hôpitaux et éditeurs, et couverture presse.',
      de: 'DocNote-News: Produktneuheiten, Vorträge an medizinischen Kongressen, Partnerschaften mit Spitälern und Softwareanbietern sowie Presseberichte.',
    },
  },
  guides: {
    slug: 'guides',
    pillar: 'ai-medical-scribe',
    badge: 'bg-gray-100 text-gray-700',
    label: { en: 'Guides', fr: 'Guides', de: 'Anleitungen' },
    description: {
      en: 'Step by step guides to clinical documentation: SOAP notes, discharge letters, templates and dictation workflows.',
      fr: 'Guides pas à pas sur la documentation clinique : notes SOAP, lettres de sortie, modèles de rapport et workflows de dictée.',
      de: 'Schritt für Schritt Anleitungen zur klinischen Dokumentation: SOAP-Notizen, Austrittsberichte, Vorlagen und Diktat.',
    },
  },
  compliance: {
    slug: 'compliance',
    pillar: 'clinical-compliance',
    badge: 'bg-gray-100 text-gray-700',
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
    badge: 'bg-gray-100 text-gray-700',
    label: { en: 'AI scribe', fr: 'Scribe IA', de: 'KI-Schreibassistent' },
    description: {
      en: 'How ambient AI scribes turn consultations into clinical notes, what they get wrong, and how to evaluate one for your practice.',
      fr: 'Comment les scribes IA transforment une consultation en note clinique, leurs limites, et comment en évaluer un pour votre cabinet.',
      de: 'Wie KI-Schreibassistenten funktionieren, wo sie Fehler machen und wie Sie einen für Ihre Praxis bewerten.',
    },
  },
  'hospital-workflows': {
    slug: 'hospital-workflows',
    pillar: 'hospital-documentation',
    badge: 'bg-gray-100 text-gray-700',
    label: { en: 'Hospital workflows', fr: 'Flux hospitaliers', de: 'Spitalprozesse' },
    description: {
      en: 'Ward rounds, operative reports, EHR integration and physician burnout: documentation at hospital scale.',
      fr: 'Visites, comptes rendus opératoires, intégration DPI et épuisement des médecins : la documentation à l’échelle de l’hôpital.',
      de: 'Visiten, OP-Berichte, KIS-Integration und Burnout bei Ärztinnen und Ärzten: klinische Dokumentation im Spitalalltag.',
    },
  },
  specialties: {
    slug: 'specialties',
    pillar: 'hospital-documentation',
    badge: 'bg-gray-100 text-gray-700',
    label: { en: 'Specialties', fr: 'Spécialités', de: 'Fachgebiete' },
    description: {
      en: 'Clinical documentation practices by medical specialty, from radiology and surgery to dentistry and general practice, with DocNote.',
      fr: 'La documentation clinique par spécialité médicale avec DocNote : radiologie, chirurgie, dentisterie, médecine générale et plus.',
      de: 'Klinische Dokumentation nach medizinischem Fachgebiet mit DocNote: Radiologie, Chirurgie, Zahnmedizin, Allgemeinmedizin und mehr.',
    },
  },
};

export const CATEGORY_LIST = CATEGORY_SLUGS.map((slug) => CATEGORIES[slug]);

export const pillarCategories = (pillar: PillarSlug): CategoryDef[] => CATEGORY_LIST.filter((c) => c.pillar === pillar);
