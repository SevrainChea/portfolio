# Architecture Decision Records

This folder records significant architectural decisions for the portfolio Nuxt
app (including its chat backend). Each ADR captures the context, the decision, and
its consequences at a point in time — so the _why_ behind the code survives.

**Format:** MADR-lite — `Status`, `Context`, `Decision`, `Consequences`.

**Naming:** `NNNN-kebab-title.md`, numbered sequentially (`0001-…`, `0002-…`).

**Status lifecycle:** `Proposed → Accepted → Superseded`. An ADR is never edited
to reverse a decision; instead a new ADR supersedes it, and the old one is marked
`Superseded by ADR-NNNN`.

## Index

- [0001 — Python + RAG chatbot backend](0001-python-rag-chatbot-backend.md) — _Superseded by 0002_
- [0002 — Migrate chatbot to Vercel AI SDK on Nitro](0002-migrate-to-vercel-ai-sdk.md) — _Accepted (amended by 0003)_
- [0003 — Extract the RAG sandbox to its own repo; promote the Nuxt app to root](0003-extract-rag-sandbox-promote-app-to-root.md) — _Accepted_
- [0004 — Scope guardrail is prompt-only, with a classifier on standby](0004-scope-guardrail-prompt-first.md) — _Accepted_
