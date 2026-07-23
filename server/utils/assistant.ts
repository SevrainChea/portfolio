import { streamText, tool } from "ai";
import type { LanguageModel, ModelMessage } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "./prompt";

// The Assistant — the one assembly of the chat persona: system prompt + Actions
// (tools) + step policy, always issued as a single streaming call. Both callers
// cross this one interface: the chat route (an HTTP-stream adapter) and the eval
// harness (a collect adapter), so "what the assistant is" lives in exactly one
// place. The model is a seam the caller fills — this module never touches Nitro
// globals or runtime config, so it stays importable outside Nitro, exactly like
// prompt.ts: the harness imports it directly to grade the real production
// assembly, not a re-built stand-in. See CONTEXT.md ("Assistant", "Action") and
// .scratch/assistant-interface/.

// Resume Action (Phase 0) — the assistant's first tool. It performs no work: it
// returns a constant public URL, and the client adapter (composables/useChat.ts)
// renders it as a link. This exists to de-risk one question — does the prod
// model reliably tool-call? — not because a link is hard. Kept here (not in the
// eval-imported prompt.ts) so the system prompt stays pure. See CONTEXT.md
// ("Action") and the .scratch Phase-0 spec.
const getResume = tool({
  description:
    "Provide a link to Sévrain's CV/resume PDF. Call this ONLY when the visitor " +
    "explicitly asks to see, open, download, or get his CV, resume, or a PDF of " +
    "his background. Do NOT call it for general questions about his experience or " +
    "skills — only on an explicit request for the document itself.",
  inputSchema: z.object({}),
  execute: async () => ({ url: "/cv.pdf" }),
});

// runAssistant — assemble system prompt + Actions + step policy into one
// streaming call and return its result. The caller supplies the concrete model
// (and optionally a retry count); it consumes the result however it needs — the
// route pipes it to a UI-message stream, the eval runner awaits its text and
// Action calls. One assembly, so both cross the same interface.
export function runAssistant(
  messages: ModelMessage[],
  opts: { model: LanguageModel; maxRetries?: number },
) {
  return streamText({
    model: opts.model,
    system: buildSystemPrompt(),
    messages,
    // Single step (no `stopWhen`): the model calls the tool, `execute` returns
    // the URL, and we stop — no second generation to narrate. The adapter turns
    // the tool result into the visible message, so the model needn't speak.
    tools: { getResume },
    maxRetries: opts.maxRetries,
  });
}
