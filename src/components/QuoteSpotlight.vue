<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';

const props = defineProps<{ quotes: { html: string; url: string; author?: string }[] }>();

// First render is deterministic (SSR == hydration); "Another quote" picks randomly.
const index = ref(0);
function next() {
  if (props.quotes.length < 2) return;
  let i = index.value;
  while (i === index.value) i = Math.floor(Math.random() * props.quotes.length);
  index.value = i;
}
</script>

<template>
  <figure v-if="quotes.length" class="flex h-full flex-col">
    <blockquote
      class="prose prose-lg max-w-none flex-1 prose-p:text-primary-50 prose-blockquote:border-primary-300 prose-blockquote:text-primary-100 prose-blockquote:font-normal prose-blockquote:not-italic prose-strong:text-white"
      aria-live="polite"
      v-html="quotes[index].html"
    />
    <figcaption class="mt-6 flex items-center justify-between gap-3">
      <span class="text-sm text-primary-200">{{ quotes[index].author ? `— ${quotes[index].author}` : '' }}</span>
      <span class="flex gap-2">
        <Button as="a" :href="quotes[index].url" label="Open" size="small" severity="contrast" outlined class="!border-primary-300 !text-white" />
        <Button icon="pi pi-refresh" label="Another" size="small" severity="contrast" @click="next" />
      </span>
    </figcaption>
  </figure>
</template>
