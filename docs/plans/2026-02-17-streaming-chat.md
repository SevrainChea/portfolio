# Streaming Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-shot POST chat with SSE streaming so tokens appear progressively, and display sources/model metadata below each assistant bubble.

**Architecture:** The backend adds a new `POST /api/chat/stream` endpoint returning `StreamingResponse` (text/event-stream). Each LLM provider gets a `generate_stream()` method. The frontend replaces `$fetch` with native `fetch()` + `ReadableStream` reader, appending tokens to the current message in-place and rendering metadata chips on completion.

**Tech Stack:** FastAPI `StreamingResponse`, Python async generators, Groq/Gemini/Ollama streaming APIs, Vue 3 Composition API, native browser `fetch` + `ReadableStream`.

**No test framework** is configured on either side — no test files needed. Verify each task manually via the running dev servers.

---

## Context: Running Servers

- Frontend dev server is already running at `localhost:3000` (hot-reload — do NOT start pnpm dev)
- Backend: `cd chatbot-backend && source venv/bin/activate && uvicorn app.main:app --reload` (start if not running)
- Design doc: `docs/plans/2026-02-17-streaming-chat-design.md`

---

### Task 1: Add `generate_stream` to LLM providers

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py`

**Step 1: Read the current file**

Read `chatbot-backend/app/services/llm_service.py` in full before making any edits.

**Step 2: Update imports and abstract base class**

Add `AsyncGenerator` to the typing import and add an abstract `generate_stream` method to `LLMProvider`:

```python
from typing import List, Dict, AsyncGenerator

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, context: List[str]) -> str:
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        pass
```

**Step 3: Add `generate_stream` to `OllamaProvider`**

Add this method inside `OllamaProvider` (after the existing `generate` method):

```python
async def generate_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
    context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])
    full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

    try:
        stream = ollama.chat(
            model=self.model,
            messages=[{'role': 'user', 'content': full_prompt}],
            stream=True
        )
        for chunk in stream:
            content = chunk['message']['content']
            if content:
                yield content
    except Exception as e:
        logger.exception("Ollama streaming failed")
        raise Exception(f"Ollama streaming failed: {str(e)}")
```

**Step 4: Add `generate_stream` to `GeminiProvider`**

Add this method inside `GeminiProvider` (after the existing `generate` method):

```python
async def generate_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
    context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])
    full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

    try:
        response = self.model.generate_content(full_prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.exception("Gemini streaming failed")
        raise Exception(f"Gemini streaming failed: {str(e)}")
```

**Step 5: Add `generate_stream` to `GroqProvider`**

Add this method inside `GroqProvider` (after the existing `generate` method):

```python
async def generate_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
    context_text = "\n\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(context)])
    full_prompt = f"""You are a helpful AI assistant representing a person's portfolio.
Use the following context to answer questions accurately.

{context_text}

Question: {prompt}

Answer based on the context provided. If you cannot find relevant information in the context,
say so politely and provide a general response."""

    try:
        stream = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": full_prompt}],
            stream=True
        )
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        logger.exception("Groq streaming failed")
        raise Exception(f"Groq streaming failed: {str(e)}")
```

**Step 6: Add `generate_response_stream` to `LLMService`**

Add this method to `LLMService` (after `generate_response`):

```python
async def generate_response_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
    async for token in self.provider.generate_stream(prompt, context):
        yield token
```

Also update the `generate_response_stream` return type annotation at the method signature:

```python
async def generate_response_stream(self, prompt: str, context: List[str]) -> AsyncGenerator[str, None]:
```

**Step 7: Verify backend syntax**

Run from `chatbot-backend/` with venv active:

```bash
python -c "from app.services.llm_service import llm_service; print('OK')"
```

Expected: `OK` with no errors.

**Step 8: Commit**

```bash
git add chatbot-backend/app/services/llm_service.py
git commit -m "feat(backend): add generate_stream to all LLM providers"
```

---

### Task 2: Add `/api/chat/stream` endpoint

**Files:**

- Modify: `chatbot-backend/app/routers/chat.py`

**Step 1: Read the current file**

Read `chatbot-backend/app/routers/chat.py` in full.

**Step 2: Add imports**

Add to the top of the file:

```python
import json
from fastapi.responses import StreamingResponse
```

**Step 3: Add the streaming endpoint**

Add this new route after the existing `/api/chat` route (before `/api/stats`):

```python
@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events.
    Yields chunk events for each token, then a done event with metadata.
    """
    # Retrieve context and prepare metadata before streaming
    context_docs = rag_service.retrieve(request.message, k=3)
    context_texts = [doc["text"] for doc in context_docs]
    sources = list(set(doc["source"] for doc in context_docs))
    conversation_id = request.conversation_id or str(uuid.uuid4())
    model_used = llm_service.provider.get_model_name()

    async def event_generator():
        try:
            async for token in llm_service.generate_response_stream(
                prompt=request.message,
                context=context_texts
            ):
                event = json.dumps({"type": "chunk", "content": token})
                yield f"data: {event}\n\n"

            done_event = json.dumps({
                "type": "done",
                "conversation_id": conversation_id,
                "sources": sources,
                "model_used": model_used
            })
            yield f"data: {done_event}\n\n"

        except Exception as e:
            logger.exception("Streaming chat failed")
            error_event = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
```

**Step 4: Verify endpoint loads**

```bash
python -c "from app.routers.chat import router; print('OK')"
```

Expected: `OK`

**Step 5: Manual test (if backend server is running)**

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your skills?"}' \
  --no-buffer
```

Expected: Lines of `data: {"type":"chunk",...}` followed by `data: {"type":"done",...}`

**Step 6: Commit**

```bash
git add chatbot-backend/app/routers/chat.py
git commit -m "feat(backend): add POST /api/chat/stream SSE endpoint"
```

---

### Task 3: Update frontend — streaming fetch and message model

**Files:**

- Modify: `portfolio-frontend/pages/chat.vue`

**Step 1: Read the current file**

Read `portfolio-frontend/pages/chat.vue` in full before making any edits.

**Step 2: Update the `Message` interface**

Replace:

```ts
interface Message {
  role: "user" | "assistant";
  content: string;
}
```

With:

```ts
interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}
```

**Step 3: Replace the `send` function**

Replace the entire `send` function with this streaming version:

```ts
const send = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";
  if (inputEl.value) inputEl.value.style.height = "auto";
  loading.value = true;
  scrollToBottom();

  // Add an empty assistant message to stream into
  const assistantMsg: Message = {
    role: "assistant",
    content: "",
    streaming: true,
  };
  messages.value.push(assistantMsg);
  const msgIndex = messages.value.length - 1;

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

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;

        let event: {
          type: string;
          content?: string;
          conversation_id?: string;
          sources?: string[];
          model_used?: string;
          message?: string;
        };
        try {
          event = JSON.parse(raw);
        } catch {
          continue;
        }

        if (event.type === "chunk" && event.content) {
          messages.value[msgIndex].content += event.content;
          scrollToBottom();
        } else if (event.type === "done") {
          messages.value[msgIndex].streaming = false;
          messages.value[msgIndex].sources = event.sources;
          messages.value[msgIndex].model_used = event.model_used;
          conversationId.value = event.conversation_id ?? null;
          scrollToBottom();
        } else if (event.type === "error") {
          messages.value[msgIndex].content =
            "Sorry, something went wrong. Please try again.";
          messages.value[msgIndex].streaming = false;
        }
      }
    }
  } catch {
    messages.value[msgIndex].content =
      "Sorry, something went wrong. Please try again.";
    messages.value[msgIndex].streaming = false;
  } finally {
    loading.value = false;
    nextTick(() => inputEl.value?.focus());
  }
};
```

**Step 4: Commit**

```bash
git add portfolio-frontend/pages/chat.vue
git commit -m "feat(frontend): replace fetch with SSE streaming reader"
```

---

### Task 4: Update frontend UI — streaming cursor and metadata chips

**Files:**

- Modify: `portfolio-frontend/pages/chat.vue`

**Step 1: Update the message bubble template**

Find the message bubble section in the template and replace it with this version that adds the cursor and metadata:

Current section to find (the `v-for` message loop):

```html
<!-- Message bubbles -->
<div
  v-for="(msg, i) in messages"
  :key="i"
  :class="msg.role === 'user' ? 'items-end' : 'items-start'"
  class="flex flex-col gap-1"
>
  <div
    :class="
      msg.role === 'user'
        ? 'bg-primary/20 border-primary/30 self-end'
        : 'self-start border-white/10 bg-black/30'
    "
    class="max-w-[85%] rounded-2xl border px-4 py-3 backdrop-blur-sm"
  >
    <p class="text-fg-light text-sm leading-relaxed whitespace-pre-wrap">
      {{ msg.content }}
    </p>
  </div>
</div>
```

Replace with:

```html
<!-- Message bubbles -->
<div
  v-for="(msg, i) in messages"
  :key="i"
  :class="msg.role === 'user' ? 'items-end' : 'items-start'"
  class="flex flex-col gap-1"
>
  <div
    :class="
      msg.role === 'user'
        ? 'bg-primary/20 border-primary/30 self-end'
        : 'self-start border-white/10 bg-black/30'
    "
    class="max-w-[85%] rounded-2xl border px-4 py-3 backdrop-blur-sm"
  >
    <p class="text-fg-light text-sm leading-relaxed whitespace-pre-wrap">
      {{ msg.content }}<span
        v-if="msg.streaming"
        class="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-white/60 align-middle"
      />
    </p>
  </div>

  <!-- Metadata chips (assistant only, after streaming) -->
  <div
    v-if="msg.role === 'assistant' && !msg.streaming && (msg.sources?.length || msg.model_used)"
    class="flex flex-wrap items-center gap-1.5 px-1"
  >
    <span
      v-for="source in msg.sources"
      :key="source"
      class="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/40"
    >
      {{ source }}
    </span>
    <span v-if="msg.model_used" class="text-xs text-white/20">
      {{ msg.model_used }}
    </span>
  </div>
</div>
```

**Step 2: Verify in browser**

Open `http://localhost:3000/chat`, send a message, and confirm:

- Tokens appear progressively in the bubble
- Blinking cursor appears while streaming
- Cursor disappears and source chips + model name appear below the bubble after done
- Input is re-focused after response

**Step 3: Commit**

```bash
git add portfolio-frontend/pages/chat.vue
git commit -m "feat(frontend): add streaming cursor and metadata chips to chat UI"
```

---

## Done

All four tasks complete. The chat now streams token-by-token and displays sources + model name below each assistant response.
