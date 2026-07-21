import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider-v2";
import type { LanguageModel } from "ai";
import type { H3Event } from "h3";

// Provider factory — the TypeScript port of the Python `LLMProvider` abstraction
// (chatbot-backend/app/services/llm_service.py). Selects a model from the
// `LLM_PROVIDER` env var and reuses the same env names for config parity.
// `modelId` mirrors the old `get_model_name()` label ("{provider}/{model}") so
// the UI can keep showing which model answered.
export function getModel(event?: H3Event): {
  model: LanguageModel;
  modelId: string;
} {
  const config = useRuntimeConfig(event);
  const provider = config.llmProvider;

  switch (provider) {
    case "groq": {
      const groq = createGroq({ apiKey: config.groqApiKey });
      return {
        model: groq(config.groqModel),
        modelId: `groq/${config.groqModel}`,
      };
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey: config.geminiApiKey });
      return {
        model: google(config.geminiModel),
        modelId: `gemini/${config.geminiModel}`,
      };
    }
    case "ollama": {
      // ollama-ai-provider-v2 expects the base URL to include the `/api` path;
      // OLLAMA_BASE_URL keeps the host-only form the Python client used.
      const ollama = createOllama({ baseURL: `${config.ollamaBaseUrl}/api` });
      return {
        model: ollama(config.ollamaModel),
        modelId: `ollama/${config.ollamaModel}`,
      };
    }
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
