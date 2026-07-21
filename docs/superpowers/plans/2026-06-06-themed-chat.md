# Theme-Aware Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/chat` page adopt each theme family's visual language by mirroring the home-page `index.vue` → `*Layout.vue` pattern, while preserving all existing chat behavior.

**Architecture:** Extract all chat logic from `pages/chat.vue` into a `useChat()` composable (no behavior change), rewrite `chat.vue` to a thin family switch, and add one token-bound component per family (`AuroraChat`, `NeonChat`, `EditorialChat`, `BlueprintChat`). Every color binds to existing `--th-*` tokens; no new tokens, no backend changes.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup lang="ts">`, Composition API), TailwindCSS v4, non-scoped namespaced `<style>` per component, Chrome DevTools MCP for visual verification.

**Spec:** `portfolio-frontend/docs/superpowers/specs/2026-06-06-themed-chat-design.md`
**Design references (in-repo):** `portfolio-frontend/docs/design_handoff_themed_chat/{README.md,chat-themes.jsx}`

---

## Conventions for every task

- All paths are relative to `portfolio-frontend/` unless absolute.
- **No test framework / linter exists.** "Verify" = use Chrome DevTools MCP against the **already-running** dev server at `localhost:3000` (the user keeps one running — **do NOT run `pnpm dev`**). Changes hot-reload.
- To force a family/variant/mode while verifying, set localStorage keys then reload. The keys come from `theme-registry.ts` (`STORAGE_KEYS`): `pf-family` (string, e.g. `"aurora"`), `pf-variants` (JSON, e.g. `{"aurora":"cobalt"}`), `pf-modes` (JSON, e.g. `{"aurora":"dark"}`). Use the ThemeSwitcher UI as the primary path; localStorage is the fallback for opposite-variant/mode checks.
- **No hardcoded theme hex** in components. Every color is `var(--th-*)` or `color-mix(in srgb, var(--th-*) N%, transparent)`. The hexes in `chat-themes.jsx` are only the default-variant resolution — translate them via the per-task mapping tables.
- Component `<style>` is **NOT scoped** and every rule is namespaced under the root class (e.g. `.aurora-chat-root .feed { … }`), matching the `*Layout.vue` files.
- Commit after each task.

---

## File Structure

| File                                 | Responsibility                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `composables/useChat.ts` (new)       | All chat state + behavior (SSE stream, scroll, send, auto-resize). Zero presentation. |
| `pages/chat.vue` (rewrite)           | Thin switch: render the active family's chat component.                               |
| `components/AuroraChat.vue` (new)    | Frameless-glass skin.                                                                 |
| `components/NeonChat.vue` (new)      | Hotline / neon-tube skin.                                                             |
| `components/EditorialChat.vue` (new) | Correspondence-column skin.                                                           |
| `components/BlueprintChat.vue` (new) | Transcript / spec-sheet skin.                                                         |
| `components/GlassCard.vue`           | Becomes dead code (no consumers after this) — left in place, noted in final task.     |

---

## Task 1: Extract `useChat()` composable

**Files:**

- Create: `composables/useChat.ts`

This is a **verbatim move** of the logic in the current `pages/chat.vue` `<script setup>` (lines 161–344). No behavior changes. The composable owns the refs and returns everything a skin needs.

- [ ] **Step 1: Create the composable**

Create `composables/useChat.ts`:

```ts
import { ref, nextTick, onMounted, onUnmounted } from "vue";

type SSEEvent =
  | { type: "chunk"; content: string }
  | {
      type: "done";
      conversation_id: string;
      sources: string[];
      model_used: string;
    }
  | { type: "error"; message: string };

export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}

export function useChat() {
  const config = useRuntimeConfig();

  const messages = ref<Message[]>([]);
  const input = ref("");
  const loading = ref(false);
  const conversationId = ref<string | null>(null);
  const messagesEl = ref<HTMLElement | null>(null);
  const inputEl = ref<HTMLTextAreaElement | null>(null);
  const userAtBottom = ref(true);
  const showScrollCTA = ref(false);

  const autoResize = () => {
    const el = inputEl.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const scrollToBottom = () => {
    // Only auto-scroll if user is already at the bottom
    if (!userAtBottom.value) return;
    nextTick(() => {
      if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      }
    });
  };

  const handleScroll = () => {
    if (!messagesEl.value) return;
    const el = messagesEl.value;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    userAtBottom.value = isAtBottom;
    if (isAtBottom && showScrollCTA.value) {
      showScrollCTA.value = false;
    }
  };

  const send = async () => {
    const text = input.value.trim();
    if (!text || loading.value) return;

    messages.value.push({ role: "user", content: text });
    input.value = "";
    if (inputEl.value) inputEl.value.style.height = "auto";
    loading.value = true;
    scrollToBottom();

    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      streaming: true,
    };
    messages.value.push(assistantMsg);
    const msgIndex = messages.value.length - 1;

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(`${config.public.apiBase}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId.value,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const remaining = decoder.decode();
          if (remaining) buffer += remaining;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(raw) as SSEEvent;
          } catch {
            continue;
          }

          if (event.type === "chunk") {
            messages.value[msgIndex].content += event.content;
            scrollToBottom();
          } else if (event.type === "done") {
            messages.value[msgIndex].streaming = false;
            messages.value[msgIndex].sources = event.sources;
            messages.value[msgIndex].model_used = event.model_used;
            conversationId.value = event.conversation_id ?? null;
            if (!userAtBottom.value) {
              showScrollCTA.value = true;
            }
            scrollToBottom();
          } else if (event.type === "error") {
            messages.value[msgIndex].content =
              "Sorry, something went wrong. Please try again.";
            messages.value[msgIndex].streaming = false;
          }
        }
      }
    } catch (e) {
      console.error("[chat] Streaming error:", e);
      messages.value[msgIndex].content =
        "Sorry, something went wrong. Please try again.";
      messages.value[msgIndex].streaming = false;
    } finally {
      reader?.cancel();
      loading.value = false;
      nextTick(() => inputEl.value?.focus());
    }
  };

  const scrollToBottomFromCTA = () => {
    showScrollCTA.value = false;
    userAtBottom.value = true;
    nextTick(() => {
      if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      }
    });
  };

  onMounted(() => {
    if (messagesEl.value) {
      messagesEl.value.addEventListener("scroll", handleScroll);
    }
  });

  onUnmounted(() => {
    if (messagesEl.value) {
      messagesEl.value.removeEventListener("scroll", handleScroll);
    }
  });

  return {
    messages,
    input,
    loading,
    conversationId,
    messagesEl,
    inputEl,
    userAtBottom,
    showScrollCTA,
    autoResize,
    scrollToBottom,
    handleScroll,
    send,
    scrollToBottomFromCTA,
  };
}
```

> Note: `useRuntimeConfig` and `ref`/`onMounted` etc. are Nuxt/Vue auto-imports; the explicit `vue` import mirrors the current `chat.vue`. The `onMounted`/`onUnmounted` listeners attach to `messagesEl` — each skin must bind `ref="messagesEl"` to its scroll container, or scroll handling is a no-op (guarded by the `if (messagesEl.value)` checks, so it fails safe).

- [ ] **Step 2: Typecheck the composable compiles**

Run: `cd portfolio-frontend && pnpm exec nuxi typecheck 2>&1 | head -40`
Expected: no errors referencing `composables/useChat.ts`. (If the project has no `typecheck` script, run `pnpm exec vue-tsc --noEmit` instead; if neither tool is available, skip and rely on the dev server having no console/HMR errors after Task 2.)

- [ ] **Step 3: Commit**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add portfolio-frontend/composables/useChat.ts
git commit -m "feat(chat): extract chat logic into useChat composable"
```

---

## Task 2: `AuroraChat.vue` + rewrite `chat.vue` to the switch

Aurora is closest to today's chat. Build it first and wire the switch so `/chat` renders it. The other three branches are added in their own tasks.

**Files:**

- Create: `components/AuroraChat.vue`
- Rewrite: `pages/chat.vue`

### Token map (Aurora) — prototype hex → token

Translate the `.ac` CSS in `chat-themes.jsx` (lines 33–75) verbatim into the component's namespaced `<style>`, substituting each hex with the token below. Keep all radii/spacing/blur/shadow geometry exactly as in the prototype.

| Prototype value                               | Replace with                                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.ac` bg `#06080f`                            | `var(--th-bg)`                                                                                  |
| `.bgg` radial gradient                        | `var(--th-bg-grad)`                                                                             |
| `.b1` blue blob `#2b5bff`                     | `var(--th-blob-1)`; opacity → `var(--th-blob-op)`                                               |
| `.b2` purple blob `#7c3aed`                   | `var(--th-blob-2)`                                                                              |
| `.b3` cyan blob `#06b6d4`                     | `var(--th-blob-3)`                                                                              |
| `.blob` `mix-blend-mode:screen`               | `mix-blend-mode: var(--th-blob-blend)`                                                          |
| `.grain` `opacity:.05`                        | `opacity: var(--th-grain-op)`                                                                   |
| body text `#f2f6ff`                           | `var(--th-ink)`                                                                                 |
| `.top img` border `rgba(255,255,255,.18)`     | `var(--th-avatar-ring)`                                                                         |
| `.top img` shadow `rgba(90,209,255,.10)`      | `color-mix(in srgb, var(--th-accent) 10%, transparent)`                                         |
| `.nm` `#fff`                                  | `var(--th-name)`                                                                                |
| `.sub` / `.live` `#8b93a7`                    | `var(--th-muted)`                                                                               |
| `.live i` `#5ad1ff` + glow                    | `var(--th-accent)`; `box-shadow: 0 0 10px var(--th-accent)`                                     |
| `.top` border `rgba(255,255,255,.08)`         | `var(--th-border)`                                                                              |
| `.bot` bg `rgba(255,255,255,.045)`            | `color-mix(in srgb, var(--th-ink) 5%, transparent)`                                             |
| `.bot` border `rgba(255,255,255,.10)`         | `var(--th-border)`                                                                              |
| `.bot` color `#cdd3e2`                        | `var(--th-body)`                                                                                |
| `.user` bg `color-mix(#5ad1ff 15%)`           | `color-mix(in srgb, var(--th-accent) 15%, transparent)`                                         |
| `.user` border `color-mix(#5ad1ff 34%)`       | `color-mix(in srgb, var(--th-accent) 34%, transparent)`                                         |
| `.user` color `#eaf7ff`                       | `var(--th-ink)`                                                                                 |
| `.hero-av` shadows `rgba(90,209,255,.08/.55)` | `color-mix(... var(--th-accent) 8%/55% ...)`; ring `var(--th-avatar-ring)`                      |
| `.hero-h` `#fff`                              | `var(--th-name)`                                                                                |
| `.hero-h em` `#9fd9ff`                        | `var(--th-accent-soft)`                                                                         |
| `.hero-sub` `#8b93a7`                         | `var(--th-muted)`                                                                               |
| `.composer` bg `rgba(255,255,255,.05)`        | `color-mix(in srgb, var(--th-ink) 5%, transparent)`                                             |
| `.composer` border `rgba(255,255,255,.16)`    | `var(--th-border-strong)`                                                                       |
| `.composer .ph` (textarea text)               | `var(--th-ink)`; placeholder `var(--th-muted)`                                                  |
| `.send` bg `#5ad1ff`                          | `var(--th-accent)`; icon color `var(--th-bg)`; shadow `color-mix(... var(--th-accent) 70% ...)` |
| `.hint` `#5a6172`                             | `var(--th-muted)`                                                                               |
| font-family `'Inter'…`                        | `var(--font-inter)`; `.nm`/`.hero-h` → `var(--font-playfair-display)`                           |

- [ ] **Step 1: Create `components/AuroraChat.vue`**

Structure: root `.aurora-chat-root` containing `<ThemeSwitcher />`, the bg layers (`bgg`/`aur`/`blob`×3/`grain`), and `.col` with header → feed → composer. Wire to `useChat()`. Full script + template:

```vue
<template>
  <div class="aurora-chat-root">
    <ThemeSwitcher />
    <div class="bgg" />
    <div class="aur">
      <div class="blob b1" />
      <div class="blob b2" />
      <div class="blob b3" />
    </div>
    <div class="grain" />

    <div class="col">
      <div class="top">
        <NuxtLink to="/" class="back" aria-label="Back to home">
          <Icon name="uil:arrow-left" size="18" />
        </NuxtLink>
        <img :src="data.photo" :alt="data.name" />
        <div>
          <div class="nm">{{ data.name }}</div>
          <div class="sub">Ask me anything</div>
        </div>
        <div class="live"><i />Online</div>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0" class="feed empty">
        <img class="hero-av" :src="data.photo" :alt="data.name" />
        <h2 class="hero-h">Ask me <em>anything</em></h2>
        <p class="hero-sub">
          About Sévrain's experience, the teams he's built, and the things he's
          shipped.
        </p>
      </div>

      <!-- Conversation -->
      <div v-else ref="messagesEl" class="feed">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="msg.role === 'user' ? 'msg-row user-row' : 'msg-row bot-row'"
        >
          <div :class="['msg', msg.role === 'user' ? 'user' : 'bot']">
            <span class="txt">{{ msg.content }}</span>
            <span v-if="msg.streaming" class="caret" />
          </div>
          <div
            v-if="
              msg.role === 'assistant' &&
              !msg.streaming &&
              (msg.sources?.length || msg.model_used)
            "
            class="meta"
          >
            <span v-for="s in msg.sources" :key="s" class="chip">{{ s }}</span>
            <span v-if="msg.model_used" class="model">{{
              msg.model_used
            }}</span>
          </div>
        </div>

        <!-- Typing indicator (before first chunk) -->
        <div
          v-if="loading && !messages.some((m) => m.streaming)"
          class="msg-row bot-row"
        >
          <div class="msg bot typing">
            <span class="dot" /><span class="dot" /><span class="dot" />
          </div>
        </div>
      </div>

      <!-- Scroll-to-latest CTA -->
      <Transition name="cta">
        <button
          v-if="showScrollCTA"
          class="scroll-cta"
          @click="scrollToBottomFromCTA"
        >
          <Icon name="uil:arrow-down" size="16" /> Scroll to latest
        </button>
      </Transition>

      <!-- Composer -->
      <form class="composer" @submit.prevent="send">
        <textarea
          ref="inputEl"
          v-model="input"
          rows="1"
          :disabled="loading"
          placeholder="Type a message…"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        />
        <button
          type="submit"
          class="send"
          :disabled="!input.trim() || loading"
          aria-label="Send"
        >
          <Icon name="uil:message" size="18" />
        </button>
      </form>
      <div class="hint">Enter to send · Shift + Enter for a new line</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const data = usePortfolioData();
const {
  messages,
  input,
  loading,
  messagesEl,
  inputEl,
  showScrollCTA,
  autoResize,
  send,
  scrollToBottomFromCTA,
} = useChat();
</script>
```

Then add the **non-scoped** `<style>` block: port the `.ac …` rules from `chat-themes.jsx` lines 33–75 under `.aurora-chat-root`, applying the token map above. Add these extra rules not in the prototype:

```css
/* in the non-scoped <style>, all under .aurora-chat-root */
.aurora-chat-root {
  position: relative;
  min-height: 100vh;
}
.aurora-chat-root .col {
  height: 100vh;
}
.aurora-chat-root .feed {
  position: relative;
  overflow-y: auto;
}
.aurora-chat-root .msg-row {
  display: flex;
  flex-direction: column;
}
.aurora-chat-root .user-row {
  align-items: flex-end;
}
.aurora-chat-root .bot-row {
  align-items: flex-start;
}
.aurora-chat-root .back {
  color: var(--th-muted);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--th-border);
  transition:
    color 0.2s,
    border-color 0.2s;
}
.aurora-chat-root .back:hover {
  color: var(--th-accent);
  border-color: var(--th-accent);
}
.aurora-chat-root .composer textarea {
  flex: 1;
  resize: none;
  max-height: 160px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--th-ink);
  font: inherit;
  font-size: 15px;
  line-height: 1.5;
}
.aurora-chat-root .composer textarea::placeholder {
  color: var(--th-muted);
}
.aurora-chat-root .send {
  border: none;
  cursor: pointer;
}
.aurora-chat-root .send:disabled {
  opacity: 0.4;
  cursor: default;
}
/* streaming caret — thin pulsing bar */
.aurora-chat-root .caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  background: var(--th-accent);
  vertical-align: text-bottom;
  animation: ac-pulse 1s ease-in-out infinite;
}
@keyframes ac-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
/* typing dots */
.aurora-chat-root .typing {
  display: flex;
  gap: 6px;
  align-items: center;
}
.aurora-chat-root .typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--th-muted);
  animation: ac-bounce 1s infinite;
}
.aurora-chat-root .typing .dot:nth-child(2) {
  animation-delay: 0.15s;
}
.aurora-chat-root .typing .dot:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes ac-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
/* sources + model */
.aurora-chat-root .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin: 6px 2px 0;
}
.aurora-chat-root .chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--th-border);
  background: color-mix(in srgb, var(--th-accent) 8%, transparent);
  color: var(--th-muted);
}
.aurora-chat-root .model {
  font-size: 11px;
  color: var(--th-muted);
  opacity: 0.7;
}
/* CTA pill */
.aurora-chat-root .scroll-cta {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--th-ink);
  border: 1px solid color-mix(in srgb, var(--th-accent) 34%, transparent);
  background: color-mix(in srgb, var(--th-accent) 15%, transparent);
  backdrop-filter: blur(8px);
}
.cta-enter-active,
.cta-leave-active {
  transition: opacity 0.2s;
}
.cta-enter-from,
.cta-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .aurora-chat-root .caret,
  .aurora-chat-root .typing .dot {
    animation: none;
  }
}
@media (max-width: 880px) {
  .aurora-chat-root .col {
    padding: 0 20px;
  }
  .aurora-chat-root .hero-h {
    font-size: 30px;
  }
}
```

> The prototype's `.composer .ph` and `.hint` map to the real textarea and hint;
> the prototype's static `.send` span becomes the submit `<button>`.

- [ ] **Step 2: Rewrite `pages/chat.vue` to the switch**

Replace the entire file with:

```vue
<template>
  <AuroraChat v-if="family === 'aurora'" />
  <NeonChat v-else-if="family === 'neon'" />
  <EditorialChat v-else-if="family === 'editorial'" />
  <BlueprintChat v-else-if="family === 'blueprint'" />
</template>

<script setup lang="ts">
// One dedicated chat screen, rendered by the active family's skin. Each skin is
// a distinct DOM consuming the shared useChat() behavior + --th-* tokens.
const { family } = useTheme();
</script>

<style scoped></style>
```

> `NeonChat`/`EditorialChat`/`BlueprintChat` are created in Tasks 3–5. Until then,
> only the `aurora` branch resolves a real component; the others are inert because
> the default family is `aurora` and Vue only resolves the branch it renders.
> **While verifying Task 2, stay on the Aurora family** (do not switch to Neon/
> Editorial/Blueprint yet — those would warn "failed to resolve component").

- [ ] **Step 3: Verify Aurora live (Chrome DevTools MCP)**

Server is already running. Steps:

1. `navigate_page` → `http://localhost:3000/chat`. Ensure family is `aurora` (default).
2. `take_screenshot` — expect: aurora background (gradient + blobs + grain), header with back arrow + avatar + "Sévrain Chea" + "Ask me anything" sublabel + "Online" dot, centered empty hero ("Ask me _anything_"), pill composer pinned at bottom, hint line. No card frame.
3. `list_console_messages` — expect: no errors (especially no "failed to resolve component").
4. Type a message in the textarea and submit (use `fill` + `press_key Enter`, or click send). Expect: user bubble right-aligned (accent tint), assistant bubble left-aligned, typing dots before first chunk, a pulsing caret while streaming, then a sources/model `.meta` line under the answer once `done` arrives. (Backend must be reachable; if not, the fallback "Sorry, something went wrong" message proves the wiring without the stream.)
5. Click the back arrow → routes to `/`. Navigate back to `/chat`.
6. `resize_page` to 800px wide → confirm composer/hero shrink and remain usable.

- [ ] **Step 4: Commit**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add portfolio-frontend/components/AuroraChat.vue portfolio-frontend/pages/chat.vue
git commit -m "feat(chat): Aurora chat skin + family switch on /chat"
```

---

## Task 3: `NeonChat.vue` + wire neon branch

**Files:**

- Create: `components/NeonChat.vue`
- (No edit to `chat.vue` — the `neon` branch already references `<NeonChat>`, now resolvable.)

### Token map (Neon) — prototype hex → token

Port the `.nc` CSS in `chat-themes.jsx` (lines 117–160), substituting. The ambient `.amb` block (lines 120–126) should be copied from `NeonLayout.vue` **verbatim** (it already uses the tokens) rather than from the prototype's hardcoded version — open `NeonLayout.vue`, find its `.amb` rule, and reuse it namespaced under `.neon-chat-root`.

| Prototype `GLOW=#ff2e88` / `ACC=#2de2e6` etc. | Replace with                                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `.nc` bg `#0d0518`                            | `var(--th-bg)`                                                                                              |
| `.nc` body color `#f5e9ff`                    | `var(--th-body)`                                                                                            |
| `.amb` (whole block)                          | copy `NeonLayout.vue`'s `.amb` rule (uses `--th-glow`, `--th-acc`, `--th-line`)                             |
| `.sign` `#fff`                                | `var(--th-name-col)`                                                                                        |
| `.sign` text-shadow `GLOW`                    | `var(--th-glow)` (keep `#fff` core highlight literal — it is intentional white, matches `NeonLayout`)       |
| `nc-breathe` keyframe                         | reuse `NeonLayout.vue`'s breathe keyframe name if present; else define `neon-breathe` with `var(--th-glow)` |
| `.status` / `.status i` `ACC`                 | `var(--th-acc)`                                                                                             |
| `.tag` (`.row.b`) `ACC`                       | `var(--th-acc)`                                                                                             |
| `.tag` (`.row.u`) `GLOW`                      | `var(--th-glow)`                                                                                            |
| `.msg` bg `#190a2b`                           | `var(--th-panel)`                                                                                           |
| `.bot` border/glow `ACC`                      | `var(--th-acc)`; shadows via `color-mix(in srgb, var(--th-acc) 40%, transparent)` (and inset 33%)           |
| `.bot` color `#eafdff`                        | `var(--th-ink)`                                                                                             |
| `.user` border/glow `GLOW`                    | `var(--th-glow)`; shadows via `color-mix(... var(--th-glow) …)`                                             |
| `.user` color `#ffeaf4`                       | `var(--th-ink)`                                                                                             |
| `.halo` border/glow `ACC`                     | `var(--th-acc)`                                                                                             |
| `.e-h` `#fff` + `GLOW` glow                   | `var(--th-name-col)` + `var(--th-glow)`                                                                     |
| `.e-sub` `#c2add9`                            | `var(--th-body)`                                                                                            |
| `.composer` bg `#190a2b`, border/glow `GLOW`  | `var(--th-panel)`, `var(--th-glow)`                                                                         |
| `.composer .ph` (textarea) `#9b7fae`          | text `var(--th-ink)`, placeholder `var(--th-muted)`                                                         |
| `.send` `#0d0518` on `ACC`                    | icon `var(--th-bg)` on `var(--th-acc)`                                                                      |

- [ ] **Step 1: Create `components/NeonChat.vue`**

Root `.neon-chat-root`, contains `<ThemeSwitcher />`, `.amb`, `.win` with `.top` (centered sign + status; add a `.back` link top-left) → feed → composer. Script identical in shape to AuroraChat (`usePortfolioData()` + `useChat()` destructure). Template mirrors the `.nc` JSX (rows with `.tag` "You"/"Sévrain", bubbles), plus the shared additions:

- **Back link:** small glow tag top-left in `.top`: `<NuxtLink to="/" class="back"><Icon name="uil:arrow-left" size="16" /></NuxtLink>` styled `color: var(--th-acc); text-shadow: 0 0 8px var(--th-acc);`.
- **Empty state:** halo ring + 96px avatar, "Drop<br>a line" `.e-h`, `.e-sub`.
- **Conversation:** `v-for` rows; tag = `You` (user) / `Sévrain` (assistant). Bind `ref="messagesEl"` on the `.feed`.
- **Streaming caret** (Neon = glowing tube tick): `<span class="caret" />` after `{{ msg.content }}`, styled `display:inline-block; width:3px; height:1em; background:var(--th-acc); box-shadow:0 0 8px var(--th-acc); margin-left:3px; animation: nc-blink 1s steps(1) infinite;`.
- **Typing indicator** (Neon pulsing tube): a small bubble with a pulsing tube bar.
- **Sources/model:** faint `--th-acc` chips: `.meta .chip { border:1px solid color-mix(in srgb, var(--th-acc) 40%, transparent); color: var(--th-acc); background: color-mix(in srgb, var(--th-acc) 8%, transparent); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; padding:2px 8px; border-radius:6px; }`. Model label `var(--th-muted)`.
- **CTA pill:** skin to `var(--th-glow)` border/glow.
- Wire textarea/send exactly as AuroraChat (real `<textarea v-model="input">`, submit button `:disabled`).

`<style>` non-scoped, under `.neon-chat-root`. Add full-height layout (`.win { height:100vh }`, `.feed { overflow-y:auto }`), `prefers-reduced-motion` to disable breathe/blink, and the `@media (max-width:760px)` reductions.

- [ ] **Step 2: Port Neon's `html:not(.dark)` daylight treatment**

Open `NeonLayout.vue`, find its `html:not(.dark) …` rules (dimmed glow: smaller blur radii, lower `color-mix`/alpha on sign, halo, bubbles, composer). Replicate the equivalent overrides for the chat selectors under `.neon-chat-root` so light mode ("daylight") doesn't ship full-strength glow on the pale wall. Mirror the same multipliers (~0.55) the layout uses.

- [ ] **Step 3: Verify Neon live (Chrome DevTools MCP)**

1. Switch family to Neon via the ThemeSwitcher (or set `pf-family="neon"` in localStorage + reload).
2. `take_screenshot` (dark/`hotline`): expect breathing "ASK ME ANYTHING" sign, "Online" status in teal, empty "Drop a line" hero with halo ring. `list_console_messages` → no errors.
3. Send a message: user tube (pink `--th-glow`) vs reply tube (teal `--th-acc`), "You"/"Sévrain" tags, glowing caret while streaming.
4. Toggle to **light mode**: confirm glow is dialed down (not raw full-strength) and text is legible on the pale wall.
5. `resize_page` 720px → confirm 760 breakpoint reductions apply.

- [ ] **Step 4: Commit**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add portfolio-frontend/components/NeonChat.vue
git commit -m "feat(chat): Neon hotline chat skin"
```

---

## Task 4: `EditorialChat.vue` + wire editorial branch

**Files:**

- Create: `components/EditorialChat.vue`

### Token map (Editorial) — prototype hex → token

Port the `.ec` CSS in `chat-themes.jsx` (lines 200–234). Editorial **defaults to light**.

| Prototype const              | Replace with                                                |
| ---------------------------- | ----------------------------------------------------------- |
| `.ec` bg `#f4efe4`           | `var(--th-bg)`                                              |
| `ink #23201a`                | `var(--th-ink)`                                             |
| `acc #b8472b`                | `var(--th-accent)`                                          |
| `mut #6f6557`                | `var(--th-muted)`                                           |
| `rule #cbb89a`               | `var(--th-border)`                                          |
| `body #3a342b`               | `var(--th-body)`                                            |
| `.paper` `opacity:.5`        | `opacity: var(--th-grain-op)` (keep the SVG noise data-URI) |
| `.send` light text `#f8f3e8` | `var(--th-bg)`                                              |
| display fonts                | `var(--font-playfair-display)`; body `var(--font-inter)`    |

- [ ] **Step 1: Create `components/EditorialChat.vue`**

Root `.editorial-chat-root`, contains `<ThemeSwitcher />`, `.paper`, `.sheet` with `.mast` (masthead) → feed → composer. Script identical shape (`usePortfolioData()` + `useChat()`).

Template mirrors the `.ec` JSX — **not bubbles**, a typeset Q/A column:

- **Back link:** small-caps rule link in the masthead meta area: `<NuxtLink to="/" class="back">← Back</NuxtLink>`, `font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--th-muted);` hover `var(--th-accent)`.
- **Masthead:** kicker "Correspondence" `var(--th-accent)`, title "In Conversation" Playfair 42px, meta block right (`With Sévrain Chea`, role from `usePortfolioData()`).
- **Empty state:** the invitation — drop-cap "A" 120px `var(--th-accent)` + Playfair standfirst + byline "An open column · **write below**".
- **Conversation:** `v-for` turns; `turn.q` for user (marker `Q.` `var(--th-accent)`, `.qtext` Playfair italic), `turn.a` for assistant (marker `A.` `var(--th-ink)`, `.atext` Inter `var(--th-body)`). Bind `ref="messagesEl"` on `.feed`.
- **Streaming caret** (typeset caret): a slim `|` `var(--th-ink)` appended to the streaming `.atext`, `animation: ec-blink 1s steps(1) infinite`.
- **Typing indicator:** an `A.` turn whose `.atext` reads "composing…" in `var(--th-muted)` italic until the first chunk replaces it.
- **Sources/model:** small-caps footnote under the answer: `.meta { font-family: var(--font-inter); font-size: 10.5px; letter-spacing:.08em; text-transform: uppercase; color: var(--th-muted); margin-top: 6px; }` rendering `Sources — {{ sources.join(", ") }}` and the model. Sits in the `1fr` grid column (align under `.atext`).
- **Composer:** "Write in" label `var(--th-accent)`; the prototype's static `.field` becomes a real `<textarea v-model="input">` styled `border-bottom:1px solid var(--th-border)`, Playfair italic, placeholder `var(--th-muted)`; send button `[Send ↗]` `border:1px solid var(--th-ink)`, `background: var(--th-accent)`, light text.
- **CTA pill:** skin to `var(--th-accent)` (rust) with paper-toned background.

`<style>` non-scoped under `.editorial-chat-root`, full-height sheet, `prefers-reduced-motion`, `@media (max-width:760px)` reductions (drop-cap + title sizes down).

- [ ] **Step 2: Verify Editorial live (Chrome DevTools MCP)**

1. Switch family to Editorial (default mode light, variant `issue`).
2. `take_screenshot`: expect paper background + grain, masthead rule (3px top / 1px bottom), "Correspondence" kicker, "In Conversation" title, drop-cap "A" invitation in the empty state, "Write in" composer with bottom-rule field. `list_console_messages` → no errors.
3. Send a message: `Q.` (rust) question in Playfair italic, `A.` (ink) answer in Inter, typeset blinking caret while streaming, small-caps "Sources — …" footnote after `done`.
4. Toggle to **dark** ("night edition"): confirm contrast holds (tokens already defined; no special-casing).
5. `resize_page` 720px → confirm reductions.

- [ ] **Step 3: Commit**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add portfolio-frontend/components/EditorialChat.vue
git commit -m "feat(chat): Editorial correspondence chat skin"
```

---

## Task 5: `BlueprintChat.vue` + wire blueprint branch

**Files:**

- Create: `components/BlueprintChat.vue`

### Token map (Blueprint) — prototype hex → token

Port the `.bc` CSS in `chat-themes.jsx` (lines 288–331). Copy the **frame/grid scaffold** (`.frame`, `.frame::before`, the body `background-image` grid, `.sheet::before` backing) from `BlueprintLayout.vue` verbatim — it already uses `--th-line1`/`--th-line2`/`--th-panel`.

| Prototype const                                    | Replace with                                                                                             |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `bg #0d2236`                                       | `var(--th-bg)`                                                                                           |
| `CY #5bb4e8` (primary)                             | `var(--th-accent)`                                                                                       |
| `AM #f0a652` (secondary)                           | `var(--th-am)`                                                                                           |
| `INK #c6dcee`                                      | `var(--th-ink)`                                                                                          |
| `MUT #7fa6c4`                                      | `var(--th-muted)`                                                                                        |
| `HEAD #fff`                                        | `var(--th-head)`                                                                                         |
| `line1 rgba(120,180,220,.14)`                      | `var(--th-line1)`                                                                                        |
| `line2 rgba(120,180,220,.05)`                      | `var(--th-line2)`                                                                                        |
| `panel rgba(9,26,42,.86)`                          | `var(--th-panel)`                                                                                        |
| `.entry::before` notch bg `#10293f`                | `var(--th-notch)`                                                                                        |
| `CY55` / `CY0c` / `CY07` / `CY33` etc. alpha tints | `color-mix(in srgb, var(--th-accent) {55/5/7/20}%, transparent)` (match the prototype's alpha → percent) |
| mono font                                          | `var(--font-jetbrains-mono)`; response body `var(--font-inter)`                                          |

- [ ] **Step 1: Create `components/BlueprintChat.vue`**

Root `.blueprint-chat-root`, contains `<ThemeSwitcher />`, `.frame`, `.sheet` with title block `.tb` → feed → composer. Script identical shape.

Template mirrors the `.bc` JSX — a numbered transcript:

- **Back link:** mono `[ ← BACK ]` in the title block or top corner: `<NuxtLink to="/" class="back">[ ← BACK ]</NuxtLink>`, `font-family: var(--font-jetbrains-mono); font-size:11px; color: var(--th-accent);`.
- **Title block:** cells `Doc: Q&A — Transcript` · `Subject: S. Chea` · `Rev: 01` · `Status: ● Live` (dot+label `var(--th-accent)`).
- **Empty state:** `// Session ready` label, big `AWAITING QUERY` Mono 40px `var(--th-head)` + blinking 18×38 cursor block `var(--th-accent)`, one-line note `var(--th-muted)`.
- **Conversation:** `v-for` entries; sequential numbering computed in template — inquiry (user) `entry.q` with left bar `var(--th-am)` and `data-fig="Q-NN · INQUIRY"`; response (assistant) `entry.a` with left bar `var(--th-accent)` and `data-fig="A-NN · RESPONSE"`. Compute `Q`/`A` indices by filtering `messages` up to `i` (e.g. a helper that counts prior user/assistant messages). Inquiry text Mono `var(--th-head)`; response Inter `var(--th-ink)` max 64ch. Bind `ref="messagesEl"` on `.feed`.
- **Streaming caret** (command-line block cursor): reuse the `.cur` 8×16 block (`bc-blink`) appended to the streaming response `.txt`.
- **Typing indicator:** a blinking `AWAITING RESPONSE` line (Mono, `var(--th-muted)`) until first chunk.
- **Sources/model:** `// sources: {{ sources.join(", ") }}` mono line `var(--th-muted)` under the response (and `// model: …`).
- **Composer (command line):** `>` prompt `var(--th-accent)`; real `<textarea v-model="input">` Mono, placeholder `var(--th-muted)`; a blinking caret element; `[ SEND ]` button `border:1px solid var(--th-accent)`, text `var(--th-accent)`, `background: color-mix(in srgb, var(--th-accent) 10%, transparent)`.
- **CTA pill:** skin to `var(--th-accent)` mono.

`<style>` non-scoped under `.blueprint-chat-root`; reuse `bc-blink` keyframe; `prefers-reduced-motion`; `@media (max-width:760px)` reductions.

> **Helper for sequential numbering** (put in `<script setup>`):
>
> ```ts
> const figNo = (i: number, role: "user" | "assistant") =>
>   messages.value.slice(0, i + 1).filter((m) => m.role === role).length;
> ```
>
> Use `String(figNo(i, msg.role)).padStart(2, "0")` for the `Q-NN`/`A-NN` label.

- [ ] **Step 2: Port Blueprint's `html:not(.dark)` overrides**

If `BlueprintLayout.vue` defines `html:not(.dark)` tweaks (grid/line contrast, panel backing on light "draft" mode), replicate the equivalent ones for the chat selectors under `.blueprint-chat-root` so the light variant reads correctly.

- [ ] **Step 3: Verify Blueprint live (Chrome DevTools MCP)**

1. Switch family to Blueprint (variant `azure`, dark).
2. `take_screenshot`: expect grid background + inset frame, title block cells (`Doc`/`Subject`/`Rev`/`Status ● Live`), empty `AWAITING QUERY` with blinking cursor, command-line composer (`>` prompt + `[ SEND ]`). `list_console_messages` → no errors.
3. Send two messages: entries numbered `Q-01 · INQUIRY` (amber bar), `A-01 · RESPONSE` (cyan bar), `Q-02`, `A-02`; notch labels sit on the top border; block cursor while streaming; `// sources:` line after `done`.
4. Toggle to **light** + try another variant (`coral`/`emerald`): confirm `--th-am`/`--th-accent` swap correctly and grid stays legible.
5. `resize_page` 720px → confirm reductions.

- [ ] **Step 4: Commit**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add portfolio-frontend/components/BlueprintChat.vue
git commit -m "feat(chat): Blueprint transcript chat skin"
```

---

## Task 6: Cross-family verification sweep + cleanup

**Files:**

- Possibly modify: any of the four chat components (fixes found during the sweep).

- [ ] **Step 1: Full matrix screenshot sweep (Chrome DevTools MCP)**

For each family, capture **empty** and **conversation** states in the **default variant + default mode** AND the **opposite mode**, plus at least one **non-default variant**:

- Aurora: `cobalt` dark (default) + light; spot-check one other variant.
- Neon: `hotline` dark (default) + light (daylight glow check); spot-check one variant.
- Editorial: `issue` light (default) + dark (night edition); spot-check one variant.
- Blueprint: `azure` dark (default) + light; spot-check one variant.

For each: confirm no console errors, no hardcoded-color regressions (everything tracks the variant), composer pinned, feed scrolls, newest message sits just above composer.

- [ ] **Step 2: Behavior parity checks**

On any one family: confirm Enter sends, Shift+Enter inserts a newline (does not send), send disabled while empty/loading, textarea auto-resizes then resets after send, scroll-to-latest CTA appears when you scroll up during streaming and dismisses on click/scroll-to-bottom, back link routes to `/`, ThemeSwitcher works on `/chat`.

- [ ] **Step 3: Confirm GlassCard is now dead code**

Run: `cd portfolio-frontend && grep -rn "GlassCard" --include=*.vue --include=*.ts . | grep -v "components/GlassCard.vue"`
Expected: no matches (chat was its last consumer). Leave the file in place (out of scope to delete); this step just records the fact. If matches remain, they are pre-existing and out of scope — note them and move on.

- [ ] **Step 4: Final typecheck (if available)**

Run: `cd portfolio-frontend && pnpm exec nuxi typecheck 2>&1 | head -40`
Expected: no new errors in `composables/useChat.ts` or the four chat components.

- [ ] **Step 5: Commit any sweep fixes**

```bash
cd /Users/sevrainchea/Documents/projects/portfolio
git add -A portfolio-frontend/components portfolio-frontend/composables portfolio-frontend/pages/chat.vue
git commit -m "fix(chat): cross-family verification sweep adjustments"
```

(If the sweep found nothing to fix, skip this commit.)

---

## Self-Review notes (author)

- **Spec coverage:** useChat (Task 1) ✓; chat.vue switch (Task 2) ✓; four skins (Tasks 2–5) ✓; sources/model per theme (each skin's "sources/model" step) ✓; themed back link (each skin) ✓; streaming caret + typing indicator per theme (each skin) ✓; scroll CTA (each skin) ✓; responsive breakpoints (each skin's `@media`) ✓; Neon/Blueprint `html:not(.dark)` ports (Tasks 3 & 5 dedicated steps) ✓; verification matrix (Task 6) ✓; GlassCard dead-code note (Task 6) ✓.
- **Type consistency:** `useChat()` returns the exact names destructured in every component (`messages`, `input`, `loading`, `messagesEl`, `inputEl`, `showScrollCTA`, `autoResize`, `send`, `scrollToBottomFromCTA`); `Message`/`SSEEvent` defined once in the composable.
- **Known dependency:** `scrollToBottom`/`handleScroll`/`userAtBottom`/`conversationId` are used internally by `useChat`; components only need the subset they bind. Each component MUST set `ref="messagesEl"` on its scroll container and `ref="inputEl"` on its textarea, or scroll/auto-resize no-op (fails safe).
- **CSS-as-port rationale:** prototype CSS lives in-repo (`chat-themes.jsx`) with an exhaustive hex→token table per task, so "port verbatim, substitute tokens" is a deterministic instruction, not a placeholder.
