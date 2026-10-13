<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';

defineProps<{
  items: { label: string; href: string; icon?: string }[];
  other: { label: string; href: string; icon: string };
  title: string;
  current: string;
}>();

const open = ref(false);
</script>

<template>
  <div class="lg:hidden">
    <Button icon="pi pi-bars" severity="secondary" text rounded aria-label="Open menu" @click="open = true" />
    <Drawer v-model:visible="open" position="right" :header="title" class="!w-72">
      <nav class="flex flex-col gap-1" aria-label="Mobile">
        <a
          v-for="i in items"
          :key="i.href"
          :href="i.href"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
          :class="{ 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300': current.startsWith(i.href) }"
        >
          <i :class="i.icon" class="text-surface-400" />{{ i.label }}
        </a>
        <hr class="my-3 border-surface-200 dark:border-surface-800" />
        <a :href="other.href" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950">
          <i :class="other.icon" />{{ other.label }}
        </a>
      </nav>
    </Drawer>
  </div>
</template>
