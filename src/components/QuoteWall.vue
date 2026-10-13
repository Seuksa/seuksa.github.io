<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';
import Paginator from 'primevue/paginator';

export interface QuoteItem {
  id: string;
  title: string;
  url: string;
  html: string;
  author?: string;
  categories: string[];
  views: number;
  date: string;
  text: string;
}

const props = withDefaults(defineProps<{ items: QuoteItem[]; perPage?: number }>(), { perPage: 24 });

const query = ref('');
const category = ref<string | null>(null);
const sort = ref<'newest' | 'popular'>('newest');
const first = ref(0);

const categories = computed(() =>
  [...new Set(props.items.flatMap((q) => q.categories))].sort().map((c) => ({ label: c, value: c })),
);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = props.items.filter(
    (i) =>
      (!category.value || i.categories.includes(category.value)) &&
      (!q || i.text.toLowerCase().includes(q) || (i.author || '').toLowerCase().includes(q)),
  );
  return sort.value === 'popular' ? [...list].sort((a, b) => b.views - a.views) : list;
});
const page = computed(() => filtered.value.slice(first.value, first.value + props.perPage));
watch([query, category, sort], () => (first.value = 0));
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
      <IconField class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="query" placeholder="Search quotes or authors…" class="w-full" aria-label="Search quotes" />
      </IconField>
      <Select
        v-model="category"
        :options="categories"
        option-label="label"
        option-value="value"
        placeholder="All themes"
        show-clear
        class="md:w-56"
        aria-label="Theme"
      />
      <SelectButton
        v-model="sort"
        :options="[{ label: 'Newest', value: 'newest' }, { label: 'Popular', value: 'popular' }]"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Sort"
      />
    </div>

    <p v-if="!filtered.length" class="py-16 text-center text-surface-500">No quotes found.</p>

    <div class="columns-1 gap-5 sm:columns-2 lg:columns-3">
      <figure
        v-for="q in page"
        :key="q.id"
        class="mb-5 break-inside-avoid rounded-2xl border border-surface-200 bg-surface-0 p-6 transition hover:border-primary-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900"
      >
        <i class="pi pi-comment mb-3 text-xl text-primary-400" aria-hidden="true" />
        <blockquote
          class="prose prose-sm max-w-none prose-blockquote:border-primary-300 prose-blockquote:font-normal prose-blockquote:not-italic prose-img:rounded-lg dark:prose-invert"
          v-html="q.html"
        />
        <figcaption class="mt-4 flex items-center justify-between gap-3 border-t border-surface-100 pt-3 text-xs text-surface-500 dark:border-surface-800">
          <span class="font-medium text-surface-700 dark:text-surface-300">{{ q.author ? `— ${q.author}` : q.date }}</span>
          <a :href="q.url" class="text-primary-600 hover:underline">Open <i class="pi pi-arrow-right text-[10px]" /></a>
        </figcaption>
      </figure>
    </div>

    <Paginator
      v-if="filtered.length > perPage"
      v-model:first="first"
      :rows="perPage"
      :total-records="filtered.length"
      class="mt-8"
      template="PrevPageLink PageLinks NextPageLink"
    />
  </div>
</template>
