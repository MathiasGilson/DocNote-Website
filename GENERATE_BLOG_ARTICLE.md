# DocNote blog article format (Qualtir / PageUp style)

Canonical writing rules adapted from Qualtir `GENERATE_BLOG_ARTICLE.md`.  
Local `PageUp/` checkout is empty — use this file as the source of truth for DocNote.

## Length & structure

- **EN length**: 1500–2500 words
- Intro (1–2 paragraphs) with primary keyword in first 100 words
- **4–6 H2 sections** with H3s as needed
- Bullet/numbered lists for scanability
- **FAQ**: 4–6 `<details>` accordions (Qualtir HTML pattern)
- Conclusion + CTA to DocNote (trial / pricing / tutorial / relevant landing)
- **2–3 internal links** to other blog posts + 1–2 product landings (`/ai-medical-scribe/`, `/hospital-documentation/`, `/pricing/`, etc.)

## Typography gate

- No em-dash (—) or en-dash (–) in prose; use comma, colon, or period
- No semicolons in prose (except code)

## Frontmatter (DocNote schema)

```yaml
---
title: "SEO title"
excerpt: "150–160 char meta / deck"
category: "ai" # ai | documentation | practice | news
author: "Name"
authorRole: "Role"
authorImage: "/images/..." # or existing URL
image: "/images/..."
date: "YYYY-MM-DD"
readTime: 8
---
```

## FAQ pattern

```html
<details>
  <summary>Question?</summary>
  <p>Answer.</p>
</details>
```

## Locales

After EN is final, translate with:

```bash
OPEN_ROUTER_API_KEY=… node scripts/translate-blog.mjs --posts=SLUG --force
```

Locales: fr de it pt nl es ru hi no sv ar zh ko th ja

## Layout

Article UI: `src/components/pages/BlogPostPage.astro` (Qualtir-style TOC sidebar + `article-prose.css`).
