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
  'for-private-practice':
    '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M10 21v-6h4v6M12 9v3M10.5 10.5h3"/>',
  'for-medical-secretaries':
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M15 4h6M15 8h6M15 12h4"/>',
  'for-clinic-groups':
    '<path d="M3 21h18"/><path d="M4 21V10l4-3 4 3v11M12 21V7l4-3 4 3v14"/><path d="M7 14h.01M15 12h.01M15 16h.01"/>',
  'medical-coding-and-billing':
    '<path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M15 3v4h4M8 12h8M8 16h5"/><path d="M8 8h3"/>',
  'ehr-integration':
    '<rect x="3" y="4" width="8" height="6" rx="1.5"/><rect x="13" y="14" width="8" height="6" rx="1.5"/><path d="M11 7h4a2 2 0 012 2v5"/><path d="M13 12l4 2-4 2"/>',
  'custom-word-templates':
    '<path d="M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5"/><path d="M9 13l1.5 5 1.5-4 1.5 4 1.5-5"/>',
  'clinical-context':
    '<path d="M21 12.5V7a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7"/><path d="M15 17h6M18 14v6"/>',
  'day-hospital-documentation':
    '<circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/><path d="M3 15a5 5 0 0110 0M11 15a5 5 0 0110 0"/><path d="M12 15v6M9 21h6"/>',
  'multilingual-medical-documentation':
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
  'ai-soap-notes':
    '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"/><path d="M9 12h6M9 16h4"/>',
  'ai-medical-transcription':
    '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6"/>',
  'ai-discharge-summary':
    '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  'operative-report-ai':
    '<path d="M14.5 4.5l5 5"/><path d="M16.5 6.5L8 15l-2 4 4-2 8.5-8.5"/><path d="M6 18l-1.5 1.5"/>',
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
