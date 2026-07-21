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
        <div class="who">
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
          :class="['msg-row', msg.role === 'user' ? 'user-row' : 'bot-row']"
        >
          <div :class="['msg', msg.role === 'user' ? 'user' : 'bot']">
            <span v-if="msg.role === 'user'" class="txt">{{
              msg.content
            }}</span>
            <div
              v-else
              class="md"
              :class="{ streaming: msg.streaming }"
              v-html="renderMarkdown(msg.content)"
            />
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

        <!-- Typing indicator (before first streaming chunk) -->
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
          aria-label="Scroll to latest messages"
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
          :class="{ dimmed: loading }"
          placeholder="Type a message…"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        />
        <button
          type="submit"
          class="send"
          :disabled="!input.trim() || loading"
          aria-label="Send message"
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

<!-- Not scoped: rules are namespaced under .aurora-chat-root, matching the
     *Layout.vue convention (real selectors + token-driven theming). -->
<style>
.aurora-chat-root {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  overflow: hidden;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-inter);
  -webkit-font-smoothing: antialiased;
}
.aurora-chat-root .bgg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--th-bg-grad);
}
.aurora-chat-root .aur {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.aurora-chat-root .blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  mix-blend-mode: var(--th-blob-blend);
  opacity: var(--th-blob-op);
}
.aurora-chat-root .b1 {
  width: 620px;
  height: 620px;
  left: -160px;
  top: -200px;
  background: var(--th-blob-1);
}
.aurora-chat-root .b2 {
  width: 520px;
  height: 520px;
  right: -120px;
  top: 40px;
  background: var(--th-blob-2);
}
.aurora-chat-root .b3 {
  width: 520px;
  height: 520px;
  left: 30%;
  bottom: -220px;
  background: var(--th-blob-3);
}
.aurora-chat-root .grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: var(--th-grain-op);
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.aurora-chat-root .col {
  position: relative;
  z-index: 2;
  height: 100vh;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 30px;
  box-sizing: border-box;
}
/* header */
.aurora-chat-root .top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 26px 4px 20px;
  border-bottom: 1px solid var(--th-border);
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
.aurora-chat-root .top img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--th-avatar-ring);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--th-accent) 10%, transparent);
}
.aurora-chat-root .top .nm {
  font-family: var(--font-playfair-display);
  font-size: 18px;
  color: var(--th-name);
  line-height: 1.1;
}
.aurora-chat-root .top .sub {
  font-size: 11.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--th-muted);
  margin-top: 3px;
}
.aurora-chat-root .top .live {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--th-muted);
}
.aurora-chat-root .top .live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--th-accent);
  box-shadow: 0 0 10px var(--th-accent);
}
/* feed */
.aurora-chat-root .feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 26px 2px;
  overflow-y: auto;
  position: relative;
}
/* Pin a short conversation to the bottom without `justify-content: flex-end`,
   which clips overflowing content off the top and makes it unscrollable. */
.aurora-chat-root .feed:not(.empty) > :first-child {
  margin-top: auto;
}
.aurora-chat-root .msg-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.aurora-chat-root .user-row {
  align-items: flex-end;
}
.aurora-chat-root .bot-row {
  align-items: flex-start;
}
.aurora-chat-root .msg {
  max-width: 78%;
  padding: 14px 18px;
  font-size: 15.5px;
  line-height: 1.62;
  white-space: pre-wrap;
}
.aurora-chat-root .bot {
  background: color-mix(in srgb, var(--th-ink) 5%, transparent);
  border: 1px solid var(--th-border);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--th-body);
  border-radius: 20px;
  border-top-left-radius: 6px;
}
.aurora-chat-root .user {
  background: color-mix(in srgb, var(--th-accent) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-accent) 34%, transparent);
  color: var(--th-ink);
  border-radius: 20px;
  border-top-right-radius: 6px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
/* rendered markdown (assistant bubbles) */
.aurora-chat-root .md {
  white-space: normal;
}
.aurora-chat-root .md > :first-child {
  margin-top: 0;
}
.aurora-chat-root .md > :last-child {
  margin-bottom: 0;
}
.aurora-chat-root .md :where(p) {
  margin: 0.6em 0;
}
.aurora-chat-root .md :where(ul, ol) {
  margin: 0.6em 0;
  padding-left: 1.3em;
}
.aurora-chat-root .md :where(li) {
  margin: 0.25em 0;
}
.aurora-chat-root .md :where(li)::marker {
  color: var(--th-accent);
}
.aurora-chat-root .md :where(strong) {
  font-weight: 600;
  color: var(--th-ink);
}
.aurora-chat-root .md :where(em) {
  font-style: italic;
}
.aurora-chat-root .md :where(a) {
  color: var(--th-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.aurora-chat-root .md :where(a):hover {
  color: var(--th-accent-soft);
}
.aurora-chat-root .md :where(h1, h2, h3, h4) {
  font-family: var(--font-playfair-display);
  color: var(--th-name);
  line-height: 1.25;
  margin: 0.8em 0 0.4em;
}
.aurora-chat-root .md :where(h1) {
  font-size: 1.4em;
}
.aurora-chat-root .md :where(h2) {
  font-size: 1.25em;
}
.aurora-chat-root .md :where(h3) {
  font-size: 1.12em;
}
.aurora-chat-root .md :where(h4) {
  font-size: 1em;
}
.aurora-chat-root .md :where(code) {
  font-family: var(--font-jetbrains-mono, ui-monospace, monospace);
  font-size: 0.86em;
  padding: 0.12em 0.4em;
  border-radius: 6px;
  background: color-mix(in srgb, var(--th-ink) 8%, transparent);
  border: 1px solid var(--th-border);
}
.aurora-chat-root .md :where(pre) {
  margin: 0.7em 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--th-ink) 7%, transparent);
  border: 1px solid var(--th-border);
  overflow-x: auto;
}
.aurora-chat-root .md :where(pre code) {
  padding: 0;
  border: none;
  background: none;
  font-size: 0.84em;
}
.aurora-chat-root .md :where(blockquote) {
  margin: 0.7em 0;
  padding: 0.2em 0 0.2em 1em;
  border-left: 3px solid color-mix(in srgb, var(--th-accent) 60%, transparent);
  color: var(--th-muted);
}
.aurora-chat-root .md :where(hr) {
  border: none;
  border-top: 1px solid var(--th-border);
  margin: 1em 0;
}
.aurora-chat-root .md :where(table) {
  border-collapse: collapse;
  margin: 0.7em 0;
  font-size: 0.92em;
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
.aurora-chat-root .md :where(th, td) {
  border: 1px solid var(--th-border);
  padding: 7px 10px;
  text-align: left;
  vertical-align: top;
}
.aurora-chat-root .md :where(th) {
  font-weight: 600;
  color: var(--th-ink);
  background: color-mix(in srgb, var(--th-accent) 10%, transparent);
}
/* streaming caret — thin pulsing bar tucked after the last rendered line */
.aurora-chat-root .md.streaming > :last-child::after {
  content: "";
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
  padding: 0 2px;
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
/* empty hero */
.aurora-chat-root .feed.empty {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0;
}
.aurora-chat-root .hero-av {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--th-avatar-ring);
  box-shadow:
    0 0 0 8px color-mix(in srgb, var(--th-accent) 8%, transparent),
    0 0 60px -10px color-mix(in srgb, var(--th-accent) 55%, transparent);
}
.aurora-chat-root .hero-h {
  font-family: var(--font-playfair-display);
  font-size: 38px;
  line-height: 1.08;
  font-weight: 600;
  color: var(--th-name);
  margin: 26px 0 0;
  letter-spacing: -0.01em;
}
.aurora-chat-root .hero-h em {
  font-style: italic;
  color: var(--th-accent-soft);
}
.aurora-chat-root .hero-sub {
  font-size: 15.5px;
  color: var(--th-muted);
  margin: 16px auto 0;
  max-width: 380px;
  line-height: 1.6;
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
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--th-ink);
  border: 1px solid color-mix(in srgb, var(--th-accent) 34%, transparent);
  background: color-mix(in srgb, var(--th-accent) 15%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
/* composer */
.aurora-chat-root .composer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 28px;
  padding: 8px 8px 8px 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--th-ink) 5%, transparent);
  border: 1px solid var(--th-border-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 50px -28px rgba(0, 0, 0, 0.9);
}
.aurora-chat-root .composer textarea {
  flex: 1;
  resize: none;
  max-height: 160px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--th-ink);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
}
.aurora-chat-root .composer textarea::placeholder {
  color: var(--th-muted);
}
.aurora-chat-root .composer textarea.dimmed {
  opacity: 0.5;
}
.aurora-chat-root .send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--th-accent);
  color: var(--th-bg);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 22px -4px
    color-mix(in srgb, var(--th-accent) 70%, transparent);
}
.aurora-chat-root .send:disabled {
  opacity: 0.4;
  cursor: default;
}
.aurora-chat-root .hint {
  text-align: center;
  font-size: 11px;
  color: var(--th-muted);
  margin: -14px 0 26px;
}
@media (prefers-reduced-motion: reduce) {
  .aurora-chat-root .md.streaming > :last-child::after,
  .aurora-chat-root .typing .dot {
    animation: none;
  }
}
@media (max-width: 880px) {
  /* Clear the fixed mobile ThemeSwitcher bar (55px) that overlays the top. */
  .aurora-chat-root .col {
    padding: 64px 20px 0;
  }
  .aurora-chat-root .top {
    padding: 16px 4px 18px;
  }
  .aurora-chat-root .hero-h {
    font-size: 30px;
  }
  .aurora-chat-root .msg {
    max-width: 86%;
  }
}
</style>
