# seuksa.github.io

Static site for **សិក្សា Seuksa** (education blog, Q&A, stories, quotes) and its sister book library
**និទាន Nitean** (Khmer folktales and collections), rebuilt from the `seuksa-nitean` Markdown archive.

Stack: Astro 7 (static) · Vue 3 islands · PrimeVue 4 (Aura preset) · Tailwind CSS 4 + Typography.

## Site structure

| URL | What |
| --- | --- |
| `/` | Seuksa home – sections, latest posts, quote spotlight, link to Nitean |
| `/blog/`, `/answers/`, `/stories/`, `/quotes/` | Section indexes with filter / category / year / pagination |
| `/<section>/<slug>/` | Article, story, Q&A or quote |
| `/tags/`, `/tags/<tag>/` | Topics across all Seuksa sections |
| `/about/`, `/phnom-penh-postal-codes/`, `/app-privacy/` | Pages |
| `/nitean/` | Library shelf (warm “paper” theme, serif Khmer reading font) |
| `/nitean/<book>/` | Book overview + table of contents by part |
| `/nitean/<book>/<chapter>/` | Reader: contents drawer, font size, prev/next, progress |
| `/search/` | Client-side search over both brands (`/search.json`) |
| `/rss.xml`, `/sitemap-index.xml` | Feeds |

Seuksa = short-form content (indigo theme). Nitean = anything read as a book (amber theme).
Both brands share one PrimeVue preset; `<html data-brand>` switches the `--brand-*` / `--surface-*` palettes
in `src/styles/global.css`, which feed both PrimeVue and the Tailwind `primary-*` / `surface-*` utilities.

## Content

Content in `src/content/` and images in `public/media/` are **generated** – don't edit them by hand:

```sh
npm run import        # reads ../seuksa-nitean/content (or: npm run import -- <path>, or $SEUKSA_CONTENT)
```

`scripts/import-content.mjs` keeps only value content and writes `scripts/import-report.json` with every
skipped file and the reason. Skipped: drafts, untitled posts, WordPress/Pressbooks placeholders
(Hello world, Sample page, “This is the first chapter…”), login/cart/theme pages, very short posts,
sub-sites with no articles (directory, dictionary, docs, kids, quiz, king, live, news, profile, tags),
Nitean books without real chapters (asteptouniversity, edunotes, highschool, sabaynovels),
the excluded book `wordoflife` (see `EXCLUDED_BOOKS`),
nitean.com announcements, and bestatjob / lomor (not part of this site).
Section mapping, length thresholds and book titles/descriptions are configured at the top of the script.

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run check     # type check
```

Using a new PrimeVue component? Add its `primevue/<name>/style` import to `src/pages/primevue.css.ts`
so its CSS is pre-rendered (otherwise it is only styled after hydration).

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`
(set *Settings → Pages → Source* to **GitHub Actions**).
