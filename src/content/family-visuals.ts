import type { SpecialtyFamilySlug } from './specialty-families'
import type { Locale } from '../utils/i18n'

export type FamilyRecipe =
  | 'pathway'
  | 'split-duo'
  | 'vocab'
  | 'pace'
  | 'unit'
  | 'dictation'
  | 'pricing'

export type FamilyVisualMeta = {
  recipe: FamilyRecipe
  /** Existing public asset — no generation */
  image: string
  imageAlt: Record<'en' | 'fr' | 'de', string>
  mediaCaption: Record<'en' | 'fr' | 'de', string>
  /** Flip media column to the right on large screens */
  mediaRight?: boolean
}

export const familyVisualMeta: Record<SpecialtyFamilySlug, FamilyVisualMeta> = {
  surgical: {
    recipe: 'pathway',
    image: '/images/CHUV.webp',
    imageAlt: {
      en: 'Hospital corridor and clinical setting',
      fr: 'Couloir d’hôpital et environnement clinique',
      de: 'Krankenhausflur und klinisches Umfeld',
    },
    mediaCaption: {
      en: 'Theatre → ward → coded discharge — one continuous pathway.',
      fr: 'Bloc → étage → sortie codée — un parcours continu.',
      de: 'OP → Station → kodierte Entlassung — ein durchgängiger Pfad.',
    },
  },
  'medical-surgical': {
    recipe: 'split-duo',
    image: '/images/visite-medicale.jpg',
    imageAlt: {
      en: 'Clinician with patient during a consultation',
      fr: 'Médecin avec un patient en consultation',
      de: 'Arzt und Patient während einer Konsultation',
    },
    mediaCaption: {
      en: 'Outpatient volume first — operative report ready when scheduled.',
      fr: 'Volume ambulatoire d’abord — compte rendu opératoire prêt si programmé.',
      de: 'Ambulantes Volumen zuerst — OP-Bericht bereit, wenn geplant.',
    },
    mediaRight: true,
  },
  medical: {
    recipe: 'vocab',
    image: '/images/visite-medicale.jpg',
    imageAlt: {
      en: 'Medical consultation in practice',
      fr: 'Consultation médicale en cabinet',
      de: 'Ärztliche Konsultation in der Praxis',
    },
    mediaCaption: {
      en: 'Specialty vocabulary in the report, letter, and follow-up — not a generic note.',
      fr: 'Vocabulaire de spécialité dans le compte rendu, la lettre et le suivi.',
      de: 'Fachvokabular in Bericht, Brief und Verlauf — kein generischer Text.',
    },
  },
  'primary-care': {
    recipe: 'pace',
    image: '/images/adopt_ai_11.25_-_3.jpg',
    imageAlt: {
      en: 'Clinicians reviewing documentation on a laptop',
      fr: 'Cliniciens consultant la documentation sur un ordinateur',
      de: 'Ärztinnen prüfen Dokumentation am Laptop',
    },
    mediaCaption: {
      en: 'Finished before the next patient — concise note, certificate, letter.',
      fr: 'Terminé avant le patient suivant — note concise, certificat, lettre.',
      de: 'Fertig vor dem nächsten Patienten — knappe Notiz, Zeugnis, Brief.',
    },
    mediaRight: true,
  },
  'acute-care': {
    recipe: 'unit',
    image: '/images/CHUV.webp',
    imageAlt: {
      en: 'Hospital unit environment',
      fr: 'Environnement d’unité hospitalière',
      de: 'Krankenhausstation',
    },
    mediaCaption: {
      en: 'Unit handoffs, triage, and ICU notes — documents that match how the floor runs.',
      fr: 'Transmissions, triage et notes de réa — des documents calés sur le rythme de l’unité.',
      de: 'Übergaben, Triage und ITS-Notizen — Dokumente im Rhythmus der Station.',
    },
  },
  diagnostics: {
    recipe: 'dictation',
    image: '/images/radiology_mode_02.26.jpg',
    imageAlt: {
      en: 'DocNote radiology / diagnostics reporting mode',
      fr: 'Mode radiologie / diagnostics DocNote',
      de: 'DocNote Radiologie- / Diagnostikmodus',
    },
    mediaCaption: {
      en: 'Dictate once into the house template — proofreading stays one tap away.',
      fr: 'Dictez une fois dans le modèle maison — la relecture reste à un tap.',
      de: 'Einmal in die Hausvorlage diktieren — Korrekturlesen einen Tip entfernt.',
    },
    mediaRight: true,
  },
  'allied-health': {
    recipe: 'pricing',
    image: '/images/mediway_integration_02.26.jpg',
    imageAlt: {
      en: 'Practice software integration with DocNote',
      fr: 'Intégration logicielle cabinet avec DocNote',
      de: 'Praxissystem-Integration mit DocNote',
    },
    mediaCaption: {
      en: 'Named for the job — including dental act pricing where it matters.',
      fr: 'Au nom du métier — y compris la tarification des actes dentaires.',
      de: 'Im Namen des Berufs — inkl. zahnärztlicher Leistungstarifierung.',
    },
  },
}

export const getFamilyVisual = (slug: SpecialtyFamilySlug): FamilyVisualMeta =>
  familyVisualMeta[slug]

export const familyVisualCopy = (
  meta: FamilyVisualMeta,
  locale: Locale
): { imageAlt: string; mediaCaption: string } => {
  const key = locale === 'fr' || locale === 'de' ? locale : 'en'
  return {
    imageAlt: meta.imageAlt[key],
    mediaCaption: meta.mediaCaption[key],
  }
}
