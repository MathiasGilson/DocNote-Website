export const BLOG_PAGE_SIZE = 15;

export const getBlogPageCount = (total: number, pageSize = BLOG_PAGE_SIZE) =>
  Math.max(1, Math.ceil(total / pageSize));

export const paginateItems = <T,>(items: T[], page: number, pageSize = BLOG_PAGE_SIZE) => {
  const totalPages = getBlogPageCount(items.length, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total: items.length,
    items: items.slice(start, start + pageSize),
  };
};
