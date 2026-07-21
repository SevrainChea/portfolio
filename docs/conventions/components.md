# Component Patterns

Conventions for components in `components/`. All components are auto-imported.

## Inventory

| Component                                     | Role                                                                         | Styling approach            |
| --------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `{Aurora,Neon,Editorial,Blueprint}Layout.vue` | Per-family home screen; `index.vue` switches on `family`                     | Namespaced plain CSS        |
| `{Aurora,Neon,Editorial,Blueprint}Chat.vue`   | Per-family `/chat` skin; `chat.vue` switches on `family`, shared `useChat()` | Namespaced plain CSS        |
| `AuroraBackground.vue`                        | Fixed full-bleed animated background (blobs + grain)                         | Scoped plain CSS            |
| `ThemeSwitcher.vue`                           | Family dropdown + variant swatches + light/dark toggle                       | Scoped plain CSS            |
| `StackTag.vue`                                | Small inline tech-stack pill                                                 | Tailwind utilities → tokens |

## The two styling approaches

Both ultimately resolve to the same `--th-*` theme tokens — pick by component size:

1. **Namespaced / scoped plain CSS** (default for layout-scale components). Used
   by every Aurora component. Rules read `var(--th-*)` tokens directly:

   ```css
   .aurora-root .name {
     color: var(--th-name);
     font-family: var(--font-playfair-display);
     transition: color 0.6s ease; /* animate on theme switch */
   }
   ```

   - `AuroraLayout.vue` uses a **non-scoped** `<style>` block, with every rule
     namespaced under `.aurora-root`. This is intentional: the About copy is
     rendered via `v-html`, and Vue's scoped data-attributes don't reach
     `v-html` content. If you add a component whose markup comes from `v-html`,
     namespace manually instead of relying on `scoped`.
   - `AuroraBackground.vue` and `ThemeSwitcher.vue` use `<style scoped>` because
     their markup is fully controlled.

2. **Tailwind utilities** (for small, self-contained components like
   `StackTag`). Use the **role-token color utilities** wired up in
   `tailwind.css` (`text-name`, `text-body`, `text-accent`, `bg-tag-bg`,
   `border-tag-border`, `text-tag-text`, …) — never hardcoded palette utilities
   like `text-blue-400`. This keeps Tailwind components theme-reactive too.

> Whichever approach you use: **never hardcode a color.** Every color comes from
> a `--th-*` token (directly, or via its `--color-*` Tailwind alias). See
> [styling-and-themes.md](styling-and-themes.md).

## Props

- Use the generic `defineProps<{}>()` form; `withDefaults` for optional props.
- Keep props minimal and typed; import shared interfaces from the owning module
  rather than redeclaring shapes.

## Content vs. rendering

Components **render** content; they don't **own** it. All copy (name, about,
experiences, socials, nav) comes from `usePortfolioData()`. A new theme family
later should consume the same data and only differ in markup/CSS — so don't bake
strings into components. See [composables-data.md](composables-data.md).

### Assistant markdown (chat skins)

The assistant is prompted to answer with structure (bullets, the occasional
table), so its replies are **markdown** and must be rendered, not interpolated:

- Each `*Chat.vue` renders the assistant bubble with
  `v-html="renderMarkdown(msg.content)"`. `renderMarkdown` (`utils/markdown.ts`,
  auto-imported) parses with **marked** (GFM) and sanitizes with **DOMPurify** —
  marked passes raw HTML through (the model sometimes writes literal `<br>` in
  table cells), so DOMPurify is what makes the output safe to inject.
- **User** messages stay plain `{{ msg.content }}` interpolation. Never `v-html`
  user-authored text.
- Rendered elements are styled per skin under `.md` (Editorial reuses `.atext`)
  inside the root namespace — `v-html` content has no scoped data-attribute, same
  reason `AuroraLayout` is non-scoped (see above). Set `white-space: normal` on
  the container (the bubbles use `pre-wrap` for plain text).
- The streaming caret is a `::after` on the last rendered line
  (`.md.streaming > :last-child::after`), not a sibling element.
- DOMPurify's link hook adds `target="_blank" rel="noopener noreferrer"`,
  matching the external-link rule below.

## Accessibility (expected on every interactive component)

The existing components set the bar — match it:

- `aria-label` / `:aria-label` on icon-only controls and links; `:aria-pressed`
  / `:aria-expanded` to reflect state; `role="menu"` / `role="menuitem"` on the
  dropdown.
- `aria-hidden="true"` on purely decorative elements (the background, icons
  beside text).
- Keyboard support: `:focus-visible` outlines on all controls; `Escape` closes
  menus; document-click closes open menus (clean up listeners in
  `onUnmounted`).
- External links: `target="_blank"` **plus** `rel="noopener noreferrer"`.
- Honor `@media (prefers-reduced-motion: reduce)` for animations (the background
  blobs stop; smooth-scroll disables).

## Theme-switch transitions

Properties that change with the theme (`color`, `background`, `border-color`)
get a `~0.6s ease` transition so switching family/variant/mode animates smoothly
rather than snapping. Match this when adding theme-reactive styles.
