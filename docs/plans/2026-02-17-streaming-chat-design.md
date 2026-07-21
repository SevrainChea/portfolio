# Streaming Chat Design

**Date:** 2026-02-17
**Status:** Approved

## Problem

Current chat uses a single POST that waits for the full LLM response before returning anything. This causes noticeable latency and no visual feedback. The payload metadata (sources, model name) is also never displayed in the UI.

## Solution

Add a streaming SSE endpoint on the backend and update the frontend to consume it token-by-token, displaying metadata chips once streaming completes.

---

## Backend

### New endpoint

`POST /api/chat/stream` — keeps existing `/api/chat` untouched.

**Returns:** `StreamingResponse` with `Content-Type: text/event-stream`

**SSE event format:**

```
data: {"type":"chunk","content":"<token>"}

data: {"type":"done","conversation_id":"<uuid>","sources":["about","skills"],"model_used":"groq/llama-3.1-8b-instant"}
```

**Flow:**

1. Receive `ChatRequest`
2. Retrieve RAG context (k=3, same as today)
3. Generate `conversation_id` upfront
4. Stream LLM tokens as `chunk` events
5. Emit final `done` event with all metadata

### LLM Service changes

Add `generate_stream(prompt, context) -> AsyncGenerator[str, None]` abstract method to `LLMProvider`.

Provider implementations:

- **Groq**: `client.chat.completions.create(..., stream=True)` → yield `chunk.choices[0].delta.content`
- **Gemini**: `model.generate_content(..., stream=True)` → yield `chunk.text`
- **Ollama**: `ollama.chat(..., stream=True)` → yield `chunk['message']['content']`

`LLMService` gets a corresponding `generate_response_stream()` method.

---

## Frontend

### Message model

```ts
interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  model_used?: string;
}
```

### Streaming fetch

Replace `$fetch` with native `fetch()` + `response.body.getReader()`. Parse SSE:

- Split chunks by `\n`
- Strip `data:` prefix, parse JSON
- `chunk` → append `content` to current message in-place
- `done` → attach `sources`, `model_used`, `conversation_id`

### UI changes

- Message text grows token-by-token in the same bubble
- Blinking cursor `▋` appended while streaming, removed on `done`
- Below each assistant bubble after streaming:
  - Source chips: small muted tags per source name
  - Model label: tiny dim text showing model identifier
