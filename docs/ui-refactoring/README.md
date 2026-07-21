# Handoff: Multi-Theme Portfolio (Aurora · Neon · Editorial · Blueprint)

## Overview

This package describes a **visitor-switchable, multi-theme** version of Sévrain Chea's
personal portfolio. A single page (avatar + name + role + tagline + nav + socials, an
**About** section, and an **Experience** timeline) can be rendered in **four distinct
visual "theme families"**, each with several **color variants** and a **light/dark mode**.
A floating switcher pill (top-right) lets the visitor pick family → variant → mode; the
choice persists across reloads.

The four families:

| Family        | Vibe                                                                        | Variants                                                         | Default mode |
| ------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| **Aurora**    | Frameless, tokenized, soft animated aurora blobs behind a two-column layout | Cobalt & Frost, Emerald & Brass, Amethyst & Rose, Garnet & Ember | dark         |
| **Neon**      | A glowing neon-sign card at night; the hero card "breathes"                 | Hotline, Acid, Electric                                          | dark         |
| **Editorial** | A printed literary issue — masthead, drop cap, multi-column flow            | The Issue, Broadsheet, Quarterly                                 | light        |
| **Blueprint** | An engineering spec sheet — drafting grid, title block, mono callouts       | Azure, Crimson, Verdant                                          | dark         |

> The content (name, tagline, about copy, experiences, stacks) is **identical across all
> themes** — only the presentation changes. Content lives in one file: `portfolio-data.js`.

---

## About the Design Files

The files in `design-files/` are **design references created in HTML + React (via in-browser
Babel)**. They are a working prototype that demonstrates the intended look, layout, motion,
and switching behavior. **They are not meant to be copied into the codebase as-is.**

Your task is to **recreate these designs inside the existing Nuxt 3 / Vue 3 portfolio
codebase** (`portfolio-frontend/`), using its established conventions — `<script setup lang="ts">`
components, TailwindCSS v4, the `--th-*` CSS theme-token system, `@nuxt/icon`, and `@nuxt/image`.
The React/JSX here is purely a vehicle for the prototype; the production implementation is Vue.

### Why React in the prototype, Vue in production

The prototype uses React only because that's the prototyping environment. Every pattern maps
cleanly to the existing Vue codebase:

| Prototype (React)                                  | Production (Vue 3, existing repo)                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `window.PORTFOLIO` data object                     | hardcoded arrays already in `ExperiencesSection.vue` / `AboutSection.vue` — keep them, or lift to a composable |
| `useTweaks` / localStorage state                   | `ref()` + `useState()` + `localStorage` (or a small composable)                                                |
| CSS injected via `dangerouslySetInnerHTML`         | Tailwind utility classes + `--th-*` tokens in `assets/css/tailwind.css`                                        |
| Inline `style={{ "--accent": ... }}` token objects | `:style` bindings or a `data-theme`/class on a root wrapper                                                    |
| `IconFor()` inline SVGs                            | `@nuxt/icon` (`<Icon name="...">`)                                                                             |

---

## Fidelity

**High-fidelity (hi-fi).** Colors, typography, spacing, borders, shadows, and interactions
are all final and specified below. Recreate the UI pixel-accurately using the codebase's
Tailwind setup. Exact hex/rgba values for every variant are in the **Design Tokens** section.

---

## Target Codebase (what you're building into)

`portfolio-frontend/` — read its `CLAUDE.md` first. Summary:

- **Nuxt 3** (`^3.17.4`) + **Vue 3** Composition API (`<script setup lang="ts">`) + **TypeScript**
- **TailwindCSS v4** via `@tailwindcss/vite`; theme tokens defined with `@theme` in
  `assets/css/tailwind.css`
- Existing `--th-*` token system with a `.dark` custom variant
  (`@custom-variant dark (&:where(.dark, .dark *))`)
- `@nuxt/icon` (Iconify) for icons, `@nuxt/image` for images
- Pages: `pages/index.vue` (portfolio), `pages/chat.vue` (streaming chatbot — out of scope here)
- Existing components: `HeaderCard`, `AboutSection`, `ExperiencesSection`, `ExperienceCard`,
  `StackTag`, `NavLink`, `DarkModeToggle`, `FooterSection`
- Package manager **pnpm**; Node pinned in `.nvmrc` (v22.16.0); Prettier + `prettier-plugin-tailwindcss`

### Recommended integration approach

The repo **already has** a single-theme token system (one dark palette + one light palette in
`tailwind.css`) and a `DarkModeToggle`. The cleanest path is to **generalize that system into
N families × M variants × 2 modes**, rather than re-architect:

1. **Promote `--th-*` to a full theme registry.** Today `:root` and `:root:not(.dark)` hold one
   palette. Instead, scope each palette under a selector that encodes family+variant+mode, e.g.
   `[data-family="aurora"][data-variant="cobalt"]` (dark) and add `.light`/`.dark` as a second
   axis. Each block sets the same `--th-*` token names to that variant's values. Components keep
   reading `var(--color-…)` / `--th-*` and never change.
2. **A `useTheme()` composable** holds `{ family, variant, mode }`, persists to `localStorage`
   (keys below), and writes `data-family` / `data-variant` / `class="dark"` onto `<html>` or the
   app root. Default family/variant/mode per the table above.
3. **Per-family layout components.** Each family is a genuinely different DOM layout, so build
   four layout components (`AuroraLayout.vue`, `NeonLayout.vue`, `EditorialLayout.vue`,
   `BlueprintLayout.vue`) that consume the shared content + tokens. `pages/index.vue` renders the
   one matching the active family. The existing `HeaderCard`/`AboutSection`/`ExperiencesSection`
   map most directly onto **Aurora** (closest to the current site); the other three are new layouts.
4. **The switcher pill** (`ThemeSwitcher.vue`) is shared chrome that adapts its own glass/accent
   to the active theme — see "Theme Switcher" below.

> If you'd rather not generalize the token file, an acceptable alternative is per-family palette
> objects in TS (mirroring `aurora-variants.js` etc.) bound via `:style`. The token-CSS route is
> preferred because it reuses the system already in the repo.

---

## Shared Content (identical across all themes)

Source of truth in the prototype: `design-files/portfolio-data.js`. In the repo this content
already exists (slightly differently worded) in `ExperiencesSection.vue` and `AboutSection.vue` —
reconcile to one source.

- **Name:** Sévrain Chea · **Role:** `Tech Lead · Full-Stack Engineer`
- **Tagline:** "Start-up mindset — shipping fast, iterating on product, and building scalable
  processes for high-performing engineering teams."
- **Photo:** `assets/profile_home.jpeg` (in repo: `public/images/` or `assets/images/`)
- **Nav:** About · Experiences · Chat
- **Socials:** GitHub · LinkedIn · Email
- **About:** 4 paragraphs (full text in `portfolio-data.js`). Note paragraph 2 bolds **Mayday**;
  preserve inline `<b>` emphasis.
- **Experiences:** array of `{ title, company, contract, dates, duration, positions[],
description, stack[], link }`. The prototype shows 3 lead roles; the repo currently lists 5
  (incl. Sopra Steria, CineApps). **Keep all real entries** — the prototype just trimmed for
  brevity. Each renders: dates + duration, "Title @ Company", contract + positions, description,
  and a row of stack tags.

---

## Screens / Views

There is **one screen** (the portfolio page), rendered four ways. Below: the shared structure,
then each family's specific layout & component spec. All four collapse to a single column on
mobile (breakpoints noted per family).

### Shared structure (all families)

- **Identity block:** circular avatar, name (two lines: "Sévrain" / "Chea"), role eyebrow, tagline,
  nav, social icons.
- **About:** an overline/label + the 4 paragraphs.
- **Experience:** an overline/label + a list of experience entries (timeline / cards / rows
  depending on family).

---

### Family 1 — Aurora _(closest to the current live site)_

**Reference:** `aurora-portfolio.jsx` (layout + CSS), `aurora-variants.js` (4 color worlds × 2 modes).

- **Layout:** centered `max-width: 1180px`, `padding: 64px 40px 80px`. Two columns via flex:
  - **Left (sticky), `width: 380px`, `padding-right: 60px`, `position: sticky; top: 64px`:**
    avatar (96×96, circular, 1px ring + 4px `color-mix(accent 8%)` halo) → name → role → tagline →
    hairline divider → vertical nav → socials.
  - **Right, `flex: 1`, `padding-left: 60px`, `border-left: 1px solid var(--border)`:** About
    overline + paragraphs, then Experience overline + a vertical timeline.
- **Background:** fixed `--bg` + `--bg-grad` radial, three blurred animated "aurora" blobs
  (`filter: blur(110px)`, `mix-blend-mode` per mode, slow 38–50s float keyframes), plus a faint
  SVG grain overlay (`--grain-op`). On mobile use a static or reduced version; respect
  `prefers-reduced-motion`.
- **Typography:**
  - Name: **Playfair Display**, 52px, weight 600, line-height 1.0, letter-spacing −0.015em, color `--name`
  - Role eyebrow: Inter, 12.5px, weight 600, letter-spacing 0.18em, uppercase, color `--accent`
  - Tagline: Playfair Display _italic_, 17.5px, line-height 1.55, color `--muted`, max-width 300px
  - About paragraphs: Inter, 16.5px, line-height 1.74, color `--body`, max-width 60ch; `<b>` → `--ink`
  - Section overline: Inter, 11.5px, weight 700, letter-spacing 0.22em, uppercase, color `--accent`,
    with a trailing gradient hairline (`::after`, `flex:1; height:1px`)
- **Nav links:** flex column; each row `padding: 12px 0`, `border-bottom: 1px solid var(--border)`,
  15px / weight 500, with an italic Playfair index "01/02/03" in `--accent`. Hover: color
  `--accent-soft`, `padding-left: 6px`. Active row uses `--ink`.
- **Socials:** 38×38, `border-radius: 10px`, `--tag-bg` fill + `--tag-border`, icon `--muted`.
  Hover: fill `--accent`, icon → `--bg`.
- **Experience timeline:** left rail `.tl` with a 1px `--border-strong` vertical line
  (`::before`, `left:4px`). Each entry `.xp` has a 9px dot node (`::before`, `left:-27px`,
  `background:--bg`, `1.5px --accent` ring); hover fills the dot + adds a 4px accent halo.
  - "when" row: 12.5px `--muted`, with duration in italic Playfair `--accent`
  - h3: Playfair 23px/600 `--name`; "@ Company" italic in `--accent`; trailing "↗" ext mark
  - pos: 13px `--muted`
  - desc: 15px/1.7 `--body`, max-width 62ch
  - tags: 11.5px/500, `padding: 4px 11px`, `border-radius: 6px`, `--tag-bg` + `--tag-border`,
    text `--tag-text`
- **Tokens:** reads **only** CSS variables (`--bg, --bg-grad, --ink, --name, --body, --muted,
--accent, --accent-soft, --border, --border-strong, --avatar-ring, --tag-bg, --tag-border,
--tag-text, --blob-1/2/3, --blob-blend, --blob-op, --grain-op, --tagline-style`). Adding a
  variant = adding a token block. Full values for all 4 variants × 2 modes in `aurora-variants.js`.
- **Responsive:** `@max-width:880px` → single column, left becomes static, right gets a top border
  instead of left. `@max-width:760px` → name 40px, avatar 78px, tighter spacing.
- **Transitions:** background/color transitions `0.6s ease` when switching variant/mode.

---

### Family 2 — Neon _(one animated hero)_

**Reference:** `theme-neon.jsx`. Font: **Space Grotesk** (fallback Inter).

- **Layout:** `max-width: 1080px`, `padding: 70px 40px 100px`, single centered column.
- **Background:** near-black `bg` with a **static** ambient glow (three layered radial gradients
  in `GLOW`/`ACC` at low alpha) + a faint masked brick/wall grid (`linear-gradient` lines at
  64px, radial mask). Nothing moves except the hero.
- **Hero — the only animated element:** a centered rounded card (`border-radius: 22px`,
  `2px solid GLOW`, `padding: 56px 50px 50px`) with a layered neon box-shadow that **breathes**
  (`@keyframes …-breathe`, 3.6s ease-in-out, pulsing glow intensity). Inner tube outline via
  `::before` (`inset: 9px`, `1px solid ACC66`, glow). Respect `prefers-reduced-motion` (disable
  the breathe animation).
  - "Open to work" pill (top-right, uppercase, glowing dot)
  - avatar 108×108, circular, `2px solid ACC`, neon glow
  - name: **80px**, weight 700, uppercase, line-height 0.94, multi-layer text-shadow glow
    (`nameHalo` + `GLOW` layers)
  - role: 13px, letter-spacing 0.34em, uppercase, `ACC`, glow
  - tagline: 15px `body`, max-width 560px
  - nav: pill buttons (`border-radius: 999px`, `1px GLOW99`, glow); hover fills `GLOW`, text → `bg`
  - socials: 42×42, `border-radius: 11px`, `1px ACC66`, glow; hover fills `ACC`
- **About / Experience:** static. Overline `.ol` (13px/700, 0.3em, uppercase, `GLOW` glow, leading
  dot + trailing gradient line). Experience cards `.xp`: `panel` fill, `1px line` border with a
  `2px GLOW88` left border, `border-radius: 12px`, `padding: 24px 26px`; hover → `ACC` border + glow.
  h3 24px/700 `head`, "@ Company" in `GLOW`; tags uppercase 11px with `ACC` tint.
- **Glow control:** every palette has an optional `glow` multiplier (1 = full dark-mode glow;
  light mode ≈ 0.55). It scales **both** blur radius (`bl()`) and alpha (`ax()`) of every shadow —
  this is what keeps light mode from being blinding. Implement as a single scalar that multiplies
  shadow blur + opacity.
- **Light mode** ("neon sign in daylight"): the sign sits on a softly **tinted** wall (never pure
  white); glow dialed back. Background saturation is **tweakable** (soft / tinted / saturated — see
  Tweaks) and glow is a slider (0.2–1).
- **Variants (palette roles `bg, panel, GLOW, ACC, ink, body, line, nameCol, nameHalo, head`):**
  Hotline (hot-pink + teal), Acid (lime + electric blue), Electric (blue + violet). Each has a dark
  and a light palette — full values in `theme-neon.jsx`.
- **Responsive:** `@max-width:760px` → name 46px, avatar 84px, nav wraps, tighter padding.

---

### Family 3 — Editorial _(printed literary issue; default mode = light)_

**Reference:** `theme-editorial.jsx`. Fonts: **Playfair Display** (display) + **Inter** (UI/meta).

- **Layout:** `max-width: 1180px`, `padding: 54px 70px 90px`, single column "sheet".
- **Background:** flat `paper` color + faint SVG paper grain overlay (`grain` opacity per variant).
- **Masthead:** `border-top: 3px solid ink`, `border-bottom: 1px solid ink`, flex space-between:
  - left: kicker ("Portfolio — Vol. {vol}", 11px/700, 0.28em, uppercase, `acc`) + h1 "Sévrain Chea"
    in Playfair **78px**/700, line-height 0.9, letter-spacing −0.02em
  - right: meta block, right-aligned, 11.5px uppercase `mut` ("Tech Lead / **Full-Stack Engineer**
    / {place} · 2025")
- **Lead row:** CSS grid `236px 1fr`, gap 48px, bottom rule.
  - left: portrait image 236×280, `object-fit: cover`, `filter: grayscale(.3) saturate(.9)`, 1px
    rule border, + italic caption
  - right: role label (12px/700, 0.2em, uppercase, `acc`), **standfirst** = tagline in Playfair
    27px/500, line-height 1.34, then a nav row (top rule, 26px gap, uppercase links with italic
    Playfair index numbers in `acc`)
- **About:** **two-column** flow (`columns: 2; column-gap: 48px`). First paragraph gets a Playfair
  **drop cap** (`::first-letter`, 62px, float left, `acc`). Body 15px/1.72 `body`; `<b>` → `ink`.
- **Section labels** `.sectlabel`: Playfair _italic_ 21px `acc` + trailing hairline.
- **Experience entries:** grid `130px 1fr`, gap 34px, separated by top rules.
  - left "when": 12.5px `mut`, tabular-nums, with duration on its own line in italic Playfair `acc`
  - right: h3 Playfair 26px/600 (company in italic `acc`); pos uppercase 12.5px `mut`; desc
    14.5px/1.72 `body` max-width 62ch; tags as a single uppercase 11px line, items separated by a
    `/` in `acc`
- **Variants (roles `paper, ink, acc, mut, rule, body, grain, vol, place`):** The Issue (warm paper
  - rust, Vol. 7), Broadsheet (near-B&W newsprint, accent = ink, Vol. II), Quarterly (cool ivory +
    forest green, Vol. 04). Each has a **dark "night edition"** counterpart. Full values in file.
- **Default mode is LIGHT** for this family.
- **Responsive:** `@max-width:760px` → masthead stacks, h1 48px, lead becomes one column, about
  collapses to one column, experience rows stack.

---

### Family 4 — Blueprint _(engineering spec sheet)_

**Reference:** `theme-blueprint.jsx`. Fonts: **Playfair Display** (names/headings), **Inter** (body),
**JetBrains Mono** (labels, callouts, mono UI).

- **Background:** drafting grid drawn with four layered `linear-gradient` line sets — major grid
  120px (`line1`), minor grid 24px (`line2`) — on a solid `bg`. A double drafting **frame**
  (`.frame`, `inset: 24px`, 1px `line1`, with an inner `::before` frame at `inset: 8px`).
- **Content sheet:** the reading area floats on a **solid `panel` backing** (`.wrap::before`) so
  grid lines only show in the margins/frame — this is a deliberate readability fix; keep it.
- **Layout:** grid `400px 1fr`, `max-width: 1240px`, `padding: 64px 56px`.
  - **Left:** avatar (full width, 230px tall, `object-fit: cover`, `1px CY66` border, `avFilter`),
    name (Playfair 46px/600 `HEAD`), role (mono 12px `CY`, prefixed `// ` in `MUT`), tagline (13.5px
    `MUT`), a **title block** (a bordered 2×2 spec table: Discipline / Exp. / Scale / Status — mono
    keys 9px `MUT`, values 13px `INK`, "Available" status in `CY`), vertical nav (mono `[01]` indices
    in `CY`), socials (38×38 square, `1px CY55`, hover fills `CY`).
  - **Right:** `border-left: 1px solid line1`, `padding-left: 50px`. Overlines `.ol` are mono with a
    "FIG 1 —" / "FIG 2 —" figure prefix in `MUT` and a trailing **dashed** `CY55` line.
- **About:** body 15.5px/1.74 `INK`, max-width 60ch; `<b>` → `HEAD` with a `1px CY66` bottom border.
- **Experience cards `.xp`:** `1px line1` border, `padding: 20px 22px`, `CY08` tint; a mono figure
  tag (`data-fig="2.1"` etc.) notched into the top-left border via `::before` (background = `notch`).
  Hover → `CY88` border + `CY12` fill. h3 Playfair 21px/600 `HEAD` (company italic `CY`); when-row,
  pos, and tags all **JetBrains Mono**; tags are square `1px CY44` chips with `CY08` fill.
- **Variants (roles `bg, CY (primary), AM (secondary/“Experience” label), line1, line2, INK, MUT,
HEAD, panel, notch, avFilter`):** Azure (navy + azure/amber), Crimson (wine + coral/teal),
  Verdant (forest + emerald/terracotta). Each has dark + light palettes. Full values in file.
- **Responsive:** `@max-width:760px` → single column, frame `inset: 10px`, nav becomes a wrapped
  row of bordered chips, right column gets a top border.

---

## Theme Switcher (shared chrome)

**Reference:** the `.ph-switch` block + `PortfolioHost` in `portfolio-host.jsx`.

A floating pill, **`position: fixed; top: 22px; right: 24px; z-index: 60`**, `border-radius: 999px`,
glassy. It contains, left→right:

1. **Family selector** — label "THEME" (10px/700, 0.16em, uppercase, 0.5 opacity) + current family
   name in Playfair 15px + a `▾` chevron. Click opens a dropdown menu (`min-width: 190px`,
   `border-radius: 13px`) listing all four families, each with a split-color mini swatch
   (`linear-gradient(135deg, c0 45%, c1 45%)`), the family name in Playfair, and either a check (if
   active) or its subtitle ("Frameless" / "Neon sign" / "The issue" / "Spec sheet").
2. **Separator** (1px).
3. **Color swatches** — one round 26×26 button per variant of the active family; inner 20px dot is
   the split-gradient of that variant's two key colors. Active = `box-shadow: 0 0 0 2px var(--acc)`.
   Hover shows a tooltip with the variant name.
4. **Separator.**
5. **Light/Dark toggle** — 34×34 round button with a sun (dark→light) or moon (light→dark) SVG icon.

**Adaptive chrome:** the pill itself flips between a **dark glass** and **light glass** treatment
based on the active mode (`data-chrome="dark|light"`), and its accent (`--acc`) is the active
variant's accent color (drives the active swatch ring + icon hover). Swatch colors per family come
from each registry's `swatchKeys` (e.g. Neon uses `[GLOW, ACC]`, Editorial `[acc, paper]`).

**Mobile behavior** (`.is-mobile`, triggered per-family at its own breakpoint — Aurora 880, others
760): the pill becomes a **full-width sticky top header**. On scroll past 96px it expands
(`.cond`) to reveal a secondary nav row (mini avatar + name + nav links) that slides down under the
theme controls.

### Persistence (localStorage keys)

- `pf-family` → string family id (`aurora` default)
- `pf-variants` → JSON map `{ [familyId]: variantId }`
- `pf-modes` → JSON map `{ [familyId]: "dark"|"light" }`

Per-family defaults: Aurora → cobalt/dark, Neon → hotline/dark, Editorial → issue/**light**,
Blueprint → azure/dark.

---

## Tweaks (optional, prototype-only convenience)

The prototype exposes a small "Tweaks" panel (`tweaks-panel.jsx`) with two Neon-light-mode controls:

- **Background** (radio): `soft` / `tinted` / `saturated` — swaps the Neon light `bg`/`panel`
  toward more saturated tints (presets in `NEON_LIGHT_SAT`).
- **Glow** (slider, 0.2–1, default 0.55): the Neon light-mode glow multiplier.

These are author-time controls for tuning, **not** required visitor-facing UI. You can omit the
panel and simply ship the chosen defaults, or wire them as dev-only settings.

---

## Interactions & Behavior

- **Theme switching:** instant token swap; Aurora animates background/text color over `0.6s ease`.
  Variant + mode are remembered **per family**.
- **Neon hero:** infinite 3.6s "breathe" box-shadow pulse; disabled under `prefers-reduced-motion`.
- **Aurora blobs:** slow 38–50s float keyframes (`flA/flB/flC`); reduce/disable on mobile + reduced-motion.
- **Hover states:** nav links shift color + indent; experience cards/timeline nodes light up with
  the accent; social icons invert to filled-accent. Specifics per family above.
- **Nav anchors:** About / Experience / (Chat). In the repo, `index.vue` already manages a `#about`
  default hash and smooth scroll — preserve that. "Chat" routes to `pages/chat.vue`.
- **External links:** each experience's `link`/`companyLink` opens the company site (new tab).
- **No loading/error/empty states** — content is static.
- **Responsive:** every family collapses to one column at its breakpoint; switcher becomes a sticky
  header on mobile.

---

## State Management

A single reactive theme state, persisted to localStorage:

```ts
// useTheme() composable (suggested)
const family = useState<"aurora" | "neon" | "editorial" | "blueprint">(
  "pf-family",
  () => load("pf-family", "aurora"),
);
const variants = useState<Record<string, string>>("pf-variants", () =>
  loadJSON("pf-variants", {}),
);
const modes = useState<Record<string, "dark" | "light">>("pf-modes", () =>
  loadJSON("pf-modes", {}),
);
// derived: current variant/mode fall back to per-family defaults
// effect: write data-family / data-variant on root + toggle `.dark` class; persist on change
```

The active mode must drive the existing `.dark` class so the current `--th-*` dark/light split (and
any `dark:` Tailwind utilities) keep working. Window-resize + scroll listeners drive the mobile
header / condensed states (already partly present via the repo's existing scroll logic).

---

## Design Tokens (authoritative values)

The complete, authoritative token values for **every variant × every mode** live in the design
files — copy them directly; do not eyeball:

- **Aurora** → `design-files/aurora-variants.js` (4 variants × dark/light, ~20 `--*` tokens each)
- **Neon** → `design-files/theme-neon.jsx` (3 variants × dark/light + `NEON_LIGHT_SAT` presets)
- **Editorial** → `design-files/theme-editorial.jsx` (3 variants × light/dark)
- **Blueprint** → `design-files/theme-blueprint.jsx` (3 variants × dark/light)

### Cross-cutting scales

- **Fonts (all Google Fonts):** Playfair Display (400–800, italics), Inter (400/500/600/700),
  JetBrains Mono (400/500/600), Space Grotesk (400/500/600/700). Aurora/Editorial/Blueprint lead
  with Playfair for display; Neon uses Space Grotesk; Blueprint uses JetBrains Mono for mono UI.
- **Border radius:** Aurora tags 6px, socials 10px; Neon card 22px / nav pills 999px / socials 11px;
  Editorial mostly square (rules, not radii); Blueprint square (drafting aesthetic); switcher pill 999px.
- **Section overlines:** uppercase, heavy letter-spacing (0.22em Aurora, 0.3em Neon, 0.1em Blueprint),
  accent-colored, with a trailing hairline/dashed/gradient line.
- **Avatar:** Aurora 96px round · Neon 108px round · Editorial 236×280 portrait · Blueprint full-width 230px tall.
- **Name display size:** Aurora 52px · Neon 80px · Editorial 78px · Blueprint 46px (desktop).
- **Switcher pill:** fixed top-right, 999px radius, dark/light adaptive glass, accent ring on active swatch.

> **Mapping to the repo's `--th-*` tokens:** the repo currently exposes `--th-primary`,
> `--th-fg-light/accent/highlight/muted`, `--th-primary-bg1/2/3`, `--th-circle1..5`,
> `--th-interactive`, `--th-blending`. Aurora's `--name/--ink/--body/--muted/--accent` map onto
> `--th-fg-light/…/--th-fg-accent`; the aurora blob colors map onto the `--th-circleN`
> system the site already animates. The other three families introduce additional
> role tokens (e.g. `GLOW/ACC`, `paper/ink/acc`, `CY/AM`) — add them as new `--th-*` names under
> the per-family selectors.

---

## Assets

- **`assets/profile_home.jpeg`** — the profile photo, used as avatar in all four families (cropped
  circular in Aurora/Neon, as a portrait/filtered image in Editorial/Blueprint). Already present in
  the repo under `public/images/`.
- **Icons** (GitHub, LinkedIn, Email, sun/moon, chevron, "↗"): the prototype inlines SVGs via
  `IconFor()`. In production use **`@nuxt/icon`** (`<Icon name="mdi:github">` etc.), which the repo
  already depends on.
- **No other raster assets.** All backgrounds (aurora blobs, neon glow, paper grain, blueprint grid)
  are pure CSS / inline-SVG-data-URI and should be reproduced as such.

---

## Files in this bundle

```
design_handoff_portfolio_themes/
├── README.md                      ← this document
└── design-files/                  ← the HTML/React prototype (reference only)
    ├── Portfolio.html             ← entry point; wires everything together
    ├── portfolio-host.jsx         ← unified switcher shell + persistence + mobile header
    ├── portfolio-data.js          ← shared content (name, tagline, about, experiences)
    ├── aurora-portfolio.jsx       ← Aurora layout + CSS (AuroraBody is what the host renders)
    ├── aurora-variants.js         ← Aurora token sets (4 variants × dark/light)
    ├── theme-neon.jsx             ← Neon layout, palettes, glow scaling, light-sat presets
    ├── theme-editorial.jsx        ← Editorial layout + palettes
    ├── theme-blueprint.jsx        ← Blueprint layout + palettes
    ├── tweaks-panel.jsx           ← prototype tweak controls (optional)
    └── assets/profile_home.jpeg   ← profile photo
```

**To view the prototype:** open `design-files/Portfolio.html` in a browser (it loads React + Babel
from a CDN, so it needs network access). Use the top-right switcher to move through families,
variants, and light/dark.

---

## Suggested implementation order

1. Generalize `assets/css/tailwind.css` into the family×variant×mode token registry (start with
   Aurora, which mirrors the current site).
2. Build `useTheme()` + persistence + root `data-*`/`.dark` wiring.
3. Build `ThemeSwitcher.vue` (pill + dropdown + swatches + mode toggle + mobile sticky header).
4. Refactor the current page into `AuroraLayout.vue` (reuse `HeaderCard`/`AboutSection`/
   `ExperiencesSection`/`ExperienceCard`/`StackTag` where possible).
5. Add `NeonLayout.vue`, `EditorialLayout.vue`, `BlueprintLayout.vue`, each consuming shared content
   - its token set.
6. Have `pages/index.vue` switch layouts on the active family.
7. Pass over hover/motion details + `prefers-reduced-motion`, then responsive breakpoints per family.
