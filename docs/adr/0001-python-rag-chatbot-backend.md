# 1. Python + RAG chatbot backend

- **Status:** Superseded by [ADR-0002](0002-migrate-to-vercel-ai-sdk.md)
- **Date:** 2026-06-06

## Context

The portfolio site needed a chat experience where a visitor can ask questions
about me and get grounded answers. The backend for that chat was built as a
standalone Python service using a Retrieval-Augmented Generation (RAG) pipeline.
That choice was driven by three goals, in priority order:

1. **Learn how RAG and embeddings work.** This was the primary goal. The backend
   was as much a hands-on classroom as a product feature — a real reason to wire
   up a vector store, an embedding step, retrieval, and prompt assembly end to end.

2. **Work in the Python/ML ecosystem.** The RAG tooling worth learning
   (LangChain, ChromaDB, sentence-transformers) is Python-first. Building here
   meant learning the libraries the wider ML world actually uses.

3. **Anticipated a larger knowledge base.** The corpus was expected to grow —
   potentially sourced from Notion (`notion-client` is already a dependency) —
   to a size where retrieval would genuinely earn its keep instead of fitting
   entirely in a prompt.

> **Not a motivation:** provider flexibility. The pluggable LLM provider layer
> (below) is real, but it emerged as an implementation detail while building —
> it was not a reason the Python/RAG approach was chosen.

## Decision

Build a standalone **FastAPI** backend (`chatbot-backend/`) implementing a RAG
pipeline over a local **ChromaDB** vector store, deployed independently to
**Railway**. Concretely:

**Service & deployment**

- FastAPI app under `chatbot-backend/app/`, deployed to Railway.
- `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- `railpack.json` runs `python scripts/ingest_data.py` then starts uvicorn on deploy.

**Configuration** (`app/config.py`, Pydantic `BaseSettings`)

- Env vars: `LLM_PROVIDER`, `ALLOWED_ORIGINS`, `*_API_KEY`, `*_MODEL`,
  `CHROMA_PERSIST_DIRECTORY`, `ENVIRONMENT`, `DEBUG`.

**Endpoints** (`app/routers/chat.py`)

- `POST /api/chat` — non-streaming, returns a `ChatResponse`
  (`response`, `conversation_id`, `sources`, `model_used`).
- `POST /api/chat/stream` — SSE: a series of `chunk` events (tokens), then a
  final `done` event carrying `conversation_id`, `sources`, `model_used`.
- `GET /api/stats` — knowledge-base stats and active LLM provider.

**LLM layer** (`app/services/llm_service.py`)

- Abstract `LLMProvider` with `OllamaProvider`, `GeminiProvider`, `GroqProvider`;
  each implements sync `generate()` and async `generate_stream()`. A factory
  selects the implementation from `LLM_PROVIDER`.
- Strategy: Ollama locally for dev (no API key), Groq for production.

**RAG layer** (`app/services/rag_service.py`)

- ChromaDB `PersistentClient`, collection **`portfolio_knowledge`**, cosine space.
- `retrieve(query, k=5)`, filtered by `RELEVANCE_THRESHOLD = 0.4`
  (`1 − cosine_distance ≥ 0.4`). Uses ChromaDB's default embedding model.
- Ingestion: `scripts/ingest_data.py` loads `data/personal_data.json`
  (**21** `{text, source}` documents), clears the collection, and re-ingests.
  The data must be re-ingested after any edit.

**Frontend contract** (documented here so the migration preserves it)

- `composables/useChat.ts` POSTs to `${config.public.apiBase}/api/chat/stream`
  and parses the SSE stream.
- Base URL comes from `runtimeConfig.public.apiBase` (env `NUXT_PUBLIC_API_BASE`,
  default `http://localhost:8000`).
- Four themed chat skins (`AuroraChat`, `NeonChat`, `EditorialChat`,
  `BlueprintChat`) share that single composable, routed by `pages/chat.vue`.

## Consequences

**Positive — goals met**

- RAG and embeddings were learned hands-on: vector store, retrieval, relevance
  thresholding, and prompt assembly are all wired end to end.
- The provider abstraction makes swapping models (Ollama / Groq / Gemini) trivial.
- Clean service/router separation keeps the code readable and testable.

**Costs at the current scale**

- The corpus is only **~2.6k tokens** total — it fits entirely within a modern
  context window many times over. At this size retrieval is unnecessary, and
  worse, it can **lose** information: top-`k` + the relevance threshold can
  exclude documents the model actually needed to answer well.
- Operational overhead for little benefit: a second runtime and a separate
  Railway deploy, CORS between origins, a vector store to persist, and a manual
  re-ingest step on every data edit.

**Why this is being reconsidered**

- The learning goal (build RAG) and the product goal (ship a simple, reliable
  portfolio chat) diverged — and the learning artifact ended up _as_ the
  production backend. That is the mismatch this ADR records.
- [ADR-0002](0002-migrate-to-vercel-ai-sdk.md) will split the two concerns:
  keep this Python repo as a learning sandbox (or a future home for a _real_,
  large-corpus RAG), and move the portfolio's production chat to **direct context
  injection** on a **Nitro server route** using the **Vercel AI SDK** — shipping
  with the Nuxt app, TypeScript end to end, one deploy.
