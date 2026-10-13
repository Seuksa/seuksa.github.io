import { getCollection, type CollectionEntry } from 'astro:content';

export type Brand = 'seuksa' | 'nitean';
export type Section = CollectionEntry<'articles'>['data']['section'];
export type Article = CollectionEntry<'articles'>;

export const SITE = {
  url: 'https://seuksa.com',
  seuksa: {
    name: 'សិក្សា Seuksa',
    tagline: 'អ្វីៗដើម្បីការអប់រំ ក្នុងសង្គមខ្មែរ',
    taglineEn: 'Everything for education in Khmer society',
  },
  nitean: {
    name: 'និទាន Nitean',
    tagline: 'បណ្ណាល័យសៀវភៅខ្មែរ',
    taglineEn: 'A Khmer book library – folktales, stories and collections',
  },
} as const;

export const SECTIONS: Record<Section, { title: string; km: string; icon: string; description: string }> = {
  blog: {
    title: 'Blog',
    km: 'ប្លុក',
    icon: 'pi pi-pen-to-square',
    description: 'Education news, Bac II exam results, university life and ideas for Cambodian students.',
  },
  answers: {
    title: 'Knowledge',
    km: 'សំណួរ និងចម្លើយ',
    icon: 'pi pi-question-circle',
    description: 'Questions and answers on Khmer history, culture, language, Buddhism and society.',
  },
  stories: {
    title: 'Stories',
    km: 'រឿងខ្មែរ',
    icon: 'pi pi-book',
    description: 'Khmer legends, short stories, novels and jokes – read for fun and wisdom.',
  },
  quotes: {
    title: 'Quotes',
    km: 'សម្រង់ពាក្យ',
    icon: 'pi pi-comment',
    description: 'Love, life, business and encouragement quotes in English and Khmer.',
  },
};

export const SECTION_ORDER: Section[] = ['blog', 'answers', 'stories', 'quotes'];

export const NAV: Record<Brand, { label: string; href: string; icon?: string }[]> = {
  seuksa: [
    ...SECTION_ORDER.map((s) => ({ label: SECTIONS[s].title, href: `/${s}/`, icon: SECTIONS[s].icon })),
    { label: 'Topics', href: '/tags/', icon: 'pi pi-tags' },
    { label: 'About', href: '/about/', icon: 'pi pi-info-circle' },
  ],
  nitean: [
    { label: 'Library', href: '/nitean/', icon: 'pi pi-book' },
    { label: 'Folktales', href: '/nitean/folktales/', icon: 'pi pi-sparkles' },
    { label: 'About', href: '/nitean/about/', icon: 'pi pi-info-circle' },
  ],
};

export const articleUrl = (a: Article) => `/${a.data.section}/${a.data.slug}/`;
export const tagUrl = (tag: string) => `/tags/${slugify(tag)}/`;

export function slugify(s: string) {
  return s
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(d?: Date) {
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

export const htmlLang = (lang: string) => (lang === 'en' ? 'en' : 'km');

/** All published articles of a section (or all), newest first. */
export async function getArticles(section?: Section) {
  const all = await getCollection('articles', (a) => !section || a.data.section === section);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Plain, serialisable card data for Vue islands. */
export function toCard(a: Article) {
  return {
    id: a.id,
    title: a.data.title,
    url: articleUrl(a),
    description: a.data.description,
    date: formatDate(a.data.date),
    year: a.data.date.getFullYear(),
    categories: a.data.categories,
    cover: a.data.cover,
    lang: a.data.lang,
  };
}
export type Card = ReturnType<typeof toCard>;

export async function getBooks() {
  return (await getCollection('books')).sort((a, b) => a.data.order - b.data.order);
}

export async function getChapters(book: string) {
  return (await getCollection('chapters', (c) => c.data.book === book)).sort((a, b) => a.data.seq - b.data.seq);
}

export const chapterUrl = (c: CollectionEntry<'chapters'>) => `/nitean/${c.data.book}/${c.data.slug}/`;

/** Tailwind classes for generated book covers, per book tone. */
export const TONES = {
  amber: 'from-amber-700 via-amber-800 to-stone-900',
  rose: 'from-rose-700 via-rose-800 to-stone-900',
  emerald: 'from-emerald-700 via-emerald-800 to-stone-900',
  sky: 'from-sky-700 via-sky-800 to-slate-900',
  slate: 'from-slate-600 via-slate-700 to-slate-900',
} as const;

/** Typography for rendered Markdown (Tailwind Typography). */
export const PROSE =
  'prose dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary-700 dark:prose-a:text-primary-300 prose-img:mx-auto prose-img:rounded-xl prose-blockquote:border-primary-300 prose-blockquote:font-normal prose-blockquote:not-italic prose-table:text-sm';
export const PROSE_BOOK = `${PROSE} prose-stone font-khmer-serif reader prose-p:leading-[2] prose-headings:font-khmer-serif`;

/** Quote data for Vue islands (rendered HTML comes from the content layer). */
export function toQuote(a: Article) {
  return {
    id: a.id,
    title: a.data.title,
    slug: a.data.slug,
    url: articleUrl(a),
    html: a.rendered?.html ?? '',
    author: a.data.quoteAuthor,
    categories: a.data.categories,
    views: a.data.views ?? 0,
    date: formatDate(a.data.date),
    text: `${a.data.title} ${a.data.description} ${a.body ?? ''}`,
  };
}
