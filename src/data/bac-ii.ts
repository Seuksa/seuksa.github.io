/**
 * Cambodia national grade 12 exam (Bac II / បាក់ឌុប) – official results by exam session.
 *
 * Rules for this file:
 * - Only figures released by the Ministry of Education, Youth and Sport (MoEYS) – either its own documents,
 *   or press reports that quote a MoEYS statement / the minister. Every year cites its sources (SOURCES ids).
 * - `null` = not published in any official source we could trace. Never estimate or back-calculate a value.
 * - `year` = the year the session's academic year ends (MoEYS convention: 1979–1980 → 1980).
 * - `passRate` is the ministry's published rate (computed by MoEYS on candidates who sat).
 * When adding a new year: append a row, add its sources, run `npm run build`. Pages and charts update automatically.
 */

export interface SourceRef {
  title: string;
  publisher: string;
  date: string; // ISO date or YYYY-MM
  url?: string;
  /** Copy kept on seuksa.com (for documents that only exist as images). */
  archive?: string;
}

export interface BacIIYear {
  year: number;
  academicYear: string;
  examDate?: string;
  resultsDate?: string;
  /** Registered candidates (when only registrations were published). */
  registered: number | null;
  /** Candidates who sat the exam. */
  sat: number | null;
  passed: number | null;
  passRate: number | null;
  grades?: { A: number | null; B: number | null; C: number | null; D: number | null; E: number | null };
  cancelled?: boolean;
  /** Values reported as approximate by the source (e.g. "about 46,560"). */
  approx?: ('passed' | 'sat' | 'registered')[];
  note?: string;
  sources: (keyof typeof SOURCES)[];
}

export const SOURCES = {
  moeys1980: {
    title: 'Results of candidates for the upper secondary certificate exam, 1980 to 2012 (official table, signed and stamped)',
    publisher: 'MoEYS – Department of General Secondary Education',
    date: '2013-08',
    url: 'http://news.sabay.com.kh/articles/857255',
    archive: '/media/seuksa/blog/7-387/Bac-II1-Cambodia-HighSchool-History-32-years.jpg',
  },
  moeysChart2014: {
    title: 'Pass rate of the upper secondary exam over 35 years (1979–1980 to 2013–2014), first session of 4 Aug 2014',
    publisher: 'MoEYS – Department of General Secondary Education (official Facebook page)',
    date: '2014-09',
    archive: '/media/seuksa/blog/7-441/general-view-highschool-cambodia-1979-2014.jpg',
  },
  seuksa2012: {
    title: 'Wow, 105 students in grade A in final exam of high school, Cambodia',
    publisher: 'Seuksa (reporting the MoEYS announcement)',
    date: '2012-09-01',
    url: '/blog/wow-105-students-in-grade-a-in-final-exam-of-high-school-cambodia/',
  },
  seuksa2013: {
    title: 'High School Exam 2013, 86.77 percentages passed',
    publisher: 'Seuksa (reporting the MoEYS announcement)',
    date: '2013-08-30',
    url: '/blog/high-school-exam-2013-86-77-percentages-passed/',
  },
  rfa2014: {
    title: 'More than 70 percent of Cambodia’s high school students fail key exam',
    publisher: 'Radio Free Asia (quoting the MoEYS statement)',
    date: '2014-08-29',
    url: 'https://www.rfa.org/english/news/cambodia/exam-08292014201054.html',
  },
  seuksa2014: {
    title: 'BACII 2014, 25.72% passed – 11 students in grade A, 289 in grade B',
    publisher: 'Seuksa (Education Minister’s TV interview, via Sabay News)',
    date: '2014-08-29',
    url: '/blog/high-school-2014-result/',
  },
  kt2015: {
    title: 'National exam pass rate jumps',
    publisher: 'Khmer Times (quoting MoEYS)',
    date: '2015-09-12',
    url: 'https://www.khmertimeskh.com/59385/national-exam-pass-rate-jumps/',
  },
  kt2016: {
    title: '405 get an A in high school exams',
    publisher: 'Khmer Times (quoting MoEYS)',
    date: '2016-09-11',
    url: 'https://www.khmertimeskh.com/64362/405-get-an-a-in-high-school-exams/',
  },
  seuksa2016: {
    title: 'លទ្ធផលបាក់ឌុបថ្ងៃនេះ ៦២.១៨%ជាប់ និទ្ទេស A ៤០៥នាក់',
    publisher: 'Seuksa (reporting the MoEYS announcement)',
    date: '2016-09-10',
    url: '/blog/high-school-2016-result-62-18-percentage-passed-a405/',
  },
  ppp2017: {
    title: 'Exam pass rate increases',
    publisher: 'Phnom Penh Post (quoting the MoEYS statement)',
    date: '2017-09-11',
    url: 'https://phnompenhpost.com/national/exam-pass-rate-increases/',
  },
  kt2019: {
    title: '68 percent of students pass high school exam',
    publisher: 'Khmer Times (quoting the MoEYS statement)',
    date: '2019-09-09',
    url: 'https://www.khmertimeskh.com/641560/68-percent-of-students-pass-high-school-exam/',
  },
  kt2020: {
    title: 'PM says Grade 12 exams cancelled, all students pass',
    publisher: 'Khmer Times (quoting the Prime Minister and MoEYS)',
    date: '2020-12-15',
    url: 'https://www.khmertimeskh.com/50793598/pm-says-grade-12-exams-cancelled-all-students-pass/',
  },
  ppp2022: {
    title: 'Over 65% of Grade 12 students pass exam',
    publisher: 'Phnom Penh Post (quoting the MoEYS official results)',
    date: '2022-01-14',
    url: 'https://phnompenhpost.com/national/over-65-grade-12-students-pass-exam/',
  },
  kt2022: {
    title: 'Bac II exams see a 70% passing rate with 1,049 Grade A scorers',
    publisher: 'Khmer Times (quoting MoEYS)',
    date: '2022-12-22',
    url: 'https://www.khmertimeskh.com/501207263/bac-ii-exams-see-a-70-passing-rate-with-1049-grade-a-scorers/',
  },
  cn2022: {
    title: 'Grade 12 exam success for 91,000',
    publisher: 'Cambodianess (quoting MoEYS)',
    date: '2022-12',
    url: 'https://www.cambodianess.com/article/grade-12-exam-success-for-91000',
  },
  cn2023: {
    title: 'Bac II pass rate reaches 72.89 pct',
    publisher: 'Cambodianess (quoting MoEYS)',
    date: '2023-11-23',
    url: 'https://cambodianess.com/article/bac-ii-pass-rate-reaches-7289-pct',
  },
  kt2024: {
    title: 'Over 100,000 candidates passed the BacII exam, with 2,216 achieving A-levels, according to MoEYS',
    publisher: 'Khmer Times (quoting the MoEYS press release)',
    date: '2024-10-30',
    url: 'https://www.khmertimeskh.com/501582895/over-100000-candidates-passed-the-bacii-exam-with-2216-achieving-a-levels-according-to-moeys/',
  },
  kt2025: {
    title: 'Ministry of Education announces Bac II 2025 results',
    publisher: 'Khmer Times (quoting MoEYS)',
    date: '2025-09-19',
    url: 'https://www.khmertimeskh.com/501760139/ministry-of-education-announces-bac-ii-2025-results/',
  },
  cn2025: {
    title: 'Bac II exam sets record pass rate',
    publisher: 'Cambodianess (quoting MoEYS; includes the 2014–2024 pass-rate series)',
    date: '2025-09',
    url: 'https://cambodianess.com/article/bac-ii-exam-sets-record-pass-rate',
  },
  kt2026: {
    title: 'Cambodian BacII exam concludes smoothly nationwide, results due September 2',
    publisher: 'Khmer Times (quoting MoEYS)',
    date: '2026-08-11',
    url: 'https://www.khmertimeskh.com/501996140/cambodian-bacii-exam-concludes-smoothly-nationwide-results-due-september-2/',
  },
  kth2023: {
    title: '១០ ឆ្នាំចុងក្រោយនេះមានបេក្ខជនប្រឡងបាក់ឌុបជាង៦០ម៉ឺននាក់ក្នុងនោះជាប់និទ្ទេស A ជាង៥ពាន់នាក់ (MoEYS report, 2014–2023 by year)',
    publisher: 'Kampuchea Thmey (reproducing the MoEYS report)',
    date: '2023-11-23',
    url: 'https://www.kampucheathmey.com/local-news/617454',
  },
  cnc2019: {
    title: '២០១៤-២០១៩ ឆ្នាំទី៦នៃកំណែទម្រង់ប្រលងបាក់ឌុប (MoEYS figures 2014–2019)',
    publisher: 'CNC (quoting MoEYS)',
    date: '2019-08',
    url: 'https://www.cnc.com.kh/detail/news/4186',
  },
  cambonomist2017: {
    title: 'លទ្ធផលបាក់ឌុប ២០១៧ ជារួម សិស្សប្រឡងជាប់ជិត៦៤%',
    publisher: 'Cambonomist (quoting MoEYS)',
    date: '2017-09-10',
    url: 'https://cambonomist.com/news/bac-ii-results-2017/',
  },
  kt2024b: {
    title: '79% of students passed the National BacII exam this year',
    publisher: 'Khmer Times (quoting the MoEYS statement)',
    date: '2024-10-30',
    url: 'https://www.khmertimeskh.com/501583150/79-of-students-passed-the-national-bacii-exam-this-year/',
  },
  cnc2024: {
    title: 'លទ្ធផលបាក់ឌុបឆ្នាំ២០២៤ មានបេក្ខជនប្រឡងជាប់ ជាង១សែននាក់ ស្មើនឹង៧៩%',
    publisher: 'CNC (quoting MoEYS)',
    date: '2024-10-30',
    url: 'https://cnc.com.kh/detail/news/59156',
  },
  freshnews2025: {
    title: 'ក្រសួងអប់រំ៖ លទ្ធផលបាក់ឌុបឆ្នាំនេះ បេក្ខជនជាប់សរុប១២២,៤៧៣នាក់, និទ្ទេស A មានចំនួន៣,០០៣នាក់',
    publisher: 'Fresh News (quoting the MoEYS statement)',
    date: '2025-09-19',
    url: 'https://m.freshnews.com.kh/localnews/402347-2025-09-19-13-05-46',
  },
  kth2026: {
    title: 'រយៈពេល៥ឆ្នាំចុងក្រោយ អត្រាប្រឡងជាប់បាក់ឌុបកើនឡើងពី ៧២% ដល់ ៨៤% (MoEYS report of 8 Sep 2026)',
    publisher: 'Kampuchea Thmey (quoting MoEYS Secretary General Tep Phyorith)',
    date: '2026-09-10',
    url: 'https://www.kampucheathmey.com/local-news/1182226',
  },
  cn2026: {
    title: 'Cambodia records 84 percent pass rate in Bac II exam',
    publisher: 'Cambodianess (quoting MoEYS spokesperson Khoun Vichheka)',
    date: '2026-09',
    url: 'https://cambodianess.com/article/cambodia-records-84-percent-pass-rate-in-bac-ii-exam',
  },
} satisfies Record<string, SourceRef>;

/** 1980–2012: transcribed from the signed MoEYS table (columns sum exactly to its totals 1,024,630 / 716,696). */
const TABLE_1980_2012: [number, string, number, number, number][] = [
  [1980, '8 Aug 1980', 82, 72, 87.8],
  [1981, '20 Jul 1981', 142, 104, 73.24],
  [1982, '20 Jul 1982', 164, 156, 95.12],
  [1983, '30 Jun 1983', 156, 135, 86.54],
  [1984, '26 Jun 1984', 834, 758, 90.89],
  [1985, '11 Jun 1985', 1616, 1133, 70.11],
  [1986, '26 Jun 1986', 3650, 2337, 64.03],
  [1987, '17 Jun 1987', 4746, 3567, 75.16],
  [1988, '17 Jun 1988', 5727, 4770, 83.29],
  [1989, '15 Jun 1989', 7833, 6254, 79.84],
  [1990, '14 Jun 1990', 11567, 10229, 88.43],
  [1991, '13 Jun 1991', 12475, 8283, 66.4],
  [1992, '18 Jun 1992', 15053, 11359, 75.46],
  [1993, '15 Jun 1993', 16208, 11391, 70.28],
  [1994, '16 Jun 1994', 17783, 751, 4.22],
  [1995, '27 Jun & 8 Aug 1995', 20829, 2517, 12.08],
  [1996, '10 Jun & 20 Jul 1996', 20081, 6105, 30.4],
  [1997, '21 Jul & 1 Sep 1997', 11743, 6638, 56.53],
  [1998, '17 Aug & 2 Oct 1998', 20650, 14678, 71.08],
  [1999, '19 Jul & 30 Aug 1999', 25263, 19868, 78.64],
  [2000, '14 Aug 2000', 23881, 16256, 68.07],
  [2001, '23 Jul 2001', 29645, 19749, 66.62],
  [2002, '22 Jul 2002', 47122, 18767, 39.83],
  [2003, '5 Aug 2003', 35391, 14360, 40.58],
  [2004, '6 Aug 2004', 38552, 18883, 48.98],
  [2005, '8 Aug 2005', 47372, 34174, 72.14],
  [2006, '7 Aug 2006', 55495, 43063, 77.6],
  [2007, '6 Aug 2007', 57676, 41964, 72.76],
  [2008, '4 Aug 2008', 78049, 55178, 70.7],
  [2009, '27 Jul 2009', 86610, 67377, 77.79],
  [2010, '26 Jul 2010', 105908, 87561, 81.9],
  [2011, '25 Jul 2011', 111287, 92236, 82.88],
  [2012, '6 Aug 2012', 111040, 96023, 86.48],
];

const NOTES: Record<number, string> = {
  1994: 'Lowest pass rate on record.',
  1995: 'Two exam sessions this year (also 1996–1999); figures are the year’s combined result.',
  2002: 'First exam of the new curriculum, graded A–F.',
  2010: 'Official rate printed as 81.90% in both MoEYS documents, although 87,561 ÷ 105,908 = 82.68%.',
  2011: 'Grades as reported in 2012; the official table gives 92,236 passed (the report said 92,232).',
  2012: 'Official table: 86.48% (early reports said 86.40% of 114,414 registered).',
};

const GRADES_2011_2012: Record<number, BacIIYear['grades']> = {
  2011: { A: 53, B: 2024, C: 12453, D: 24641, E: null },
  2012: { A: 105, B: 3505, C: null, D: null, E: null },
};

export const BAC_II: BacIIYear[] = [
  ...TABLE_1980_2012.map(([year, examDate, sat, passed, passRate]) => ({
    year,
    academicYear: `${year - 1}–${year}`,
    examDate,
    registered: null,
    sat,
    passed,
    passRate,
    ...(GRADES_2011_2012[year] ? { grades: GRADES_2011_2012[year] } : {}),
    ...(NOTES[year] ? { note: NOTES[year] } : {}),
    sources: (year >= 2011 ? ['moeys1980', 'moeysChart2014', 'seuksa2012'] : ['moeys1980', 'moeysChart2014']) as BacIIYear['sources'],
  })),
  {
    year: 2013,
    academicYear: '2012–2013',
    resultsDate: '30 Aug 2013',
    registered: null,
    sat: 105297,
    passed: 91370,
    passRate: 86.77,
    note: 'Last exam before the 2014 anti-cheating reform.',
    sources: ['seuksa2013', 'moeysChart2014'],
  },
  {
    year: 2014,
    academicYear: '2013–2014',
    examDate: '4–5 Aug 2014',
    resultsDate: '29 Aug 2014',
    registered: null,
    sat: 89937,
    passed: 23126,
    passRate: 25.72,
    grades: { A: 11, B: 280, C: null, D: null, E: null },
    note: 'First year of the reform; figures are for the first session. Grade B is 280 in the MoEYS report (the minister said 289 on TV and also gave C 800, D 1,832, E ≈20,000, which the report does not list). A second session in Oct 2014 added 10,871 passes (17.94%; grades C 1, D 55, E 10,815); one outlet reported 12,199 of 68,000.',
    sources: ['rfa2014', 'kth2023', 'cnc2019', 'seuksa2014', 'moeysChart2014'],
  },
  {
    year: 2015,
    academicYear: '2014–2015',
    resultsDate: '12 Sep 2015',
    registered: null,
    sat: 83325,
    passed: 46560,
    passRate: 55.88,
    grades: { A: 108, B: 1085, C: 3292, D: 6093, E: 35982 },
    note: 'No second-chance exam this year. One report gives 55.87%.',
    sources: ['cnc2019', 'kth2023', 'kt2015', 'kt2016'],
  },
  {
    year: 2016,
    academicYear: '2015–2016',
    examDate: '22–23 Aug 2016',
    resultsDate: '10 Sep 2016',
    registered: null,
    sat: 89661,
    passed: 55753,
    passRate: 62.18,
    grades: { A: 405, B: 2801, C: 5595, D: 8835, E: 38117 },
    note: 'One report gives 62.16%; the MoEYS series uses 62.18%.',
    sources: ['seuksa2016', 'kt2016', 'cnc2019', 'kth2023'],
  },
  {
    year: 2017,
    academicYear: '2016–2017',
    resultsDate: '10 Sep 2017',
    registered: null,
    sat: 99728,
    passed: 63668,
    passRate: 63.84,
    grades: { A: 424, B: 2464, C: 5000, D: 9123, E: 46657 },
    note: 'Minimum passing mark: 47%.',
    sources: ['cambonomist2017', 'ppp2017', 'cnc2019', 'kth2023'],
  },
  {
    year: 2018,
    academicYear: '2017–2018',
    examDate: '21–22 Aug 2018',
    resultsDate: 'Sep 2018 (corrected)',
    registered: 117061,
    sat: null,
    passed: 76034,
    passRate: 67.07,
    grades: { A: 408, B: 2222, C: 6041, D: 15180, E: 52183 },
    note: 'Corrected results. The first release (75,059 passed, 66.21%; A 290, B 1,532, C 4,631, D 13,999, E 54,607; 115,268 candidates) was revised after scoring errors were found. 117,061 is the candidate total as published; the rate is on those who sat.',
    sources: ['cnc2019', 'kth2023', 'kt2019'],
  },
  {
    year: 2019,
    academicYear: '2018–2019',
    examDate: '19–20 Aug 2019',
    resultsDate: '9 Sep 2019',
    registered: 117024,
    sat: null,
    passed: 79052,
    passRate: 68.62,
    grades: { A: 443, B: 2430, C: 5847, D: 14100, E: 56232 },
    sources: ['kt2019', 'cnc2019', 'kth2023'],
  },
  {
    year: 2020,
    academicYear: '2019–2020',
    examDate: 'planned 11 Jan 2021',
    resultsDate: '14 Dec 2020 (cancelled)',
    registered: 121108,
    sat: null,
    passed: null,
    passRate: null,
    cancelled: true,
    note: 'Exam cancelled because of COVID-19 (the “28 November” outbreak). All registered students passed automatically, without grades.',
    sources: ['kt2020', 'ppp2022', 'cn2025'],
  },
  {
    year: 2021,
    academicYear: '2020–2021',
    examDate: '27–28 Dec 2021',
    resultsDate: '14 Jan 2022',
    registered: 114187,
    sat: null,
    passed: 72016,
    passRate: 65.65,
    grades: { A: 1753, B: 5215, C: 11634, D: 23499, E: 29915 },
    note: 'Official release: 65.65% (one later report says 65.64%; another printed E as 29,925).',
    sources: ['ppp2022', 'kth2023', 'kt2022', 'cn2022'],
  },
  {
    year: 2022,
    academicYear: '2021–2022',
    examDate: '5–6 Dec 2022',
    resultsDate: '22 Dec 2022',
    registered: 128135,
    sat: 125735,
    passed: 90950,
    passRate: 72.33,
    grades: { A: 1049, B: 7232, C: 19053, D: 31166, E: 32450 },
    note: '125,735 sat (MoEYS report); 128,135 was published as the candidate total (registered). One report printed C 19,953 and E 32,459; the counts used here sum to 90,950.',
    sources: ['kth2023', 'kt2022', 'cn2022'],
  },
  {
    year: 2023,
    academicYear: '2022–2023',
    examDate: '6 Nov 2023',
    resultsDate: 'Nov 2023',
    registered: 137412,
    sat: 135084,
    passed: 98460,
    passRate: 72.89,
    grades: { A: 1673, B: 6964, C: 18308, D: 34246, E: 37269 },
    sources: ['kth2023', 'cn2023', 'cnc2024'],
  },
  {
    year: 2024,
    academicYear: '2023–2024',
    examDate: '8–9 Oct 2024',
    resultsDate: '30–31 Oct 2024',
    registered: 137040,
    sat: 134634,
    passed: 106351,
    passRate: 79,
    grades: { A: 2216, B: 9701, C: 22675, D: 36683, E: 35076 },
    note: 'Sat = 137,040 registered − 2,406 absent (1.76%), both published by MoEYS; 106,351 ÷ 134,634 = 79.00%, the official rate. Exam held in 230 centres.',
    sources: ['kt2024b', 'cnc2024', 'kt2024'],
  },
  {
    year: 2025,
    academicYear: '2024–2025',
    examDate: '28–29 Aug 2025',
    resultsDate: '19–20 Sep 2025',
    registered: 146720,
    sat: null,
    passed: 122473,
    passRate: 84.56,
    grades: { A: 3003, B: 9901, C: 28801, D: 45859, E: 34909 },
    note: 'Highest pass rate since the 2014 reform. Registered: 40,678 science, 106,042 social science.',
    sources: ['freshnews2025', 'kt2025', 'cn2025'],
  },
  {
    year: 2026,
    academicYear: '2025–2026',
    examDate: '10–11 Aug 2026',
    resultsDate: '1–2 Sep 2026',
    registered: 151238,
    sat: null,
    passed: 125975,
    passRate: 84.06,
    grades: { A: 2022, B: 8848, C: 23422, D: 44869, E: 46814 },
    note: 'Passed: 32,821 science, 93,154 social science. Grade A: 1,766 science (87.8%), 256 social science.',
    sources: ['cn2026', 'kth2026', 'kt2026'],
  },
];

export const GRADE_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;

/** Candidates for a year: those who sat, else registered. */
export const candidates = (y: BacIIYear) => y.sat ?? y.registered;
export const hasFullGrades = (y: BacIIYear) => !!y.grades && GRADE_KEYS.every((k) => y.grades![k] != null);
