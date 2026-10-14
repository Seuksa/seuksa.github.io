import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SECTIONS, articleUrl, chapterUrl, getArticles } from '../lib/site';
import { ALL_HONOUREES, SUBJECTS, honoureeId } from '../data/outstanding';
import { provinceByKey } from '../data/provinces';

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
  const honourees = ALL_HONOUREES.map((e) => ({
    t: e.name,
    u: `/stats/outstanding-students/${e.year}/#${honoureeId(e)}`,
    d: `Rank ${e.rank} · ${SUBJECTS[e.subject].km} · grade ${e.grade} · ${e.school} · ${provinceByKey[e.province].km}`,
    s: `Outstanding students ${e.year}`,
    b: 'seuksa',
  }));
  return new Response(JSON.stringify([...bookDocs, ...articles, ...chapters, ...honourees]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
