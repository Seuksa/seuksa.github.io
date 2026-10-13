import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, articleUrl, getArticles } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = (await getArticles()).filter((a) => a.data.section !== 'quotes').slice(0, 50);
  return rss({
    title: SITE.seuksa.name,
    description: SITE.seuksa.taglineEn,
    site: context.site!,
    items: posts.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.date,
      link: articleUrl(a),
      categories: a.data.categories,
    })),
  });
}
