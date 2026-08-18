import { getSpecialtyFamily, type SpecialtyFamilySlug } from './specialty-families'
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
  /** Flip media column to the right on large screens */
  mediaRight?: boolean
}

export const familyVisualMeta: Record<SpecialtyFamilySlug, FamilyVisualMeta> = {
  surgical: {
    recipe: 'pathway',
    image: '/images/CHUV.webp',
  },
  'medical-surgical': {
    recipe: 'split-duo',
    image: '/images/University of Pennsylvania.avif',
    mediaRight: true,
  },
  medical: {
    recipe: 'vocab',
    image: '/images/remise-prix-lumiere-2023.jpg',
  },
  'primary-care': {
    recipe: 'pace',
    image: '/images/visite-medicale.jpg',
    mediaRight: true,
  },
  'acute-care': {
    recipe: 'unit',
    image: '/images/Chinese nurses.jpg',
  },
  diagnostics: {
    recipe: 'dictation',
    image: '/images/radiology_mode_02.26.jpg',
    mediaRight: true,
  },
  'allied-health': {
    recipe: 'pricing',
    image: '/images/CHU Bordeaux.jpg',
  },
}

export const getFamilyVisual = (slug: SpecialtyFamilySlug): FamilyVisualMeta =>
  familyVisualMeta[slug]

/** Localized alt / caption now live in the specialty-families bundle (per family `visual`). */
export const familyVisualCopy = (
  slug: SpecialtyFamilySlug,
  locale: Locale
): { imageAlt: string; mediaCaption: string } => {
  const copy = getSpecialtyFamily(slug, locale)
  const en = getSpecialtyFamily(slug, 'en')
  return {
    imageAlt: copy.visual?.imageAlt || en.visual?.imageAlt || '',
    mediaCaption: copy.visual?.mediaCaption || en.visual?.mediaCaption || '',
  }
}
