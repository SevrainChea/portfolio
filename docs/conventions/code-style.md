# Code Style

How code in `portfolio-frontend` is written. Match the surrounding file.

## TypeScript & Vue

- **Always** `<script setup lang="ts">`. Composition API only — no Options API,
  no `defineComponent`, no `export default {}`.
- Prefer explicit types at boundaries. Props use the generic form:

  ```ts
  // Simple props
  defineProps<{ text: string }>();

  // With defaults
  withDefaults(defineProps<{ size?: number }>(), { size: 18 });
  ```

- Shared shapes are declared as `interface`s and **exported from the module that
  owns the data** (e.g. `Experience`, `NavItem` live in `usePortfolioData.ts`;
  `FamilyDef`, `VariantDef`, `Mode` live in `theme-registry.ts`). Import the
  type where needed rather than redeclaring it.
- Keep `theme-registry.ts` **dependency-free** (no Vue/Nuxt imports) — it is
  imported by both the runtime composable and `nuxt.config.ts`. Do not add
  runtime imports there.
- Guard browser-only code with `import.meta.client` (see `useTheme.ts`); wrap
  `localStorage` access in `try/catch` (quota / disabled storage).

## Imports & auto-imports

Nuxt auto-imports are used deliberately — know which is which:

- **Auto-imported (no import line):** components under `components/`, composables
  under `composables/` (`useTheme()`, `usePortfolioData()`), and Nuxt built-ins
  (`useState`, `useHead`, `useRoute`, `<NuxtLink>`, `<NuxtPage>`, `<Icon>`).
- **Imported explicitly:** Vue primitives (`ref`, `computed`, `watch`,
  `onMounted`, `onUnmounted`) and named exports / `type` imports from registry
  and data modules:

  ```ts
  import { ref, onMounted } from "vue";
  import { UPCOMING_FAMILIES, type FamilyId } from "~/composables/useTheme";
  import type { Experience } from "~/composables/usePortfolioData";
  ```

- `useTheme.ts` re-exports the registry's public surface so components can pull
  everything theme-related from `~/composables/useTheme`. Prefer that single
  entry point over importing `~/theme-registry` directly in components.

## Comments — explain the _why_

This codebase comments **intent and hazards**, not mechanics. Theme/hydration
code is subtle (FOUC avoidance, SSR/CSR hydration parity, pre-paint scripts), so
when you touch it, leave a comment explaining _why_ the non-obvious choice is
required — mirror the existing density in `app.vue`, `useTheme.ts`,
`nuxt.config.ts`, and `ThemeSwitcher.vue`. Don't narrate obvious code.

Good (from the codebase):

```ts
// Hydrate from localStorage AFTER mount, not during setup: this keeps the
// first client render identical to the SSR default render, avoiding a Vue
// hydration mismatch ...
```

## Formatting

- Prettier defaults + `prettier-plugin-tailwindcss` (auto-sorts Tailwind
  classes). 2-space indent, double quotes, semicolons, trailing commas.
- Don't hand-order Tailwind classes — let the plugin do it.
- **ESLint** (`@nuxt/eslint`) runs as a **behavior-only** linter — Prettier keeps
  formatting, so ESLint's `stylistic` set is off and `vue/html-self-closing` is
  disabled. Run `pnpm lint` (or `pnpm lint:fix`). Fix errors; the remaining
  warnings (`vue/no-v-html` on the sanitized chat markdown, `require-default-prop`
  on the deprecated `GlassCard.vue`) are known and non-blocking.
