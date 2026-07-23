import { convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

// Chat endpoint — the HTTP-stream adapter over the Assistant
// (server/utils/assistant.ts). It replaces the standalone Python FastAPI backend
// (ADR-0002) and does only adapter work: parse the body, resolve the Provider
// from runtime config (getModel), convert the UI message history to model
// messages, hand them to runAssistant, and pipe the streamed result back as a
// UI-message stream (riding the model label along as metadata). The assistant
// assembly — system prompt, Actions, single-step policy — lives behind
// runAssistant, not here. `getModel` and `runAssistant` are auto-imported from
// server/utils.
export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{ messages: UIMessage[] }>(event);
  const { model, modelId } = getModel(event);

  const result = runAssistant(await convertToModelMessages(messages), {
    model,
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
