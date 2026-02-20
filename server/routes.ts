import type { Express, NextFunction, Request, Response } from "express";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { AI_APP_ID } from "../src/config/ai.js";
import {
  PROJECT_CHAT_ACTIONS,
  type ProjectChatActionProposal,
  type ProjectChatPageContext,
} from "../src/config/projectChat.js";
import { createAiRouter } from "./services/ai-router.js";
import {
  maybeCreateProjectActionProposal,
  resolveProjectActionProposal,
} from "./services/project-chat-actions.js";
import {
  applyGithubPushWebhookUpdate,
  getProjectLastUpdatedSnapshot,
  verifyGithubWebhookSignature,
} from "./services/project-last-updated.js";
import { getProviderHealthSnapshot } from "./services/provider-health.js";
import { buildProjectSystemPrompt } from "./services/project-context.js";

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
  context: z.enum(["vendors", "projects"]).optional(),
  sessionId: z.string().min(8).max(120).optional(),
  projectPageContext: z
    .object({
      route: z.string().min(1).max(200),
      view: z.enum([
        "command_center_dashboard",
        "project_detail",
        "legacy_project_dashboard",
        "unknown",
      ]),
      selectedProject: z
        .object({
          slug: z.string().min(1),
          name: z.string().min(1),
          status: z.enum(["green", "yellow", "red"]),
          phase: z.enum(["discovery", "build", "hardening", "launch", "maintenance", "paused"]),
        })
        .nullable(),
      visibleProjects: z
        .array(
          z.object({
            slug: z.string().min(1),
            name: z.string().min(1),
            status: z.enum(["green", "yellow", "red"]),
            phase: z.enum(["discovery", "build", "hardening", "launch", "maintenance", "paused"]),
          }),
        )
        .max(20),
      visibleProjectsSummary: z.string().min(1).max(1000),
    })
    .optional(),
});

const actionConfirmSchema = z.object({
  sessionId: z.string().min(8).max(120),
  proposalId: z.string().min(8).max(120),
  proposal: z
    .discriminatedUnion("action", [
      z.object({
        id: z.string().min(8).max(120),
        action: z.literal(PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT),
        title: z.string().min(1).max(240),
        reason: z.string().min(1).max(1000),
        requiresConfirmation: z.boolean(),
        destructive: z.boolean(),
        createdAt: z.string().min(1).max(80),
        payload: z.object({
          projectSlug: z.string().min(1),
          projectName: z.string().min(1),
          route: z.string().min(1).max(200),
        }),
      }),
      z.object({
        id: z.string().min(8).max(120),
        action: z.literal(PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS),
        title: z.string().min(1).max(240),
        reason: z.string().min(1).max(1000),
        requiresConfirmation: z.boolean(),
        destructive: z.boolean(),
        createdAt: z.string().min(1).max(80),
        payload: z.object({
          projectSlug: z.string().min(1),
          projectName: z.string().min(1),
          note: z.string().min(1).max(240),
        }),
      }),
    ])
    .optional(),
  decision: z.enum(["confirm", "reject"]),
  expectedAction: z
    .enum([
      PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT,
      PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS,
    ])
    .optional(),
  idempotencyKey: z.string().min(8).max(120),
});

export function registerRoutes(app: Express) {
  app.get("/api/health", asyncRoute(async (req, res) => {
    const refreshFlag = String(req.query.refresh ?? "").toLowerCase();
    const forceRefresh = refreshFlag === "1" || refreshFlag === "true" || refreshFlag === "yes";
    const aiProviders = await getProviderHealthSnapshot({ forceRefresh });

    res.json({
      status: "ok",
      appId: AI_APP_ID,
      aiCoreVersion: getAiCoreVersion(),
      vercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
      aiProviders,
      providersConfigured: {
        gemini: aiProviders.providers.gemini.configured,
        openai: aiProviders.providers.openai.configured,
        anthropic: aiProviders.providers.anthropic.configured,
      },
    });
  }));

  app.get("/api/projects/last-updated", (_req, res) => {
    res.json({
      ok: true,
      data: getProjectLastUpdatedSnapshot(),
    });
  });

  app.post(
    "/api/projects/github-webhook",
    asyncRoute(async (req, res) => {
      const signatureHeader = req.header("x-hub-signature-256") ?? undefined;
      const eventName = (req.header("x-github-event") ?? "").toLowerCase();
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

      const signatureValid = verifyGithubWebhookSignature(rawBody, signatureHeader, secret);
      if (!signatureValid) {
        return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
      }

      if (eventName === "ping") {
        return res.json({ ok: true, event: "ping", acknowledgedAt: new Date().toISOString() });
      }

      if (eventName !== "push") {
        return res.status(202).json({
          ok: true,
          ignored: true,
          reason: "unsupported_event",
          event: eventName || "unknown",
        });
      }

      const result = applyGithubPushWebhookUpdate(req.body as any);
      if (!result.updated) {
        return res.status(202).json({
          ok: true,
          ignored: true,
          ...result,
        });
      }

      return res.json({
        ok: true,
        result,
        data: getProjectLastUpdatedSnapshot(),
      });
    }),
  );

  app.post(
    "/api/ai/chat",
    asyncRoute(async (req, res) => {
      const startedAt = Date.now();
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.message });
      }
      const lastUserMessage = [...parsed.data.messages]
        .reverse()
        .find((message) => message.role === "user")
        ?.content.trim();

      if (parsed.data.context === "projects" && parsed.data.sessionId && lastUserMessage) {
        const proposal = maybeCreateProjectActionProposal({
          sessionId: parsed.data.sessionId,
          userMessage: lastUserMessage,
          pageContext: parsed.data.projectPageContext as ProjectChatPageContext | undefined,
        });

        if (proposal) {
          return res.json({
            ok: true,
            response: {
              message: {
                role: "assistant",
                content: proposal.assistantText,
              },
              provider: "project-action-registry",
              model: "action-proposal",
            },
            chatResult: {
              kind: "action_proposal",
              assistantText: proposal.assistantText,
              actionProposal: proposal.proposal,
            },
          });
        }
      }

      const systemPromptExtra =
        parsed.data.context === "projects" ? buildProjectSystemPrompt() : undefined;

      const router = createAiRouter({
        forceProvider: parsed.data.provider,
        systemPromptExtra,
      });
      const overallTimeoutMs = Number(process.env.AI_CHAT_OVERALL_TIMEOUT_MS || 25000);

      // eslint-disable-next-line no-console
      console.log("[api] /api/ai/chat start");

      const response = await withOverallTimeout(
        router.chat({
          appId: AI_APP_ID,
          messages: parsed.data.messages as any,
        }),
        overallTimeoutMs,
        "route:/api/ai/chat",
      );

      // eslint-disable-next-line no-console
      console.log(
        `[api] /api/ai/chat ok provider=${response.provider ?? "unknown"} model=${response.model ?? "unknown"} ms=${Date.now() - startedAt}`,
      );

      res.json({
        ok: true,
        response,
        chatResult: {
          kind: "assistant",
          assistantText: response.message.content,
        },
      });
    }),
  );

  app.post(
    "/api/ai/chat/action/confirm",
    asyncRoute(async (req, res) => {
      const parsed = actionConfirmSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.message });
      }

      const actionResult = resolveProjectActionProposal({
        sessionId: parsed.data.sessionId,
        proposalId: parsed.data.proposalId,
        proposal: parsed.data.proposal as ProjectChatActionProposal | undefined,
        decision: parsed.data.decision,
        expectedAction: parsed.data.expectedAction,
        idempotencyKey: parsed.data.idempotencyKey,
      });
      res.json({
        ok: true,
        actionResult,
      });
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
