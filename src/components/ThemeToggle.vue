<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';

const dark = ref(false);

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark');
});

function toggle() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
  try {
    localStorage.setItem('theme', dark.value ? 'dark' : 'light');
  } catch {}
}
</script>

<template>
  <Button
    :icon="dark ? 'pi pi-sun' : 'pi pi-moon'"
    severity="secondary"
    text
    rounded
    :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  />
</template>
