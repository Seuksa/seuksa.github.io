<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import ToggleButton from 'primevue/togglebutton';

const props = defineProps<{
  quotes: { id: string; title: string }[];
  categories: string[];
  origin: string; // production origin used in the copied snippets
}>();

type Mode = 'daily' | 'random' | 'quote';
const mode = ref<Mode>('daily');
const quoteId = ref<string | null>(props.quotes[0]?.id ?? null);
const category = ref<string | null>(null);
const lang = ref<'both' | 'en' | 'km'>('both');
const theme = ref<'light' | 'dark' | 'auto'>('light');
const accent = ref('#4f46e5');
const shuffle = ref(false);
const copied = ref('');
const preview = ref<HTMLElement | null>(null);

onMounted(() => {
  const id = new URLSearchParams(location.search).get('id');
  if (id && props.quotes.some((q) => q.id === id)) {
    mode.value = 'quote';
    quoteId.value = id;
  }
  draw();
});

const attrs = computed(() => {
  const a: Record<string, string> = { quote: mode.value === 'quote' ? quoteId.value || 'daily' : mode.value };
  if (mode.value !== 'quote' && category.value) a.category = category.value;
  if (lang.value !== 'both') a.lang = lang.value;
  if (theme.value !== 'light') a.theme = theme.value;
  if (accent.value.toLowerCase() !== '#4f46e5') a.accent = accent.value;
  if (shuffle.value && mode.value !== 'quote') a.shuffle = 'true';
  return a;
});

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const scriptSnippet = computed(() => {
  const data = Object.entries(attrs.value)
    .map(([k, v]) => ` data-${k}="${esc(v)}"`)
    .join('');
  return (
    `<div class="seuksa-quote"${data}><a href="${props.origin}/quotes/">Quotes by Seuksa</a></div>\n` +
    `<script src="${props.origin}/embed/quote.js" async><\/script>`
  );
});

const iframeSnippet = computed(() => {
  const qs = new URLSearchParams(attrs.value).toString();
  return (
    `<iframe src="${props.origin}/embed/quote/?${esc(qs)}" title="Quote from Seuksa" ` +
    `width="100%" height="300" style="border:0;max-width:576px" loading="lazy"></iframe>`
  );
});

async function copy(which: 'script' | 'iframe') {
  try {
    await navigator.clipboard.writeText(which === 'script' ? scriptSnippet.value : iframeSnippet.value);
    copied.value = which;
    setTimeout(() => (copied.value = ''), 1800);
  } catch {
    copied.value = '';
  }
}

/** Re-render the live preview with the real embed script. */
async function draw() {
  await nextTick();
  const box = preview.value;
  const api = (window as any).SeuksaQuote;
  if (!box || !api) return;
  box.innerHTML = '';
  const host = document.createElement('div');
  host.className = 'seuksa-quote';
  for (const [k, v] of Object.entries(attrs.value)) host.dataset[k] = v;
  box.appendChild(host);
  api.render(host);
}
watch(attrs, draw);

const modes = [
  { label: 'Quote of the day', value: 'daily' },
  { label: 'Random', value: 'random' },
  { label: 'One quote', value: 'quote' },
];
const langs = [
  { label: 'Both', value: 'both' },
  { label: 'English', value: 'en' },
  { label: 'ខ្មែរ', value: 'km' },
];
const themes = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
];
const swatches = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#e11d48', '#334155'];
</script>

<template>
  <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <!-- Options -->
    <div class="space-y-6">
      <div>
        <label class="mb-2 block text-sm font-semibold">Which quote</label>
        <SelectButton v-model="mode" :options="modes" option-label="label" option-value="value" :allow-empty="false" class="flex-wrap" />
        <p class="mt-2 text-xs text-surface-500">
          <template v-if="mode === 'daily'">Changes every day – everyone sees the same quote that day.</template>
          <template v-else-if="mode === 'random'">A different quote on every page load.</template>
          <template v-else>Always shows the quote you pick.</template>
        </p>
      </div>

      <div v-if="mode === 'quote'">
        <label class="mb-2 block text-sm font-semibold" for="embed-quote">Quote</label>
        <Select
          v-model="quoteId"
          input-id="embed-quote"
          :options="quotes"
          option-label="title"
          option-value="id"
          filter
          filter-placeholder="Search quotes…"
          class="w-full"
        />
      </div>
      <div v-else>
        <label class="mb-2 block text-sm font-semibold" for="embed-cat">Theme of quotes</label>
        <Select
          v-model="category"
          input-id="embed-cat"
          :options="categories"
          placeholder="All themes"
          show-clear
          class="w-full"
        />
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-semibold">Language</label>
          <SelectButton v-model="lang" :options="langs" option-label="label" option-value="value" :allow-empty="false" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold">Colour mode</label>
          <SelectButton v-model="theme" :options="themes" option-label="label" option-value="value" :allow-empty="false" />
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-6">
        <div>
          <span class="mb-2 block text-sm font-semibold">Accent</span>
          <div class="flex items-center gap-2">
            <button
              v-for="c in swatches"
              :key="c"
              type="button"
              class="size-7 rounded-full ring-offset-2 ring-offset-surface-0 transition dark:ring-offset-surface-900"
              :class="accent === c ? 'ring-2 ring-surface-900 dark:ring-surface-0' : ''"
              :style="{ background: c }"
              :aria-label="`Accent ${c}`"
              :aria-pressed="accent === c"
              @click="accent = c"
            />
            <input v-model="accent" type="color" class="size-8 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Custom accent colour" />
          </div>
        </div>
        <ToggleButton
          v-if="mode !== 'quote'"
          v-model="shuffle"
          on-label="“Another quote” button"
          off-label="“Another quote” button"
          on-icon="pi pi-check"
          off-icon="pi pi-plus"
        />
      </div>
    </div>

    <!-- Preview + code -->
    <div class="space-y-6">
      <div>
        <span class="mb-2 block text-sm font-semibold">Preview</span>
        <div
          class="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-surface-300 p-6 dark:border-surface-700"
          :class="theme === 'dark' ? 'bg-slate-800' : 'bg-[repeating-linear-gradient(45deg,var(--p-surface-50),var(--p-surface-50)_10px,var(--p-surface-100)_10px,var(--p-surface-100)_20px)] dark:bg-none'"
        >
          <div ref="preview" class="w-full" aria-live="polite" />
        </div>
      </div>

      <div v-for="s in [
        { key: 'script', title: 'Embed with script (recommended)', code: scriptSnippet, hint: 'Paste where the quote should appear. Works on any site that allows HTML + JavaScript.' },
        { key: 'iframe', title: 'Embed with iframe', code: iframeSnippet, hint: 'For platforms that block scripts (some site builders and forums). Adjust height if needed.' },
      ]" :key="s.key">
        <div class="mb-2 flex items-center justify-between gap-3">
          <span class="text-sm font-semibold">{{ s.title }}</span>
          <Button
            :label="copied === s.key ? 'Copied!' : 'Copy'"
            :icon="copied === s.key ? 'pi pi-check' : 'pi pi-copy'"
            size="small"
            :severity="copied === s.key ? 'success' : 'primary'"
            @click="copy(s.key as 'script' | 'iframe')"
          />
        </div>
        <pre class="rounded-xl bg-slate-900 p-4 text-[13px] leading-relaxed break-all whitespace-pre-wrap text-slate-100"><code>{{ s.code }}</code></pre>
        <p class="mt-1.5 text-xs text-surface-500">{{ s.hint }}</p>
      </div>
    </div>
  </div>
</template>
