import { ProviderRouter, type AiProvider, type ChatRequest, type ChatResponse } from "@dvanosdol88/ai-core";
import { AI_MODELS, AI_PERSONA, AI_PROVIDER_ORDER, type AiProviderName } from "../../src/config/ai.js";
import { PROJECTS } from "../../src/config/projects.js";
import { AnthropicProvider } from "../providers/anthropic.js";
import { GeminiProvider } from "../providers/gemini.js";
import { OpenAiProvider } from "../providers/openai.js";

function modelFor(name: AiProviderName): string {
  if (name === "gemini") return process.env.GEMINI_MODEL || AI_MODELS.gemini;
  if (name === "openai") return process.env.OPENAI_MODEL || AI_MODELS.openai;
  return process.env.ANTHROPIC_MODEL || AI_MODELS.anthropic;
}

function buildProvidersInOrder(opts?: {
  forceProvider?: AiProviderName;
  systemPromptOverride?: string;
}): AiProvider[] {
  const configured: Partial<Record<AiProviderName, boolean>> = {
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  };

  const systemPrompt = opts?.systemPromptOverride || AI_PERSONA.systemPrompt;
  const order = opts?.forceProvider ? [opts.forceProvider] : AI_PROVIDER_ORDER;
  const providers: AiProvider[] = [];

  for (const name of order) {
    if (!configured[name]) continue;
    const model = modelFor(name);
    if (name === "gemini") providers.push(new GeminiProvider({ model, systemPrompt }));
    if (name === "openai") providers.push(new OpenAiProvider({ model, systemPrompt }));
    if (name === "anthropic") providers.push(new AnthropicProvider({ model, systemPrompt }));
  }

  if (providers.length === 0) {
    providers.push(new LocalFallbackProvider());
  }

  return providers;
}

function statusEmoji(status: string): string {
  if (status === "green") return "🟢";
  if (status === "yellow") return "🟡";
  return "🔴";
}

function buildStatusSummary(): string {
  const lines = PROJECTS.map((project, index) => {
    return `${index + 1}. ${project.name} ${statusEmoji(project.status)} - Phase: ${project.phase}`;
  });
  return `Current portfolio status:\n${lines.join("\n")}`;
}

function buildPrioritySummary(): string {
  const lines = PROJECTS.map((project) => {
    const next = project.nextSteps[0] ?? "No next step defined";
    return `- ${project.name}: ${next}`;
  });
  return `Suggested next actions by project:\n${lines.join("\n")}`;
}

class LocalFallbackProvider implements AiProvider {
  readonly name = "local";

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const userMessage = [...req.messages]
      .reverse()
      .find((message) => message.role === "user")
      ?.content.trim()
      .toLowerCase();

    let content = "I can summarize project status, priorities, and next steps from the current portfolio config.";
    if (userMessage) {
      if (userMessage.includes("status") || userMessage.includes("summary") || userMessage.includes("summar")) {
        content = buildStatusSummary();
      } else if (userMessage.includes("next") || userMessage.includes("priority") || userMessage.includes("work on")) {
        content = buildPrioritySummary();
      }
    }

    return {
      message: {
        role: "assistant",
        content,
      },
      model: "local-fallback",
    };
  }
}

export function createAiRouter(opts?: {
  forceProvider?: AiProviderName;
  systemPromptOverride?: string;
  systemPromptExtra?: string;
}) {
  const systemPromptOverride =
    opts?.systemPromptOverride ??
    AI_PERSONA.systemPrompt + (opts?.systemPromptExtra ? `\n\n${opts.systemPromptExtra}` : "");

  return new ProviderRouter(buildProvidersInOrder({ ...opts, systemPromptOverride }), {
    providerTimeoutMs: {
      gemini: Number(process.env.AI_TIMEOUT_GEMINI_MS || 8000),
      openai: Number(process.env.AI_TIMEOUT_OPENAI_MS || 9000),
      anthropic: Number(process.env.AI_TIMEOUT_ANTHROPIC_MS || 9000),
    },
    debug: true,
  });
}
