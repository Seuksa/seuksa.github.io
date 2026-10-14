<script setup lang="ts">
import { computed, ref } from 'vue';
import SelectButton from 'primevue/selectbutton';
import BarChart from './BarChart.vue';

interface Row {
  province: string;
  grade: number;
  rank: number;
  subject: string;
}
interface Prov {
  key: string;
  km: string;
  en: string;
  shortKm: string;
  code: string;
}

const props = defineProps<{ rows: Row[]; provinces: Prov[]; subjects: Record<string, string> }>();

// String values: PrimeVue SelectButton cannot select an option whose value is null.
const choice = ref<'all' | '12' | '9'>('all');
const grade = computed(() => (choice.value === 'all' ? null : Number(choice.value)));
const options = [
  { label: 'All', value: 'all' },
  { label: 'Grade 12', value: '12' },
  { label: 'Grade 9', value: '9' },
];

const byKey = Object.fromEntries(props.provinces.map((p) => [p.key, p]));
const items = computed(() => {
  const rows = props.rows.filter((r) => !grade.value || r.grade === grade.value);
  const counts = new Map<string, Row[]>();
  for (const r of rows) counts.set(r.province, [...(counts.get(r.province) ?? []), r]);
  return [...counts]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([k, list]) => {
      const p = byKey[k];
      const details: [string, string][] = [
        ['Province', `${p.km} · ${p.en}`],
        ['Rank 1', String(list.filter((r) => r.rank === 1).length)],
      ];
      if (!grade.value) details.push(['Grade 12 / 9', `${list.filter((r) => r.grade === 12).length} / ${list.filter((r) => r.grade === 9).length}`]);
      for (const [s, label] of Object.entries(props.subjects)) details.push([label, String(list.filter((r) => r.subject === s).length)]);
      const qs = new URLSearchParams({ province: k, ...(grade.value ? { grade: String(grade.value) } : {}) });
      return { label: p.shortKm, sublabel: p.code, value: list.length, details, href: `/stats/outstanding-students/?${qs}#s-search` };
    });
});
const total = computed(() => items.value.reduce((n, i) => n + i.value, 0));
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <SelectButton v-model="choice" :options="options" option-label="label" option-value="value" :allow-empty="false" aria-label="Grade" />
      <span class="text-sm text-surface-500">{{ total }} honourees · {{ items.length }} provinces</span>
    </div>
    <!-- key forces a clean re-render when the bar set changes -->
    <BarChart
      :key="choice"
      title="Honourees by province"
      value-label="Honourees"
      :items="items"
      :labelled="items.length ? [items[0].label] : []"
      :tick-every="1"
    />
  </div>
</template>
