<template>
  <div class="editorial-chat-root">
    <ThemeSwitcher />
    <div class="paper" />

    <div class="sheet">
      <div class="mast">
        <div>
          <NuxtLink to="/" class="back">← Back</NuxtLink>
          <div class="kick">Correspondence</div>
          <h1>In Conversation</h1>
        </div>
        <div class="meta">
          <div>With <b>{{ data.name }}</b></div>
          <div>An open column</div>
          <div><b>{{ data.role }}</b></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0" class="feed empty">
        <div class="invite">
          <div class="dcap">A</div>
          <div>
            <p class="stand">
              sk me anything — about the work, the teams I've built, and the
              craft of shipping software that lasts.
            </p>
            <div class="by">An open column · <b>write below</b></div>
          </div>
        </div>
      </div>

      <!-- Conversation -->
      <div v-else ref="messagesEl" class="feed">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['turn', msg.role === 'user' ? 'q' : 'a']"
        >
          <div class="mark">{{ msg.role === "user" ? "Q." : "A." }}</div>
          <div class="body">
            <p v-if="msg.role === 'user'" class="qtext">{{ msg.content }}</p>
            <p v-else class="atext">
              {{ msg.content }}<span v-if="msg.streaming" class="caret">|</span>
            </p>
            <div
              v-if="
                msg.role === 'assistant' &&
                !msg.streaming &&
                (msg.sources?.length || msg.model_used)
              "
              class="srcs"
            >
              <template v-if="msg.sources?.length"
                >Sources — {{ msg.sources.join(", ") }}</template
              ><template v-if="msg.model_used">
                · {{ msg.model_used }}</template
              >
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading && !messages.some((m) => m.streaming)" class="turn a">
          <div class="mark">A.</div>
          <div class="body"><p class="atext composing">composing…</p></div>
        </div>
      </div>

      <!-- Scroll-to-latest CTA -->
      <Transition name="cta">
        <button
          v-if="showScrollCTA"
          class="scroll-cta"
          aria-label="Scroll to latest messages"
          @click="scrollToBottomFromCTA"
        >
          ↓ Latest
        </button>
      </Transition>

      <!-- Composer — "write in" -->
      <form class="composer" @submit.prevent="send">
        <span class="lab">Write in</span>
        <textarea
          ref="inputEl"
          v-model="input"
          rows="1"
          :disabled="loading"
          :class="{ dimmed: loading }"
          placeholder="Type your question…"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        />
        <button
          type="submit"
          class="send"
          :disabled="!input.trim() || loading"
          aria-label="Send message"
        >
          Send <Icon name="uil:arrow-right" size="14" />
        </button>
      </form>
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

<!-- Not scoped: namespaced under .editorial-chat-root. Defaults to light; the
     .dark "night edition" resolves purely from --th-* tokens. -->
<style>
.editorial-chat-root {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  overflow: hidden;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-inter);
  -webkit-font-smoothing: antialiased;
}
.editorial-chat-root .paper {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: var(--th-grain-op);
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}
.editorial-chat-root .sheet {
  position: relative;
  z-index: 2;
  height: 100vh;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 36px;
  box-sizing: border-box;
}
/* masthead */
.editorial-chat-root .mast {
  border-top: 3px solid var(--th-ink);
  border-bottom: 1px solid var(--th-ink);
  padding: 14px 0 16px;
  margin-top: 34px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.editorial-chat-root .mast .kick {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--th-accent);
  margin-bottom: 8px;
}
.editorial-chat-root .mast h1 {
  font-family: var(--font-playfair-display);
  font-size: 42px;
  line-height: 0.92;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
  color: var(--th-ink);
}
.editorial-chat-root .mast .meta {
  text-align: right;
  font-size: 10.5px;
  color: var(--th-muted);
  letter-spacing: 0.05em;
  line-height: 1.8;
  text-transform: uppercase;
}
.editorial-chat-root .mast .meta b {
  color: var(--th-ink);
}
.editorial-chat-root .mast .back {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--th-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.editorial-chat-root .mast .back:hover {
  color: var(--th-accent);
}
/* feed */
.editorial-chat-root .feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 6px 0;
  position: relative;
}
/* Pin a short conversation to the bottom without `justify-content: flex-end`,
   which clips overflowing content off the top and makes it unscrollable. */
.editorial-chat-root .feed:not(.empty) > :first-child {
  margin-top: auto;
}
.editorial-chat-root .turn {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 0 18px;
  padding: 20px 0;
  border-bottom: 1px solid var(--th-border);
}
.editorial-chat-root .turn:last-child {
  border-bottom: none;
}
.editorial-chat-root .mark {
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-size: 30px;
  line-height: 1;
}
.editorial-chat-root .turn.q .mark {
  color: var(--th-accent);
}
.editorial-chat-root .turn.a .mark {
  color: var(--th-ink);
}
.editorial-chat-root .qtext {
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-weight: 500;
  font-size: 22px;
  line-height: 1.34;
  color: var(--th-ink);
  margin: 2px 0 0;
  text-wrap: pretty;
}
.editorial-chat-root .atext {
  font-size: 15px;
  line-height: 1.72;
  color: var(--th-body);
  margin: 3px 0 0;
  max-width: 60ch;
  white-space: pre-wrap;
}
.editorial-chat-root .atext.composing {
  font-style: italic;
  color: var(--th-muted);
}
/* streaming caret — typeset */
.editorial-chat-root .caret {
  color: var(--th-ink);
  font-weight: 400;
  margin-left: 1px;
  animation: ec-blink 1s steps(1) infinite;
}
@keyframes ec-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
/* sources + model — small-caps footnote */
.editorial-chat-root .srcs {
  margin-top: 8px;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--th-muted);
}
/* empty — the invitation */
.editorial-chat-root .feed.empty {
  justify-content: center;
}
.editorial-chat-root .invite {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0 24px;
  align-items: start;
}
.editorial-chat-root .invite .dcap {
  font-family: var(--font-playfair-display);
  font-weight: 700;
  font-size: 120px;
  line-height: 0.74;
  color: var(--th-accent);
}
.editorial-chat-root .invite .stand {
  font-family: var(--font-playfair-display);
  font-size: 30px;
  line-height: 1.32;
  font-weight: 500;
  color: var(--th-ink);
  margin: 6px 0 0;
  text-wrap: pretty;
}
.editorial-chat-root .invite .by {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--th-muted);
  margin-top: 18px;
}
.editorial-chat-root .invite .by b {
  color: var(--th-accent);
}
/* CTA */
.editorial-chat-root .scroll-cta {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 8px 16px;
  color: var(--th-bg);
  background: var(--th-accent);
  border: 1px solid var(--th-ink);
  z-index: 3;
}
.cta-enter-active,
.cta-leave-active {
  transition: opacity 0.2s;
}
.cta-enter-from,
.cta-leave-to {
  opacity: 0;
}
/* composer — "write to the editor" */
.editorial-chat-root .composer {
  border-top: 2px solid var(--th-ink);
  margin-top: 6px;
  padding: 16px 0 30px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.editorial-chat-root .composer .lab {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--th-accent);
  white-space: nowrap;
}
.editorial-chat-root .composer textarea {
  flex: 1;
  resize: none;
  max-height: 140px;
  border: none;
  border-bottom: 1px solid var(--th-border);
  background: transparent;
  outline: none;
  padding: 9px 2px;
  font-family: var(--font-playfair-display);
  font-style: italic;
  font-size: 18px;
  color: var(--th-ink);
  line-height: 1.4;
}
.editorial-chat-root .composer textarea::placeholder {
  color: var(--th-muted);
}
.editorial-chat-root .composer textarea.dimmed {
  opacity: 0.5;
}
.editorial-chat-root .send {
  border: 1px solid var(--th-ink);
  background: var(--th-accent);
  color: var(--th-bg);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 11px 20px;
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  white-space: nowrap;
}
.editorial-chat-root .send:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  .editorial-chat-root .caret {
    animation: none;
  }
}
@media (max-width: 760px) {
  /* Clear the fixed mobile ThemeSwitcher bar that overlays the top. */
  .editorial-chat-root .sheet {
    padding: 56px 22px 0;
  }
  .editorial-chat-root .mast {
    margin-top: 18px;
  }
  .editorial-chat-root .mast h1 {
    font-size: 32px;
  }
  .editorial-chat-root .invite .dcap {
    font-size: 84px;
  }
  .editorial-chat-root .invite .stand {
    font-size: 23px;
  }
  .editorial-chat-root .composer {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
