import { describe, expect, it } from 'vitest';
import { buildTranslationMap, estimateReadingTime, getPostSlug, paginatePosts, pickRelatedPosts } from './blog';

describe('getPostSlug', () => {
  it('strips the locale folder and extension', () => {
    expect(getPostSlug('en/soap-notes-best-practices.md')).toBe('soap-notes-best-practices');
    expect(getPostSlug('fr/docnote-mode-radiologie')).toBe('docnote-mode-radiologie');
  });
});

describe('estimateReadingTime', () => {
  it('rounds up at 200 words per minute with a floor of 1', () => {
    expect(estimateReadingTime('one two three')).toBe(1);
    expect(estimateReadingTime(Array(401).fill('word').join(' '))).toBe(3);
  });
  it('ignores markdown syntax and image lines', () => {
    expect(estimateReadingTime('# Title\n\n![alt](/images/x.jpg)\n\n**bold** text here')).toBe(1);
  });
});

describe('paginatePosts', () => {
  it('splits into fixed-size pages, last page shorter', () => {
    expect(paginatePosts([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it('returns one empty page for no items', () => {
    expect(paginatePosts([], 12)).toEqual([[]]);
  });
});

describe('pickRelatedPosts', () => {
  const posts = [
    { slug: 'a', category: 'guides', tags: ['soap', 'notes'], date: '2026-01-01' },
    { slug: 'b', category: 'guides', tags: ['soap'], date: '2026-02-01' },
    { slug: 'c', category: 'news', tags: ['soap', 'notes'], date: '2026-03-01' },
    { slug: 'd', category: 'compliance', tags: [], date: '2026-04-01' },
    { slug: 'e', category: 'guides', tags: [], date: '2026-05-01' },
  ];
  it('prefers same category, then shared tags, then recency, and excludes itself', () => {
    expect(pickRelatedPosts(posts[0], posts, 3).map((p) => p.slug)).toEqual(['b', 'e', 'c']);
  });
  it('respects the limit', () => {
    expect(pickRelatedPosts(posts[0], posts, 1)).toHaveLength(1);
  });
});

describe('buildTranslationMap', () => {
  it('groups slugs by translationKey', () => {
    const map = buildTranslationMap([
      { locale: 'en', slug: 'soap-notes', translationKey: 'soap-notes' },
      { locale: 'fr', slug: 'notes-soap', translationKey: 'soap-notes' },
    ]);
    expect(map.get('soap-notes')).toEqual({ en: 'soap-notes', fr: 'notes-soap' });
  });
  it('throws on duplicate locale for a key', () => {
    expect(() =>
      buildTranslationMap([
        { locale: 'en', slug: 'a', translationKey: 'k' },
        { locale: 'en', slug: 'b', translationKey: 'k' },
      ])
    ).toThrow(/duplicate/);
  });
  it('throws when a key has no English entry', () => {
    expect(() => buildTranslationMap([{ locale: 'fr', slug: 'a', translationKey: 'k' }])).toThrow(/no English/);
  });
});
