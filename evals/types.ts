// Shared shapes for the eval harness. Kept in their own module so run.ts,
// asserts.ts, and judge.ts can all import them without cycles.

/** Expected behavior label — the yardstick each case is graded against. */
export type ExpectedBehavior = "answer" | "not_in_kb" | "redirect";

export interface EvalCase {
  id: string;
  question: string;
  persona: string;
  category: string;
  expected: ExpectedBehavior;
}

/** One Level-1 deterministic check. `pass: null` means "not applicable". */
export interface AssertResult {
  name: string;
  pass: boolean | null;
  detail?: string;
}

/** One binary judge dimension: pass/fail + evidence-citing critique. */
export interface DimensionVerdict {
  pass: boolean;
  critique: string;
}

export interface JudgeVerdict {
  scope: DimensionVerdict;
  grounding: DimensionVerdict;
}

export interface CaseResult {
  case: EvalCase;
  answer: string;
  /** Set when the model call itself failed (rate limit, network, …). */
  error?: string;
  botModel: string;
  latencyMs: number;
  asserts: AssertResult[];
  /** false iff any applicable assert failed. */
  assertsPass: boolean;
  /** null when the judge was skipped (EVAL_JUDGE=off) or errored. */
  judge: JudgeVerdict | null;
  judgeError?: string;
}
