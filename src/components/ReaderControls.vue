<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';

interface TocItem {
  title: string;
  url: string;
  part?: string;
}

const props = defineProps<{ toc: TocItem[]; current: string; bookTitle: string; bookUrl: string }>();

const SIZES = [1, 1.125, 1.25, 1.375, 1.5];
const size = ref(1);
const open = ref(false);

function apply() {
  document.documentElement.style.setProperty('--reader-size', `${SIZES[size.value]}rem`);
  try {
    localStorage.setItem('reader-size', String(size.value));
  } catch {}
}
function change(step: number) {
  size.value = Math.min(SIZES.length - 1, Math.max(0, size.value + step));
  apply();
}
onMounted(() => {
  try {
    const saved = Number(localStorage.getItem('reader-size'));
    if (Number.isInteger(saved) && saved >= 0 && saved < SIZES.length) size.value = saved;
  } catch {}
  apply();
});

const grouped = () => {
  const out: { part?: string; items: TocItem[] }[] = [];
  for (const i of props.toc) {
    const last = out.at(-1);
    if (last && last.part === i.part) last.items.push(i);
    else out.push({ part: i.part, items: [i] });
  }
  return out;
};
</script>

<template>
  <div class="flex items-center gap-1">
    <Button icon="pi pi-list" label="Contents" severity="secondary" text size="small" @click="open = true" />
    <span class="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-700" />
    <Button label="A−" severity="secondary" text size="small" :disabled="size === 0" aria-label="Smaller text" @click="change(-1)" />
    <Button label="A+" severity="secondary" text size="small" :disabled="size === SIZES.length - 1" aria-label="Larger text" @click="change(1)" />

    <Drawer v-model:visible="open" :header="bookTitle" class="!w-full sm:!w-96">
      <a :href="bookUrl" class="mb-4 inline-flex items-center gap-2 text-sm text-primary-700 hover:underline dark:text-primary-300">
        <i class="pi pi-arrow-left text-xs" /> Book overview
      </a>
      <nav aria-label="Table of contents" lang="km">
        <section v-for="(g, gi) in grouped()" :key="gi" class="mb-5">
          <h3 v-if="g.part" class="mb-1 px-2 text-xs font-semibold tracking-wide text-surface-500 uppercase">{{ g.part }}</h3>
          <a
            v-for="i in g.items"
            :key="i.url"
            :href="i.url"
            class="block rounded-md px-2 py-1.5 text-sm hover:bg-surface-100 dark:hover:bg-surface-800"
            :class="i.url === current ? 'bg-primary-50 font-semibold text-primary-800 dark:bg-primary-950 dark:text-primary-200' : 'text-surface-700 dark:text-surface-300'"
            :aria-current="i.url === current ? 'page' : undefined"
          >
            {{ i.title }}
          </a>
        </section>
      </nav>
    </Drawer>
  </div>
</template>
