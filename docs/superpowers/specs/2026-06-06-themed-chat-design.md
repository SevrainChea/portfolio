# Spec: Theme-Aware "Ask Me Anything" Chat

**Date:** 2026-06-06
**Status:** Approved for planning
**Source handoff:** `portfolio-frontend/docs/design_handoff_themed_chat/`

## Problem

The portfolio's single chat feature (`pages/chat.vue`, a RAG "Ask me anything"
assistant backed by `POST {apiBase}/api/chat/stream`) is styled in one fixed
look regardless of the active
theme. The home page already adapts to each theme family via per-family
`*Layout.vue` components; the chat does not.

## Goal

Redesign the chat so it adopts each theme family's own visual language, mirroring
the home-page `index.vue` → `*Layout.vue` pattern, while preserving 100% of the
existing chat behavior. No new design tokens — every color binds to the existing
`--th-*` registry, so all variants and light/dark render for free.

### The four skins (default variant · mode shown for reference)

| Family        | Metaphor                                                                     | Default          |
| ------------- | ---------------------------------------------------------------------------- | ---------------- |
| **Aurora**    | Frameless glass — conversation floats on the aurora                          | `cobalt` · dark  |
| **Neon**      | The hotline — breathing "ASK ME ANYTHING" sign, glow tubes                   | `hotline` · dark |
| **Editorial** | Correspondence column — typeset Q./A. interview, "write in" field            | `issue` · light  |
| **Blueprint** | The transcript — figure-numbered inquiry/response log, command-line composer | `azure` · dark   |

## Non-goals

- No backend / API changes. The SSE contract is unchanged.
- No new `--th-*` tokens, palettes, or fonts (all already in `tailwind.css`).
- No changes to `tailwind.css`, `useTheme.ts`, `theme-registry.ts`, or the four
  home-page `*Layout.vue` files — these are **reference-only** for token names and
  per-family CSS idioms (`.amb`, frame/grid, grain, `html:not(.dark)` overrides,
  breathe keyframes).
- No unrelated refactoring of the home page.

## Architecture

Three-part split, identical in shape to the home page:

### 1. `composables/useChat.ts` (new)

Lift **all** logic currently in `chat.vue`'s `<script setup>` into a composable,
with **no behavior changes**. It owns and returns:

```ts
interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}

// state
messages: Ref<Message[]>
input: Ref<string>
loading: Ref<boolean>
conversationId: Ref<string | null>
messagesEl: Ref<HTMLElement | null>   // feed scroll container — skins bind ref
inputEl: Ref<HTMLTextAreaElement | null>
userAtBottom: Ref<boolean>
showScrollCTA: Ref<boolean>

// methods
send(): Promise<void>
autoResize(): void
scrollToBottom(): void
handleScroll(): void
scrollToBottomFromCTA(): void
```

The SSE stream parser (`chunk` → append `content`; `done` → set `sources`,
`model_used`, `conversationId`, clear `streaming`, raise CTA if scrolled up;
`error` → fallback message), `useRuntimeConfig()` for `apiBase`, and the
`onMounted`/`onUnmounted` scroll-listener registration move verbatim into the
composable. The `SSEEvent` and `Message` types live here too.

**Contract:** any chat skin calls `useChat()`, binds `messagesEl` to its feed
element and `inputEl` to its textarea, and gets identical behavior. The composable
knows nothing about presentation.

### 2. `pages/chat.vue` (rewrite → thin switch)

```vue
<template>
  <AuroraChat v-if="family === 'aurora'" />
  <NeonChat v-else-if="family === 'neon'" />
  <EditorialChat v-else-if="family === 'editorial'" />
  <BlueprintChat v-else-if="family === 'blueprint'" />
</template>
<script setup lang="ts">
const { family } = useTheme();
</script>
```

### 3. `components/{Aurora,Neon,Editorial,Blueprint}Chat.vue` (new, 4 files)

Each follows the `*Layout.vue` convention exactly:

- Root element class `.{family}-chat-root` (e.g. `.aurora-chat-root`).
- **Non-scoped** `<style>` namespaced under that root class — required for real
  selectors and `html:not(.dark)` overrides, same as the layouts.
- Mounts `<ThemeSwitcher />` so visitors can switch themes from the chat route.
- Calls `useChat()`; binds `messagesEl`/`inputEl`; renders the shared message list
  in its own family-specific DOM.
- All colors via `var(--th-*)` + `color-mix(in srgb, var(--th-*) N%, transparent)`.
  Fonts via `var(--font-*)`. **No hardcoded hex** — the hexes inlined in the
  prototype `chat-themes.jsx` are only the default-variant resolution of tokens.
- Full-page layout: `h-screen` / `min-height:100vh`, header at top, feed in the
  middle (`flex:1; justify-content:flex-end` so newest messages sit above the
  composer), composer pinned at the bottom.
- Two states driven by `messages.length === 0`: **Empty** (family-specific hero)
  and **Conversation** (populated feed).

**Why four components, not one tokenized template:** Aurora and Neon are bubble
layouts, but Editorial is a typeset Q/A column and Blueprint is a numbered log —
fundamentally different DOM. Four small focused files beat one branching template,
exactly as the home page uses four distinct `*Layout.vue` files.

## Per-family specifications

Full CSS values are in `docs/design_handoff_themed_chat/README.md` (§ Screens /
Views) and `chat-themes.jsx`. Token bindings per family (all tokens already exist):

- **Aurora** — `--th-bg`/`--th-bg-grad`, `--th-blob-1/2/3`/`--th-blob-blend`/
  `--th-blob-op`, grain via `--th-grain-op`; reply panel faint white/`--th-ink`
  tint + `--th-border` + `backdrop-filter`; user bubble `color-mix(--th-accent 15%)`
  fill + `color-mix(--th-accent 34%)` border, text `--th-ink`; composer pill with
  `--th-border-strong`; send circle `--th-accent`, icon `--th-bg`. Header avatar
  ring `--th-avatar-ring`, name Playfair `--th-name`, sublabel `--th-muted`,
  "Online" dot `--th-accent`. Empty hero: 92px avatar halo, Playfair 38px with
  _anything_ italic in `--th-accent-soft`. Breakpoint 880.
- **Neon** — `--th-bg` + ambient `.amb` block copied from `NeonLayout.vue`
  (`--th-glow`/`--th-acc` glows, masked wall grid `--th-line`). Sign uses
  `--th-name-col` + `neon-breathe` keyframe (reuse from layout). Bubble fill
  `--th-panel`; reply border/glow `--th-acc`, user border/glow `--th-glow`; tags
  "You" `--th-glow` / "Sévrain" `--th-acc`. Composer `--th-glow` border+glow, send
  `--th-acc`. Empty: 120px halo ring + 96px avatar, "Drop / a line" `--th-name-col`
  pink glow. **`html:not(.dark)` daylight:** dial glow ~0.55 (smaller blur radii,
  lower `color-mix` %), per `NeonLayout.vue`. Breakpoint 760.
- **Editorial** — paper `--th-bg`, grain `--th-grain-op` at opacity .5. Masthead
  `border-top:3px var(--th-ink)` / `border-bottom:1px var(--th-ink)`, kicker
  `--th-accent`, title Playfair 42px. Turn = grid `50px 1fr`, `border-bottom:1px
var(--th-border)`; marker Playfair italic 30px (`Q.` `--th-accent`, `A.`
  `--th-ink`); question Playfair italic 22px `--th-ink`; answer Inter 15px
  `--th-body` max 60ch. Composer `border-top:2px var(--th-ink)`, "Write in" label
  `--th-accent`, field `border-bottom:1px var(--th-border)` Playfair italic, send
  `--th-accent` bg + light text. Empty: drop-cap "A" 120px `--th-accent` + Playfair
  standfirst. **Default mode light;** `.dark` "night edition" tokens already exist.
  Breakpoint 760.
- **Blueprint** — grid bg from two `linear-gradient`s (`--th-line1` 120px,
  `--th-line2` 24px); inset frame + `::before`; content sheet `::before` backing
  `--th-panel`. Copy frame/grid scaffold from `BlueprintLayout.vue`. Title block
  cells `border:1px color-mix(--th-accent 55%)`, `k` label Mono `--th-muted` over
  `v` value Mono `--th-head`; Status `● Live` in `--th-accent`. Entry
  `border:1px var(--th-line1)`, `background: color-mix(--th-accent 7%)`, left bar
  inquiry `--th-am` / response `--th-accent`, notch label via
  `::before content:attr(data-fig)` on `--th-notch`, numbered sequentially.
  Inquiry text Mono `--th-head`; response Inter `--th-ink` max 64ch. Composer
  command line: `>` prompt `--th-accent`, blinking caret (`bc-blink`), `[ SEND ]`
  `--th-accent`. Empty: `// Session ready` + `AWAITING QUERY` Mono 40px `--th-head`
  - blinking cursor block. Breakpoint 760.

## Behavior (preserved exactly — lives in `useChat()`)

- **Send:** Enter sends; Shift+Enter newlines (`@keydown.enter.exact.prevent`).
  Disabled while `loading` or input empty. Textarea auto-resizes (`autoResize`,
  capped via `max-height`).
- **Streaming:** SSE `data:{…}` lines; `chunk` appends, `done` finalizes, `error`
  shows fallback. A **streaming caret** renders at the end of the streaming message,
  themed per family (Aurora pulsing bar, Neon tube tick, Editorial typeset caret,
  Blueprint block cursor).
- **Typing indicator** (loading, before first chunk): themed per family (Aurora 3
  bouncing dots, Neon pulsing tube, Editorial "composing…", Blueprint blinking
  `AWAITING RESPONSE`).
- **Scroll-to-latest CTA:** existing `userAtBottom`/`showScrollCTA` logic; pill
  skinned to the active accent.
- **Auto-scroll** only when already at bottom.
- **Responsive:** each family reduces paddings / type sizes at its breakpoint
  (Aurora 880, others 760), as the `*Layout.vue` files do.

## Decisions (resolved during brainstorming)

1. **Sources + model label:** **render subtly per theme** (not dropped). Shown only
   on assistant messages after streaming completes (same guard as today:
   `role === 'assistant' && !streaming && (sources?.length || model_used)`).
   - Aurora: faint accent chips + muted `model_used` label.
   - Neon: faint `--th-acc` chips under the reply tube.
   - Editorial: small-caps "Sources — …" footnote line in `--th-muted`.
   - Blueprint: `// sources: …` mono line in `--th-muted`.
2. **Back navigation:** **themed back link per family** → `/` (`uil:arrow-left`
   "Back"), styled to each metaphor (Aurora muted glass link, Neon glow tag,
   Editorial small-caps rule link, Blueprint mono `[ ← BACK ]`). ThemeSwitcher is
   also mounted per the handoff.
3. **Build sequence:** **Aurora first** — land `useChat` + `chat.vue` switch +
   `AuroraChat`, verify live, then Neon → Editorial → Blueprint.

## Files

- **New:** `composables/useChat.ts`, `components/AuroraChat.vue`,
  `components/NeonChat.vue`, `components/EditorialChat.vue`,
  `components/BlueprintChat.vue`.
- **Edit:** `pages/chat.vue` (→ family switch).
- **Reference only (do not change):** `assets/css/tailwind.css`,
  `composables/useTheme.ts`, `theme-registry.ts`, the four `*Layout.vue` files,
  `composables/usePortfolioData.ts` (avatar via `usePortfolioData().photo`).

## Verification

No test framework configured — verify visually via Chrome DevTools MCP against the
running dev server (user keeps one running; do not start a new one). Per skin,
screenshot:

- Empty state and a populated conversation (send a real message to exercise
  streaming + the themed caret/typing indicator).
- Default variant + opposite mode (light/dark), confirming the `html:not(.dark)`
  glow/contrast tweaks for Neon and Blueprint.
- One responsive width below the family breakpoint.

Confirm: no console errors, send/Enter/Shift+Enter behavior intact, scroll CTA
appears when scrolled up during streaming, sources/model line renders after a turn,
back link routes home, ThemeSwitcher works on the route.

## Success criteria

- Switching family on `/chat` swaps the entire chat skin, same as `/` swaps layouts.
- All four skins render faithfully to the comps in their default variant + mode, and
  render correctly in the other variants + opposite mode purely from token resolution.
- Chat behavior (streaming, scroll, send, auto-resize, CTA) is byte-for-byte the
  same as today's `chat.vue` — only presentation changed.
- No hardcoded theme hex values in the new components; everything via `--th-*`.
