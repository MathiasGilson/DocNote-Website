// rehype plugin: relocalize internal links inside blog markdown bodies.
//
// Translators sometimes write internal links as bare EN-style paths
// (`/pricing/`, `/ai-medical-scribe/`) with no locale prefix, or invent a
// literal translated path segment that doesn't exist as a route
// (`/prissättning/`, `/sjukhusdokumentation/`, `/ai-medisinsk-skriver/`).
// Both produce internal 404s for every non-English locale.
//
// This plugin runs at build time on every content-collection markdown file,
// so it self-heals all locales x all posts, including future translations
// that repeat the same mistake.
//
// IMPORTANT: keep LOCALES/DEFAULT_LOCALE in sync with `src/utils/i18n.ts`.
// Duplicated here (not imported) because astro.config.mjs's markdown
// pipeline runs outside the app's Vite/content-collections module graph.
const LOCALES = [
  'en', 'zh', 'es', 'ar', 'pt', 'ja', 'ru', 'de',
  'fr', 'ko', 'it', 'hi', 'nl', 'th', 'sv', 'no',
]
const DEFAULT_LOCALE = 'en'

// Known mistranslated landing/page path segments -> canonical EN segment.
const BAD_SEGMENT_MAP = {
  'ai-medicinsk-skrivare': 'ai-medical-scribe',
  'ai-medisinsk-scribe': 'ai-medical-scribe',
  'ai-medisinsk-skriver': 'ai-medical-scribe',
  'sjukhusdokumentation': 'hospital-documentation',
  'sykehusdokumentasjon': 'hospital-documentation',
  'priser': 'pricing',
  'prissättning': 'pricing',
}

// Known mistranslated blog slugs -> canonical EN slug (the on-disk filename
// every non-FR/DE locale actually uses, per src/utils/blog-translations.ts).
const BAD_BLOG_SLUG_MAP = {
  'minska-lakarutmattning': 'reducing-physician-burnout',
  'mindre-tid-pa-dokumentation-ai-mer-vard': 'less-time-documenting-ai-more-care',
}

/** Locale from a content file path, e.g. …/content/blog/sv/foo.md → "sv". */
function localeFromPath(filePath) {
  if (typeof filePath !== 'string') return DEFAULT_LOCALE
  const m = filePath.replace(/\\/g, '/').match(/\/content\/blog\/([a-z]{2})\//)
  return m && LOCALES.includes(m[1]) ? m[1] : DEFAULT_LOCALE
}

function isSkippableHref(href) {
  if (typeof href !== 'string' || href.length === 0) return true
  if (!href.startsWith('/')) return true
  if (href.startsWith('//')) return true
  if (href.startsWith('/images/') || href.startsWith('/videos/')) return true
  return false
}

/** Rewrite one internal href for the given (non-default) locale. */
function relocalizeHref(href, locale) {
  const [pathPart, hashPart] = href.split('#')
  const segments = pathPart.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (segments.length === 0) return href

  // Already locale-prefixed (this locale or another) — leave untouched.
  if (LOCALES.includes(segments[0])) return href

  let newSegments
  if (segments[0] === 'blog') {
    const slug = segments.slice(1).join('/')
    const canonicalSlug = BAD_BLOG_SLUG_MAP[slug] || slug
    newSegments = canonicalSlug ? ['blog', canonicalSlug] : ['blog']
  } else {
    const canonicalFirst = BAD_SEGMENT_MAP[segments[0]] || segments[0]
    newSegments = [canonicalFirst, ...segments.slice(1)]
  }

  const newPath = `/${locale}/${newSegments.join('/')}/`
  return hashPart ? `${newPath}#${hashPart}` : newPath
}

export default function rehypeFixInternalLinks() {
  return (tree, file) => {
    const locale = localeFromPath(file?.history?.[0] || file?.path || '')
    if (locale === DEFAULT_LOCALE) return

    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return
      for (const child of node.children) {
        if (child?.type === 'element' && child.tagName === 'a' && child.properties) {
          const href = child.properties.href
          if (!isSkippableHref(href)) {
            child.properties.href = relocalizeHref(href, locale)
          }
        }
        walk(child)
      }
    }
    walk(tree)
  }
}
