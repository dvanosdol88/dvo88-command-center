import { createHmac, timingSafeEqual } from "node:crypto";
import { AI_APP_ID } from "../../src/config/ai.js";
import { createAiRouter } from "./ai-router.js";

/* ── Types ── */

export type TriageSeverity = "critical" | "high" | "medium" | "low";

export interface TriageResult {
  severity: TriageSeverity;
  impact: string;
  rootCause: string;
  suggestedFix: string;
  affectedProject: string;
}

export interface TriagedEvent {
  id: string;
  receivedAt: string;
  sentryEventId: string;
  sentryIssueId: string;
  title: string;
  culprit: string;
  level: string;
  firstSeen: string;
  permalink: string;
  platform: string;
  rawPayload: unknown;
  triage: TriageResult | null;
  triageError: string | null;
  triageDurationMs: number | null;
  status: "triaged" | "error" | "pending";
}

/* ── In-memory event store ── */

const MAX_EVENTS = 50;
const events = new Map<string, TriagedEvent>();

function evictOldest() {
  if (events.size <= MAX_EVENTS) return;
  // Map preserves insertion order — delete the first (oldest) key
  const oldest = events.keys().next().value;
  if (oldest) events.delete(oldest);
}

export function getStoredEvents(): TriagedEvent[] {
  return Array.from(events.values()).sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}

/* ── Webhook signature verification ── */

export function verifySentryWebhookSignature(
  rawBody: Buffer | undefined,
  signatureHeader: string | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return true; // No secret configured → skip (dev convenience)
  if (!rawBody || !signatureHeader) return false;

  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = Buffer.from(signatureHeader, "hex");
  const expected = Buffer.from(expectedHex, "hex");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/* ── AI triage ── */

const TRIAGE_PROMPT = `You are a Sentry error triage agent. You analyze error events and produce a structured triage assessment.

Given an error event, respond with ONLY a JSON object (no markdown fences, no explanation):
{
  "severity": "critical" | "high" | "medium" | "low",
  "impact": "<one sentence describing user/business impact>",
  "rootCause": "<one sentence identifying the likely root cause>",
  "suggestedFix": "<one sentence suggesting the fix>",
  "affectedProject": "<project or service name if identifiable, otherwise 'unknown'>"
}

Severity guidelines:
- critical: data loss, security breach, entire service down, payment failures
- high: major feature broken, many users affected, degraded performance
- medium: minor feature broken, workaround exists, limited user impact
- low: cosmetic issue, edge case, development/test environment only`;

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

async function triageWithAi(event: {
  title: string;
  culprit: string;
  level: string;
  platform: string;
}): Promise<TriageResult> {
  const router = createAiRouter({ systemPromptOverride: TRIAGE_PROMPT });

  const userMessage = [
    `Error title: ${event.title}`,
    `Culprit: ${event.culprit}`,
    `Level: ${event.level}`,
    `Platform: ${event.platform}`,
  ].join("\n");

  const response = await router.chat({
    appId: AI_APP_ID,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = stripCodeFences(response.message.content);
  const parsed = JSON.parse(raw) as TriageResult;

  // Validate severity is one of the expected values
  const validSeverities: TriageSeverity[] = ["critical", "high", "medium", "low"];
  if (!validSeverities.includes(parsed.severity)) {
    parsed.severity = "medium";
  }

  return parsed;
}

/* ── Process webhook event ── */

interface SentryWebhookPayload {
  action?: string;
  data?: {
    issue?: {
      id?: string;
      title?: string;
      culprit?: string;
      level?: string;
      firstSeen?: string;
      permalink?: string;
      platform?: string;
    };
  };
}

export async function processWebhookEvent(
  payload: SentryWebhookPayload,
): Promise<TriagedEvent> {
  const issue = payload.data?.issue;
  const sentryIssueId = String(issue?.id ?? "unknown");

  // Deduplicate by sentryIssueId (handle Sentry retries)
  const existing = events.get(sentryIssueId);
  if (existing) return existing;

  const event: TriagedEvent = {
    id: `sentry-${sentryIssueId}-${Date.now()}`,
    receivedAt: new Date().toISOString(),
    sentryEventId: sentryIssueId,
    sentryIssueId,
    title: issue?.title ?? "Unknown error",
    culprit: issue?.culprit ?? "unknown",
    level: issue?.level ?? "error",
    firstSeen: issue?.firstSeen ?? new Date().toISOString(),
    permalink: issue?.permalink ?? "",
    platform: issue?.platform ?? "unknown",
    rawPayload: payload,
    triage: null,
    triageError: null,
    triageDurationMs: null,
    status: "pending",
  };

  // Run AI triage inline
  const triageStart = Date.now();
  try {
    event.triage = await triageWithAi({
      title: event.title,
      culprit: event.culprit,
      level: event.level,
      platform: event.platform,
    });
    event.status = "triaged";
  } catch (err) {
    event.triageError = err instanceof Error ? err.message : String(err);
    event.status = "error";
  }
  event.triageDurationMs = Date.now() - triageStart;

  // Store and evict
  events.set(sentryIssueId, event);
  evictOldest();

  return event;
}
