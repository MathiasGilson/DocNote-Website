export const CATEGORY_ORDER = ['news', 'ai', 'documentation', 'practice'] as const;

export type BlogCategory = (typeof CATEGORY_ORDER)[number];

export interface CategoryMeta {
  eyebrow: string;
  badge: string;
}

export const CATEGORY_META: Record<BlogCategory, CategoryMeta> = {
  news: {
    eyebrow: 'text-sky-600',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  ai: {
    eyebrow: 'text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  documentation: {
    eyebrow: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  practice: {
    eyebrow: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

export const FALLBACK_META: CategoryMeta = {
  eyebrow: 'text-slate-500',
  badge: 'bg-slate-50 text-slate-700 border-slate-200',
};

export interface CategoryPost {
  category: string;
  date: string;
}

export interface CategoryGroup<T extends CategoryPost> {
  category: BlogCategory | string;
  posts: T[];
}

export const groupPostsByCategory = <T extends CategoryPost>(posts: T[]): CategoryGroup<T>[] => {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const key = post.category || 'other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(post);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const known = CATEGORY_ORDER.filter((c) => groups.has(c));
  const extras = [...groups.keys()]
    .filter((c) => !(CATEGORY_ORDER as readonly string[]).includes(c))
    .sort((a, b) => groups.get(b)!.length - groups.get(a)!.length);

  return [...known, ...extras].map((category) => ({
    category,
    posts: groups.get(category)!,
  }));
};
