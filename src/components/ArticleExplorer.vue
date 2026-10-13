<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Paginator from 'primevue/paginator';
import Tag from 'primevue/tag';
import type { Card } from '../lib/site';

const props = withDefaults(defineProps<{ items: Card[]; perPage?: number }>(), { perPage: 12 });

const query = ref('');
const category = ref<string | null>(null);
const year = ref<number | null>(null);
const first = ref(0);

const count = <T,>(values: T[]) =>
  [...values.reduce((m, v) => m.set(v, (m.get(v) || 0) + 1), new Map<T, number>())];

const categories = computed(() =>
  count(props.items.flatMap((i) => i.categories))
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => ({ label: `${label} (${n})`, value: label })),
);
const years = computed(() =>
  count(props.items.map((i) => i.year))
    .sort((a, b) => b[0] - a[0])
    .map(([y, n]) => ({ label: `${y} (${n})`, value: y })),
);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.items.filter(
    (i) =>
      (!category.value || i.categories.includes(category.value)) &&
      (!year.value || i.year === year.value) &&
      (!q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
  );
});
const page = computed(() => filtered.value.slice(first.value, first.value + props.perPage));

watch([query, category, year], () => (first.value = 0));
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 sm:flex-row">
      <IconField class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="query" placeholder="Filter by title or text…" class="w-full" aria-label="Filter articles" />
      </IconField>
      <Select
        v-if="categories.length > 1"
        v-model="category"
        :options="categories"
        option-label="label"
        option-value="value"
        placeholder="All categories"
        show-clear
        class="sm:w-60"
        aria-label="Category"
      />
      <Select
        v-if="years.length > 1"
        v-model="year"
        :options="years"
        option-label="label"
        option-value="value"
        placeholder="All years"
        show-clear
        class="sm:w-40"
        aria-label="Year"
      />
    </div>

    <p v-if="!filtered.length" class="py-16 text-center text-surface-500">Nothing matches your filter.</p>

    <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in page" :key="item.id">
        <a
          :href="item.url"
          class="group flex h-full flex-col overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg dark:border-surface-800 dark:bg-surface-900"
        >
          <img v-if="item.cover" :src="item.cover" alt="" loading="lazy" class="aspect-[16/9] w-full object-cover" />
          <div class="flex flex-1 flex-col gap-3 p-5">
            <div class="flex flex-wrap items-center gap-2 text-xs text-surface-500">
              <time>{{ item.date }}</time>
              <Tag v-for="c in item.categories.slice(0, 2)" :key="c" :value="c" severity="secondary" class="!text-[11px]" />
            </div>
            <h3
              :lang="item.lang === 'en' ? 'en' : 'km'"
              class="text-lg font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-0 dark:group-hover:text-primary-300"
            >
              {{ item.title }}
            </h3>
            <p :lang="item.lang === 'en' ? 'en' : 'km'" class="line-clamp-3 text-sm text-surface-600 dark:text-surface-400">
              {{ item.description }}
            </p>
          </div>
        </a>
      </li>
    </ul>

    <Paginator
      v-if="filtered.length > perPage"
      v-model:first="first"
      :rows="perPage"
      :total-records="filtered.length"
      class="mt-10"
      template="PrevPageLink PageLinks NextPageLink"
    />
  </div>
</template>
