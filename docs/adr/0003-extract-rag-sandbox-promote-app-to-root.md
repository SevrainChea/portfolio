# 3. Extract the RAG sandbox to its own repo; promote the Nuxt app to root

- **Status:** Accepted
- **Date:** 2026-06-07
- **Amends:** [ADR-0002](0002-migrate-to-vercel-ai-sdk.md) (sub-decision 3 — where
  the Python sandbox lives)

## Context

[ADR-0002](0002-migrate-to-vercel-ai-sdk.md) moved the production chat into the
Nuxt app as a Nitro route and, as its third sub-decision, chose to **keep
`chatbot-backend/` in the repo as a documented learning sandbox** while retiring
its Railway deploy. That left the repository in an awkward shape:

- The repo was structured and named as a **monorepo** — `portfolio-frontend/`
  beside `chatbot-backend/`, with a root `README.md`/`QUICK_START.md`/`dev.sh`
  describing "two independent projects" and a script to boot both together.
- After ADR-0002 the two are no longer co-equal. The Nuxt app is the **entire
  production system** (UI _and_ the chat backend, in `server/`); the Python
  service is a **retired sandbox** with no role in the deployed product.
- So `portfolio-frontend/` is a misnomer (it is not "the frontend" — it is the
  whole app), and the monorepo framing actively misleads a reader into thinking
  the backend is a live, co-equal part of the system.

The two projects also have genuinely **separate lifecycles**: different language,
runtime, deploy story, and reason to exist (one ships the site; the other is a
place to learn RAG). They were only ever in one repo for convenience, and that
convenience no longer outweighs the confusion.

## Decision

Split the two concerns into two repositories and let the structure tell the
truth.

1. **Extract the Python RAG backend to its own repo —
   [`SevrainChea/sandbox-rag`](https://github.com/SevrainChea/sandbox-rag)
   (public).** The extraction preserves the backend's git history (its 21
   commits), rewritten so the former `chatbot-backend/` contents sit at that
   repo's root. It stands alone as a learning sandbox and the future home for a
   _real_, large-corpus RAG (the scenario ADR-0002 named as the point where
   retrieval becomes the right tool again).

2. **Promote the Nuxt app to the root of this repo.** Everything under
   `portfolio-frontend/` moves up one level; the app _is_ the project. Colliding
   root files are merged rather than clobbered: `.gitignore` rewritten for a
   root-level Nuxt app, `.vscode/settings.json` kept (Tailwind associations) with
   the dead Python interpreter paths dropped, `docs/` merged, `CLAUDE.md` updated
   with a chat-backend section and a pointer to `sandbox-rag`, `README.md`
   rewritten for the single app. The stale `dev.sh` and `QUICK_START.md`
   (monorepo-era, backend-centric) are deleted.

3. **Rename the GitHub repo `portfolio-monorepo` → `portfolio`.** It is not a
   monorepo anymore. GitHub auto-redirects the old URL.

This **amends ADR-0002's third sub-decision** (the sandbox stays in-repo): the
sandbox now lives in its own repo instead. ADR-0002's core decision — RAG → direct
context injection on a Nitro route — is unchanged and still in force.

## Consequences

**Positive**

- The repository structure is honest: one repo = one deployable Nuxt app, with no
  misleading `portfolio-frontend/` wrapper or dead co-equal sibling.
- The sandbox keeps its full history and gains an independent lifecycle — it can
  evolve (or not) without touching the portfolio, and is discoverable on its own.
- No secrets crossed over: only committed files were extracted; `.env`, `venv/`,
  and `chroma_db/` were gitignored and excluded from the new repo.

**Negative / costs**

- A large, mechanical rename churn in this repo's history (most of the diff is
  path moves). Git rename detection keeps blame intact for the moved files.
- **Vercel's "Root Directory" must change** from `portfolio-frontend` to the repo
  root, in the dashboard, or production deploys break. This is an ops step outside
  the code, easy to forget.
- Older ADRs (0001, 0002) still reference `portfolio-frontend/…` and
  `chatbot-backend/…` paths. As point-in-time records they are intentionally left
  unedited; this ADR is the pointer to the current layout.

**Boundary of this decision**

- This is a structural/organisational change only — no runtime behaviour changes.
  The split does not preclude folding the sandbox back in later, but the default
  is now two repos.
