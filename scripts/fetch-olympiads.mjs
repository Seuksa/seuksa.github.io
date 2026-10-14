#!/usr/bin/env node
/**
 * Fetch IMO and IPhO results for the ASEAN countries (2000 → now) into src/data/olympiads/.
 *
 *   node scripts/fetch-olympiads.mjs
 *
 * Sources:
 *  - IMO: official results database, https://www.imo-official.org (team + individual results per country,
 *    and each year's team table for the number of participating countries).
 *  - IPhO: https://ipho-unofficial.org – the long-standing results database for the IPhO (compiled from the
 *    official results; the official site ipho-new.org does not publish a comparable database).
 * Raw pages are saved to archive/sources/olympiads/ (git-ignored) as a backup of what was read.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/olympiads');
const RAW = path.join(ROOT, 'archive/sources/olympiads');
const FROM = 2000;
const UA = 'Mozilla/5.0 (compatible; SeuksaArchive/1.0; +https://seuksa.com)';

/** ASEAN members with their codes on each site (Laos has not taken part in IPhO). */
const ASEAN = [
  { key: 'KHM', en: 'Cambodia', km: 'កម្ពុជា', imo: 'KHM', ipho: 'KHM' },
  { key: 'VNM', en: 'Vietnam', km: 'វៀតណាម', imo: 'VNM', ipho: 'VNM' },
  { key: 'THA', en: 'Thailand', km: 'ថៃ', imo: 'THA', ipho: 'THA' },
  { key: 'SGP', en: 'Singapore', km: 'សិង្ហបុរី', imo: 'SGP', ipho: 'SGP' },
  { key: 'IDN', en: 'Indonesia', km: 'ឥណ្ឌូណេស៊ី', imo: 'IDN', ipho: 'IDN' },
  { key: 'MYS', en: 'Malaysia', km: 'ម៉ាឡេស៊ី', imo: 'MAS', ipho: 'MAS' },
  { key: 'PHL', en: 'Philippines', km: 'ហ្វីលីពីន', imo: 'PHI', ipho: 'PHI' },
  { key: 'MMR', en: 'Myanmar', km: 'មីយ៉ាន់ម៉ា', imo: 'MMR', ipho: 'MMR' },
  { key: 'LAO', en: 'Laos', km: 'ឡាវ', imo: 'LAO', ipho: null },
  { key: 'BRN', en: 'Brunei', km: 'ព្រុយណេ', imo: 'BRU', ipho: 'BRU' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, rawName) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) {
      const t = await r.text();
      fs.mkdirSync(RAW, { recursive: true });
      fs.writeFileSync(path.join(RAW, rawName), t);
      await sleep(400); // be polite
      return t;
    }
    if (r.status === 404) return '';
    await sleep(1500 * attempt);
  }
  throw new Error(`fetch failed: ${url}`);
}

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/\s+/g, ' ')
    .trim();

/** First <table> as rows of {text, href} cells. */
function table(html) {
  const t = html.match(/<table[\s\S]*?<\/table>/)?.[0];
  if (!t) return [];
  return [...t.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((r) =>
    [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => ({ text: decode(c[1]), href: c[1].match(/href="([^"]+)"/)?.[1] })),
  );
}
const num = (s) => {
  const m = String(s ?? '').match(/\d+/);
  return m ? Number(m[0]) : null;
};
const awardCode = (s) => {
  const a = String(s).toLowerCase();
  if (a.startsWith('gold')) return 'G';
  if (a.startsWith('silver')) return 'S';
  if (a.startsWith('bronze')) return 'B';
  if (a.startsWith('honourable') || a === 'hm') return 'HM';
  return null;
};

/* ---------------------------------------------------------------- IMO */
async function imo() {
  const thisYear = new Date().getFullYear();
  const years = {};
  for (let y = FROM; y <= thisYear; y++) {
    const rows = table(await get(`https://www.imo-official.org/results/team/year/${y}/`, `imo-team-${y}.html`));
    const countries = rows.slice(1).filter((r) => r.length > 3 && num(r[1]?.text) != null).length;
    if (countries) years[y] = { countries };
  }
  const countries = {};
  for (const c of ASEAN) {
    const team = table(await get(`https://www.imo-official.org/results/team/country/${c.imo}/`, `imo-${c.imo}-team.html`))
      .slice(1)
      .filter((r) => num(r[0]?.text) >= FROM)
      .map((r) => ({
        year: num(r[0].text),
        rank: num(r[1].text),
        points: num(r[3].text),
        gold: num(r[10]?.text) ?? 0,
        silver: num(r[11]?.text) ?? 0,
        bronze: num(r[12]?.text) ?? 0,
        hm: num(r[13]?.text) ?? 0,
      }))
      .sort((a, b) => a.year - b.year);
    const people = table(await get(`https://www.imo-official.org/results/individual/country/${c.imo}/`, `imo-${c.imo}-individual.html`))
      .slice(1)
      .filter((r) => num(r[0]?.text) >= FROM && r[1]?.text)
      .map((r) => ({
        year: num(r[0].text),
        name: r[1].text,
        rank: num(r[2].text),
        award: awardCode(r[4].text),
        points: num(r[5].text),
        url: r[1].href ? new URL(r[1].href, 'https://www.imo-official.org').href : undefined,
      }));
    countries[c.key] = { results: team, contestants: people };
    console.log(`IMO ${c.en}: ${team.length} years, ${people.length} contestants`);
  }
  return {
    competition: 'IMO',
    name: 'International Mathematical Olympiad',
    source: 'https://www.imo-official.org',
    official: true,
    fetched: new Date().toISOString().slice(0, 10),
    years,
    countries,
  };
}

/* --------------------------------------------------------------- IPhO */
async function ipho() {
  const years = {};
  for (const r of table(await get('https://ipho-unofficial.org/timeline/', 'ipho-timeline.html'))) {
    const y = num(r[1]?.text);
    if (r.length >= 7 && y >= FROM && num(r[5]?.text)) years[y] = { countries: num(r[5].text), contestants: num(r[6]?.text) };
  }
  const countries = {};
  for (const c of ASEAN) {
    if (!c.ipho) continue;
    const people = table(await get(`https://ipho-unofficial.org/countries/${c.ipho}/individual`, `ipho-${c.ipho}-individual.html`))
      .slice(1)
      .filter((r) => num(r[0]?.text) >= FROM && r[1]?.text)
      .map((r) => ({ year: num(r[0].text), name: r[1].text, rank: num(r[2].text), award: awardCode(r[3].text) }));
    const byYear = new Map();
    for (const p of people) {
      const s = byYear.get(p.year) ?? { year: p.year, gold: 0, silver: 0, bronze: 0, hm: 0, contestants: 0 };
      s.contestants++;
      if (p.award === 'G') s.gold++;
      else if (p.award === 'S') s.silver++;
      else if (p.award === 'B') s.bronze++;
      else if (p.award === 'HM') s.hm++;
      byYear.set(p.year, s);
    }
    countries[c.key] = { results: [...byYear.values()].sort((a, b) => a.year - b.year), contestants: people };
    console.log(`IPhO ${c.en}: ${byYear.size} years, ${people.length} contestants`);
  }
  return {
    competition: 'IPhO',
    name: 'International Physics Olympiad',
    source: 'https://ipho-unofficial.org',
    official: false,
    sourceNote: 'Results database compiled from the official IPhO results; the official site is ipho-new.org.',
    fetched: new Date().toISOString().slice(0, 10),
    years,
    countries,
  };
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'countries.json'), JSON.stringify(ASEAN, null, 1) + '\n');
fs.writeFileSync(path.join(OUT, 'imo.json'), JSON.stringify(await imo(), null, 1) + '\n');
fs.writeFileSync(path.join(OUT, 'ipho.json'), JSON.stringify(await ipho(), null, 1) + '\n');
console.log('done');
