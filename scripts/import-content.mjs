#!/usr/bin/env node
/**
 * Curated import of the seuksa-nitean Markdown archive into this Astro site.
 *
 *   node scripts/import-content.mjs [path/to/seuksa-nitean/content]
 *
 * Source defaults to ../seuksa-nitean/content (or $SEUKSA_CONTENT).
 * Writes:
 *   src/content/seuksa/<section>/<slug>.md    blog, quotes, stories, answers
 *   src/content/pages/<slug>.md               standalone Seuksa pages
 *   src/content/nitean/<book>/book.md         book metadata (+ parts) for the Nitean library
 *   src/content/nitean/<book>/chapters/*.md   front matter, chapters, back matter in reading order
 *   public/media/...                          only the images the imported content references
 *   scripts/import-report.json                what was imported and what was skipped (and why)
 *
 * Only "value" content is kept: drafts, untitled posts, WordPress/Pressbooks placeholders
 * (Hello world, Sample Page, "This is the first chapter…"), login/cart/theme-option pages,
 * empty sections and books without real chapters are skipped. Re-running replaces the output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(process.argv[2] || process.env.SEUKSA_CONTENT || path.join(ROOT, '../seuksa-nitean/content'));
const OUT = path.join(ROOT, 'src/content');
const MEDIA = path.join(ROOT, 'public/media');

if (!fs.existsSync(path.join(SRC, 'seuksa')) || !fs.existsSync(path.join(SRC, 'nitean'))) {
  console.error(`Source content not found at ${SRC} (expected seuksa/ and nitean/ inside).`);
  process.exit(1);
}

/* ------------------------------------------------------------------ config */

/** Seuksa sources → site sections. Everything else in content/seuksa is skipped as a whole. */
const SEUKSA_SOURCES = [
  { dir: 'seuksa/blog/posts', section: 'blog' },
  { dir: 'seuksa/reviews/posts', section: 'blog', category: 'University Reviews' },
  { dir: 'seuksa/quotes/posts', section: 'quotes' },
  { dir: 'seuksa/stories/posts', section: 'stories' },
  { dir: 'seuksa/education/answers/posts', section: 'answers' },
  { dir: 'seuksa/site/mcm-locations', section: 'answers', category: 'Places' },
];

/** Minimum length of readable text per section (quotes are short by nature). */
const MIN_TEXT = { blog: 200, stories: 200, answers: 80, quotes: 12 };

/** Standalone pages worth keeping (everything else under <section>/pages is login/cart/placeholder). */
const SEUKSA_PAGES = [
  { dir: 'seuksa/blog/pages/phnom-penh-postal-code', slug: 'phnom-penh-postal-codes' },
  { dir: 'seuksa/site/pages/app-privacy', slug: 'app-privacy', title: 'Seuksa App – Privacy Policy' },
];

const SKIPPED_SEUKSA_SECTIONS = {
  'seuksa/directory': 'only placeholder pages (Hello world, listing forms)',
  'seuksa/education/dictionary': 'only placeholder pages',
  'seuksa/education/docs': 'only placeholder pages',
  'seuksa/education/kids': 'only placeholder pages',
  'seuksa/education/quiz': 'only test posts',
  'seuksa/king': 'only theme options and photo stubs',
  'seuksa/live': 'Twitter widget pages, no articles',
  'seuksa/news': 'feed aggregator pages, no articles',
  'seuksa/profile': 'only placeholder pages',
  'seuksa/tags': 'only placeholder pages',
};

/** Nitean books left out on purpose, even though they have content. */
const EXCLUDED_BOOKS = {
  wordoflife: 'not needed on the new site',
};

/** Curated presentation for the Nitean books that have real content. */
const BOOKS = {
  folktales: {
    order: 1,
    title: 'ប្រជុំរឿងព្រេងនិទានខ្មែរ',
    subtitle: 'Khmer Folktales',
    lang: 'km',
    tone: 'amber',
  },
  anystory: {
    order: 2,
    title: 'រឿងពីនេះពីនោះ',
    subtitle: 'Stories from here and there',
    lang: 'km',
    tone: 'rose',
  },
  khmerheros: {
    order: 3,
    title: 'ប្រវត្តិវីរបុរសខ្មែរ',
    subtitle: 'Short History of Khmer Heroes',
    lang: 'km',
    tone: 'emerald',
    description:
      'A collection of articles about the lives of Khmer heroes. Each article keeps the copyright notice of its original source.',
  },
  eyesontech: {
    order: 4,
    title: 'Eyes on Building Tech Products',
    subtitle: 'Article Collection',
    lang: 'en',
    tone: 'slate',
  },
};

/* ----------------------------------------------------------------- helpers */

const report = { source: SRC, generated: new Date().toISOString(), imported: {}, skipped: [] };
const skip = (file, reason) => report.skipped.push({ file: rel(file), reason });
const count = (key) => (report.imported[key] = (report.imported[key] || 0) + 1);
const rel = (p) => path.relative(SRC, p).split(path.sep).join('/');

function walk(dir, pred) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, pred));
    else if (pred(p)) out.push(p);
  }
  return out.sort();
}

function read(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  return { data, body: content.replace(/\r\n/g, '\n').trim() };
}

/** qTranslate titles/bodies: `<!--:km-->…<!--:--><!--:en-->…<!--:-->` → Khmer (or English) part. */
function qtranslate(s = '') {
  if (!s.includes('<!--:')) return s;
  const parts = {};
  for (const m of s.matchAll(/<!--:(\w+)-->([\s\S]*?)<!--:-->/g)) parts[m[1]] = m[2].trim();
  return parts.km || parts.en || s.replace(/<!--:\w*-->/g, '');
}

const ZW = /[​-‍﻿]/g;
const cleanText = (s = '') => qtranslate(String(s)).replace(ZW, '').replace(/\s+/g, ' ').trim();

/** Readable text of a Markdown body (for length checks and excerpts). */
function plain(md) {
  return md
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\^\d+\]:?/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\|.*\|\s*$/gm, (row) => row.replace(/[|:-]+/g, ' '))
    .replace(/[#>*_`~\\]+/g, ' ')
    .replace(ZW, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(md, max = 180) {
  const t = plain(md);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
}

/** Slug safe for URLs and file names; keeps Khmer letters, drops zero-width chars and punctuation. */
function slugify(s) {
  let v = String(s || '');
  try {
    v = decodeURIComponent(v);
  } catch {}
  return v
    .normalize('NFC')
    .replace(ZW, '')
    .toLowerCase()
    .replace(/['’"“”]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function uniqueSlug(slug, used) {
  let s = slug || 'item';
  for (let i = 2; used.has(s); i++) s = `${slug}-${i}`;
  used.add(s);
  return s;
}

/**
 * Outbound links that moved since the article was written: old URL → current URL.
 * Applied on every import, so fixes survive re-running the importer.
 */
const LINK_REWRITES = {
  'http://www.phnompenhpost.com/index.php/2012061356778/LIFT/high-school-sweet-hearts-will-it-last-until-marriage.html':
    'https://phnompenhpost.com/business/high-school-sweet-hearts-will-it-last-until-marriage/',
  'http://www.phnompenhpost.com/index.php/2012062056905/LIFT/letter-to-the-editor.html':
    'https://phnompenhpost.com/business/letter-editor-2/',
};
const rewriteLinks = (md) => Object.entries(LINK_REWRITES).reduce((s, [from, to]) => s.split(from).join(to), md);

/** Turn legacy WordPress leftovers into clean Markdown. */
function cleanBody(md) {
  return (
    rewriteLinks(qtranslate(md))
      // WordPress tabs shortcode → headings
      .replace(/\\\[tab:END\\\]/g, '')
      .replace(/\\\[tab:(.+?)\\\]/g, (_, t) => `\n### ${t.replace(/\*\*/g, '').trim()}\n`)
      // dead Flash embeds and Facebook SDK roots
      .replace(/<object[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>(<\/embed>)?/gi, '')
      .replace(/<div id="fb-root">\s*<\/div>/gi, '')
      // Scribd iframes no longer render → plain link
      .replace(/<iframe[^>]*src="([^"]*scribd\.com[^"]*)"[^>]*>\s*<\/iframe>/gi, (_, src) => {
        const id = src.match(/embeds\/(\d+)/)?.[1];
        return id ? `[Read the full document on Scribd](https://www.scribd.com/document/${id})` : '';
      })
      .replace(/<iframe([^>]*)src="http:\/\//gi, '<iframe$1src="https://')
      // layout wrappers: unwrap so the Markdown inside renders
      .replace(/<\/?(div|span|body)\b[^>]*>/gi, '')
      .replace(/^\\---$/gm, '---')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/* ------------------------------------------------------------------- media */

const copied = new Map();

/** Copy a referenced local file into public/media/<bucket>/ and return its public URL. */
function media(fromDir, ref, bucket) {
  if (!ref || /^(https?:)?\/\//i.test(ref) || ref.startsWith('/') || ref.startsWith('#') || ref.startsWith('data:'))
    return null;
  let target = ref;
  try {
    target = decodeURIComponent(ref);
  } catch {}
  const abs = path.resolve(fromDir, target);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile() || abs.endsWith('.md')) return null;
  if (copied.has(abs)) return copied.get(abs);
  const name = path.basename(abs);
  const dest = path.join(MEDIA, ...bucket.split('/'), name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs, dest);
  const url = '/media/' + [...bucket.split('/'), name].map(encodeURIComponent).join('/');
  copied.set(abs, url);
  count('media files');
  return url;
}

function rewriteMedia(md, fromDir, bucket) {
  return md
    .replace(/(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (all, a, ref, b) => {
      const url = media(fromDir, ref, bucket);
      return url ? `${a}${url}${b}` : all;
    })
    .replace(/(\s(?:src|href)=")([^"]+)(")/g, (all, a, ref, b) => {
      const url = media(fromDir, ref, bucket);
      return url ? `${a}${url}${b}` : all;
    });
}

/* ------------------------------------------------------------------ output */

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) continue;
    lines.push(`${k}: ${JSON.stringify(v)}`); // JSON is valid YAML
  }
  lines.push('---', '');
  return lines.join('\n');
}

function write(file, data, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, frontmatter(data) + body.trim() + '\n');
}

const iso = (d) => (d ? String(d).replace(' ', 'T') : undefined);
const list = (v) => (Array.isArray(v) ? v.map(cleanText).filter(Boolean) : []);
const isPlaceholderTitle = (t) => /^\(untitled/i.test(t) || /^hello world!?$/i.test(t) || /^sample page$/i.test(t);

/* ------------------------------------------------------------------ seuksa */

function importSeuksa() {
  const used = {};
  for (const src of SEUKSA_SOURCES) {
    const files = walk(path.join(SRC, src.dir), (p) => p.endsWith('index.md'));
    for (const file of files) {
      const { data, body: raw } = read(file);
      const title = cleanText(data.title);
      const body = cleanBody(raw);
      const text = plain(body);
      if (data.draft === true || data.status === 'draft') { skip(file, 'draft'); continue; }
      if (!title || isPlaceholderTitle(title) || data.slug === 'hello-world') { skip(file, 'placeholder or untitled'); continue; }
      if (text.length < MIN_TEXT[src.section]) { skip(file, `too short (${text.length} chars)`); continue; }

      const section = src.section;
      used[section] ??= new Set();
      // WordPress cut non-Latin slugs mid-word; the full title gives a readable Khmer slug instead.
      const wpSlug = slugify(data.slug);
      const base = (/^[a-z0-9-]+$/.test(wpSlug) ? wpSlug : slugify(title)) || String(data.wp?.id ?? '');
      const slug = uniqueSlug(/^\d+$/.test(base) ? `${section}-${base}` : base, used[section]);
      const bucket = `seuksa/${section}/${data.wp?.blog_id ?? 0}-${data.wp?.id ?? slug}`;
      const dir = path.dirname(file);

      const out = rewriteMedia(body, dir, bucket);
      const categories = [...new Set([...list(data.categories), ...(src.category ? [src.category] : [])])].filter(
        (c) => !/^uncategori[sz]ed$/i.test(c),
      );
      const description = cleanText(data.description);
      write(
        path.join(OUT, 'seuksa', section, `${slug}.md`),
        {
          title,
          slug,
          section,
          date: iso(data.date),
          updated: iso(data.updated),
          author: data.author && data.author !== 'admin' ? data.author : undefined,
          quoteAuthor: cleanText(data.quote_author) || undefined,
          categories,
          tags: list(data.tags),
          description: description && description !== title ? description : excerpt(out),
          cover: data.cover ? media(dir, data.cover, bucket) || undefined : undefined,
          lang: data.lang || 'km',
          views: typeof data.views === 'number' ? data.views : undefined,
          source: data.source_url,
        },
        out,
      );
      count(`seuksa/${section}`);
    }
  }

  for (const page of SEUKSA_PAGES) {
    const file = path.join(SRC, page.dir, 'index.md');
    if (!fs.existsSync(file)) continue;
    const { data, body } = read(file);
    const out = rewriteMedia(cleanBody(body), path.dirname(file), `seuksa/pages/${page.slug}`);
    write(
      path.join(OUT, 'pages', `${page.slug}.md`),
      {
        title: page.title || cleanText(data.title),
        slug: page.slug,
        description: excerpt(out),
        date: iso(data.date),
        updated: iso(data.updated),
        lang: data.lang || 'en',
        source: data.source_url,
      },
      out,
    );
    count('pages');
  }

  for (const [dir, reason] of Object.entries(SKIPPED_SEUKSA_SECTIONS)) skip(path.join(SRC, dir), `section skipped: ${reason}`);
  skip(path.join(SRC, 'seuksa/*/pages'), 'login / register / cart / sample pages (WordPress plumbing)');
}

/* ------------------------------------------------------------------ nitean */

const PRESSBOOKS_PLACEHOLDER =
  /^(This is (the first chapter|where you can)|This is an example page|Welcome to \[Books Sites\])/i;

function isValuableBookText(body) {
  const text = plain(body);
  return text.length >= 100 && !PRESSBOOKS_PLACEHOLDER.test(text);
}

function chapterSlug(data, file, title) {
  const fromUrl = slugify(String(data.source_url || '').match(/\/(?:chapter|front-matter|back-matter)\/([^/]+)\/?$/)?.[1]);
  if (/^[a-z0-9-]+$/.test(fromUrl)) return fromUrl;
  return slugify(title) || fromUrl || slugify(path.basename(file, '.md').replace(/^\d+-/, ''));
}

function importNitean() {
  const booksDir = path.join(SRC, 'nitean/books');
  for (const book of fs.readdirSync(booksDir).sort()) {
    const bookDir = path.join(booksDir, book);
    const bookFile = path.join(bookDir, 'book.md');
    if (!fs.existsSync(bookFile)) continue;
    if (EXCLUDED_BOOKS[book]) {
      skip(bookDir, `book skipped: ${EXCLUDED_BOOKS[book]}`);
      continue;
    }
    const meta = read(bookFile);
    const conf = BOOKS[book] || {};
    const used = new Set();
    const chapters = [];
    const bucket = `nitean/${book}`;

    const take = (file, kind, part) => {
      const { data, body } = read(file);
      const title = cleanText(data.title);
      if (data.draft === true) return skip(file, 'draft');
      if (!title || isPlaceholderTitle(title)) return skip(file, 'untitled');
      const cleaned = cleanBody(body);
      if (!isValuableBookText(cleaned)) return skip(file, 'Pressbooks placeholder or empty');
      chapters.push({
        file,
        kind,
        part,
        title,
        slug: uniqueSlug(chapterSlug(data, file, title), used),
        order: Number(data.order) || 0,
        data,
        body: rewriteMedia(cleaned, path.dirname(file), bucket),
      });
    };

    for (const f of walk(path.join(bookDir, 'front-matter'), (p) => p.endsWith('.md'))) take(f, 'front');

    const parts = [];
    const partsDir = path.join(bookDir, 'parts');
    if (fs.existsSync(partsDir)) {
      for (const p of fs.readdirSync(partsDir).sort()) {
        const pdir = path.join(partsDir, p);
        const index = path.join(pdir, 'index.md');
        if (!fs.existsSync(index)) continue;
        const { data, body } = read(index);
        const key = p.replace(/^\d+-/, '');
        const part = {
          key: slugify(key) || p,
          title: cleanText(data.title),
          order: Number(data.order) || parts.length + 1,
          intro: isValuableBookText(body) || plain(body).length >= 40 ? cleanBody(body) : undefined,
        };
        const before = chapters.length;
        for (const f of walk(pdir, (x) => x.endsWith('.md') && path.basename(x) !== 'index.md')) take(f, 'chapter', part);
        if (chapters.length > before) parts.push(part);
        else skip(index, 'part without readable chapters');
      }
    }

    for (const f of walk(path.join(bookDir, 'back-matter'), (p) => p.endsWith('.md'))) take(f, 'back');
    skip(path.join(bookDir, '_extra'), 'Pressbooks site pages (About/Buy/Cover/Access denied/Sample) – no book content');

    const readable = chapters.filter((c) => c.kind === 'chapter');
    if (!readable.length) {
      skip(bookDir, 'book skipped: no real chapters (only Pressbooks placeholders)');
      continue;
    }

    // book-level metadata
    const copyright = meta.body.match(/## Copyright\s+([\s\S]*?)(?=\n## |\s*$)/)?.[1]?.trim();
    const intro = chapters.find((c) => c.kind === 'front');
    const description =
      conf.description ||
      (intro && excerpt(intro.body, 220)) ||
      (parts.find((p) => p.intro) && excerpt(parts.find((p) => p.intro).intro, 220)) ||
      cleanText(meta.data.about_short) ||
      undefined;
    const coverRef = meta.data.cover && !/default-book-cover/.test(meta.data.cover) ? meta.data.cover : undefined;
    const author = meta.data.author && !['admin', 'Khmer'].includes(meta.data.author) ? meta.data.author : undefined;

    const outDir = path.join(OUT, 'nitean', book);
    let seq = 0;
    const ordered = [
      ...chapters.filter((c) => c.kind === 'front').sort((a, b) => a.order - b.order),
      ...parts.flatMap((p) => chapters.filter((c) => c.part === p).sort((a, b) => a.order - b.order)),
      ...chapters.filter((c) => c.kind === 'back').sort((a, b) => a.order - b.order),
    ];
    for (const c of ordered) {
      seq++;
      write(
        path.join(outDir, 'chapters', `${String(seq).padStart(3, '0')}-${c.slug}.md`),
        {
          title: c.title,
          slug: c.slug,
          book,
          kind: c.kind,
          part: c.part?.key,
          seq,
          lang: c.data.lang || conf.lang || 'km',
          date: iso(c.data.date),
          updated: iso(c.data.updated),
          description: excerpt(c.body, 160),
          source: c.data.source_url,
        },
        c.body,
      );
      count(`nitean/${book}`);
    }

    write(
      path.join(outDir, 'book.md'),
      {
        title: conf.title || cleanText(meta.data.title),
        subtitle: conf.subtitle || cleanText(meta.data.short_title) || undefined,
        originalTitle: cleanText(meta.data.title),
        book,
        order: conf.order ?? 99,
        lang: conf.lang || 'km',
        tone: conf.tone || 'amber',
        author,
        description,
        cover: coverRef ? media(bookDir, coverRef, bucket) || undefined : undefined,
        chapters: readable.length,
        parts: parts.map((p) => ({ key: p.key, title: p.title, ...(p.intro ? { intro: p.intro } : {}) })),
        source: meta.data.source_url,
      },
      copyright || '',
    );
    count('nitean books');
  }
  skip(path.join(SRC, 'nitean/_site'), 'nitean.com network announcements (not book content)');
}

/* -------------------------------------------------------------------- main */

for (const d of [path.join(OUT, 'seuksa'), path.join(OUT, 'pages'), path.join(OUT, 'nitean'), MEDIA])
  fs.rmSync(d, { recursive: true, force: true });

importSeuksa();
importNitean();

fs.writeFileSync(path.join(ROOT, 'scripts/import-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Imported from ${SRC}`);
for (const [k, v] of Object.entries(report.imported)) console.log(`  ${k.padEnd(22)} ${v}`);
console.log(`  skipped                ${report.skipped.length} (see scripts/import-report.json)`);
