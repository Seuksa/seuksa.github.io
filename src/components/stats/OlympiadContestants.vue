<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

interface Person {
  year: number;
  name: string;
  rank: number | null;
  award: 'G' | 'S' | 'B' | 'HM' | null;
  url?: string;
  honours?: { year: number; label: string; href: string; km: string; possible: boolean }[];
}
const props = defineProps<{ lists: { competition: string; people: Person[] }[] }>();

const AWARD: Record<string, string> = { G: 'Gold', S: 'Silver', B: 'Bronze', HM: 'Honourable Mention' };
const MEDAL: Record<string, string> = {
  G: 'bg-amber-400 text-amber-950',
  S: 'bg-slate-300 text-slate-900',
  B: 'bg-orange-300 text-orange-950',
  HM: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100',
};

const year = ref<number | null>(null);
onMounted(() => {
  year.value = Number(new URLSearchParams(location.search).get('year')) || null;
});
watch(year, () => {
  const u = new URL(location.href);
  year.value ? u.searchParams.set('year', String(year.value)) : u.searchParams.delete('year');
  history.replaceState(null, '', u);
});

const years = computed(() =>
  [...new Set(props.lists.flatMap((l) => l.people.map((p) => p.year)))]
    .sort((a, b) => b - a)
    .map((y) => ({ y, counts: props.lists.map((l) => ({ c: l.competition, n: l.people.filter((p) => p.year === y).length })) })),
);
const total = computed(() => props.lists.reduce((n, l) => n + l.people.length, 0));
const shown = computed(() => props.lists.map((l) => ({ ...l, people: year.value ? l.people.filter((p) => p.year === year.value) : l.people })));
const chip = (on: boolean) =>
  on
    ? 'border-primary-600 bg-primary-600 text-white'
    : 'border-surface-200 text-surface-700 hover:border-primary-300 dark:border-surface-700 dark:text-surface-300';
</script>

<template>
  <div>
    <div class="mt-5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by year">
      <span class="mr-1 text-xs font-semibold text-surface-500">Year · ឆ្នាំ</span>
      <button type="button" class="rounded-full border px-3 py-1 text-xs font-medium transition" :class="chip(!year)" :aria-pressed="!year" @click="year = null">
        All <span class="opacity-70">{{ total }}</span>
      </button>
      <button
        v-for="x in years"
        :key="x.y"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition"
        :class="chip(year === x.y)"
        :aria-pressed="year === x.y"
        :title="x.counts.map((c) => `${c.c}: ${c.n}`).join(' · ')"
        @click="year = year === x.y ? null : x.y"
      >
        {{ x.y }}
        <span class="opacity-70">{{ x.counts.filter((c) => c.n).map((c) => c.c).join('+') }}</span>
      </button>
    </div>

    <div class="mt-5 grid gap-6 lg:grid-cols-2">
      <div v-for="l in shown" :key="l.competition" class="overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800">
        <h3 class="border-b border-surface-200 px-4 py-3 font-semibold dark:border-surface-800">
          {{ l.competition }} <span class="font-normal text-surface-500">· {{ l.people.length }} contestant{{ l.people.length === 1 ? '' : 's' }}{{ year ? ` in ${year}` : '' }}</span>
        </h3>
        <table v-if="l.people.length" class="w-full text-left text-sm tabular-nums">
          <thead class="bg-surface-50 text-xs text-surface-600 dark:bg-surface-900 dark:text-surface-400">
            <tr>
              <th class="px-3 py-2 font-semibold">Year</th>
              <th class="px-3 py-2 font-semibold">Name</th>
              <th class="px-3 py-2 font-semibold">Award</th>
              <th class="px-3 py-2 text-right font-semibold">Rank</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-800">
            <tr v-for="p in l.people" :key="`${p.year}-${p.name}`">
              <td class="px-3 py-2">
                <button type="button" class="hover:text-primary-700 hover:underline dark:hover:text-primary-300" :title="`Show only ${p.year}`" @click="year = p.year">{{ p.year }}</button>
              </td>
              <td class="px-3 py-2 font-medium">
                <a v-if="p.url" :href="p.url" rel="noopener" class="hover:text-primary-700 hover:underline dark:hover:text-primary-300">{{ p.name }}</a>
                <template v-else>{{ p.name }}</template>
                <span v-if="p.honours?.length" class="mt-0.5 flex flex-wrap gap-1">
                  <a
                    v-for="h in p.honours"
                    :key="h.href"
                    :href="h.href"
                    class="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-normal text-amber-900 hover:border-amber-500 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                    :title="`National outstanding students: ${h.km}${h.possible ? ' – possible match, spellings differ' : ''}`"
                  >
                    <i class="pi pi-trophy text-[10px]" aria-hidden="true" />
                    <span>{{ h.label }}{{ h.possible ? ' ?' : '' }}</span>
                    <span lang="km">· {{ h.km }}</span>
                  </a>
                </span>
              </td>
              <td class="px-3 py-2">
                <span v-if="p.award" class="rounded px-1.5 py-0.5 text-xs" :class="MEDAL[p.award]">{{ AWARD[p.award] }}</span>
                <span v-else class="text-surface-400">–</span>
              </td>
              <td class="px-3 py-2 text-right">{{ p.rank ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="px-4 py-8 text-center text-sm text-surface-500">Cambodia did not take part in the {{ l.competition }} in {{ year }}.</p>
      </div>
    </div>
  </div>
</template>
