import type { APIRoute } from 'astro';
import { BAC_II, GRADE_KEYS, SOURCES } from '../../data/bac-ii';

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Bac II dataset as CSV (UTF-8 with BOM so Excel shows it correctly). */
export const GET: APIRoute = () => {
  const head = ['year', 'academic_year', 'exam_date', 'results_date', 'sat', 'registered', 'passed', 'pass_rate', ...GRADE_KEYS.map((k) => `grade_${k}`), 'cancelled', 'approximate', 'note', 'sources'];
  const rows = BAC_II.map((y) => [
    y.year, y.academicYear, y.examDate, y.resultsDate, y.sat, y.registered, y.passed, y.passRate,
    ...GRADE_KEYS.map((k) => y.grades?.[k]), y.cancelled ? 'yes' : '', y.approx?.join(' '), y.note,
    y.sources.map((s) => `${SOURCES[s].publisher} (${SOURCES[s].date})${'url' in SOURCES[s] ? ' ' + (SOURCES[s] as { url: string }).url : ''}`).join(' | '),
  ]);
  const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
