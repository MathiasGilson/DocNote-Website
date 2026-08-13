// rehype plugin: relocalize internal links inside blog markdown bodies,
// ensure trailing slashes (site uses trailingSlash: 'always'), and demote
// body <h1> → <h2> so the template title remains the sole page H1.
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
  if (href.startsWith('/images/') || href.startsWith('/videos/') || href.startsWith('/fonts/')) return true
  return false
}

function ensureTrailingSlash(pathPart) {
  if (!pathPart || pathPart === '/') return '/'
  // Keep extension-looking paths as-is (e.g. /llms.txt).
  const last = pathPart.split('/').filter(Boolean).pop() || ''
  if (last.includes('.')) return pathPart
  return pathPart.endsWith('/') ? pathPart : `${pathPart}/`
}

/** Rewrite one internal href for the given locale; always trailing-slash page paths. */
function normalizeHref(href, locale) {
  const [pathPart, hashPart] = href.split('#')
  const segments = pathPart.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)

  let newPath
  if (segments.length === 0) {
    newPath = locale === DEFAULT_LOCALE ? '/' : `/${locale}/`
  } else if (LOCALES.includes(segments[0])) {
    // Already locale-prefixed — only normalize slash.
    newPath = ensureTrailingSlash(`/${segments.join('/')}`)
  } else if (locale === DEFAULT_LOCALE) {
    if (segments[0] === 'blog') {
      const slug = segments.slice(1).join('/')
      const canonicalSlug = BAD_BLOG_SLUG_MAP[slug] || slug
      newPath = ensureTrailingSlash(canonicalSlug ? `/blog/${canonicalSlug}` : '/blog')
    } else {
      const canonicalFirst = BAD_SEGMENT_MAP[segments[0]] || segments[0]
      newPath = ensureTrailingSlash(`/${[canonicalFirst, ...segments.slice(1)].join('/')}`)
    }
  } else if (segments[0] === 'blog') {
    const slug = segments.slice(1).join('/')
    const canonicalSlug = BAD_BLOG_SLUG_MAP[slug] || slug
    newPath = ensureTrailingSlash(
      canonicalSlug ? `/${locale}/blog/${canonicalSlug}` : `/${locale}/blog`
    )
  } else {
    const canonicalFirst = BAD_SEGMENT_MAP[segments[0]] || segments[0]
    newPath = ensureTrailingSlash(`/${locale}/${[canonicalFirst, ...segments.slice(1)].join('/')}`)
  }

  return hashPart ? `${newPath}#${hashPart}` : newPath
}

function demoteBodyH1(tree) {
  const walk = (node) => {
    if (!node || !Array.isArray(node.children)) return
    for (const child of node.children) {
      if (child?.type === 'element' && child.tagName === 'h1') {
        child.tagName = 'h2'
      }
      walk(child)
    }
  }
  walk(tree)
}

/** Add width/height on markdown <img> to reduce CLS (SF / Lighthouse unsized-images). */
function ensureImgDimensions(tree) {
  const walk = (node) => {
    if (!node || !Array.isArray(node.children)) return
    for (const child of node.children) {
      if (child?.type === 'element' && child.tagName === 'img' && child.properties) {
        const props = child.properties
        if (props.width == null) props.width = 1200
        if (props.height == null) props.height = 675
        if (!props.loading) props.loading = 'lazy'
        if (!props.decoding) props.decoding = 'async'
      }
      walk(child)
    }
  }
  walk(tree)
}

export default function rehypeFixInternalLinks() {
  return (tree, file) => {
    const locale = localeFromPath(file?.history?.[0] || file?.path || '')

    demoteBodyH1(tree)
    ensureImgDimensions(tree)

    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return
      for (const child of node.children) {
        if (child?.type === 'element' && child.tagName === 'a' && child.properties) {
          const href = child.properties.href
          if (!isSkippableHref(href)) {
            child.properties.href = normalizeHref(href, locale)
          }
        }
        walk(child)
      }
    }
    walk(tree)
  }
}
