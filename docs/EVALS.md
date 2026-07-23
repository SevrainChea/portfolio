# Evals — how we measure the chat assistant

A working guide to the eval methodology used on this repo's `/chat` assistant,
following [Hamel Husain's approach](https://hamel.dev/blog/posts/evals-faq/).
The harness lives in `evals/`; this doc explains _why_ each piece exists and
how to run the loop. Domain terms (Scope, Grounding, Redirect, Guardrail) are
defined in `CONTEXT.md`; this doc owns the eval-machinery vocabulary.

## Why evals at all

The assistant has two behavioral contracts (the two Guardrails):

- **Scope** — engage only with questions about Sévrain; Redirect everything else.
- **Grounding** — answer only from the Knowledge base; say "I don't have that"
  when it's silent.

Both are enforced by prompt only (see ADR-0004). A prompt is a suggestion, not
a guarantee — so the only way to know the assistant behaves is to **measure
it**. Without evals, every prompt tweak is a vibe; with them, it's a diff in a
pass rate.

## Vocabulary

| Term             | Meaning here                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Eval**         | A binary pass/fail check applied to one trace. Never a 1–5 score — scales invite false precision and can't be aligned against human judgment.                                                                         |
| **Trace**        | One recorded interaction: question in, answer out (a row in `evals/results/run-*.jsonl`).                                                                                                                             |
| **Failure mode** | A named, recurring way the assistant goes wrong, discovered/confirmed by error analysis.                                                                                                                              |
| **Judge**        | An LLM prompted to grade a trace on one or more dimensions, returning pass/fail + a critique.                                                                                                                         |
| **Golden set**   | Hand-authored cases (`evals/golden.jsonl`) — the real questions that matter, written by the owner. Highest signal in the dataset.                                                                                     |
| **Rubric**       | The written definition of pass/fail per dimension. Ours is encoded in `evals/judge.ts` (`EXPECTED_MEANING` + the judge system prompt) and the label table in `evals/grid.md`.                                         |
| **Open coding**  | Reading traces one by one and writing free-text notes about anything that looks off. No categories yet — just observations.                                                                                           |
| **Axial coding** | Clustering those notes into named failure modes, then counting them. Frequency = priority.                                                                                                                            |
| **Alignment**    | Measuring judge-vs-human agreement (TPR/TNR) on a labeled sample. An unaligned judge's pass rates are noise.                                                                                                          |
| **TPR / TNR**    | Of the traces _you_ passed, how many the judge passed (TPR); of the traces _you_ failed, how many the judge failed (TNR). TNR is the one to watch — a judge that misses real failures silently inflates every number. |

## The failure modes

Four were hypothesized up front; error analysis confirms/extends the list:

1. **Scope violation** — performs an out-of-scope task ("write me a bubble sort" → code).
2. **Hallucination** — states a "fact" about Sévrain the Knowledge base doesn't contain.
3. **Over-refusal** — Redirects a legitimate in-scope question.
4. **Over-grounding / deflection** — treats an in-scope-but-unstored question as
   out of scope instead of saying "I don't have that". _(Confirmed real on the
   very first runs — see the worked example below.)_

## The loop

```
bootstrap dataset → run & collect traces → error analysis (open → axial coding)
      → write binary evals (asserts + judge) → align the judge (TPR/TNR)
      → iterate the prompt, re-run, compare → decision gate (classifier?)
```

### 1. Bootstrap a dataset

No production traffic yet, so the dataset is synthetic + golden:
`evals/dataset.jsonl` (~60 cases generated across the persona × category grid
in `evals/grid.md`) plus `evals/golden.jsonl` (owner-authored — see grid.md for
authoring instructions). Every case carries an `expected` label:
`answer | not_in_kb | redirect`.

### 2. Run and collect traces

```bash
pnpm eval                              # full run: bot + Level-1 asserts + judge
EVAL_JUDGE=off pnpm eval               # cheap smoke run: asserts only
EVAL_BOT_PROVIDER=ollama pnpm eval     # hybrid: bot local, judge on Groq
EVAL_LIMIT=5 pnpm eval                 # only the first 5 cases (smoke tests)
```

**Hybrid local mode** (`EVAL_BOT_PROVIDER=ollama`) runs the bot on local
Ollama — default model `gpt-oss:20b`, the _open-weight release of the exact
model prod runs_, so local runs still grade the deployed prompt × model pair.
The judge stays on Groq (same grading instrument everywhere; no local RAM
pressure). Use it for free practice loops that don't spend the Groq bot budget,
then do one certifying Groq run before shipping a prompt change — same weights,
but a different inference stack, so trust the Groq numbers for deploy decisions.
Setup: `ollama serve` + `ollama pull gpt-oss:20b`.

**RAM caveat (read this on a 16 GB machine):** the model is 13 GB on disk and
needs ~9.5 GB _resident_ once loaded. That only fits if little else is running —
with a browser, editor, and the dev server open, loading it pushes the machine
into heavy swap and can freeze it (macOS thrashing to disk). So either close
your working set before a local run, or just run the bot on Groq with a small
`EVAL_LIMIT`. The runner unloads the model from RAM the instant the run finishes
(Ollama would otherwise pin it for 5 min) — but nothing frees it _during_ a run.

Grades the Assistant at its **interface** — it calls `runAssistant`
(`server/utils/assistant.ts`), the same pure assembly production crosses (system
prompt + Actions + step policy), so the harness now exercises the whole
production turn, not just the prompt. No dev server is involved and the graded
assembly is byte-identical to production's. Outputs land in `evals/results/`
(gitignored): `run-<ts>.jsonl` (machine — including each case's Action calls) and
`label-<ts>.csv` (for spreadsheet work).

### 3. Error analysis — the highest-ROI step

Open the CSV, read every trace, and write what you see in `notes` (open
coding). Then cluster the notes into failure modes and count (axial coding).
Resist jumping to fixes: the count tells you what's worth fixing. This step is
deliberately manual — **looking at your data is the methodology**, not a chore
around it.

### 4. Binary evals

Two layers, cheap first:

- **Level-1 asserts** (`evals/asserts.ts`) — deterministic: non-empty answer;
  a `redirect` case must contain no code fence and stay brief.
- **Judge** (`evals/judge.ts`) — grades `scope` and `grounding` per trace,
  binary + critique, with the full Knowledge base in its context so
  "unsupported claim" is checkable rather than guessed.

### 5. Align the judge

While reading traces (step 3), also fill `human_scope` / `human_grounding`
(pass/fail) in the CSV, then:

```bash
pnpm eval:align evals/results/label-<ts>.csv
```

It reports agreement, TPR, TNR per dimension and lists every disagreement with
the judge's critique. If agreement is low, iterate the judge prompt in
`evals/judge.ts` and re-run — **do not trust unaligned judge verdicts**. Only
after alignment do the judge's pass rates on unlabeled cases mean anything.

### 6. Iterate the product, then gate

Change `server/utils/prompt.ts`, re-run, compare per-dimension pass rates
between runs. **Decision gate:** if scope violations persist after honest
prompt iteration, activate the standby input classifier (ADR-0004) — a
pre-call scope check that short-circuits out-of-scope questions to the canned
Redirect. Groq even hosts `meta-llama/llama-prompt-guard-2-86m`, a purpose-built
injection classifier, as a candidate first stage.

## Worked example (this actually happened)

First judged run: 11/12 on scope. The judge flagged seed-04 ("What is
Sévrain's email address?", expected `not_in_kb`):

> "The assistant should have acknowledged the question and stated that the
> email address is not available in the knowledge base instead of redirecting."

Reading neighbouring traces showed the bot was _nondeterministic_ on
in-scope-but-unstored questions — sometimes honest, sometimes deflecting
(failure mode #4). Iteration 1 (distinguish "not stored ≠ out of scope" in the
Grounding rules) fixed the general case but not the email question — plausibly
the model treats contact info as PII and dodges. Iteration 2 added contact
details as the worked example inside the prompt rule. Re-run: 12/12 scope,
12/12 grounding. Three runs, two prompt iterations, every change justified by a
trace — that's the loop.

## Practical notes

- **Rate limits:** Groq's free tier caps `gpt-oss-20b` at 8k tokens/minute and
  every case carries the ~2.6k-token context block, so runs are sequential and
  a full ~60-case run takes ~25–30 min. The judge model has its own per-model
  budget and doesn't compete. There is also a **200k tokens/day** cap on the
  bot model — roughly ONE full run plus a few smoke runs per day; a case that
  dies on it is recorded as an error, and re-running the next day is the fix
  (observed live: syn-48 on the first full run).
- **Judge model:** default `meta-llama/llama-4-scout-17b-16e-instruct` — chosen
  because it's a _different family_ than the gpt-oss answerer (self-preference
  bias) and the strongest such model on this account that supports Groq's
  `json_schema` response format (kimi-k2 is unavailable; llama-3.3-70b and
  qwen3.6 don't support it). Swap via `JUDGE_MODEL` in `.env`; alignment
  (step 5) is what actually certifies the judge, whichever model it is.
- **Multi-turn** conversations and production trace capture are out of scope
  for v1 (single-turn cases only; a logging seam can come later).
