import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { primeVueOptions } from '../lib/theme';

export default (app: App) => {
  app.use(PrimeVue, primeVueOptions);
};
