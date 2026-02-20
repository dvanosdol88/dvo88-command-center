import { existsSync, readFileSync } from "node:fs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PROJECTS } from "../../src/config/projects.js";

interface ProjectUpdateSource {
  slug: string;
  githubRepo: string;
}

interface ProjectUpdateSourcesFile {
  sources: ProjectUpdateSource[];
}

interface ProjectLastUpdatedOverridesFile {
  updatedAt: string;
  overrides: Record<string, string>;
}

interface GithubPushPayload {
  repository?: {
    full_name?: string;
    pushed_at?: number;
  };
  head_commit?: {
    timestamp?: string;
    id?: string;
  };
}

const currentFilePath = fileURLToPath(import.meta.url);
const serverDir = dirname(dirname(currentFilePath));
const repoRoot = dirname(serverDir);
const updateSourcesPath = resolve(repoRoot, "src", "config", "projectUpdateSources.json");
const overridesPath = resolve(repoRoot, "src", "config", "projectLastUpdatedOverrides.json");

const runtimeOverrides = new Map<string, string>();

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function normalizeIsoTimestamp(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function readUpdateSources(): ProjectUpdateSource[] {
  const parsed = readJsonFile<ProjectUpdateSourcesFile>(updateSourcesPath);
  if (!parsed || !Array.isArray(parsed.sources)) return [];
  return parsed.sources.filter(
    (source) =>
      typeof source.slug === "string" &&
      source.slug.length > 0 &&
      typeof source.githubRepo === "string" &&
      source.githubRepo.length > 0,
  );
}

function readDiskOverrides(): Record<string, string> {
  const parsed = readJsonFile<ProjectLastUpdatedOverridesFile>(overridesPath);
  if (!parsed || typeof parsed !== "object" || typeof parsed.overrides !== "object") {
    return {};
  }

  const cleanOverrides: Record<string, string> = {};
  for (const [slug, timestamp] of Object.entries(parsed.overrides)) {
    const normalized = normalizeIsoTimestamp(timestamp);
    if (normalized) cleanOverrides[slug] = normalized;
  }
  return cleanOverrides;
}

export function getProjectLastUpdatedSnapshot() {
  const base: Record<string, string> = {};
  for (const project of PROJECTS) {
    base[project.slug] = project.lastUpdated;
  }

  const diskOverrides = readDiskOverrides();
  const memoryOverrides = Object.fromEntries(runtimeOverrides.entries());

  return {
    updatedAt: new Date().toISOString(),
    overrides: {
      ...base,
      ...diskOverrides,
      ...memoryOverrides,
    },
    runtimeCount: runtimeOverrides.size,
  };
}

function resolveSlugForRepo(repoFullName: string | undefined): string | null {
  if (!repoFullName) return null;
  const target = repoFullName.trim().toLowerCase();
  if (!target) return null;

  const match = readUpdateSources().find((source) => source.githubRepo.toLowerCase() === target);
  return match ? match.slug : null;
}

export function verifyGithubWebhookSignature(
  rawBody: Buffer | undefined,
  signatureHeader: string | undefined,
  secret: string | undefined,
) {
  if (!secret) return true;
  if (!rawBody || !signatureHeader) return false;
  if (!signatureHeader.startsWith("sha256=")) return false;

  const providedHex = signatureHeader.slice("sha256=".length);
  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = Buffer.from(providedHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export function applyGithubPushWebhookUpdate(payload: GithubPushPayload) {
  const repoFullName = payload.repository?.full_name;
  const slug = resolveSlugForRepo(repoFullName);
  if (!slug) {
    return {
      updated: false as const,
      reason: "unmapped_repo",
      repo: repoFullName ?? null,
    };
  }

  const commitTimestamp = normalizeIsoTimestamp(payload.head_commit?.timestamp);
  const pushedAtTimestamp =
    typeof payload.repository?.pushed_at === "number"
      ? new Date(payload.repository.pushed_at * 1000).toISOString()
      : null;
  const effectiveTimestamp = commitTimestamp ?? pushedAtTimestamp ?? new Date().toISOString();

  runtimeOverrides.set(slug, effectiveTimestamp);

  return {
    updated: true as const,
    slug,
    repo: repoFullName,
    timestamp: effectiveTimestamp,
    commitId: payload.head_commit?.id ?? null,
  };
}
