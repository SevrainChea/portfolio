<template>
  <div class="blueprint-chat-root">
    <ThemeSwitcher />
    <div class="frame" />

    <div class="sheet">
      <div class="topbar">
        <NuxtLink to="/" class="back">[ ← BACK ]</NuxtLink>
      </div>

      <div class="tb">
        <div class="cell"><span class="k">Doc</span><span class="v">Q&amp;A — Transcript</span></div>
        <div class="cell"><span class="k">Subject</span><span class="v">S. Chea</span></div>
        <div class="cell"><span class="k">Rev</span><span class="v">01</span></div>
        <div class="cell"><span class="k">Status</span><span class="v live"><i />Live</span></div>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0" class="feed empty">
        <div class="await">
          <div class="lbl">// Session ready</div>
          <div class="big">AWAITING QUERY<span class="cur" /></div>
          <div class="note">
            Enter an inquiry below to begin the transcript. Ask about roles,
            scale, architecture or stacks.
          </div>
        </div>
      </div>

      <!-- Conversation -->
      <div v-else ref="messagesEl" class="feed">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['entry', msg.role === 'user' ? 'q' : 'a']"
          :data-fig="figLabel(i, msg.role)"
        >
          <div class="txt">
            <template v-if="msg.role === 'user'">{{ msg.content }}</template>
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
            class="srcs"
          >
            <template v-if="msg.sources?.length"
              >// sources: {{ msg.sources.join(", ") }}</template
            ><template v-if="msg.model_used">
              // model: {{ msg.model_used }}</template
            >
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading && !messages.some((m) => m.streaming)" class="awaiting">
          AWAITING RESPONSE<span class="cur sm" />
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
          ↓ latest
        </button>
      </Transition>

      <!-- Composer — command line -->
      <form class="composer" @submit.prevent="send">
        <span class="pr">&gt;</span>
        <textarea
          ref="inputEl"
          v-model="input"
          rows="1"
          :disabled="loading"
          :class="{ dimmed: loading }"
          placeholder="type query"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        />
        <button
          type="submit"
          class="send"
          :disabled="!input.trim() || loading"
          aria-label="Send message"
        >
          [ SEND ]
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from "~/composables/useChat";

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

// Number inquiries/responses sequentially, independent of interleaving.
const figLabel = (i: number, role: Message["role"]) => {
  const n = messages.value.slice(0, i + 1).filter((m) => m.role === role).length;
  const pad = String(n).padStart(2, "0");
  return role === "user" ? `Q-${pad} · INQUIRY` : `A-${pad} · RESPONSE`;
};
</script>

<!-- Not scoped: namespaced under .blueprint-chat-root. CY-alpha tints use
     color-mix on --th-accent; frame/grid scaffold copied from BlueprintLayout.vue.
     Light variants resolve purely from --th-* tokens. -->
<style>
.blueprint-chat-root {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  overflow: clip;
  background: var(--th-bg);
  color: var(--th-ink);
  font-family: var(--font-inter);
  -webkit-font-smoothing: antialiased;
  background-image:
    linear-gradient(var(--th-line1) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line1) 1px, transparent 1px),
    linear-gradient(var(--th-line2) 1px, transparent 1px),
    linear-gradient(90deg, var(--th-line2) 1px, transparent 1px);
  background-size:
    120px 120px,
    120px 120px,
    24px 24px,
    24px 24px;
}
.blueprint-chat-root .frame {
  position: absolute;
  inset: 24px;
  border: 1px solid var(--th-line1);
  z-index: 1;
  pointer-events: none;
}
.blueprint-chat-root .frame::before {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid var(--th-line2);
}
.blueprint-chat-root .sheet {
  position: relative;
  z-index: 2;
  height: 100vh;
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 46px;
  box-sizing: border-box;
}
.blueprint-chat-root .sheet::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--th-panel);
  z-index: -1;
  box-shadow: 0 0 0 1px var(--th-line1);
}
/* topbar — back link, kept clear of the top-right ThemeSwitcher */
.blueprint-chat-root .topbar {
  padding: 24px 0 0;
}
.blueprint-chat-root .back {
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--th-accent);
  text-decoration: none;
  transition: filter 0.2s;
}
.blueprint-chat-root .back:hover {
  filter: brightness(1.25);
}
/* title block */
.blueprint-chat-root .tb {
  display: flex;
  border: 1px solid color-mix(in srgb, var(--th-accent) 55%, transparent);
  background: color-mix(in srgb, var(--th-accent) 5%, transparent);
  margin-top: 14px;
}
.blueprint-chat-root .tb .cell {
  padding: 9px 14px;
  border-right: 1px solid color-mix(in srgb, var(--th-accent) 33%, transparent);
}
.blueprint-chat-root .tb .cell:last-child {
  border-right: none;
  margin-left: auto;
}
.blueprint-chat-root .tb .k {
  font-family: var(--font-jetbrains-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--th-muted);
  display: block;
  margin-bottom: 2px;
  white-space: nowrap;
}
.blueprint-chat-root .tb .v {
  font-family: var(--font-jetbrains-mono);
  font-size: 13px;
  color: var(--th-head);
  font-weight: 500;
  white-space: nowrap;
}
.blueprint-chat-root .tb .v.live {
  color: var(--th-accent);
  display: flex;
  align-items: center;
  gap: 7px;
}
.blueprint-chat-root .tb .v.live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--th-accent);
  box-shadow: 0 0 10px var(--th-accent);
}
/* feed */
.blueprint-chat-root .feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  padding: 22px 0;
  position: relative;
}
/* Pin a short conversation to the bottom without `justify-content: flex-end`,
   which clips overflowing content off the top and makes it unscrollable. */
.blueprint-chat-root .feed:not(.empty) > :first-child {
  margin-top: auto;
}
.blueprint-chat-root .entry {
  position: relative;
  border: 1px solid var(--th-line1);
  padding: 15px 18px 16px;
  background: color-mix(in srgb, var(--th-accent) 7%, transparent);
}
.blueprint-chat-root .entry.q {
  border-left: 2px solid var(--th-am);
}
.blueprint-chat-root .entry.a {
  border-left: 2px solid var(--th-accent);
}
.blueprint-chat-root .entry::before {
  content: attr(data-fig);
  position: absolute;
  top: -8px;
  left: 14px;
  background: var(--th-notch);
  padding: 0 8px;
  font-family: var(--font-jetbrains-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.blueprint-chat-root .entry.q::before {
  color: var(--th-am);
}
.blueprint-chat-root .entry.a::before {
  color: var(--th-accent);
}
.blueprint-chat-root .entry .txt {
  font-size: 14.5px;
  line-height: 1.66;
  color: var(--th-ink);
  max-width: 64ch;
  white-space: pre-wrap;
}
.blueprint-chat-root .entry.q .txt {
  font-family: var(--font-jetbrains-mono);
  font-size: 13.5px;
  color: var(--th-head);
}
/* rendered markdown (assistant replies) */
.blueprint-chat-root .md {
  white-space: normal;
}
.blueprint-chat-root .md > :first-child {
  margin-top: 0;
}
.blueprint-chat-root .md > :last-child {
  margin-bottom: 0;
}
.blueprint-chat-root .md :where(p) {
  margin: 0.6em 0;
}
.blueprint-chat-root .md :where(ul, ol) {
  margin: 0.6em 0;
  padding-left: 1.3em;
}
.blueprint-chat-root .md :where(li) {
  margin: 0.25em 0;
}
.blueprint-chat-root .md :where(li)::marker {
  color: var(--th-accent);
}
.blueprint-chat-root .md :where(strong) {
  font-weight: 700;
  color: var(--th-head);
}
.blueprint-chat-root .md :where(em) {
  font-style: italic;
}
.blueprint-chat-root .md :where(a) {
  color: var(--th-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.blueprint-chat-root .md :where(a):hover {
  filter: brightness(1.25);
}
.blueprint-chat-root .md :where(h1, h2, h3, h4) {
  font-family: var(--font-jetbrains-mono);
  color: var(--th-head);
  line-height: 1.3;
  letter-spacing: 0.02em;
  margin: 0.8em 0 0.4em;
}
.blueprint-chat-root .md :where(h1) {
  font-size: 1.3em;
}
.blueprint-chat-root .md :where(h2) {
  font-size: 1.18em;
}
.blueprint-chat-root .md :where(h3) {
  font-size: 1.08em;
}
.blueprint-chat-root .md :where(h4) {
  font-size: 1em;
}
.blueprint-chat-root .md :where(code) {
  font-family: var(--font-jetbrains-mono);
  font-size: 0.86em;
  padding: 0.12em 0.4em;
  background: color-mix(in srgb, var(--th-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-accent) 40%, transparent);
}
.blueprint-chat-root .md :where(pre) {
  margin: 0.7em 0;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--th-accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--th-accent) 40%, transparent);
  overflow-x: auto;
}
.blueprint-chat-root .md :where(pre code) {
  padding: 0;
  border: none;
  background: none;
  font-size: 0.84em;
}
.blueprint-chat-root .md :where(blockquote) {
  margin: 0.7em 0;
  padding: 0.2em 0 0.2em 1em;
  border-left: 2px solid var(--th-accent);
  color: var(--th-muted);
}
.blueprint-chat-root .md :where(hr) {
  border: none;
  border-top: 1px solid var(--th-line1);
  margin: 1em 0;
}
.blueprint-chat-root .md :where(table) {
  border-collapse: collapse;
  margin: 0.7em 0;
  font-size: 0.92em;
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
.blueprint-chat-root .md :where(th, td) {
  border: 1px solid color-mix(in srgb, var(--th-accent) 35%, transparent);
  padding: 7px 10px;
  text-align: left;
  vertical-align: top;
}
.blueprint-chat-root .md :where(th) {
  font-family: var(--font-jetbrains-mono);
  font-weight: 600;
  color: var(--th-head);
  background: color-mix(in srgb, var(--th-accent) 10%, transparent);
}
/* streaming caret — block cursor after the last rendered line */
.blueprint-chat-root .md.streaming > :last-child::after {
  content: "";
  display: inline-block;
  width: 8px;
  height: 16px;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: var(--th-accent);
  animation: bc-blink 1.1s steps(1) infinite;
}
.blueprint-chat-root .srcs {
  margin-top: 10px;
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--th-muted);
}
/* block cursor */
.blueprint-chat-root .cur {
  display: inline-block;
  width: 18px;
  height: 38px;
  background: var(--th-accent);
  box-shadow: 0 0 14px var(--th-accent);
  animation: bc-blink 1.1s steps(1) infinite;
}
.blueprint-chat-root .cur.sm {
  width: 8px;
  height: 16px;
  margin-left: 3px;
  vertical-align: text-bottom;
  box-shadow: none;
}
@keyframes bc-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
/* typing line */
.blueprint-chat-root .awaiting {
  font-family: var(--font-jetbrains-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--th-muted);
  display: flex;
  align-items: center;
}
/* empty — ready sheet */
.blueprint-chat-root .feed.empty {
  justify-content: center;
  align-items: flex-start;
}
.blueprint-chat-root .await {
  font-family: var(--font-jetbrains-mono);
}
.blueprint-chat-root .await .lbl {
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--th-muted);
  margin-bottom: 14px;
}
.blueprint-chat-root .await .big {
  font-size: 40px;
  letter-spacing: 0.04em;
  color: var(--th-head);
  display: flex;
  align-items: center;
}
.blueprint-chat-root .await .big .cur {
  margin-left: 10px;
}
.blueprint-chat-root .await .note {
  font-size: 12px;
  color: var(--th-muted);
  margin-top: 18px;
  letter-spacing: 0.04em;
  max-width: 46ch;
  line-height: 1.7;
}
/* CTA */
.blueprint-chat-root .scroll-cta {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  padding: 8px 14px;
  color: var(--th-accent);
  border: 1px solid var(--th-accent);
  background: color-mix(in srgb, var(--th-accent) 12%, transparent);
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
/* composer — command line */
.blueprint-chat-root .composer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 13px 14px;
  border: 1px solid color-mix(in srgb, var(--th-accent) 66%, transparent);
  background: color-mix(in srgb, var(--th-accent) 12%, transparent);
  font-family: var(--font-jetbrains-mono);
}
.blueprint-chat-root .composer .pr {
  color: var(--th-accent);
  font-size: 15px;
}
.blueprint-chat-root .composer textarea {
  flex: 1;
  resize: none;
  max-height: 140px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--th-ink);
  font-family: var(--font-jetbrains-mono);
  font-size: 13.5px;
  line-height: 1.5;
}
.blueprint-chat-root .composer textarea::placeholder {
  color: var(--th-muted);
}
.blueprint-chat-root .composer textarea.dimmed {
  opacity: 0.5;
}
.blueprint-chat-root .send {
  border: 1px solid var(--th-accent);
  color: var(--th-accent);
  background: color-mix(in srgb, var(--th-accent) 10%, transparent);
  font-family: var(--font-jetbrains-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  padding: 9px 14px;
  cursor: pointer;
  white-space: nowrap;
}
.blueprint-chat-root .send:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (prefers-reduced-motion: reduce) {
  .blueprint-chat-root .cur,
  .blueprint-chat-root .md.streaming > :last-child::after {
    animation: none;
  }
}
@media (max-width: 760px) {
  /* Clear the fixed mobile ThemeSwitcher bar that overlays the top. */
  .blueprint-chat-root .sheet {
    padding: 56px 24px 0;
  }
  .blueprint-chat-root .tb {
    flex-wrap: wrap;
  }
  .blueprint-chat-root .tb .cell:last-child {
    margin-left: 0;
  }
  .blueprint-chat-root .await .big {
    font-size: 30px;
  }
}
</style>
