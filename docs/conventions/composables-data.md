# Composables & Data

Two composables under `composables/` (both auto-imported).

## `usePortfolioData()` — site content

The **single source of truth for all portfolio copy**. Returns one plain object;
every theme family is expected to consume it so the content never diverges
across layouts. There is no CMS or API for this — it's typed, hardcoded data.

Edit content here, never in components:

- `name` / `firstName` / `lastName` / `role` / `tagline` / `photo`
- `nav: NavItem[]` — the Chat link is intentionally commented out (WIP)
- `about: string[]` — **HTML strings**: inline `<b>` is rendered via `v-html`
  (e.g. emphasizing "Mayday"). Keep these as trusted, hand-authored strings;
  don't interpolate untrusted input into them.
- `socials: SocialLink[]` — `icon` is an Iconify name (`mdi:github`, etc.)
- `experiences: Experience[]` — newest first; `positions` may be empty;
  `projectLinks` is optional

Exported interfaces (`Experience`, `ProjectLink`, `SocialLink`, `NavItem`) are
the canonical shapes — import them rather than redeclaring. When adding a field,
update the interface and every entry.

`photo` and other static assets resolve from `public/` (e.g.
`/images/profile_home.jpeg`).

## `useTheme()` — theme state

Reactive, persisted theme state. Its data/types come from the dependency-free
`~/theme-registry` (re-exported here so components import everything theme-
related from `~/composables/useTheme`). For the full model and the FOUC/
hydration rules, see [styling-and-themes.md](styling-and-themes.md).

Public surface:

| Returned                 | Kind     | Notes                                              |
| ------------------------ | -------- | -------------------------------------------------- |
| `families`               | array    | all registered `FamilyDef`s                        |
| `family`                 | ref      | active `FamilyId`                                  |
| `currentFamily`          | computed | active `FamilyDef`                                 |
| `currentVariant`         | computed | active variant id (falls back to family default)   |
| `currentVariantDef`      | computed | active `VariantDef`                                |
| `currentMode`            | computed | `dark`/`light` (stored → OS pref → family default) |
| `isDark`                 | computed | convenience boolean                                |
| `accent`                 | computed | active accent hex (switcher chrome)                |
| `setFamily/Variant/Mode` | fn       | update + persist to `localStorage`                 |
| `toggleMode`             | fn       | flip dark/light for the active family              |

Notes:

- State is held in `useState` (SSR-safe) and **hydrated from `localStorage` in
  `onMounted`**, not setup — don't move that, it prevents a hydration mismatch.
- All `localStorage` access is `try/catch`-guarded and `import.meta.client`-
  gated. Keep new persistence the same way.
- Variants and modes are stored **per family** (`Record<familyId, …>`), so each
  family remembers its own variant/mode.
- Don't write to `<html>` from feature code — `app.vue`'s watcher and the
  pre-paint script own that. Use the `set*` functions and let attributes follow.
