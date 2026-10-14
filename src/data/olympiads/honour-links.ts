/**
 * Cambodian olympians ↔ national outstanding-students honour roll (src/data/outstanding).
 * Hand-curated: the olympiads publish Latin names, the ministry lists Khmer names, so each pair was matched by
 * name, subject and year. `possible: true` marks pairs where the spellings do not fully agree (e.g. family name
 * Sorn vs សិន) – shown with a "?" until someone confirms them. Every target is checked at build time.
 */
import { ALL_HONOUREES, SUBJECTS, honoureeId, type Grade, type Subject } from '../outstanding';

interface HonourRef {
  year: number;
  grade: Grade;
  subject: Subject;
  rank: number;
}
interface Link {
  competition: 'IMO' | 'IPhO';
  /** Name exactly as published by the olympiad. */
  name: string;
  honours: HonourRef[];
  possible?: boolean;
}

const h = (year: number, grade: Grade, subject: Subject, rank: number): HonourRef => ({ year, grade, subject, rank });

const LINKS: Link[] = [
  // IMO
  { competition: 'IMO', name: 'Sovannit Oun', honours: [h(2013, 9, 'math', 2)] },
  { competition: 'IMO', name: 'Sothea Saren', honours: [h(2013, 9, 'math', 3), h(2016, 12, 'math', 5)] },
  { competition: 'IMO', name: 'Seavmey Chip', honours: [h(2013, 9, 'math', 4)] },
  { competition: 'IMO', name: 'Puthvathna Chourn', honours: [h(2013, 9, 'math', 9)], possible: true }, // ជួន ពុធវន្នូនា
  { competition: 'IMO', name: 'Namchhoen Veng', honours: [h(2013, 9, 'math', 1), h(2016, 12, 'math', 2)] },
  { competition: 'IMO', name: 'Ly An Chhay', honours: [h(2018, 12, 'math', 1)] },
  { competition: 'IMO', name: 'Ompor Chin', honours: [h(2018, 12, 'math', 10)], possible: true }, // ផិន អម្ពរ
  { competition: 'IMO', name: 'Monivathana Ly', honours: [h(2016, 9, 'math', 1)] },
  { competition: 'IMO', name: 'Theanwin Mom', honours: [h(2016, 9, 'math', 2), h(2019, 12, 'math', 5)] },
  { competition: 'IMO', name: 'Yongchhing Chhun', honours: [h(2016, 9, 'math', 5)] },
  { competition: 'IMO', name: 'Usa An', honours: [h(2016, 9, 'math', 6), h(2019, 12, 'math', 3)] },
  { competition: 'IMO', name: 'Seyha Sun', honours: [h(2016, 9, 'math', 7)] },
  { competition: 'IMO', name: 'Eangly Te', honours: [h(2016, 9, 'math', 10)] },
  { competition: 'IMO', name: 'Borey Norint Son', honours: [h(2023, 9, 'math', 1)] },
  { competition: 'IMO', name: 'Lyhour Ny', honours: [h(2023, 9, 'math', 3)] },
  { competition: 'IMO', name: 'Tyty Lay', honours: [h(2024, 9, 'math', 1)] },
  { competition: 'IMO', name: 'Panhasakda Phors', honours: [h(2024, 9, 'math', 4)] },
  { competition: 'IMO', name: 'Kimheng Ngov', honours: [h(2024, 9, 'math', 5)] },
  // IPhO
  { competition: 'IPhO', name: 'Ny Vannat', honours: [h(2011, 12, 'physics', 1)] },
  { competition: 'IPhO', name: 'Sopheak Sorn', honours: [h(2011, 12, 'physics', 2)] },
  { competition: 'IPhO', name: 'Sokanha Ly', honours: [h(2014, 12, 'physics', 1)] },
  { competition: 'IPhO', name: 'Sin Rithy Vong', honours: [h(2018, 12, 'physics', 5)] },
  { competition: 'IPhO', name: 'Panhaudom Nget', honours: [h(2026, 12, 'physics', 5)] },
];

export interface HonourLink {
  year: number;
  label: string;
  href: string;
  km: string;
  possible: boolean;
}

const resolve = (l: Link): HonourLink[] =>
  l.honours.map((r) => {
    const e = ALL_HONOUREES.find((x) => x.year === r.year && x.grade === r.grade && x.subject === r.subject && x.rank === r.rank);
    if (!e) throw new Error(`honour-links: no honour-roll entry ${JSON.stringify(r)} for ${l.name}`);
    return {
      year: r.year,
      label: `${r.year} · ${SUBJECTS[r.subject].en} G${r.grade} #${r.rank}`,
      href: `/stats/outstanding-students/${r.year}/#${honoureeId(e)}`,
      km: e.name,
      possible: !!l.possible,
    };
  });

const byKey = new Map(LINKS.map((l) => [`${l.competition}|${l.name}`, resolve(l)]));

/** Honour-roll entries for an olympian (by the olympiad's spelling). */
export const honoursOf = (competition: string, name: string) => byKey.get(`${competition}|${name}`) ?? [];

/** Olympiad appearances for an honour-roll entry, keyed `${year}|${honoureeId}` – for the honour-roll pages. */
export function olympiadsByHonouree(contestants: { competition: string; year: number; name: string; award: string | null }[]) {
  const m = new Map<string, { competition: string; year: number; award: string | null; possible: boolean }[]>();
  for (const l of LINKS)
    for (const r of l.honours) {
      const key = `${r.year}|${honoureeId(r)}`;
      const apps = contestants.filter((c) => c.competition === l.competition && c.name === l.name);
      m.set(key, [...(m.get(key) ?? []), ...apps.map((c) => ({ competition: c.competition, year: c.year, award: c.award, possible: !!l.possible }))]);
    }
  return m;
}
