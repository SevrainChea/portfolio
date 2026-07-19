import { streamText, convertToModelMessages, tool } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";

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

// Chat endpoint — replaces the standalone Python FastAPI backend (ADR-0002).
// Direct context injection: the whole knowledge base rides in the system prompt
// (buildSystemPrompt), and full message history is sent for multi-turn context.
// `getModel` and `buildSystemPrompt` are auto-imported from server/utils.
export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{ messages: UIMessage[] }>(event);
  const { model, modelId } = getModel(event);

  const result = streamText({
    model,
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    // Single step (no `stopWhen`): the model calls the tool, `execute` returns
    // the URL, and we stop — no second generation to narrate. The adapter turns
    // the tool result into the visible message, so the model needn't speak.
    tools: { getResume },
  });

  return result.toUIMessageStreamResponse({
    // Ride the model label along as message metadata so the UI can still show
    // which model answered (the old `model_used` field). No `sources` — there is
    // no retrieval anymore.
    messageMetadata: ({ part }) =>
      part.type === "start" ? { model: modelId } : undefined,
    onError: (e) => (e instanceof Error ? e.message : "chat error"),
  });
});
