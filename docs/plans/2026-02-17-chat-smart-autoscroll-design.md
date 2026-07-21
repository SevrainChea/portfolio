# Chat Smart Auto-Scroll Design

**Date:** 2026-02-17
**Component:** `pages/chat.vue`
**Feature:** Smart auto-scroll with conditional "scroll to bottom" CTA

## Problem Statement

Current implementation auto-scrolls to the bottom on every streaming chunk, preventing users from scrolling up to read responses while they're still being generated. This interrupts the reading experience.

## Solution Overview

Implement scroll-aware auto-scroll that:

1. **Stops auto-scrolling** when user manually scrolls up
2. **Resumes auto-scrolling** when user scrolls back to bottom
3. **Shows a CTA button** when streaming ends and user isn't at bottom
4. **Auto-dismisses CTA** when user scrolls to bottom or clicks the button

## Component State Changes

### New Reactive Variables

```typescript
userAtBottom: boolean; // true if scroll position within 50px of bottom
showScrollCTA: boolean; // true if streaming ended AND userAtBottom is false
shouldAutoScroll: boolean; // determines if scrollToBottom() should execute
```

**Initial State:**

- `userAtBottom: true` (start at bottom)
- `showScrollCTA: false` (no CTA on load)
- `shouldAutoScroll: true` (auto-scroll by default during streaming)

## Scroll Event Handler

**Trigger:** `messagesEl` scroll event

**Logic:**

```
1. Calculate: isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 50)
2. Update userAtBottom = isAtBottom
3. If userAtBottom became true AND showScrollCTA is true:
   - Set showScrollCTA = false (auto-dismiss)
```

**Threshold:** 50px from bottom (standard for chat apps, forgiving of scroll imprecision)

## Streaming Behavior

### During Message Streaming

- On each SSE chunk: only call `scrollToBottom()` if `userAtBottom === true`
- This allows user to scroll up without being forced back down

### When Streaming Ends

- Event type `done` arrives
- Check: if `userAtBottom === false`, set `showScrollCTA = true`
- This shows the CTA only when needed

### CTA Button Click

- Handler calls `scrollToBottom()`
- Sets `showScrollCTA = false` (dismiss button)

## UI Component

### Floating Button

- **Position:** Absolute, bottom-right of messages container (z-index above messages)
- **Visibility:** Only shown when `showScrollCTA === true`
- **Appearance:** Small pill button with down arrow icon + "Scroll to latest" text
- **Animation:** Fade in/out transition
- **Interaction:** Click scrolls to bottom

### Implementation Details

```vue
<div v-if="showScrollCTA" class="absolute right-4 bottom-4">
  <button @click="scrollToBottomFromCTA" ...>
    <Icon name="arrow-down" /> Scroll to latest
  </button>
</div>
```

## Lifecycle & Cleanup

### On Mount

- Add scroll event listener to `messagesEl`

### On Unmount

- Remove scroll event listener to prevent memory leaks

## Edge Cases

1. **Very long responses:** User can read at their own pace; CTA appears when stream ends
2. **Fast scrolling:** 50px threshold prevents false positives from momentum scrolling
3. **Multiple messages:** Each message triggers its own auto-scroll during streaming; CTA only shows when stream truly ends
4. **User scrolls to bottom during streaming:** Auto-scroll resumes immediately

## Testing Checklist

- [ ] Auto-scroll works during streaming when user at bottom
- [ ] Auto-scroll stops when user scrolls up during streaming
- [ ] CTA appears when stream ends and user not at bottom
- [ ] CTA disappears when user clicks it
- [ ] CTA disappears when user manually scrolls to bottom
- [ ] Auto-scroll resumes if user scrolls back to bottom mid-stream
- [ ] Scroll listener is properly cleaned up on unmount
- [ ] No scroll jank or performance issues during rapid chunk arrival

## Performance Considerations

- Scroll event fires frequently; consider debouncing if needed, but likely unnecessary for DOM reads
- `scrollToBottom()` is already optimized with `nextTick()`
- No additional network calls or heavy computations

## Future Enhancements

- Add badge count ("3 new messages") to CTA
- Configurable threshold distance instead of hardcoded 50px
- Smooth scroll animation option
