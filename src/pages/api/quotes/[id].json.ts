import type { APIRoute, GetStaticPaths } from 'astro';
import { EMBED_LICENSE, getEmbedQuotes, type EmbedQuote } from '../../../lib/quotes';

export const getStaticPaths = (async () =>
  (await getEmbedQuotes()).map((quote) => ({ params: { id: quote.id }, props: { quote } }))) satisfies GetStaticPaths;

/** One quote, for embeds that show a fixed quote (smaller than the full list). */
export const GET: APIRoute = ({ props }) =>
  new Response(JSON.stringify({ version: 1, license: EMBED_LICENSE, quote: (props as { quote: EmbedQuote }).quote }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
