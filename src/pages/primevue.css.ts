/**
 * PrimeVue theme CSS (Aura preset + brand variables) rendered once at build time as a static,
 * cacheable stylesheet, so server-rendered islands are styled before hydration.
 * Add a component's style module here when you start using a new PrimeVue component.
 */
import type { APIRoute } from 'astro';
import { Theme } from '@primeuix/styled';
import BaseStyleModule from '@primevue/core/base/style';
import ButtonStyle from 'primevue/button/style';
import DrawerStyle from 'primevue/drawer/style';
import IconFieldStyle from 'primevue/iconfield/style';
import InputIconStyle from 'primevue/inputicon/style';
import InputTextStyle from 'primevue/inputtext/style';
import PaginatorStyle from 'primevue/paginator/style';
import SelectStyle from 'primevue/select/style';
import SelectButtonStyle from 'primevue/selectbutton/style';
import ToggleButtonStyle from 'primevue/togglebutton/style';
import TagStyle from 'primevue/tag/style';
import { primeVueOptions } from '../lib/theme';

// The .d.ts types BaseStyle as an interface; the runtime default export is the style object.
const BaseStyle = BaseStyleModule as any;

const COMPONENTS = [
  ButtonStyle, DrawerStyle, IconFieldStyle, InputIconStyle, InputTextStyle,
  PaginatorStyle, SelectStyle, SelectButtonStyle, ToggleButtonStyle, TagStyle,
];

export const GET: APIRoute = () => {
  Theme.setTheme(primeVueOptions.theme);
  const html = [
    BaseStyle.getCommonThemeStyleSheet(),
    BaseStyle.getThemeStyleSheet(),
    ...COMPONENTS.map((s: any) => s.getThemeStyleSheet()),
  ].join('');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  return new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
};
