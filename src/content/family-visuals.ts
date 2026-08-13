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
      en: 'Modern university hospital campus with terrace gardens',
      fr: 'Campus d’hôpital universitaire moderne avec jardins en terrasse',
      de: 'Moderner Universitätsklinik-Campus mit Terrassengärten',
    },
    mediaCaption: {
      en: 'Theatre → ward → coded discharge — one continuous pathway.',
      fr: 'Bloc → étage → sortie codée — un parcours continu.',
      de: 'OP → Station → kodierte Entlassung — ein durchgängiger Pfad.',
    },
  },
  'medical-surgical': {
    recipe: 'split-duo',
    image: '/images/University of Pennsylvania.avif',
    imageAlt: {
      en: 'Historic academic medical campus buildings in autumn',
      fr: 'Bâtiments historiques d’un campus médical universitaire en automne',
      de: 'Historischer akademischer Medizin-Campus im Herbst',
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
    image: '/images/remise-prix-lumiere-2023.jpg',
    imageAlt: {
      en: 'Clinicians at a general internal medicine award ceremony',
      fr: 'Cliniciens lors d’une cérémonie de prix en médecine interne générale',
      de: 'Ärztinnen und Ärzte bei einer Preisverleihung der Allgemeinen Inneren Medizin',
    },
    mediaCaption: {
      en: 'Specialty vocabulary in the report, letter, and follow-up — not a generic note.',
      fr: 'Vocabulaire de spécialité dans le compte rendu, la lettre et le suivi.',
      de: 'Fachvokabular in Bericht, Brief und Verlauf — kein generischer Text.',
    },
  },
  'primary-care': {
    recipe: 'pace',
    image: '/images/visite-medicale.jpg',
    imageAlt: {
      en: 'Clinician reviewing a bedside monitor with a patient',
      fr: 'Clinicien examinant un moniteur au lit avec un patient',
      de: 'Behandelnde Person zeigt einer Patientin einen Monitor am Bett',
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
    image: '/images/Chinese nurses.jpg',
    imageAlt: {
      en: 'Nursing team reviewing a chart together on the unit',
      fr: 'Équipe infirmière consultant ensemble un dossier dans l’unité',
      de: 'Pflegeteam bespricht gemeinsam eine Akte auf der Station',
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
      en: 'Clinician reviewing diagnostic imaging on a workstation',
      fr: 'Clinicien examinant des images diagnostiques sur un poste',
      de: 'Ärztin prüft diagnostische Bildgebung am Arbeitsplatz',
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
    image: '/images/CHU Bordeaux.jpg',
    imageAlt: {
      en: 'Hospital campus exterior with clinical buildings',
      fr: 'Extérieur d’un campus hospitalier avec bâtiments cliniques',
      de: 'Krankenhauscampus von außen mit Klinikgebäuden',
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
