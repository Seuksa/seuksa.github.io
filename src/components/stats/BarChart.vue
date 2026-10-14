<script setup lang="ts">
import { computed, ref } from 'vue';

export interface BarItem {
  label: string;
  /** Optional second line under the axis label (e.g. an English code under a Khmer one). */
  sublabel?: string;
  value: number | null;
  /** Tooltip rows after the headline value: [label, value]. */
  details?: [string, string][];
  /** Shown instead of a bar when value is null (e.g. "No exam"). */
  emptyText?: string;
}

const props = withDefaults(
  defineProps<{
    items: BarItem[];
    title: string;
    unit?: 'pct' | 'count';
    valueLabel?: string;
    /** Labels whose value is printed on the bar cap (keep it selective). */
    labelled?: string[];
    /** Show an x-axis label every n bars (plus the last one). */
    tickEvery?: number;
    /** Vertical annotation lines: [label of the bar, text]. */
    annotations?: [string, string][];
    max?: number;
  }>(),
  { unit: 'count', valueLabel: 'Value', labelled: () => [], tickEvery: 1, annotations: () => [] },
);

const W = 720;
const H = 300;
const hasSub = props.items.some((i) => i.sublabel);
const M = { l: 52, r: 12, t: 28, b: hasSub ? 44 : 30 };
const pw = W - M.l - M.r;
const ph = H - M.t - M.b;

const maxValue = computed(() => {
  if (props.max) return props.max;
  const m = Math.max(...props.items.map((i) => i.value ?? 0));
  const step = niceStep(m / 4);
  return Math.ceil(m / step) * step;
});
function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
const ticks = computed(() => {
  const step = maxValue.value / 4;
  return [0, 1, 2, 3, 4].map((i) => i * step);
});

const slot = computed(() => pw / props.items.length);
const barW = computed(() => Math.max(2, Math.min(28, slot.value - 2))); // 2px surface gap between bars
const x = (i: number) => M.l + slot.value * i + (slot.value - barW.value) / 2;
const y = (v: number) => M.t + ph - (v / maxValue.value) * ph;

const nf = new Intl.NumberFormat('en-US');
const fmt = (v: number | null) =>
  v == null ? '—' : props.unit === 'pct' ? `${v.toFixed(2).replace(/\.00$/, '')}%` : nf.format(v);
const fmtTick = (v: number) =>
  props.unit === 'pct' ? `${v}%` : v >= 1000 ? `${nf.format(Math.round(v / 100) / 10)}K` : nf.format(v);

/** Rounded data-end (4px), square at the baseline. */
function barPath(i: number, v: number) {
  const x0 = x(i);
  const w = barW.value;
  const top = y(v);
  const base = M.t + ph;
  const r = Math.min(4, w / 2, base - top);
  return `M${x0},${base}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + w - r}Q${x0 + w},${top} ${x0 + w},${top + r}V${base}Z`;
}

const active = ref<number | null>(null);
const tip = computed(() => (active.value == null ? null : props.items[active.value]));
const tipLeft = computed(() => (active.value == null ? 0 : ((x(active.value) + barW.value / 2) / W) * 100));

function onKey(e: KeyboardEvent) {
  const n = props.items.length;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const cur = active.value ?? (e.key === 'ArrowRight' ? -1 : n);
    active.value = Math.min(n - 1, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)));
  } else if (e.key === 'Home') active.value = 0;
  else if (e.key === 'End') active.value = n - 1;
  else if (e.key === 'Escape') active.value = null;
}
/** Regular ticks every n bars, plus the last bar; drop a regular tick that would crowd the last one. */
const showTick = (i: number) => {
  const last = props.items.length - 1;
  if (props.tickEvery <= 1) return true;
  return i === last || (i % props.tickEvery === 0 && last - i >= Math.max(2, props.tickEvery / 2));
};
const index = (label: string) => props.items.findIndex((i) => i.label === label);
</script>

<template>
  <div class="relative">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="h-auto w-full text-surface-600 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg dark:text-surface-400"
      role="img"
      :aria-label="`${title}. Use left and right arrow keys to read each year; all values are also in the table below.`"
      tabindex="0"
      @keydown="onKey"
      @blur="active = null"
      @pointerleave="active = null"
    >
      <!-- grid + y axis -->
      <g font-size="11" fill="currentColor">
        <g v-for="t in ticks" :key="t">
          <line :x1="M.l" :x2="W - M.r" :y1="y(t)" :y2="y(t)" stroke="currentColor" :stroke-opacity="t === 0 ? 0.4 : 0.12" />
          <text :x="M.l - 8" :y="y(t) + 4" text-anchor="end">{{ fmtTick(t) }}</text>
        </g>
      </g>

      <!-- annotations -->
      <g v-for="[label, text] in annotations" :key="label" class="text-surface-500">
        <template v-if="index(label) >= 0">
          <line
            :x1="x(index(label)) + barW / 2"
            :x2="x(index(label)) + barW / 2"
            :y1="M.t - 14"
            :y2="M.t + ph"
            stroke="currentColor"
            stroke-dasharray="3 3"
            stroke-opacity="0.6"
          />
          <text :x="x(index(label)) + barW / 2 + 4" :y="M.t - 16" font-size="11" fill="currentColor">{{ text }}</text>
        </template>
      </g>

      <!-- bars -->
      <g v-for="(item, i) in items" :key="item.label">
        <path
          v-if="item.value != null"
          :d="barPath(i, item.value)"
          class="fill-primary-500 transition-opacity"
          :class="active != null && active !== i ? 'opacity-45' : ''"
        />
        <text
          v-else-if="item.emptyText"
          :x="x(i) + barW / 2"
          :y="M.t + ph - 6"
          font-size="10"
          text-anchor="middle"
          class="fill-surface-500"
        >
          ×
        </text>
        <text
          v-if="item.value != null && labelled.includes(item.label)"
          :x="x(i) + barW / 2"
          :y="y(item.value) - 6"
          font-size="11"
          font-weight="600"
          text-anchor="middle"
          class="fill-surface-800 dark:fill-surface-100"
        >
          {{ fmt(item.value) }}
        </text>
        <text
          v-if="showTick(i)"
          :x="x(i) + barW / 2"
          :y="hasSub ? H - 24 : H - 10"
          font-size="11"
          text-anchor="middle"
          fill="currentColor"
        >
          {{ item.label }}
        </text>
        <text
          v-if="item.sublabel && showTick(i)"
          :x="x(i) + barW / 2"
          :y="H - 8"
          font-size="9"
          text-anchor="middle"
          fill="currentColor"
          fill-opacity="0.7"
        >
          {{ item.sublabel }}
        </text>
        <!-- hit target: the full slot height, wider than the bar -->
        <rect
          :x="M.l + slot * i"
          :y="M.t"
          :width="slot"
          :height="ph"
          fill="transparent"
          @pointerenter="active = i"
          @pointerdown="active = i"
        >
          <title>{{ item.label }}: {{ item.value == null ? item.emptyText || '—' : fmt(item.value) }}</title>
        </rect>
      </g>
    </svg>

    <!-- tooltip -->
    <div
      v-if="tip"
      class="pointer-events-none absolute top-2 z-10 min-w-56 -translate-x-1/2 rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-xs shadow-lg dark:border-surface-700 dark:bg-surface-900"
      :style="{ left: `clamp(5.5rem, ${tipLeft}%, calc(100% - 5.5rem))` }"
      role="status"
    >
      <p class="text-sm font-semibold text-surface-900 dark:text-surface-0">
        {{ tip.value == null ? tip.emptyText || 'No data' : fmt(tip.value) }}
      </p>
      <p class="flex items-center gap-1.5 text-surface-500">
        <span class="inline-block h-0.5 w-3 rounded bg-primary-500" aria-hidden="true" />{{ valueLabel }} · {{ tip.label }}
      </p>
      <dl v-if="tip.details?.length" class="mt-1.5 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 border-t border-surface-100 pt-1.5 dark:border-surface-800">
        <template v-for="[k, v] in tip.details" :key="k">
          <dt class="whitespace-nowrap text-surface-500">{{ k }}</dt>
          <dd class="text-right font-medium whitespace-nowrap text-surface-800 tabular-nums dark:text-surface-200">{{ v }}</dd>
        </template>
      </dl>
    </div>
  </div>
</template>
