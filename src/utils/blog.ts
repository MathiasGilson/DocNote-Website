import type { Locale } from './i18n';

export const PAGE_SIZE = 12;

export function getPostSlug(id: string): string {
  return id.split('/').slice(1).join('/').replace(/\.mdx?$/, '');
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(markdown: string): number {
  const text = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/[#>*_`~\-|]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function paginatePosts<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
  return pages;
}

export type RelatedInput = { slug: string; category: string; tags?: string[]; date: string };

export function pickRelatedPosts<T extends RelatedInput>(current: T, all: T[], limit = 3): T[] {
  const currentTags = new Set(current.tags ?? []);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const sharedTags = (p.tags ?? []).filter((t) => currentTags.has(t)).length;
      return { p, score: (p.category === current.category ? 10 : 0) + sharedTags };
    })
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map(({ p }) => p);
}

export type TranslationInput = { locale: Locale; slug: string; translationKey: string };

export function buildTranslationMap(entries: TranslationInput[]): Map<string, Partial<Record<Locale, string>>> {
  const map = new Map<string, Partial<Record<Locale, string>>>();
  for (const { locale, slug, translationKey } of entries) {
    const group = map.get(translationKey) ?? {};
    if (group[locale]) {
      throw new Error(`Blog: duplicate translationKey "${translationKey}" for locale ${locale} (${group[locale]} and ${slug})`);
    }
    group[locale] = slug;
    map.set(translationKey, group);
  }
  for (const [key, group] of map) {
    if (!group.en) throw new Error(`Blog: translationKey "${key}" has no English entry (x-default needs one)`);
  }
  return map;
}
