# 4. Scope guardrail is prompt-only, with a classifier on standby

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

The chat assistant must only discuss Sévrain (Scope) and answer only from the
Knowledge base (Grounding) — see `CONTEXT.md` for both terms. Security best
practice says "system prompts are not guardrails" and prescribes an input
classifier in front of the model (defense in depth). Hamel Husain's eval
methodology says the opposite: measure first, add machinery only when data
proves the need. Two facts tip the balance here: the stakes are low (a
portfolio bot with no tools, no PII beyond a public bio, no money path), and
replies **stream token-by-token**, which rules out output-side checking
outright — you cannot stream an answer and then retract it.

## Decision

Enforce both guardrails **in the system prompt only** (`server/utils/prompt.ts`)
and measure leakage with the eval harness (`evals/`, see `docs/EVALS.md`). An
**input classifier stays designed-but-unbuilt**: a cheap pre-call scope check
that would short-circuit out-of-scope questions to the canned Redirect without
invoking the main model (Groq hosts `meta-llama/llama-prompt-guard-2-86m` as a
candidate first stage). It ships only if the eval decision gate fires — i.e.
scope violations persist after honest prompt iteration.

## Consequences

- No added latency, cost, or false-refusal surface until data justifies them.
- The prompt WILL leak under determined jailbreaks; we accept that at these
  stakes and track it via the `prompt-injection` eval cases rather than
  pretending the prompt is a hard boundary.
- If the classifier ships later, Redirects become a fixed string — cheaply
  code-assertable, retiring one judge dimension.
- Do not "fix" the missing classifier without running the evals first; its
  absence is deliberate.
