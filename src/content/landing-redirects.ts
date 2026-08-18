/**
 * Retired solution landings → canonical replacement (301).
 * Kept dependency-free so astro.config.mjs can import it at build time.
 * Applied for every locale prefix (see astro.config.mjs + public/_redirects).
 */
export const landingRedirects: Record<string, string> = {
  'ambient-clinical-documentation': 'ai-medical-scribe',
  'ai-clinical-documentation': 'ai-medical-scribe',
  'ai-consultation-notes': 'ai-soap-notes',
  'multilingual-ai-medical-scribe': 'multilingual-medical-documentation',
}

export const retiredLandingSlugs = Object.keys(landingRedirects)
