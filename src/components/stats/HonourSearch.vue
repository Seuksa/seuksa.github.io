<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Paginator from 'primevue/paginator';

interface Row {
  year: number;
  grade: number;
  subject: string;
  subjectKm: string;
  rank: number;
  name: string;
  gender: 'F' | 'M' | null;
  school: string;
  province: string;
  provinceKm: string;
  url: string;
}

const props = withDefaults(defineProps<{ rows: Row[]; provinces: { key: string; label: string }[]; perPage?: number }>(), {
  perPage: 25,
});

const q = ref('');
const province = ref<string | null>(null);
const grade = ref<number | null>(null);
const subject = ref<string | null>(null);
const first = ref(0);

onMounted(() => {
  const p = new URLSearchParams(location.search);
  q.value = p.get('q') ?? '';
  province.value = p.get('province');
});
watch([q, province], () => {
  const u = new URL(location.href);
  q.value ? u.searchParams.set('q', q.value) : u.searchParams.delete('q');
  province.value ? u.searchParams.set('province', province.value) : u.searchParams.delete('province');
  history.replaceState(null, '', u);
});

const norm = (s: string) => s.normalize('NFC').replace(/[​-‍\s]+/g, '').toLowerCase();
const filtered = computed(() => {
  const t = norm(q.value);
  return props.rows.filter(
    (r) =>
      (!province.value || r.province === province.value) &&
      (!grade.value || r.grade === grade.value) &&
      (!subject.value || r.subject === subject.value) &&
      (!t || norm(r.name).includes(t) || norm(r.school).includes(t) || String(r.year) === q.value.trim()),
  );
});
const page = computed(() => filtered.value.slice(first.value, first.value + props.perPage));
watch([q, province, grade, subject], () => (first.value = 0));

const khmerDigits = (n: number) => String(n).replace(/\d/g, (d) => '០១២៣៤៥៦៧៨៩'[Number(d)]);
const medal = (rank: number) => (rank === 1 ? 'bg-amber-400 text-amber-950' : rank === 2 ? 'bg-slate-300 text-slate-900' : rank === 3 ? 'bg-orange-300 text-orange-950' : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200');
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <IconField class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="q" placeholder="ស្វែងរកឈ្មោះ ឬសាលា · Search a name or school" class="w-full" aria-label="Search honourees" />
      </IconField>
      <Select v-model="province" :options="provinces" option-label="label" option-value="key" placeholder="All provinces" show-clear filter class="lg:w-56" aria-label="Province" />
      <SelectButton v-model="grade" :options="[{ l: 'Grade 12', v: 12 }, { l: 'Grade 9', v: 9 }]" option-label="l" option-value="v" aria-label="Grade" />
      <SelectButton
        v-model="subject"
        :options="[{ l: 'ខ្មែរ', v: 'khmer' }, { l: 'Math', v: 'math' }, { l: 'Physics', v: 'physics' }]"
        option-label="l"
        option-value="v"
        aria-label="Subject"
      />
    </div>
    <p class="mt-3 text-sm text-surface-500" aria-live="polite">{{ filtered.length }} of {{ rows.length }} honourees</p>

    <div class="mt-4 overflow-x-auto rounded-2xl border border-surface-200 dark:border-surface-800">
      <table class="w-full min-w-[44rem] text-left text-sm">
        <thead class="bg-surface-50 text-xs text-surface-600 dark:bg-surface-900 dark:text-surface-400">
          <tr>
            <th class="px-3 py-2.5 font-semibold">Year</th>
            <th class="px-3 py-2.5 font-semibold">Rank</th>
            <th class="px-3 py-2.5 font-semibold">Name · ឈ្មោះ</th>
            <th class="px-3 py-2.5 font-semibold">Subject</th>
            <th class="px-3 py-2.5 font-semibold">School · សាលា</th>
            <th class="px-3 py-2.5 font-semibold">Province</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100 dark:divide-surface-800" lang="km">
          <tr v-for="r in page" :key="r.url" class="hover:bg-primary-50/40 dark:hover:bg-primary-950/30">
            <td class="px-3 py-2 tabular-nums"><a :href="r.url" class="text-primary-700 hover:underline dark:text-primary-300">{{ r.year }}</a></td>
            <td class="px-3 py-2">
              <span class="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold" :class="medal(r.rank)">{{ r.rank }}</span>
            </td>
            <td class="px-3 py-2 font-medium">{{ r.name }}</td>
            <td class="px-3 py-2 text-surface-600 dark:text-surface-400">{{ r.subjectKm }} · ថ្នាក់ទី{{ khmerDigits(r.grade) }}</td>
            <td class="px-3 py-2">{{ r.school || "—" }}</td>
            <td class="px-3 py-2">{{ r.provinceKm }}</td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="px-3 py-10 text-center text-surface-500">No honouree matches.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Paginator
      v-if="filtered.length > perPage"
      v-model:first="first"
      :rows="perPage"
      :total-records="filtered.length"
      class="mt-6"
      template="PrevPageLink PageLinks NextPageLink"
    />
  </div>
</template>
