import type { APIRoute } from 'astro';
import { SITE } from '../../lib/site';
import { BAC_II, SOURCES } from '../../data/bac-ii';

/** Bac II dataset with its sources – same data as /stats/bac-ii/. */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        title: 'Cambodia grade 12 national exam (Bac II) – official results',
        page: `${SITE.url}/stats/bac-ii/`,
        rules: 'Only figures released by MoEYS (own documents or reports quoting a MoEYS statement). null = not published.',
        years: BAC_II,
        sources: SOURCES,
      },
      null,
      1,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
