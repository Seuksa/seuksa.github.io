import type { APIRoute } from 'astro';
import { SITE } from '../../lib/site';
import { EMBED_LICENSE, getEmbedQuotes } from '../../lib/quotes';

/** Public quotes API used by /embed/quote.js. Shape is versioned – only add fields. */
export const GET: APIRoute = async () => {
  const quotes = await getEmbedQuotes();
  return new Response(
    JSON.stringify({
      version: 1,
      source: `${SITE.url}/quotes/`,
      license: EMBED_LICENSE,
      count: quotes.length,
      quotes,
    }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};
