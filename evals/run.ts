import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createOllama } from "ollama-ai-provider-v2";
import { buildSystemPrompt } from "../server/utils/prompt";
import { assertsPass, runAsserts } from "./asserts";
import { DEFAULT_JUDGE_MODEL, judgeCase } from "./judge";
import type { CaseResult, EvalCase, JudgeVerdict } from "./types";

// Eval runner — grades the assistant at the direct seam: the real production
// system prompt (buildSystemPrompt is pure, no Nitro needed) + a single-shot
// generateText call. The HTTP route is plumbing that doesn't shape answer
// content, so it is deliberately bypassed; that's why this builds its own Groq
// client instead of reusing server/utils/llm.ts (which needs useRuntimeConfig).
//
// Usage: pnpm eval          (reads GROQ_API_KEY / GROQ_MODEL from .env)

const EVALS_DIR = dirname(fileURLToPath(import.meta.url));

// Groq's free tier caps gpt-oss-20b at 8k tokens/minute, and every case
// carries the full ~2.6k-token context block — so parallel calls trip the
// limit immediately. Run sequentially and let maxRetries' exponential backoff
// (2+4+8+16+32s) ride out the per-minute window. ~2-3 cases/min is the
// sustainable free-tier rate.
const CONCURRENCY = 1;
const MAX_RETRIES = 5;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name} — set it in .env (see .env.example).`);
    process.exit(1);
  }
  return v;
}

// Two committed case files: dataset.jsonl (synthetic, generated across the
// persona × category grid — see grid.md) and golden.jsonl (hand-authored,
// highest-signal — the real questions recruiters ask). Same schema, one run.
const CASE_FILES = ["dataset.jsonl", "golden.jsonl"];

function loadDataset(): EvalCase[] {
  return CASE_FILES.flatMap((file) => {
    let raw: string;
    try {
      raw = readFileSync(join(EVALS_DIR, file), "utf8");
    } catch {
      return [];
    }
    return raw
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as EvalCase);
  });
}

/** Run `fn` over `items` with a small concurrency cap (rate-limit friendly). */
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

function csvField(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

/** Fail fast with a useful message instead of 60 per-case connection errors. */
async function assertOllamaReady(base: string, model: string): Promise<void> {
  let models: { name: string }[];
  try {
    const res = await fetch(`${base}/api/tags`);
    ({ models } = (await res.json()) as { models: { name: string }[] });
  } catch {
    console.error(
      `Ollama is not reachable at ${base} — start it with \`ollama serve\`.`,
    );
    process.exit(1);
  }
  // Pulled models are listed as name:tag, so accept an exact or prefix match.
  if (!models.some((m) => m.name === model || m.name.startsWith(`${model}:`))) {
    console.error(
      `Model "${model}" is not pulled — run \`ollama pull ${model}\`.\n` +
        `Available: ${models.map((m) => m.name).join(", ") || "(none)"}`,
    );
    process.exit(1);
  }
}

// Evict the bot model from RAM the moment the run ends. gpt-oss:20b holds
// ~9.5 GB resident, and Ollama's default keep-alive pins it for 5 more minutes
// — long enough to swap-thrash (or freeze) a 16 GB machine that's also running
// a browser + dev server. `keep_alive: 0` with no prompt is Ollama's native
// unload. Best-effort: a failed unload just lets the model linger, so it must
// never fail the run. (The ollama-ai-provider chat model has no keepAlive knob,
// hence the raw API call here.)
async function unloadOllama(base: string, model: string): Promise<void> {
  try {
    await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, keep_alive: 0 }),
    });
  } catch {
    // ignore — the model just keeps Ollama's default 5-min keep-alive
  }
}

async function main() {
  // EVAL_JUDGE=off gives a cheap asserts-only smoke run.
  const judgeOn = process.env.EVAL_JUDGE !== "off";
  // EVAL_BOT_PROVIDER=ollama runs the BOT locally (hybrid mode): unlimited
  // free reps against the same open weights prod uses, while the judge stays
  // on Groq — same grading instrument across local and Groq runs, and no
  // model-swap thrashing on a 16GB machine. The judge always needs Groq.
  const botProvider = process.env.EVAL_BOT_PROVIDER ?? "groq";
  const judgeModel = process.env.JUDGE_MODEL ?? DEFAULT_JUDGE_MODEL;
  const needsGroq = botProvider === "groq" || judgeOn;
  const groq = createGroq({
    apiKey: needsGroq ? requireEnv("GROQ_API_KEY") : "",
  });

  let bot: LanguageModel;
  let botLabel: string;
  // Captured for the post-run unload (only set in the ollama branch).
  let ollamaBase: string | undefined;
  let ollamaModel: string | undefined;
  if (botProvider === "ollama") {
    ollamaBase = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    // gpt-oss:20b is the open-weight release of the exact model prod runs on
    // Groq — local runs therefore grade the deployed prompt × model pair.
    ollamaModel = process.env.EVAL_BOT_MODEL ?? "gpt-oss:20b";
    await assertOllamaReady(ollamaBase, ollamaModel);
    const ollama = createOllama({ baseURL: `${ollamaBase}/api` });
    bot = ollama(ollamaModel);
    botLabel = `ollama/${ollamaModel}`;
  } else {
    const model =
      process.env.EVAL_BOT_MODEL ??
      process.env.GROQ_MODEL ??
      "openai/gpt-oss-20b";
    bot = groq(model);
    botLabel = `groq/${model}`;
  }

  const system = buildSystemPrompt();
  // EVAL_LIMIT=N runs only the first N cases — for smoke-testing a config
  // change without paying for (or waiting on) the full set.
  const limit = Number(process.env.EVAL_LIMIT) || undefined;
  const cases = loadDataset().slice(0, limit);

  console.log(
    `Running ${cases.length} cases against ${botLabel}` +
      (judgeOn ? ` (judge: groq/${judgeModel})…\n` : " (judge off)…\n"),
  );

  const results = await mapPool(
    cases,
    CONCURRENCY,
    async (c): Promise<CaseResult> => {
      const started = Date.now();
      let text = "";
      let error: string | undefined;
      try {
        ({ text } = await generateText({
          model: bot,
          system,
          prompt: c.question,
          maxRetries: MAX_RETRIES,
        }));
      } catch (e) {
        // A dead case shouldn't kill the run — record it and keep grading.
        error = e instanceof Error ? e.message : String(e);
      }
      const asserts = runAsserts(c, text);

      // Judge only what actually answered — a dead bot call has nothing to grade.
      let judge: JudgeVerdict | null = null;
      let judgeError: string | undefined;
      if (judgeOn && !error) {
        try {
          judge = await judgeCase(groq(judgeModel), c, text);
        } catch (e) {
          judgeError = e instanceof Error ? e.message : String(e);
        }
      }

      const result: CaseResult = {
        case: c,
        answer: text,
        error,
        botModel: botLabel,
        latencyMs: Date.now() - started,
        asserts,
        assertsPass: !error && assertsPass(asserts),
        judge,
        judgeError,
      };
      const judgeMark = judge
        ? ` scope:${judge.scope.pass ? "✓" : "✗"} grounding:${judge.grounding.pass ? "✓" : "✗"}`
        : "";
      console.log(
        `  ${result.assertsPass ? "✓" : "✗"} ${c.id} (${c.expected})${judgeMark}${error || judgeError ? " — ERROR" : ""}`,
      );
      return result;
    },
  );

  // Bot is done grading — evict it from RAM now, before the file writes and
  // summary, so a 16 GB machine isn't left swapping for Ollama's 5-min default.
  if (ollamaBase && ollamaModel) {
    await unloadOllama(ollamaBase, ollamaModel);
    console.log(`\nUnloaded ${ollamaModel} from Ollama (freed local RAM).`);
  }

  // ── Write results: JSONL (machine) + CSV (spreadsheet labeling) ──────────
  const stamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  const outDir = join(EVALS_DIR, "results");
  mkdirSync(outDir, { recursive: true });

  const jsonlPath = join(outDir, `run-${stamp}.jsonl`);
  writeFileSync(
    jsonlPath,
    results.map((r) => JSON.stringify(r)).join("\n") + "\n",
  );

  // The CSV is the error-analysis + alignment surface: open it in a
  // spreadsheet, read each trace, fill `human_scope`/`human_grounding`
  // (pass/fail — used for judge alignment) and free-text `notes` (open coding).
  const csvPath = join(outDir, `label-${stamp}.csv`);
  const header =
    "id,persona,category,expected,question,answer,asserts_pass," +
    "judge_scope,judge_scope_critique,judge_grounding,judge_grounding_critique," +
    "human_scope,human_grounding,notes";
  const rows = results.map((r) =>
    [
      r.case.id,
      r.case.persona,
      r.case.category,
      r.case.expected,
      csvField(r.case.question),
      csvField(r.answer),
      String(r.assertsPass),
      r.judge ? String(r.judge.scope.pass) : "",
      csvField(r.judge?.scope.critique ?? ""),
      r.judge ? String(r.judge.grounding.pass) : "",
      csvField(r.judge?.grounding.critique ?? ""),
      "", // human_scope — pass/fail, you fill this in
      "", // human_grounding — pass/fail, you fill this in
      "", // notes — open-coding observations
    ].join(","),
  );
  writeFileSync(csvPath, [header, ...rows].join("\n") + "\n");

  // ── Summary ───────────────────────────────────────────────────────────────
  const byExpected = new Map<string, { total: number; pass: number }>();
  for (const r of results) {
    const bucket = byExpected.get(r.case.expected) ?? { total: 0, pass: 0 };
    bucket.total++;
    if (r.assertsPass) bucket.pass++;
    byExpected.set(r.case.expected, bucket);
  }
  const passed = results.filter((r) => r.assertsPass).length;

  console.log(`\nLevel-1 asserts: ${passed}/${results.length} passed`);
  for (const [label, { total, pass }] of byExpected) {
    console.log(`  ${label.padEnd(10)} ${pass}/${total}`);
  }

  if (judgeOn) {
    const judged = results.filter((r) => r.judge);
    const scopePass = judged.filter((r) => r.judge!.scope.pass).length;
    const groundPass = judged.filter((r) => r.judge!.grounding.pass).length;
    console.log(`\nJudge (${judged.length}/${results.length} graded):`);
    console.log(`  scope      ${scopePass}/${judged.length}`);
    console.log(`  grounding  ${groundPass}/${judged.length}`);
    for (const r of judged) {
      if (!r.judge!.scope.pass)
        console.log(`  ✗ scope ${r.case.id}: ${r.judge!.scope.critique}`);
      if (!r.judge!.grounding.pass)
        console.log(
          `  ✗ grounding ${r.case.id}: ${r.judge!.grounding.critique}`,
        );
    }
  }

  console.log(`\nResults:  ${jsonlPath}`);
  console.log(`Labeling: ${csvPath}`);
}

main();
