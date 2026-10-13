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
| `/stats/`, `/stats/bac-ii/` | Statistics: Bac II results 1980–today (charts, table, sources; `.csv` / `.json` downloads) |
| `/quotes/embed/`, `/embed/quote.js`, `/api/quotes.json` | Quote embed builder, widget script and public quotes API |
| `/rss.xml`, `/sitemap-index.xml` | Feeds |

Seuksa = short-form content (indigo theme). Nitean = anything read as a book (amber theme).
Both brands share one PrimeVue preset; `<html data-brand>` switches the `--brand-*` / `--surface-*` palettes
in `src/styles/global.css`, which feed both PrimeVue and the Tailwind `primary-*` / `surface-*` utilities.

## Content

`src/content/seuksa/`, `pages/`, `nitean/` and `public/media/` are **generated** – don't edit them by hand.
New posts written for this site go in **`src/content/authored/<section>/<slug>.md`** (same front matter as the
imported posts); the importer never touches that folder.

Statistics live in typed data files, not Markdown: **`src/data/bac-ii.ts`** holds one row per exam year plus a
source registry. Add next year’s row and its sources there – the stats page, charts and downloads update on build.
Only official MoEYS figures (or reports quoting a MoEYS statement) go in; unpublished values stay `null`.

Re-import the archive:

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

### Custom domain: seuksa.com

The site is served at **https://seuksa.com** (`site` in `astro.config.mjs`, `SITE.url` in `src/lib/site.ts`,
and `public/CNAME`, which is copied into the build).

1. **DNS** at the seuksa.com registrar – remove the old records pointing to the previous server, then add:

   | Type | Host | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `<github-user>.github.io` |

   GitHub then redirects `www.seuksa.com` → `seuksa.com`.
2. **GitHub** – *Settings → Pages → Custom domain*: `seuksa.com`, wait for the DNS check, then tick
   **Enforce HTTPS** (the certificate can take up to an hour).
3. Recommended: verify the domain under your account’s *Settings → Pages → Verified domains*
   (a TXT record) so no other repository can claim it.

The old sub-domains (blog., quote., story., answer.seuksa.com …) are not served by this site; their content now
lives under `/blog/`, `/quotes/`, `/stories/` and `/answers/`.
