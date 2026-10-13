<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';

interface Doc {
  t: string; // title
  u: string; // url
  d: string; // description
  s: string; // section label
  b: 'seuksa' | 'nitean';
}

const docs = ref<Doc[]>([]);
const loading = ref(true);
const query = ref('');
const scope = ref<'all' | 'seuksa' | 'nitean'>('all');

onMounted(async () => {
  query.value = new URLSearchParams(location.search).get('q') || '';
  try {
    docs.value = await (await fetch('/search.json')).json();
  } finally {
    loading.value = false;
  }
});

watch(query, (q) => {
  const url = new URL(location.href);
  q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
  history.replaceState(null, '', url);
});

const results = computed(() => {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return docs.value
    .filter((d) => scope.value === 'all' || d.b === scope.value)
    .map((d) => {
      const t = d.t.toLowerCase();
      const body = d.d.toLowerCase();
      if (!terms.every((w) => t.includes(w) || body.includes(w))) return null;
      return { d, score: terms.reduce((s, w) => s + (t.includes(w) ? 3 : 1), 0) };
    })
    .filter((r): r is { d: Doc; score: number } => !!r)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map((r) => r.d);
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row">
      <IconField class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="query" autofocus placeholder="ស្វែងរក · Search articles, quotes, stories, book chapters…" class="w-full !py-3 !text-lg" aria-label="Search" />
      </IconField>
      <SelectButton
        v-model="scope"
        :options="[{ label: 'All', value: 'all' }, { label: 'Seuksa', value: 'seuksa' }, { label: 'Nitean', value: 'nitean' }]"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Search scope"
      />
    </div>

    <p class="mt-4 text-sm text-surface-500" aria-live="polite">
      <template v-if="loading">Loading index…</template>
      <template v-else-if="query.trim()">{{ results.length }} result{{ results.length === 1 ? '' : 's' }}</template>
      <template v-else>{{ docs.length }} pages indexed. Type in Khmer or English.</template>
    </p>

    <ul class="mt-6 divide-y divide-surface-200 dark:divide-surface-800">
      <li v-for="r in results" :key="r.u" class="py-4">
        <a :href="r.u" class="group block">
          <div class="mb-1 flex items-center gap-2">
            <Tag :value="r.b === 'nitean' ? 'Nitean' : 'Seuksa'" :severity="r.b === 'nitean' ? 'warn' : 'info'" class="!text-[11px]" />
            <span class="text-xs text-surface-500">{{ r.s }}</span>
          </div>
          <h3 class="font-semibold text-surface-900 group-hover:text-primary-600 dark:text-surface-0">{{ r.t }}</h3>
          <p class="line-clamp-2 text-sm text-surface-600 dark:text-surface-400">{{ r.d }}</p>
        </a>
      </li>
    </ul>
  </div>
</template>
