import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { AI_MODELS, type AiProviderName } from "../../src/config/ai.js";

type ProviderHealthStatus = "green" | "red";

interface ProviderHealthInfo {
  provider: AiProviderName;
  displayName: string;
  envVar: string;
  configured: boolean;
  isLive: boolean;
  status: ProviderHealthStatus;
  reason: string;
  model: string;
  latencyMs: number | null;
  checkedAt: string;
}

export interface ProviderHealthSnapshot {
  status: ProviderHealthStatus;
  checkedAt: string;
  cacheTtlMs: number;
  providers: Record<AiProviderName, ProviderHealthInfo>;
}

const PROVIDER_METADATA: Record<
  AiProviderName,
  { displayName: string; envVar: string; probe: (model: string) => Promise<void> }
> = {
  openai: {
    displayName: "OpenAI",
    envVar: "OPENAI_API_KEY",
    probe: async (model) => {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
      await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: "health check" }],
        max_tokens: 1,
        temperature: 0,
      });
    },
  },
  anthropic: {
    displayName: "Anthropic",
    envVar: "ANTHROPIC_API_KEY",
    probe: async (model) => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
      await client.messages.create({
        model,
        system: "health check",
        messages: [{ role: "user", content: "health check" }],
        max_tokens: 1,
        temperature: 0,
      });
    },
  },
  gemini: {
    displayName: "Gemini",
    envVar: "GEMINI_API_KEY",
    probe: async (model) => {
      const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: "health check" }] }],
        config: { maxOutputTokens: 1 },
      });
    },
  },
};

const PROVIDER_ORDER: AiProviderName[] = ["openai", "anthropic", "gemini"];
const PROVIDER_HEALTH_TIMEOUT_MS = Number(process.env.AI_PROVIDER_HEALTH_TIMEOUT_MS || 10000);
const PROVIDER_HEALTH_CACHE_MS = Number(process.env.AI_PROVIDER_HEALTH_CACHE_MS || 45000);

let cachedSnapshot: ProviderHealthSnapshot | null = null;
let cacheExpiresAt = 0;
let inFlight: Promise<ProviderHealthSnapshot> | null = null;

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error during provider health check";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      if (typeof (t as any)?.unref === "function") (t as any).unref();
    }),
  ]);
}

async function checkSingleProvider(name: AiProviderName): Promise<ProviderHealthInfo> {
  const meta = PROVIDER_METADATA[name];
  const model = AI_MODELS[name];
  const configured = Boolean(process.env[meta.envVar]);
  const checkedAt = new Date().toISOString();

  if (!configured) {
    return {
      provider: name,
      displayName: meta.displayName,
      envVar: meta.envVar,
      configured: false,
      isLive: false,
      status: "red",
      reason: `Missing ${meta.envVar}`,
      model,
      latencyMs: null,
      checkedAt,
    };
  }

  const startedAt = Date.now();
  try {
    await withTimeout(meta.probe(model), PROVIDER_HEALTH_TIMEOUT_MS, `${meta.displayName} probe`);
    return {
      provider: name,
      displayName: meta.displayName,
      envVar: meta.envVar,
      configured: true,
      isLive: true,
      status: "green",
      reason: "Connection live",
      model,
      latencyMs: Date.now() - startedAt,
      checkedAt,
    };
  } catch (err) {
    return {
      provider: name,
      displayName: meta.displayName,
      envVar: meta.envVar,
      configured: true,
      isLive: false,
      status: "red",
      reason: errorMessage(err),
      model,
      latencyMs: Date.now() - startedAt,
      checkedAt,
    };
  }
}

async function computeSnapshot(): Promise<ProviderHealthSnapshot> {
  const now = new Date().toISOString();
  const checks = await Promise.all(PROVIDER_ORDER.map((provider) => checkSingleProvider(provider)));
  const providers = checks.reduce<Record<AiProviderName, ProviderHealthInfo>>((acc, item) => {
    acc[item.provider] = item;
    return acc;
  }, {} as Record<AiProviderName, ProviderHealthInfo>);

  const anyFailing = checks.some((provider) => provider.status === "red");
  return {
    status: anyFailing ? "red" : "green",
    checkedAt: now,
    cacheTtlMs: PROVIDER_HEALTH_CACHE_MS,
    providers,
  };
}

export async function getProviderHealthSnapshot(opts?: {
  forceRefresh?: boolean;
}): Promise<ProviderHealthSnapshot> {
  const now = Date.now();
  if (!opts?.forceRefresh && cachedSnapshot && now < cacheExpiresAt) {
    return cachedSnapshot;
  }

  if (inFlight) return inFlight;

  inFlight = computeSnapshot()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cacheExpiresAt = Date.now() + PROVIDER_HEALTH_CACHE_MS;
      return snapshot;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
