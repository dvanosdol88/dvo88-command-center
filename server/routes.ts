import type { Express, NextFunction, Request, Response } from "express";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { AI_APP_ID } from "../src/config/ai.js";
import { createAiRouter } from "./services/ai-router.js";

const require = createRequire(import.meta.url);

function getAiCoreVersion(): string | null {
  try {
    const resolveFn = (import.meta as any).resolve as ((specifier: string) => string) | undefined;
    const entryUrl = resolveFn ? resolveFn("@dvanosdol88/ai-core") : undefined;
    const entryPath = entryUrl ? fileURLToPath(entryUrl) : require.resolve("@dvanosdol88/ai-core");
    const pkgPath = join(dirname(entryPath), "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

function asyncRoute(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

function withOverallTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  if (!Number.isFinite(ms) || ms <= 0) return p;
  return Promise.race([
    p,
    new Promise<T>((_resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      if (typeof (t as any)?.unref === "function") (t as any).unref();
    }),
  ]);
}

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  provider: z.enum(["gemini", "openai", "anthropic"]).optional(),
});

export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      appId: AI_APP_ID,
      aiCoreVersion: getAiCoreVersion(),
      vercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
      providersConfigured: {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
      },
    });
  });

  app.post(
    "/api/ai/chat",
    asyncRoute(async (req, res) => {
      const startedAt = Date.now();
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.message });
      }

      const router = createAiRouter({ forceProvider: parsed.data.provider });
      const overallTimeoutMs = Number(process.env.AI_CHAT_OVERALL_TIMEOUT_MS || 25000);

      // eslint-disable-next-line no-console
      console.log("[api] /api/ai/chat start");

      const response = await withOverallTimeout(
        router.chat({
          appId: AI_APP_ID,
          messages: parsed.data.messages,
        }),
        overallTimeoutMs,
        "route:/api/ai/chat",
      );

      // eslint-disable-next-line no-console
      console.log(
        `[api] /api/ai/chat ok provider=${response.provider ?? "unknown"} model=${response.model ?? "unknown"} ms=${Date.now() - startedAt}`,
      );

      res.json({ ok: true, response });
    }),
  );

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;
    const status = Number(err?.statusCode || err?.status) || 500;
    const cause = err?.cause as unknown;
    const causeMessage =
      cause instanceof Error
        ? cause.message
        : typeof cause === "string"
          ? cause
          : cause
            ? JSON.stringify(cause)
            : undefined;

    // eslint-disable-next-line no-console
    console.error("[api] unhandled error:", err);

    res.status(status).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      ...(causeMessage ? { cause: causeMessage } : {}),
    });
  });
}
