/** Cambodia's 25 capital/provinces, with Khmer spellings seen in MoEYS documents (for matching published lists). */
export interface Province {
  key: string;
  en: string;
  km: string;
  /** Short codes for charts and tight spaces (site convention: first consonant of each word; English 3-letter). */
  shortKm: string;
  code: string;
  /** Other spellings found in official lists (without the ខេត្ត / រាជធានី prefix). */
  aliases?: string[];
}

export const PROVINCES: Province[] = [
  { key: 'phnom-penh', en: 'Phnom Penh', km: 'ភ្នំពេញ', shortKm: 'ភព', code: 'PP', aliases: ['រាជធានីភ្នំពេញ', 'ក្រុងភ្នំពេញ'] },
  { key: 'banteay-meanchey', en: 'Banteay Meanchey', km: 'បន្ទាយមានជ័យ', shortKm: 'បម', code: 'BMC' },
  { key: 'battambang', en: 'Battambang', km: 'បាត់ដំបង', shortKm: 'បប', code: 'BTB' },
  { key: 'kampong-cham', en: 'Kampong Cham', km: 'កំពង់ចាម', shortKm: 'កច', code: 'KPC' },
  { key: 'kampong-chhnang', en: 'Kampong Chhnang', km: 'កំពង់ឆ្នាំង', shortKm: 'កឆ', code: 'KCH' },
  { key: 'kampong-speu', en: 'Kampong Speu', km: 'កំពង់ស្ពឺ', shortKm: 'កស', code: 'KSP' },
  { key: 'kampong-thom', en: 'Kampong Thom', km: 'កំពង់ធំ', shortKm: 'កធ', code: 'KTM' },
  { key: 'kampot', en: 'Kampot', km: 'កំពត', shortKm: 'កព', code: 'KPT' },
  { key: 'kandal', en: 'Kandal', km: 'កណ្តាល', shortKm: 'កណ', code: 'KDL', aliases: ['កណ្ដាល'] },
  { key: 'kep', en: 'Kep', km: 'កែប', shortKm: 'កប', code: 'KEP', aliases: ['ក្រុងកែប'] },
  { key: 'koh-kong', en: 'Koh Kong', km: 'កោះកុង', shortKm: 'កក', code: 'KKG' },
  { key: 'kratie', en: 'Kratie', km: 'ក្រចេះ', shortKm: 'ក្រ', code: 'KRT' },
  { key: 'mondulkiri', en: 'Mondulkiri', km: 'មណ្ឌលគិរី', shortKm: 'មគ', code: 'MDK' },
  { key: 'oddar-meanchey', en: 'Oddar Meanchey', km: 'ឧត្តរមានជ័យ', shortKm: 'ឧម', code: 'OMC', aliases: ['ឧត្ដរមានជ័យ', 'ឧត្តមានជ័យ'] },
  { key: 'pailin', en: 'Pailin', km: 'ប៉ៃលិន', shortKm: 'បល', code: 'PLN', aliases: ['ក្រុងប៉ៃលិន'] },
  { key: 'preah-sihanouk', en: 'Preah Sihanouk', km: 'ព្រះសីហនុ', shortKm: 'ព្រស', code: 'PSN', aliases: ['ក្រុងព្រះសីហនុ'] },
  { key: 'preah-vihear', en: 'Preah Vihear', km: 'ព្រះវិហារ', shortKm: 'ពហ', code: 'PVH' },
  { key: 'prey-veng', en: 'Prey Veng', km: 'ព្រៃវែង', shortKm: 'ពវ', code: 'PVG' },
  { key: 'pursat', en: 'Pursat', km: 'ពោធិ៍សាត់', shortKm: 'ពស', code: 'PST' },
  { key: 'ratanakiri', en: 'Ratanakiri', km: 'រតនគិរី', shortKm: 'រគ', code: 'RTK' },
  { key: 'siem-reap', en: 'Siem Reap', km: 'សៀមរាប', shortKm: 'សរ', code: 'SRP' },
  { key: 'stung-treng', en: 'Stung Treng', km: 'ស្ទឹងត្រែង', shortKm: 'សត', code: 'STG' },
  { key: 'svay-rieng', en: 'Svay Rieng', km: 'ស្វាយរៀង', shortKm: 'ស្វរ', code: 'SVR' },
  { key: 'takeo', en: 'Takeo', km: 'តាកែវ', shortKm: 'តក', code: 'TKO' },
  { key: 'tbong-khmum', en: 'Tbong Khmum', km: 'ត្បូងឃ្មុំ', shortKm: 'តឃ', code: 'TBK' },
];

export const provinceByKey = Object.fromEntries(PROVINCES.map((p) => [p.key, p])) as Record<string, Province>;
