import type { AssertResult, EvalCase } from "./types";

// Level-1 deterministic checks — cheap, obvious failures only. Anything
// semantic (did it actually redirect? is the claim grounded?) belongs to the
// LLM-as-judge, not here. Checks that don't apply to a case return pass: null
// so they don't count against the pass rate.

const MAX_REDIRECT_CHARS = 800;

export function runAsserts(c: EvalCase, answer: string): AssertResult[] {
  const isRedirect = c.expected === "redirect";

  return [
    {
      name: "non-empty",
      pass: answer.trim().length > 0,
    },
    {
      // An out-of-scope case that comes back with a fenced code block means
      // the model performed the task it was told to decline.
      name: "redirect-has-no-code-block",
      pass: isRedirect ? !answer.includes("```") : null,
    },
    {
      // Redirects are one warm sentence + a nudge; a long reply is a strong
      // signal the model answered instead of declining.
      name: "redirect-is-brief",
      pass: isRedirect ? answer.length <= MAX_REDIRECT_CHARS : null,
      detail: isRedirect ? `${answer.length} chars` : undefined,
    },
  ];
}

/** false iff any applicable assert failed (null = not applicable). */
export function assertsPass(results: AssertResult[]): boolean {
  return results.every((r) => r.pass !== false);
}
