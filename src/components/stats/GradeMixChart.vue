<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  rows: { year: number; grades: Record<'A' | 'B' | 'C' | 'D' | 'E', number> }[];
}>();

const KEYS = ['A', 'B', 'C', 'D', 'E'] as const;
/** Ordinal grades → one-hue ramp, strongest step for A; the anchor flips in dark mode. */
const FILL: Record<(typeof KEYS)[number], string> = {
  A: 'bg-primary-800 dark:bg-primary-200',
  B: 'bg-primary-600 dark:bg-primary-300',
  C: 'bg-primary-400 dark:bg-primary-500',
  D: 'bg-primary-300 dark:bg-primary-700',
  E: 'bg-primary-200 dark:bg-primary-900',
};
const INK: Record<(typeof KEYS)[number], string> = {
  A: 'text-white dark:text-primary-950',
  B: 'text-white dark:text-primary-950',
  C: 'text-primary-950 dark:text-white',
  D: 'text-primary-950 dark:text-white',
  E: 'text-primary-950 dark:text-white',
};

const nf = new Intl.NumberFormat('en-US');
const data = computed(() =>
  props.rows.map((r) => {
    const total = KEYS.reduce((s, k) => s + r.grades[k], 0);
    return { year: r.year, total, segs: KEYS.map((k) => ({ k, n: r.grades[k], pct: (r.grades[k] / total) * 100 })) };
  }),
);
const active = ref<string | null>(null);
</script>

<template>
  <div>
    <ul class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-600 dark:text-surface-400" aria-label="Legend">
      <li v-for="k in KEYS" :key="k" class="flex items-center gap-1.5">
        <span class="size-3 rounded-sm" :class="FILL[k]" aria-hidden="true" />Grade {{ k }}
      </li>
    </ul>
    <div class="space-y-2.5">
      <div v-for="row in data" :key="row.year" class="grid grid-cols-[3rem_1fr] items-center gap-3">
        <span class="text-sm font-medium text-surface-700 tabular-nums dark:text-surface-300">{{ row.year }}</span>
        <div class="flex h-8 gap-0.5" role="list" :aria-label="`Grades of students who passed in ${row.year}`">
          <div
            v-for="s in row.segs"
            :key="s.k"
            role="listitem"
            tabindex="0"
            class="group relative flex items-center justify-center first:rounded-l last:rounded-r outline-none focus-visible:ring-2 focus-visible:ring-surface-900 dark:focus-visible:ring-surface-0"
            :class="[FILL[s.k], active && active !== `${row.year}${s.k}` ? 'opacity-60' : '']"
            :style="{ width: `${s.pct}%` }"
            :aria-label="`${row.year}, grade ${s.k}: ${nf.format(s.n)} (${s.pct.toFixed(1)}%)`"
            @pointerenter="active = `${row.year}${s.k}`"
            @pointerleave="active = null"
            @focus="active = `${row.year}${s.k}`"
            @blur="active = null"
          >
            <span v-if="s.pct >= 9" class="text-[11px] font-semibold tabular-nums" :class="INK[s.k]">{{ s.k }} {{ s.pct.toFixed(0) }}%</span>
            <span
              class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-xs whitespace-nowrap shadow-lg group-hover:block group-focus-visible:block dark:border-surface-700 dark:bg-surface-900"
            >
              <strong class="block text-sm text-surface-900 dark:text-surface-0">{{ nf.format(s.n) }} · {{ s.pct.toFixed(1) }}%</strong>
              <span class="text-surface-500">Grade {{ s.k }} · {{ row.year }} · of {{ nf.format(row.total) }} passed</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
