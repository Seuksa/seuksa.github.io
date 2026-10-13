import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SECTIONS, articleUrl, chapterUrl, getArticles } from '../lib/site';

/** Compact client-side search index (title, url, description, section, brand). */
export const GET: APIRoute = async () => {
  const articles = (await getArticles()).map((a) => ({
    t: a.data.title,
    u: articleUrl(a),
    d: a.data.description,
    s: SECTIONS[a.data.section].title,
    b: 'seuksa',
  }));
  const books = await getCollection('books');
  const titles = Object.fromEntries(books.map((b) => [b.id, b.data.subtitle || b.data.title]));
  const chapters = (await getCollection('chapters')).map((c) => ({
    t: c.data.title,
    u: chapterUrl(c),
    d: c.data.description,
    s: titles[c.data.book] ?? c.data.book,
    b: 'nitean',
  }));
  const bookDocs = books.map((b) => ({ t: b.data.title, u: `/nitean/${b.id}/`, d: b.data.description ?? '', s: 'Book', b: 'nitean' }));
  return new Response(JSON.stringify([...bookDocs, ...articles, ...chapters]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
