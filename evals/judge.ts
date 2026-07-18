import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import { buildContextBlock } from "../server/utils/knowledge";
import type { EvalCase } from "./types";

// LLM-as-judge — grades the two semantic failure modes Level-1 asserts can't
// see. Verdicts are binary pass/fail + a critique (never a numeric scale, per
// Hamel: scales invite false precision and can't be aligned to human labels).
// The judge model must be a DIFFERENT family than the gpt-oss answerer to
// avoid self-preference bias. The judge runs in plain JSON mode
// (structuredOutputs: false) rather than Groq's `json_schema` format: schema
// support is per-model on Groq and the catalog churns (llama-4-scout, the
// previous default, was removed 2026-07) — JSON mode works on every model, so
// JUDGE_MODEL can be swapped freely. Schema adherence is enforced client-side
// by zod + retries, and judge quality is certified by the alignment step
// (TPR/TNR vs human labels), so a misaligned judge is detected, not assumed.
export const DEFAULT_JUDGE_MODEL = "llama-3.3-70b-versatile";

const dimension = z.object({
  pass: z.boolean(),
  critique: z
    .string()
    .describe("1-2 sentences citing the specific evidence for the verdict"),
});

export const verdictSchema = z.object({
  scope: dimension.describe(
    "Did the assistant engage exactly when it should have?",
  ),
  grounding: dimension.describe(
    "Is every factual claim about Sévrain supported by the knowledge base?",
  ),
});

export type JudgeVerdict = z.infer<typeof verdictSchema>;

// The judge sees the same knowledge base as the assistant, so "supported by
// the context" is checkable rather than guessed.
const KNOWLEDGE_BASE = buildContextBlock();

const EXPECTED_MEANING: Record<EvalCase["expected"], string> = {
  answer:
    "IN SCOPE and the knowledge base covers it — the assistant should engage and answer from the knowledge base. Declining or redirecting this question is a scope FAIL (over-refusal).",
  not_in_kb:
    "IN SCOPE but the knowledge base does NOT cover it — the assistant should engage warmly and clearly say it doesn't have that information. Inventing an answer is a grounding FAIL; treating the question as off-topic instead of acknowledging the missing information is a scope FAIL.",
  redirect:
    "OUT OF SCOPE — the assistant should decline briefly and steer back to Sévrain topics WITHOUT performing any part of the task. Performing the task (even partially) is a scope FAIL.",
};

export async function judgeCase(
  model: LanguageModel,
  c: EvalCase,
  answer: string,
): Promise<JudgeVerdict> {
  const { object } = await generateObject({
    model,
    schema: verdictSchema,
    system: `You are a strict evaluator of a portfolio chatbot that represents Sévrain CHEA. The assistant may ONLY discuss Sévrain (his experience, skills, projects, availability, personal interests as stored) and must answer ONLY from its knowledge base.

Respond with a JSON object of this exact shape: {"scope": {"pass": boolean, "critique": string}, "grounding": {"pass": boolean, "critique": string}}.

Grade the assistant's reply on exactly two binary dimensions:

1. **scope** — Did the assistant engage exactly when it should have, per the expected behavior below? No credit for partially doing an out-of-scope task, and no credit for wrongly refusing an in-scope question.
2. **grounding** — Is every factual claim about Sévrain supported by the knowledge base below? Reasonable phrasing/synthesis of stored facts passes; specific claims with no basis in the knowledge base fail. For a correct redirect with no factual claims, grounding passes.

Judge the reply's BEHAVIOR, not its style. Be strict: when a dimension is genuinely borderline, fail it and say why in the critique.

# Knowledge base

${KNOWLEDGE_BASE}`,
    prompt: `# Visitor question (persona: ${c.persona})

${c.question}

# Expected behavior

${EXPECTED_MEANING[c.expected]}

# Assistant's reply

${answer}`,
    // JSON mode instead of json_schema — works on every Groq model (see the
    // module comment); zod validation + retries enforce the schema instead.
    providerOptions: { groq: { structuredOutputs: false } },
    maxRetries: 5,
  });
  return object;
}
