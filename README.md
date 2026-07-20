# Portfolio

Personal portfolio for a Tech Lead / Full-Stack Engineer — a single-page Nuxt 3
site with a built-in, theme-aware AI chatbot.

- **Frontend:** Nuxt 3 + Vue 3 (`<script setup lang="ts">`) + TailwindCSS v4, with
  a multi-theme system (Aurora / Neon / Editorial / Blueprint × variant ×
  light/dark) driven by `theme-registry.ts`.
- **Chat backend:** a Nitro server route (`server/api/chat.post.ts`) using the
  **Vercel AI SDK**, streaming responses with the knowledge base injected
  directly into the system prompt. Pluggable LLM provider (Groq / Gemini /
  Ollama).

It deploys as a single app to **Vercel** (Nitro `vercel` preset) — UI and chat
API together, one deploy.

## Quick start

Package manager is **pnpm**; Node is pinned in `.nvmrc`.

```bash
pnpm install
cp .env.example .env   # set LLM_PROVIDER and the matching API key
pnpm dev               # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm generate`, `pnpm preview`.

## Configuration

Server-only chat config lives in `runtimeConfig` (`nuxt.config.ts`), read from
env. See `.env.example`. Key vars:

| Var                                | Purpose                        |
| ---------------------------------- | ------------------------------ |
| `LLM_PROVIDER`                     | `groq` \| `gemini` \| `ollama` |
| `GROQ_API_KEY`                     | Groq key (production default)  |
| `GROQ_MODEL`                       | e.g. `llama-3.1-8b-instant`    |
| `OLLAMA_BASE_URL` / `OLLAMA_MODEL` | local dev (no key)             |

## Project layout

```
.
├── app.vue, pages/, components/, composables/, assets/   # Nuxt frontend
├── theme-registry.ts                                     # theme single source of truth
├── server/                                               # Nitro chat backend
│   ├── api/chat.post.ts                                  #   streaming endpoint (AI SDK)
│   ├── utils/{knowledge,prompt,llm}.ts                   #   context, prompt, provider factory
│   └── data/personal_data.json                           #   knowledge base
└── docs/                                                 # ADRs, plans, conventions
```

## Docs

- `docs/adr/` — architecture decision records (incl. the chat-backend migration).
- `docs/conventions/` — code style, components, styling/themes, composables/data.
- `CLAUDE.md` — working guidance for AI assistants.

## Related

- [**sandbox-rag**](https://github.com/SevrainChea/sandbox-rag) — the original
  Python + ChromaDB RAG chat backend, now a standalone learning sandbox
  (superseded here by direct context injection; see
  [ADR-0002](docs/adr/0002-migrate-to-vercel-ai-sdk.md)).
