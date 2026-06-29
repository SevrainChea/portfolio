<template>
  <div class="neon-chat-root">
    <ThemeSwitcher />
    <div class="amb" />

    <div class="win">
      <div class="top">
        <NuxtLink to="/" class="back" aria-label="Back to home">
          <Icon name="uil:arrow-left" size="16" />
        </NuxtLink>
        <span class="sign">Ask me anything</span>
        <span class="status"><i />Online</span>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0" class="feed empty">
        <div class="halo"><img :src="data.photo" :alt="data.name" /></div>
        <h2 class="e-h">Drop<br />a line</h2>
        <p class="e-sub">
          The line's open — ask about the work, the teams, the stacks. Sévrain's
          listening.
        </p>
      </div>

      <!-- Conversation -->
      <div v-else ref="messagesEl" class="feed">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['row', msg.role === 'user' ? 'u' : 'b']"
        >
          <span class="tag">{{ msg.role === "user" ? "You" : "Sévrain" }}</span>
          <div :class="['msg', msg.role === 'user' ? 'user' : 'bot']">
            <span v-if="msg.role === 'user'" class="txt">{{ msg.content }}</span>
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
            <span v-if="msg.model_used" class="model">{{ msg.model_used }}</span>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading && !messages.some((m) => m.streaming)" class="row b">
          <span class="tag">Sévrain</span>
          <div class="msg bot typing"><span class="tube" /></div>
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
          placeholder="Say hello…"
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

<!-- Not scoped: namespaced under .neon-chat-root. Glow uses color-mix on
     --th-glow/--th-acc; light mode dials the glow back (~0.55), mirroring
     NeonLayout.vue's html:not(.dark) treatment. -->
<style>
.neon-chat-root {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  overflow: hidden;
  background: var(--th-bg);
  color: var(--th-body);
  font-family: var(--font-space-grotesk), var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* ── ambient glow + wall grid (copied from NeonLayout.vue) ── */
.neon-chat-root .amb {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      620px 420px at 50% 4%,
      color-mix(in srgb, var(--th-glow) 12%, transparent),
      transparent 70%
    ),
    radial-gradient(
      520px 520px at 88% 38%,
      color-mix(in srgb, var(--th-acc) 8%, transparent),
      transparent 70%
    ),
    radial-gradient(
      560px 560px at 8% 72%,
      color-mix(in srgb, var(--th-glow) 7%, transparent),
      transparent 70%
    );
}
html:not(.dark) .neon-chat-root .amb {
  background:
    radial-gradient(
      620px 420px at 50% 4%,
      color-mix(in srgb, var(--th-glow) 7%, transparent),
      transparent 70%
    ),
    radial-gradient(
      520px 520px at 88% 38%,
      color-mix(in srgb, var(--th-acc) 5%, transparent),
      transparent 70%
    ),
    radial-gradient(
      560px 560px at 8% 72%,
      color-mix(in srgb, var(--th-glow) 4%, transparent),
      transparent 70%
    );
}
.neon-chat-root .amb::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    linear-gradient(var(--th-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask: radial-gradient(120% 90% at 50% 30%, #000, transparent 75%);
  mask: radial-gradient(120% 90% at 50% 30%, #000, transparent 75%);
}
.neon-chat-root .win {
  position: relative;
  z-index: 2;
  height: 100vh;
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 34px;
  box-sizing: border-box;
}
/* header — the neon sign */
.neon-chat-root .top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 30px 0 22px;
  position: relative;
}
.neon-chat-root .back {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  color: var(--th-acc);
  text-shadow: 0 0 8px var(--th-acc);
  transition: filter 0.2s;
}
.neon-chat-root .back:hover {
  filter: brightness(1.3);
}
.neon-chat-root .sign {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--th-name-col);
  text-shadow:
    0 0 6px var(--th-name-halo),
    0 0 18px var(--th-glow),
    0 0 40px var(--th-glow);
  animation: nc-sign-breathe 3.6s ease-in-out infinite;
}
@keyframes nc-sign-breathe {
  0%,
  100% {
    text-shadow:
      0 0 5px var(--th-name-halo),
      0 0 14px var(--th-glow),
      0 0 30px var(--th-glow);
  }
  50% {
    text-shadow:
      0 0 8px var(--th-name-halo),
      0 0 22px var(--th-glow),
      0 0 52px var(--th-glow);
  }
}
html:not(.dark) .neon-chat-root .sign {
  text-shadow:
    0 0 4px var(--th-name-halo),
    0 0 11px color-mix(in srgb, var(--th-glow) 55%, transparent),
    0 0 24px color-mix(in srgb, var(--th-glow) 55%, transparent);
  animation-name: nc-sign-breathe-soft;
}
@keyframes nc-sign-breathe-soft {
  0%,
  100% {
    text-shadow:
      0 0 3px var(--th-name-halo),
      0 0 9px color-mix(in srgb, var(--th-glow) 47%, transparent),
      0 0 18px color-mix(in srgb, var(--th-glow) 47%, transparent);
  }
  50% {
    text-shadow:
      0 0 5px var(--th-name-halo),
      0 0 14px color-mix(in srgb, var(--th-glow) 55%, transparent),
      0 0 30px color-mix(in srgb, var(--th-glow) 55%, transparent);
  }
}
.neon-chat-root .status {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--th-acc);
  text-shadow: 0 0 10px var(--th-acc);
}
.neon-chat-root .status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--th-acc);
  box-shadow: 0 0 12px var(--th-acc);
}
/* feed */
.neon-chat-root .feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 26px 4px;
  overflow-y: auto;
  position: relative;
}
/* Pin a short conversation to the bottom without `justify-content: flex-end`,
   which clips overflowing content off the top and makes it unscrollable. */
.neon-chat-root .feed:not(.empty) > :first-child {
  margin-top: auto;
}
.neon-chat-root .row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.neon-chat-root .row.u {
  align-items: flex-end;
}
.neon-chat-root .tag {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  padding: 0 4px;
}
.neon-chat-root .row.b .tag {
  color: var(--th-acc);
  text-shadow: 0 0 10px color-mix(in srgb, var(--th-acc) 60%, transparent);
}
.neon-chat-root .row.u .tag {
  color: var(--th-glow);
  text-shadow: 0 0 10px color-mix(in srgb, var(--th-glow) 60%, transparent);
}
.neon-chat-root .msg {
  max-width: 74%;
  padding: 13px 18px;
  border-radius: 16px;
  font-size: 14.5px;
  line-height: 1.62;
  background: var(--th-panel);
  white-space: pre-wrap;
}
.neon-chat-root .bot {
  border: 1.5px solid var(--th-acc);
  color: var(--th-ink);
  box-shadow:
    0 0 16px -3px color-mix(in srgb, var(--th-acc) 40%, transparent),
    inset 0 0 14px -5px color-mix(in srgb, var(--th-acc) 33%, transparent);
}
.neon-chat-root .user {
  border: 1.5px solid var(--th-glow);
  color: var(--th-ink);
  box-shadow:
    0 0 16px -3px color-mix(in srgb, var(--th-glow) 40%, transparent),
    inset 0 0 14px -5px color-mix(in srgb, var(--th-glow) 33%, transparent);
}
html:not(.dark) .neon-chat-root .bot {
  box-shadow:
    0 0 10px -4px color-mix(in srgb, var(--th-acc) 29%, transparent),
    inset 0 0 8px -5px color-mix(in srgb, var(--th-acc) 18%, transparent);
}
html:not(.dark) .neon-chat-root .user {
  box-shadow:
    0 0 10px -4px color-mix(in srgb, var(--th-glow) 29%, transparent),
    inset 0 0 8px -5px color-mix(in srgb, var(--th-glow) 18%, transparent);
}
/* rendered markdown (assistant bubbles) */
.neon-chat-root .md {
  white-space: normal;
}
.neon-chat-root .md > :first-child {
  margin-top: 0;
}
.neon-chat-root .md > :last-child {
  margin-bottom: 0;
}
.neon-chat-root .md :where(p) {
  margin: 0.6em 0;
}
.neon-chat-root .md :where(ul, ol) {
  margin: 0.6em 0;
  padding-left: 1.3em;
}
.neon-chat-root .md :where(li) {
  margin: 0.25em 0;
}
.neon-chat-root .md :where(li)::marker {
  color: var(--th-acc);
}
.neon-chat-root .md :where(strong) {
  font-weight: 700;
  color: var(--th-acc);
}
.neon-chat-root .md :where(em) {
  font-style: italic;
}
.neon-chat-root .md :where(a) {
  color: var(--th-glow);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.neon-chat-root .md :where(a):hover {
  filter: brightness(1.25);
}
.neon-chat-root .md :where(h1, h2, h3, h4) {
  color: var(--th-name-col);
  line-height: 1.25;
  margin: 0.8em 0 0.4em;
  letter-spacing: 0.02em;
}
.neon-chat-root .md :where(h1) {
  font-size: 1.35em;
}
.neon-chat-root .md :where(h2) {
  font-size: 1.2em;
}
.neon-chat-root .md :where(h3) {
  font-size: 1.1em;
}
.neon-chat-root .md :where(h4) {
  font-size: 1em;
}
.neon-chat-root .md :where(code) {
  font-family: var(--font-jetbrains-mono, ui-monospace, monospace);
  font-size: 0.86em;
  padding: 0.12em 0.4em;
  border-radius: 5px;
  background: color-mix(in srgb, var(--th-acc) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
}
.neon-chat-root .md :where(pre) {
  margin: 0.7em 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--th-acc) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  overflow-x: auto;
}
.neon-chat-root .md :where(pre code) {
  padding: 0;
  border: none;
  background: none;
  font-size: 0.84em;
}
.neon-chat-root .md :where(blockquote) {
  margin: 0.7em 0;
  padding: 0.2em 0 0.2em 1em;
  border-left: 3px solid var(--th-acc);
  color: var(--th-body);
}
.neon-chat-root .md :where(hr) {
  border: none;
  border-top: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  margin: 1em 0;
}
.neon-chat-root .md :where(table) {
  border-collapse: collapse;
  margin: 0.7em 0;
  font-size: 0.92em;
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
.neon-chat-root .md :where(th, td) {
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  padding: 7px 10px;
  text-align: left;
  vertical-align: top;
}
.neon-chat-root .md :where(th) {
  font-weight: 700;
  color: var(--th-acc);
  background: color-mix(in srgb, var(--th-acc) 12%, transparent);
}
/* streaming caret — glowing tube tick after the last rendered line */
.neon-chat-root .md.streaming > :last-child::after {
  content: "";
  display: inline-block;
  width: 3px;
  height: 1em;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: var(--th-acc);
  box-shadow: 0 0 8px var(--th-acc);
  animation: nc-blink 1s steps(1) infinite;
}
@keyframes nc-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.15;
  }
}
/* typing — pulsing tube */
.neon-chat-root .typing {
  display: flex;
  align-items: center;
}
.neon-chat-root .typing .tube {
  display: inline-block;
  width: 26px;
  height: 6px;
  border-radius: 999px;
  background: var(--th-acc);
  box-shadow: 0 0 12px var(--th-acc);
  animation: nc-pulse 1.1s ease-in-out infinite;
}
@keyframes nc-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}
/* sources + model */
.neon-chat-root .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 0 4px;
}
.neon-chat-root .chip {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--th-acc) 40%, transparent);
  background: color-mix(in srgb, var(--th-acc) 8%, transparent);
  color: var(--th-acc);
}
.neon-chat-root .model {
  font-size: 10.5px;
  color: var(--th-muted);
  letter-spacing: 0.06em;
}
/* empty */
.neon-chat-root .feed.empty {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0;
}
.neon-chat-root .halo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 2px solid var(--th-acc);
  box-shadow:
    0 0 28px color-mix(in srgb, var(--th-acc) 53%, transparent),
    inset 0 0 22px color-mix(in srgb, var(--th-acc) 33%, transparent);
  animation: nc-halo-breathe 3.6s ease-in-out infinite;
}
@keyframes nc-halo-breathe {
  0%,
  100% {
    box-shadow:
      0 0 20px color-mix(in srgb, var(--th-acc) 40%, transparent),
      inset 0 0 16px color-mix(in srgb, var(--th-acc) 27%, transparent);
  }
  50% {
    box-shadow:
      0 0 38px var(--th-acc),
      inset 0 0 26px color-mix(in srgb, var(--th-acc) 40%, transparent);
  }
}
html:not(.dark) .neon-chat-root .halo {
  box-shadow:
    0 0 14px color-mix(in srgb, var(--th-acc) 33%, transparent),
    inset 0 0 10px color-mix(in srgb, var(--th-acc) 18%, transparent);
  animation: none;
}
.neon-chat-root .halo img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}
.neon-chat-root .e-h {
  font-size: 54px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--th-name-col);
  margin: 30px 0 0;
  line-height: 0.95;
  text-shadow:
    0 0 8px var(--th-name-halo),
    0 0 24px var(--th-glow),
    0 0 56px var(--th-glow);
  animation: nc-eh-breathe 3.6s ease-in-out infinite;
}
@keyframes nc-eh-breathe {
  0%,
  100% {
    text-shadow:
      0 0 7px var(--th-name-halo),
      0 0 20px var(--th-glow),
      0 0 44px var(--th-glow);
  }
  50% {
    text-shadow:
      0 0 10px var(--th-name-halo),
      0 0 30px var(--th-glow),
      0 0 70px var(--th-glow);
  }
}
html:not(.dark) .neon-chat-root .e-h {
  text-shadow:
    0 0 5px var(--th-name-halo),
    0 0 13px color-mix(in srgb, var(--th-glow) 55%, transparent),
    0 0 30px color-mix(in srgb, var(--th-glow) 55%, transparent);
  animation: none;
}
.neon-chat-root .e-sub {
  font-size: 14px;
  color: var(--th-body);
  margin: 18px auto 0;
  max-width: 380px;
  line-height: 1.7;
}
/* CTA */
.neon-chat-root .scroll-cta {
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--th-ink);
  background: var(--th-panel);
  border: 1.5px solid var(--th-glow);
  box-shadow: 0 0 18px -4px color-mix(in srgb, var(--th-glow) 55%, transparent);
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
.neon-chat-root .composer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 8px 0 30px;
  padding: 11px 11px 11px 20px;
  border-radius: 14px;
  background: var(--th-panel);
  border: 1.5px solid var(--th-glow);
  box-shadow:
    0 0 20px -4px color-mix(in srgb, var(--th-glow) 33%, transparent),
    inset 0 0 16px -6px color-mix(in srgb, var(--th-glow) 27%, transparent);
}
html:not(.dark) .neon-chat-root .composer {
  box-shadow:
    0 0 12px -4px color-mix(in srgb, var(--th-glow) 22%, transparent),
    inset 0 0 10px -6px color-mix(in srgb, var(--th-glow) 15%, transparent);
}
.neon-chat-root .composer textarea {
  flex: 1;
  resize: none;
  max-height: 160px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--th-ink);
  font-family: inherit;
  font-size: 14.5px;
  line-height: 1.5;
}
.neon-chat-root .composer textarea::placeholder {
  color: var(--th-muted);
}
.neon-chat-root .composer textarea.dimmed {
  opacity: 0.5;
}
.neon-chat-root .send {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: var(--th-bg);
  background: var(--th-acc);
  border: none;
  cursor: pointer;
  box-shadow: 0 0 22px -2px var(--th-acc);
}
.neon-chat-root .send:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  .neon-chat-root .sign,
  .neon-chat-root .e-h,
  .neon-chat-root .halo,
  .neon-chat-root .md.streaming > :last-child::after,
  .neon-chat-root .typing .tube {
    animation: none;
  }
}
@media (max-width: 760px) {
  /* Clear the fixed mobile ThemeSwitcher bar that overlays the top. */
  .neon-chat-root .win {
    padding: 60px 22px 0;
  }
  .neon-chat-root .top {
    padding: 18px 0 18px;
  }
  .neon-chat-root .back {
    position: static;
    transform: none;
  }
  .neon-chat-root .sign {
    font-size: 20px;
  }
  .neon-chat-root .e-h {
    font-size: 40px;
  }
  .neon-chat-root .msg {
    max-width: 84%;
  }
}
</style>
