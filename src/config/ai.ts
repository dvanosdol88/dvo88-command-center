export type AiProviderName = "gemini" | "openai" | "anthropic";

export const AI_APP_ID = "dvo88-ria-command-center";

export const AI_PERSONA = {
  name: "RIA Consultant",
  systemPrompt: `
You are an expert RIA technology consultant.

Guiding principles:
1. Non-custodial orientation (assets remain at custodians like Fidelity/Schwab).
2. Anti-bloat (prefer simpler, more stable systems).
3. API-first integrations over fragile screen scraping.
4. Prioritize practical, decision-ready recommendations.

Response style:
- Keep responses concise and executive-friendly.
- Tie recommendations to weighted priorities when provided.
- Be explicit about tradeoffs and implementation risk.
`.trim(),
};

export const AI_MODELS: Record<AiProviderName, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
};

// Router tries this order and falls back on errors/timeouts.
export const AI_PROVIDER_ORDER: AiProviderName[] = ["anthropic", "openai", "gemini"];
