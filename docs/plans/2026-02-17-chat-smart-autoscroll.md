# Chat Smart Auto-Scroll Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement scroll-aware auto-scrolling that stops when user scrolls up and shows a "scroll to bottom" CTA when streaming ends.

**Architecture:** Track scroll position to detect if user is near bottom (within 50px). Only auto-scroll during streaming if user is at bottom. When stream completes and user isn't at bottom, show a floating CTA button. Auto-dismiss CTA when user clicks it or manually scrolls to bottom.

**Tech Stack:** Vue 3 Composition API, Nuxt 3, TailwindCSS v4

**Reference Design:** `docs/plans/2026-02-17-chat-smart-autoscroll-design.md`

---

### Task 1: Add Scroll Position State Variables

**Files:**

- Modify: `pages/chat.vue:148-153` (add new state)

**Step 1: Add reactive state for scroll tracking**

After line 153 (`inputEl` ref), add:

```typescript
const userAtBottom = ref(true);
const showScrollCTA = ref(false);
```

These track:

- `userAtBottom`: true if scroll is within 50px of bottom
- `showScrollCTA`: true if stream ended and user scrolled up

**Verification:**

- Component loads without errors in dev server
- No console errors

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): add scroll position state variables"
```

---

### Task 2: Add Scroll Event Listener with Handler

**Files:**

- Modify: `pages/chat.vue:132-252` (add scroll handler and lifecycle hooks)

**Step 1: Add scroll event handler function**

After the `scrollToBottom()` function (line 168), add:

```typescript
const handleScroll = () => {
  if (!messagesEl.value) return;

  const el = messagesEl.value;
  const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

  // Update state
  userAtBottom.value = isAtBottom;

  // Auto-dismiss CTA if scrolled to bottom
  if (isAtBottom && showScrollCTA.value) {
    showScrollCTA.value = false;
  }
};
```

**Step 2: Add scroll listener on mount and cleanup on unmount**

Find or add lifecycle imports at the top of `<script setup>` (around line 132). Add `onMounted` and `onUnmounted` if not already imported:

```typescript
import { ref, nextTick, onMounted, onUnmounted } from "vue";
```

Then add lifecycle hooks at the end of the script setup block (before closing `</script>`):

```typescript
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
```

**Verification:**

- Dev server loads without errors
- No console errors
- Try scrolling in the chat—should not error

**Step 3: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): add scroll event listener and handler"
```

---

### Task 3: Modify scrollToBottom() to Respect User Position

**Files:**

- Modify: `pages/chat.vue:162-168` (update scrollToBottom function)

**Step 1: Update scrollToBottom to only scroll if user at bottom**

Replace the `scrollToBottom` function (lines 162-168) with:

```typescript
const scrollToBottom = () => {
  // Only auto-scroll if user is already at the bottom
  if (!userAtBottom.value) return;

  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
};
```

**Explanation:**

- Now checks `userAtBottom` before scrolling
- This prevents forcing scroll when user has scrolled up
- On-demand CTA button click will still work (see Task 6)

**Verification:**

- Dev server loads without errors
- Load a conversation with existing messages (or test manually)
- Scroll should work when at bottom
- Scrolling up should not force scroll back down

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): make scrollToBottom respect user scroll position"
```

---

### Task 4: Show CTA When Streaming Ends and User Scrolled Up

**Files:**

- Modify: `pages/chat.vue:227-241` (done event handler)

**Step 1: Add CTA display logic to done event**

Find the section handling `event.type === "done"` (around line 231). Update it to:

```typescript
} else if (event.type === "done") {
  messages.value[msgIndex].streaming = false;
  messages.value[msgIndex].sources = event.sources;
  messages.value[msgIndex].model_used = event.model_used;
  conversationId.value = event.conversation_id ?? null;

  // Show CTA if user scrolled up during streaming
  if (!userAtBottom.value) {
    showScrollCTA.value = true;
  }

  scrollToBottom();
```

**Explanation:**

- When stream completes, check if user is at bottom
- If not, show the CTA button (will be implemented in Task 6)
- Still attempt `scrollToBottom()` (which will no-op if user scrolled up, per Task 3)

**Verification:**

- Dev server loads without errors
- Test streaming: send a message, scroll up during streaming
- When stream finishes, message component should update (scroll state should be tracked)
- We'll verify CTA visibility in Task 6

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): set showScrollCTA flag when streaming ends and user not at bottom"
```

---

### Task 5: Add CTA Button Handler Function

**Files:**

- Modify: `pages/chat.vue:252` (add button click handler)

**Step 1: Add scrollToBottomFromCTA function**

After the `send()` function (before closing `</script>`), add:

```typescript
const scrollToBottomFromCTA = () => {
  showScrollCTA.value = false;
  userAtBottom.value = true;

  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
};
```

**Explanation:**

- Called when user clicks the CTA button
- Manually sets flags to indicate user is at bottom
- Performs immediate scroll (bypassing the conditional check)
- Dismisses CTA by setting `showScrollCTA` to false

**Verification:**

- No errors on reload
- Will test fully in Task 6 when UI is added

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): add scrollToBottomFromCTA handler"
```

---

### Task 6: Add CTA Button UI

**Files:**

- Modify: `pages/chat.vue:16-129` (add CTA button in template)

**Step 1: Add CTA button to template**

Find the `<!-- Messages -->` section (line 21). Right after the closing `</div>` that wraps the messages (around line 96), add:

```vue
<!-- Scroll to Bottom CTA -->
<Transition
  enter-active-class="transition-opacity duration-200"
  enter-from-class="opacity-0"
  enter-to-class="opacity-100"
  leave-active-class="transition-opacity duration-200"
  leave-from-class="opacity-100"
  leave-to-class="opacity-0"
>
        <button
          v-if="showScrollCTA"
          @click="scrollToBottomFromCTA"
          class="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-2 text-xs font-medium text-fg-light hover:bg-primary/30 transition-colors duration-200"
          aria-label="Scroll to latest messages"
        >
          <Icon name="uil:arrow-down" size="16" />
          Scroll to latest
        </button>
      </Transition>
```

**Important:** This button must be a child of the `<GlassCard>` to position absolutely within it. Place it as a sibling to the messages container `</div>` but inside the GlassCard, after line 96.

**Explanation:**

- Transition for smooth fade in/out
- Absolute positioning bottom-right
- Uses primary color theme for consistency
- Icon + text for clarity
- Accessible label for screen readers

**Verification:**

- Dev server loads without errors
- Send a message and scroll up during streaming
- When stream ends, button should appear in bottom-right
- Button should have hover effect

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): add scroll-to-bottom CTA button UI"
```

---

### Task 7: Manual Testing & Verification

**Files:**

- Test: `pages/chat.vue` (manual integration test)

**Verification Checklist:**

1. **Auto-scroll works when user at bottom**

   - [ ] Load chat page
   - [ ] Send a message
   - [ ] Observe: page auto-scrolls to show response as it streams
   - [ ] Expected: smooth auto-scroll as chunks arrive

2. **Auto-scroll stops when user scrolls up**

   - [ ] Send a message
   - [ ] During streaming, manually scroll up
   - [ ] Expected: page stops auto-scrolling, stays at your scroll position
   - [ ] Response text is readable without being forced down

3. **CTA appears when appropriate**

   - [ ] Scroll up during streaming
   - [ ] Wait for stream to complete
   - [ ] Expected: "Scroll to latest" button appears in bottom-right

4. **CTA dismisses on click**

   - [ ] Button visible from previous step
   - [ ] Click the button
   - [ ] Expected: page smoothly scrolls to bottom, button disappears

5. **CTA dismisses on manual scroll to bottom**

   - [ ] Scroll up during streaming
   - [ ] Wait for stream to complete (CTA visible)
   - [ ] Manually scroll to bottom
   - [ ] Expected: button disappears automatically

6. **Auto-scroll resumes after user scrolls back**

   - [ ] Send another message
   - [ ] Auto-scroll works normally (you're at bottom)
   - [ ] Scroll up during this new stream
   - [ ] Scroll back to bottom manually
   - [ ] Expected: auto-scroll resumes for the remainder of the stream

7. **No console errors**
   - [ ] Open dev tools console (F12)
   - [ ] Repeat tests above
   - [ ] Expected: no errors or warnings

**If any tests fail:**

- Check browser console for errors
- Verify scroll event listener is firing (add `console.log` in `handleScroll` temporarily)
- Verify scroll position calculations are correct

**Step 1: Run Manual Tests**

Follow checklist above in dev server running at `localhost:3000`

**Step 2: Commit**

```bash
git add pages/chat.vue
git commit -m "feat(chat): implement smart auto-scroll with scroll-to-bottom CTA"
```

---

### Task 8: Final Code Review

**Files:**

- Review: `pages/chat.vue:1-254`

**Step 1: Verify Code Quality**

- [ ] All scroll handlers properly reference `messagesEl.value`
- [ ] Event listeners added in `onMounted` and removed in `onUnmounted`
- [ ] State variables (`userAtBottom`, `showScrollCTA`) initialized correctly
- [ ] CTA button styling matches design tokens and existing component style
- [ ] No duplicate code or unused variables
- [ ] Comments are clear and helpful

**Step 2: Verify No Regressions**

- [ ] Original auto-scroll still works when user at bottom
- [ ] Existing message streaming still works
- [ ] Chat input still focuses after send
- [ ] Back button navigation still works
- [ ] Component mounts/unmounts without errors

**Step 3: Commit**

```bash
git add pages/chat.vue
git commit -m "chore(chat): final review of smart auto-scroll implementation"
```

---

## Summary

This plan implements scroll-aware auto-scrolling through 8 focused tasks:

1. Add state tracking for scroll position
2. Add scroll event listener
3. Make scrollToBottom conditional
4. Show CTA when stream ends and user scrolled up
5. Add button click handler
6. Add CTA UI button
7. Manual testing
8. Final code review

**Total estimated time:** 20-30 minutes
**Key principle:** Small, incremental changes with commits after each logical step

---
