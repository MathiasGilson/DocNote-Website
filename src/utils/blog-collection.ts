import { getCollection, type CollectionEntry } from 'astro:content';
import { buildTranslationMap, getPostSlug, PAGE_SIZE, paginatePosts } from './blog';
import { getLocalizedPath, locales, type Locale } from './i18n';
import { absoluteUrl } from './seo';

export type BlogEntry = CollectionEntry<'blog'>;

export function getPostLocale(entry: BlogEntry): Locale {
  return entry.id.split('/')[0] as Locale;
}

export async function getPostsForLocale(locale: Locale): Promise<BlogEntry[]> {
  const all = await getCollection('blog', ({ id, data }) => id.startsWith(`${locale}/`) && !data.noindex);
  return all.sort((a, b) => b.data.date.localeCompare(a.data.date));
}

let translationMapPromise: Promise<Map<string, Partial<Record<Locale, string>>>> | null = null;

function getTranslationMap() {
  translationMapPromise ??= getCollection('blog').then((entries) =>
    buildTranslationMap(
      entries.map((e) => ({ locale: getPostLocale(e), slug: getPostSlug(e.id), translationKey: e.data.translationKey }))
    )
  );
  return translationMapPromise;
}

export async function getBlogAlternateUrls(translationKey: string): Promise<Partial<Record<Locale, string>>> {
  const group = (await getTranslationMap()).get(translationKey) ?? {};
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    const slug = group[locale];
    if (slug) out[locale] = absoluteUrl(getLocalizedPath(`/blog/${slug}`, locale));
  }
  return out;
}

export async function getPaginationPresence() {
  const pageCounts = Object.fromEntries(
    await Promise.all(
      locales.map(async (l) => [l, paginatePosts(await getPostsForLocale(l), PAGE_SIZE).length] as const)
    )
  ) as Record<Locale, number>;
  return { pageCounts, maxPages: Math.max(...Object.values(pageCounts)) };
}

export function paginationAlternates(page: number, pageCounts: Record<Locale, number>): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of locales) if (pageCounts[l] >= page) out[l] = absoluteUrl(getLocalizedPath(`/blog/page/${page}`, l));
  return out;
}
