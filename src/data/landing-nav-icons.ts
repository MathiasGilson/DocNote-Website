import type { LandingSlug } from '../content/landings'
import { specialtyIconMarkup, type SpecialtyKey } from './specialty-icons'

/** Outline path markup for 24×24 viewBox icons (stroke via parent SVG). */
const ICONS: Partial<Record<LandingSlug, string>> = {
  'ai-medical-scribe':
    '<path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/>',
  'hospital-documentation':
    '<path d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14"/><path d="M9 21v-4h6v4M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>',
  'clinical-compliance':
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  'ambient-clinical-documentation':
    '<path d="M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  'ai-clinical-documentation':
    '<path d="M8 4h6l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M14 4v4h4M9 13h6M9 17h4"/>',
  'ai-soap-notes':
    '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"/><path d="M9 12h6M9 16h4"/>',
  'ai-medical-transcription':
    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6"/>',
  'ai-discharge-summary':
    '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  'operative-report-ai':
    '<path d="M14.5 4.5l5 5"/><path d="M16.5 6.5L8 15l-2 4 4-2 8.5-8.5"/><path d="M6 18l-1.5 1.5"/>',
  'ai-consultation-notes':
    '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8M8 13h5"/>',
  'multilingual-ai-medical-scribe':
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
}

const FALLBACK =
  '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'

const SPECIALTY_KEY_BY_SLUG: Partial<Record<LandingSlug, SpecialtyKey>> = {
  'ai-scribe-general-practice': 'general-practice',
  'ai-scribe-psychiatry': 'psychiatry',
  'ai-scribe-cardiology': 'cardiology',
  'ai-scribe-pediatrics': 'pediatrics',
  'ai-scribe-emergency-medicine': 'emergency-medicine',
  'ai-scribe-surgery': 'surgery',
  'ai-scribe-dermatology': 'dermatology',
  'ai-scribe-neurology': 'neurology',
}

export const landingNavIconMarkup = (slug: LandingSlug): string => {
  if (ICONS[slug]) return ICONS[slug]!
  const specialtyKey = SPECIALTY_KEY_BY_SLUG[slug]
  if (specialtyKey) return specialtyIconMarkup(specialtyKey)
  return FALLBACK
}
