import { SITE, articleUrl, getArticles, type Article } from './site';

/** Public shape of a quote in /api/quotes.json – keep backwards compatible, embeds depend on it. */
export interface EmbedQuote {
  id: string;
  title: string;
  url: string;
  author?: string;
  categories: string[];
  lines: { text: string; lang: 'km' | 'en' }[];
}

const KHMER = /[ក-៿᧠-᧿]/g;

/** Markdown inline syntax → plain text (embeds render text only, never HTML). */
function inline(s: string) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*{1,3}|_{1,3}|`)(\S[\s\S]*?\S|\S)\1/g, '$2')
    .replace(/\\([\\`*_{}[\]()#+\-.!"])/g, '$1')
    .replace(/[​﻿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Split a quote body into paragraphs, tagged Khmer or English (English line + Khmer translation is the usual shape). */
export function quoteLines(md: string): EmbedQuote['lines'] {
  return md
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .filter((l) => !/^\s*!\[/.test(l) && !/^\s*(-{3,}|\*{3,})\s*$/.test(l))
        .map((l) => inline(l.replace(/^\s*>\s?/, '').replace(/^\s*(#{1,6}|[-*+]|\d+\.)\s+/, '')))
        .filter(Boolean)
        .join('\n'),
    )
    .filter(Boolean)
    .map((text) => {
      const letters = text.replace(/[\s\p{P}\p{S}\d]/gu, '').length || 1;
      return { text, lang: (text.match(KHMER)?.length ?? 0) / letters > 0.3 ? ('km' as const) : ('en' as const) };
    });
}

export function toEmbedQuote(a: Article): EmbedQuote {
  return {
    id: a.data.slug,
    title: a.data.title,
    url: new URL(articleUrl(a), SITE.url).href,
    author: a.data.quoteAuthor,
    categories: a.data.categories,
    lines: quoteLines(a.body ?? ''),
  };
}

/** Quotes that have readable text (a few are image-only and can't be embedded as text). */
export async function getEmbedQuotes() {
  return (await getArticles('quotes')).map(toEmbedQuote).filter((q) => q.lines.length > 0);
}

export const EMBED_LICENSE = 'Free to embed on any website with the visible link back to seuksa.com.';
