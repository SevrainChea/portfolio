# Styling & Themes

The theme system is the heart of the frontend. Understand it before touching
styles, `tailwind.css`, `theme-registry.ts`, `useTheme.ts`, or `nuxt.config.ts`.

## The model: family → variant → mode

- **Family** = a whole layout + visual language (e.g. `AuroraLayout`). Four
  ship: `aurora`, `neon`, `editorial`, and `blueprint`; each is selectable in
  the switcher (`UPCOMING_FAMILIES` is currently empty).
- **Variant** = a color scheme within a family (Aurora has `cobalt`, `emerald`,
  `amethyst`, `garnet`).
- **Mode** = `dark` | `light`.

State lives in `useTheme()` and is persisted to `localStorage`
(`pf-family` / `pf-variants` / `pf-modes`). The active selection is written onto
`<html>` as `data-family`, `data-variant`, and the `.dark` class.

## The token contract (`--th-*`)

`assets/css/tailwind.css` holds, in order:

1. An `@theme` block mapping **role tokens to Tailwind color utilities**
   (`--color-name: var(--th-name)` → `text-name`, etc.) and the fonts.
2. A `:root` fallback block (= Aurora · Cobalt · dark) for pre-hydration / when
   no `<html>` attributes are set.
3. One **selector block per variant per mode**, e.g.
   `[data-family="aurora"][data-variant="emerald"].dark { … }`, each re-setting
   the same `--th-*` role tokens to that scheme's values.

**The rule for components:** read `var(--th-*)` (or the `--color-*` Tailwind
alias) and never hardcode a color. Because every variant/mode block re-defines
the same token names, components automatically re-color when `<html>` attributes
change — they never know which theme is active.

Role tokens include: `--th-bg`, `--th-bg-grad`, `--th-ink`, `--th-name`,
`--th-body`, `--th-muted`, `--th-accent`, `--th-accent-soft`, `--th-border`,
`--th-border-strong`, `--th-avatar-ring`, `--th-tag-bg/-border/-text`, and the
background-only `--th-blob-1/2/3`, `--th-blob-blend`, `--th-blob-op`,
`--th-grain-op`. Legacy aliases (`--th-fg-*`, `--th-primary*`) exist only for the
WIP `chat.vue`; don't use them in new Aurora work.

## FOUC & hydration — the non-negotiable rules

The trickiest part of the system. Theme must paint correctly on the **first
frame** without a flash of the default, and SSR/CSR must hydrate without
mismatch. Keep all of these intact:

- **Pre-paint inline script** (`nuxt.config.ts` → `app.head.script`) reads
  `localStorage` (→ OS `prefers-color-scheme` → family default) and sets the
  `<html>` attributes _before_ first paint. Its storage keys and default map are
  injected from `theme-registry.ts` so they can't drift from `useTheme`.
- **`useTheme` hydrates state in `onMounted`, not during setup** — so the first
  client render matches the SSR default render (no hydration mismatch). The
  post-mount update flushes before paint, so there's no visible flash.
- **`app.vue`'s watcher uses `immediate: false`** — so it never overwrites the
  inline script's correct values with SSR defaults before hydration.
- CSS that must be flash-free keys off the `<html>` attributes the inline script
  already set (e.g. swatch colors via `--sw-d`/`--sw-l` picked by `.dark`; the
  switcher's active ring injected via `useHead` and generated from
  `ALL_VARIANT_IDS`). Prefer this CSS-driven approach over JS that runs
  post-mount.

If you change anything about _what_ gets written to `<html>` or _which_ storage
keys are used, update **all four** touch points together: `theme-registry.ts`,
`useTheme.ts`, `app.vue`, and the inline script in `nuxt.config.ts`.

## Recipe: add a variant to an existing family

1. Add a `VariantDef` entry (id, name, `swatch.dark` / `swatch.light`) to the
   family in `theme-registry.ts`.
2. Add the two selector blocks in `tailwind.css`:
   `[data-family="…"][data-variant="newId"].dark { … }` and `…:not(.dark) { … }`,
   setting every `--th-*` token.

That's it — the switcher swatch, the active ring, and persistence all derive
from the registry automatically.

## Recipe: add a family

1. Add a token block per variant/mode in `tailwind.css`.
2. Create the `<XLayout>.vue` (and any background) consuming `--th-*` tokens.
3. Add a `FamilyDef` to `THEME_REGISTRY` and **remove** it from
   `UPCOMING_FAMILIES`. Set its `breakpoint` (px at/under which it collapses to
   the mobile layout).
4. Add `FamilyId` to the union type in `theme-registry.ts`.
5. In `pages/index.vue`, add a branch on `useTheme().family` to render the new
   family's layout (it already switches across the shipping families).

Everything else (switcher entry, swatches, defaults map, FOUC script) derives
from the registry.

## Fonts & globals

- `assets/css/main.css`: global resets, `Playfair Display` as the base font,
  smooth scroll (disabled under `prefers-reduced-motion`), `.no-scrollbar`.
- `--font-playfair-display` (display/headings) and `--font-inter` (body/UI) are
  declared in `@theme`; reference them via `var(--font-*)`.
- Responsive breakpoints in Aurora CSS (`880px`, `760px`) are hand-authored
  media queries; `880` matches the family's registry `breakpoint`. Keep them in
  sync if you change one.

## Deprecated

Glass morphism / "glass-ui" (`GlassCard.vue`, `backdrop-blur` card surfaces) and
`BgGradient.vue` are **deprecated**. Both are now unreferenced dead code —
`GlassCard`'s last consumer (`chat.vue`) was replaced by the per-family
`*Chat.vue` skins in the themed-chat redesign. Don't build new surfaces on them —
use the token-driven per-family approach.
