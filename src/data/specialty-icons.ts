/** Stable keys — index-aligned with `specialties.items` in all locale JSON files. */
export const SPECIALTY_KEYS = [
  'general-practice',
  'internal-medicine',
  'cardiology',
  'dermatology',
  'endocrinology',
  'gastroenterology',
  'neurology',
  'oncology',
  'orthopedics',
  'pediatrics',
  'psychiatry',
  'pulmonology',
  'rheumatology',
  'surgery',
  'urology',
  'emergency-medicine',
] as const

export type SpecialtyKey = (typeof SPECIALTY_KEYS)[number]

/** Outline path markup for 24×24 viewBox icons (stroke via parent SVG). */
const ICONS: Record<SpecialtyKey, string> = {
  'general-practice':
    '<path d="M11 4a2 2 0 114 0v4.5a1 1 0 001 1H19a2 2 0 110 4h-3a1 1 0 00-1 1V20a2 2 0 11-4 0v-5.5a1 1 0 00-1-1H7a2 2 0 110-4h3a1 1 0 001-1V4z"/>',
  'internal-medicine':
    '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z"/><path d="M9 12h6M9 16h4"/>',
  cardiology:
    '<path d="M19.5 12.6l-7.1 7.1a.6.6 0 01-.8 0L4.5 12.6a5 5 0 117.1-7.1l.4.4.4-.4a5 5 0 017.1 7.1z"/>',
  dermatology:
    '<path d="M7 14c0-3.5 2.2-6 5-7.5 2.8 1.5 5 4 5 7.5a5 5 0 11-10 0z"/><path d="M10 15.5c.6.8 1.4 1.3 2.3 1.3"/>',
  endocrinology:
    '<path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/>',
  gastroenterology:
    '<path d="M8 5c0 0 1.5-1.5 4-1.5S16 5 16 5"/><path d="M8 5c-2.5 1-3.5 3.5-2.5 6.5S8 16 8 16c0 2.5 1.8 4 4 4s4-1.5 4-4c0 0 1.5-1.5 2.5-4.5S15.5 6 16 5"/><path d="M10 11c1 .8 3 .8 4 0"/>',
  neurology:
    '<path d="M12 4c-2.2 0-4 1.6-4 3.8 0 1.2.5 2.2 1.3 2.9-.5.6-.8 1.4-.8 2.3 0 1.7 1.2 3.1 2.8 3.5V19a1 1 0 002 0v-2.5c1.6-.4 2.8-1.8 2.8-3.5 0-.9-.3-1.7-.8-2.3.8-.7 1.3-1.7 1.3-2.9C16 5.6 14.2 4 12 4z"/><path d="M10.2 9.2c.5-.4 1.1-.6 1.8-.6s1.3.2 1.8.6"/>',
  oncology:
    '<path d="M12 21v-6"/><path d="M12 15c-2.2-.2-4-1.8-4-4 0-1.5 1-2.8 2.4-3.4C9.8 6.2 9.2 4.8 9.2 3.5c0-.3.2-.5.5-.5.8 0 1.6.4 2.3 1.1.7-.7 1.5-1.1 2.3-1.1.3 0 .5.2.5.5 0 1.3-.6 2.7-1.2 3.6C14.9 8.2 16 9.5 16 11c0 2.2-1.8 3.8-4 4z"/>',
  orthopedics:
    '<path d="M9.5 4.5c1-1 2.6-1.2 3.8-.3l5.5 4.2c1.2.9 1.4 2.6.5 3.8l-1.2 1.6M14.5 19.5c-1 1-2.6 1.2-3.8.3l-5.5-4.2c-1.2-.9-1.4-2.6-.5-3.8l1.2-1.6"/><path d="M8 12l4 3 4-3"/>',
  pediatrics:
    '<circle cx="12" cy="8" r="3"/><path d="M7 20v-1a5 5 0 0110 0v1"/><path d="M9 13.5c.8.6 1.8 1 3 1s2.2-.4 3-1"/>',
  psychiatry:
    '<path d="M12 4a6 6 0 00-6 6c0 2.2 1.2 4.1 3 5.2V18a1 1 0 001 1h4a1 1 0 001-1v-2.8c1.8-1.1 3-3 3-5.2a6 6 0 00-6-6z"/><path d="M10 11.5h.01M14 11.5h.01M10.5 14c.5.5 1.2.8 1.5.8s1-.3 1.5-.8"/>',
  pulmonology:
    '<path d="M12 20V10"/><path d="M12 14c-1.5-2-3.5-3.2-5.2-3.5C4.5 10.1 3 8.2 3 6.2 3 4.5 4.3 3 6 3c1.5 0 2.7 1 3.2 2.4"/><path d="M12 14c1.5-2 3.5-3.2 5.2-3.5C19.5 10.1 21 8.2 21 6.2 21 4.5 19.7 3 18 3c-1.5 0-2.7 1-3.2 2.4"/>',
  rheumatology:
    '<path d="M8 14V9a2 2 0 014 0v1"/><path d="M12 10V8a2 2 0 014 0v6"/><path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4"/><path d="M7 17l-1.5 2.5M17 17l1.5 2.5"/>',
  surgery:
    '<path d="M14.5 4.5l5 5"/><path d="M16.5 6.5L8 15l-2 4 4-2 8.5-8.5"/><path d="M6 18l-1.5 1.5"/>',
  urology:
    '<path d="M12 21c-3.5-2.2-6-5.2-6-8.5C6 8.5 8.7 6 12 6s6 2.5 6 6.5c0 3.3-2.5 6.3-6 8.5z"/><path d="M12 6V3M10 3h4"/>',
  'emergency-medicine':
    '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
}

const FALLBACK =
  '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'

export const specialtyIconMarkup = (key: string | undefined): string => {
  if (key && key in ICONS) return ICONS[key as SpecialtyKey]
  return FALLBACK
}

export const specialtyKeyAt = (index: number): SpecialtyKey | undefined =>
  SPECIALTY_KEYS[index]
