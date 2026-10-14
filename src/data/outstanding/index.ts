/**
 * National Outstanding Students Examination (ប្រឡងសិស្សពូកែទូទាំងប្រទេស) – honour roll.
 * Scope: Khmer literature, mathematics and physics, grade 9 and grade 12.
 *
 * One JSON file per exam year in ./years/<year>.json. Rules:
 * - Only lists published by MoEYS (its documents, or news reports reproducing them). Cite every source.
 * - Record only: rank, name, gender, school, province. Never record date of birth or other personal details
 *   (the honourees are minors), even though the official lists include them.
 * - Names are copied exactly as published. Set `verified: true` on a year only after the names have been
 *   checked against the source by a person (image transcription can contain mistakes).
 * - `province` is a key from src/data/provinces.ts. `school` is the school name as published.
 */
import { provinceByKey } from '../provinces';

export type Subject = 'khmer' | 'math' | 'physics';
export type Grade = 9 | 12;

export interface Honouree {
  grade: Grade;
  subject: Subject;
  rank: number;
  name: string;
  gender: 'F' | 'M' | null;
  school: string;
  province: string;
}

export interface OutstandingSource {
  title: string;
  publisher: string;
  date: string;
  url?: string;
  archive?: string;
}

export interface OutstandingYear {
  year: number;
  examDate?: string;
  resultsDate?: string;
  /** Where the national round was held, when published. */
  host?: string;
  ranksPerSubject: number;
  /** "image" = transcribed from an image of the official list; "text" = copied from a text list. */
  transcribedFrom: 'image' | 'text' | 'pdf';
  verified: boolean;
  note?: string;
  sources: OutstandingSource[];
  entries: Honouree[];
}

export const SUBJECTS: Record<Subject, { en: string; km: string }> = {
  khmer: { en: 'Khmer literature', km: 'អក្សរសិល្ប៍ខ្មែរ' },
  math: { en: 'Mathematics', km: 'គណិតវិទ្យា' },
  physics: { en: 'Physics', km: 'រូបវិទ្យា' },
};
export const SUBJECT_ORDER: Subject[] = ['khmer', 'math', 'physics'];
export const GRADES: Grade[] = [12, 9];

const files = import.meta.glob<{ default: OutstandingYear }>('./years/*.json', { eager: true });

export const OUTSTANDING: OutstandingYear[] = Object.values(files)
  .map((m) => m.default)
  .sort((a, b) => a.year - b.year);

// Fail the build early on data mistakes.
for (const y of OUTSTANDING) {
  for (const e of y.entries) {
    if (!provinceByKey[e.province]) throw new Error(`outstanding ${y.year}: unknown province "${e.province}" (${e.name})`);
    if (!SUBJECTS[e.subject]) throw new Error(`outstanding ${y.year}: unknown subject "${e.subject}"`);
  }
}

/** Every honouree with its year – for search, aggregates and per-person lookups. */
export const ALL_HONOUREES = OUTSTANDING.flatMap((y) => y.entries.map((e) => ({ ...e, year: y.year })));
export type HonoureeWithYear = (typeof ALL_HONOUREES)[number];

/** Stable anchor id for a person on a year page. */
export const honoureeId = (e: { grade: number; subject: string; rank: number }) => `g${e.grade}-${e.subject}-${e.rank}`;

export function countBy<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  for (const i of items) m.set(key(i), (m.get(key(i)) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** School identity = province + name as published (the same name can exist in several provinces). */
export const schoolKey = (e: { province: string; school: string }) => `${e.province}|${e.school.replace(/\s+/g, ' ').trim()}`;
