# 2. Migrate chatbot to Vercel AI SDK on Nitro

- **Status:** Accepted
- **Date:** 2026-06-06
- **Supersedes:** [ADR-0001](0001-python-rag-chatbot-backend.md)

## Context

[ADR-0001](0001-python-rag-chatbot-backend.md) recorded that the standalone
Python FastAPI + ChromaDB RAG backend is over-engineered for this site's
knowledge base (~2.6k tokens across 21 short documents). At that scale retrieval
adds failure modes — top-`k` and the relevance threshold can _exclude_ documents
the model needed — while costing a second runtime, a separate Railway deploy,
CORS between origins, a vector store to persist, and a manual re-ingest step on
every data edit. None of it buys anything the context window can't hold directly.

The frontend is a Nuxt 3 app. Keeping a separate Python service means a second
deploy target and language in the request path for a feature that could ship with
the app itself.

## Decision

Replace RAG with **direct context injection** and move the chat backend into the
Nuxt app as a **Nitro server route** built on the **Vercel AI SDK v6** —
TypeScript end to end, one deploy (Vercel), no Python in the request path. The
entire knowledge base is injected into the system prompt on every request.

Three sub-decisions frame the work:

1. **Adopt the AI SDK idiom on the client.** Use `@ai-sdk/vue` v2's `Chat` class
   and the AI SDK data-stream protocol, rather than preserving the legacy custom
   SSE contract. (`@ai-sdk/vue` v2 removed the `useChat` composable in favour of
   the `Chat` class.)
2. **Port the multi-provider switch to TypeScript.** Recreate the Ollama / Groq /
   Gemini selection from the Python `LLMProvider` abstraction, reusing the same
   env var names for config parity.
3. **Keep the Python backend as a sandbox; retire Railway.** `chatbot-backend/`
   stays in the repo as a documented learning artifact; its Railway deploy is
   taken down. This ADR supersedes ADR-0001.

### Implementation blueprint

Verified against AI SDK **v6 (beta)** docs.

**Server — `portfolio-frontend/server/`**

- `server/api/chat.post.ts` — `defineEventHandler`; read `{ messages }` (UIMessages)
  from the body and:

  ```ts
  const result = streamText({
    model: getModel(), // server/utils/llm.ts
    system: buildSystemPrompt(), // server/utils/prompt.ts
    messages: convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) =>
      part.type === "start" ? { model: getModelId() } : undefined,
    onError: (e) => (e instanceof Error ? e.message : "chat error"),
  });
  ```

  No `sources` (retrieval is gone); the model name rides along as message
  metadata so the UI can still show it.

- `server/utils/llm.ts` — provider factory returning an AI SDK `LanguageModel`
  from `LLM_PROVIDER`: `groq` (`createGroq`, `GROQ_API_KEY`, `GROQ_MODEL`),
  `gemini` (`@ai-sdk/google`), `ollama` (community `ollama-ai-provider`, local
  dev). Reuses the env names from `chatbot-backend/app/config.py`.
- `server/utils/knowledge.ts` — load the knowledge JSON and format all 21 docs
  into one plain context block (no embeddings, no retrieval).
- `server/utils/prompt.ts` — system prompt = the `SYSTEM_PROMPT` text ported from
  `chatbot-backend/app/services/llm_service.py` + the context block.
- **Data:** copy `chatbot-backend/data/personal_data.json` →
  `portfolio-frontend/server/data/personal_data.json` (server-side only).

**Client — `portfolio-frontend/`**

- Rewrite `composables/useChat.ts` as a thin wrapper over the `Chat` class:

  ```ts
  const chat = new Chat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  ```

  **Preserve** the UX helpers the SDK does not provide — `input` ref,
  `autoResize`, auto-scroll, `showScrollCTA`, `scrollToBottomFromCTA`,
  `messagesEl`/`inputEl`. Map `loading` ← `chat.status !== 'ready'`;
  `send()` → `chat.sendMessage({ text: input.value })`. Keep the exposed API
  close to today's to minimise per-skin churn.

- The four skins (`AuroraChat` / `NeonChat` / `EditorialChat` / `BlueprintChat.vue`)
  render message text from `parts`
  (`m.parts.filter(p => p.type === 'text').map(p => p.text).join('')`) instead of
  `msg.content`. **Remove the `sources` chips**; keep an optional model label read
  from message metadata.
- `nuxt.config.ts` — drop `runtimeConfig.public.apiBase` for chat (the route is
  same-origin); `NUXT_PUBLIC_API_BASE` is retired. Use the Nitro `vercel` preset.
- `package.json` — add `ai@^6`, `@ai-sdk/vue@^2`, `@ai-sdk/groq`,
  `@ai-sdk/google`, `ollama-ai-provider`.

**Deployment**

- Vercel (Nitro `vercel` preset). Env in the Vercel project: `LLM_PROVIDER`,
  `GROQ_API_KEY`, `GROQ_MODEL` (+ `GOOGLE_GENERATIVE_AI_API_KEY` if Gemini is used).
- The Railway service for `chatbot-backend/` is taken down; the code stays.

## Consequences

**Positive**

- One repo, one language, one deploy. The chat ships with the site; no second
  runtime, no CORS, no vector store, no re-ingest step.
- Better answers at this scale: the model sees the _entire_ knowledge base every
  turn, so it can no longer miss a relevant document the way top-`k` retrieval can.
- **Multi-turn context for free:** the `Chat` class sends full message history by
  default, whereas the Python flow only ever sent the latest message.
- Editing knowledge is now just editing one JSON file — no ingestion to re-run.

**Negative / costs**

- Real frontend churn: `composables/useChat.ts` is rewritten and all four themed
  skins are touched (parts rendering, sources removed). Mitigated by keeping the
  wrapper's API close to today's.
- New dependencies and a provider abstraction to maintain in TS; `ollama-ai-provider`
  is a community package, not an official AI SDK provider.
- Every request now carries the full ~2.6k-token context — negligible at this
  size, but it scales with the knowledge base. The day the corpus outgrows the
  context window is the day RAG becomes the right tool again (see below).
- AI SDK v6 is in beta; pin versions and watch for breaking changes.

**Boundary of this decision**

- This is right _because the corpus is tiny_. If the knowledge base grows large
  (e.g. a real Notion export), revisit retrieval — that is exactly the scenario
  the `chatbot-backend/` sandbox is preserved to explore.
