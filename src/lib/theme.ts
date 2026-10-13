import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const vars = (prefix: string) => Object.fromEntries(scale.map((n) => [n, `var(--${prefix}-${n})`]));

/**
 * One Aura preset for both brands: primary and surface colors point at CSS variables
 * (--brand-*, --surface-*) that global.css switches with <html data-brand="seuksa|nitean">.
 */
export const SitePreset = definePreset(Aura, {
  semantic: {
    primary: vars('brand'),
    colorScheme: {
      light: { surface: { 0: '#ffffff', ...vars('surface') } },
      dark: { surface: { 0: '#ffffff', ...vars('surface') } },
    },
  },
});

export const primeVueOptions = {
  theme: {
    preset: SitePreset,
    options: {
      darkModeSelector: '.dark',
      // Tailwind utilities (later layers) win over PrimeVue component styles.
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
};
