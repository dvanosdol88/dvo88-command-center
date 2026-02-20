import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourcesPath = path.join(repoRoot, "src/config/projectUpdateSources.json");
const overridesPath = path.join(
  repoRoot,
  "src/config/projectLastUpdatedOverrides.json",
);
const dryRun = process.env.DRY_RUN === "1";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJsonFile(filePath) {
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

async function loadExistingOverrides() {
  if (!existsSync(overridesPath)) {
    return { updatedAt: null, overrides: {} };
  }

  try {
    const data = await readJsonFile(overridesPath);
    return {
      updatedAt: isNonEmptyString(data?.updatedAt) ? data.updatedAt : null,
      overrides:
        data && typeof data.overrides === "object" && !Array.isArray(data.overrides)
          ? data.overrides
          : {},
    };
  } catch (error) {
    console.warn(
      `[warn] Failed to parse existing overrides at ${overridesPath}. Starting from empty overrides. ${error.message}`,
    );
    return { updatedAt: null, overrides: {} };
  }
}

async function fetchLatestCommitTimestamp(githubRepo, token) {
  const commitsUrl = `https://api.github.com/repos/${githubRepo}/commits?per_page=1`;
  const response = await fetch(commitsUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "dvo88-project-last-updated-sync",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub API ${response.status} ${response.statusText} for ${githubRepo}: ${errorBody.slice(0, 200)}`,
    );
  }

  const commits = await response.json();
  if (!Array.isArray(commits) || commits.length === 0) {
    throw new Error(`No commits returned for ${githubRepo}`);
  }

  const timestamp =
    commits[0]?.commit?.committer?.date ?? commits[0]?.commit?.author?.date;
  if (!isNonEmptyString(timestamp)) {
    throw new Error(`Missing commit date for ${githubRepo}`);
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid commit date for ${githubRepo}: ${timestamp}`);
  }

  return parsed.toISOString();
}

async function main() {
  const token = process.env.GITHUB_TOKEN;

  const config = await readJsonFile(sourcesPath);
  const sources = Array.isArray(config?.sources) ? config.sources : [];

  if (sources.length === 0) {
    console.error(`[error] No update sources configured in ${sourcesPath}`);
    process.exitCode = 1;
    return;
  }

  const invalidSource = sources.find(
    (source) =>
      !isNonEmptyString(source?.slug) || !isNonEmptyString(source?.githubRepo),
  );

  if (invalidSource) {
    console.error(
      `[error] Invalid source entry found: ${JSON.stringify(invalidSource)}`,
    );
    process.exitCode = 1;
    return;
  }

  const existing = await loadExistingOverrides();
  const nextOverrides = { ...existing.overrides };

  let successCount = 0;
  let failureCount = 0;
  let changedCount = 0;

  for (const source of sources) {
    try {
      if (!isNonEmptyString(token)) {
        throw new Error("GITHUB_TOKEN is not set");
      }

      const timestamp = await fetchLatestCommitTimestamp(source.githubRepo, token);
      if (nextOverrides[source.slug] !== timestamp) {
        changedCount += 1;
      }
      nextOverrides[source.slug] = timestamp;
      successCount += 1;
      console.log(`[ok] ${source.slug} <- ${source.githubRepo} (${timestamp})`);
    } catch (error) {
      failureCount += 1;
      const retained = isNonEmptyString(nextOverrides[source.slug])
        ? ` Retaining existing value ${nextOverrides[source.slug]}.`
        : "";
      console.warn(
        `[warn] Failed to sync ${source.slug} from ${source.githubRepo}: ${error.message}.${retained}`,
      );
    }
  }

  const output = {
    updatedAt:
      changedCount > 0
        ? new Date().toISOString()
        : existing.updatedAt ?? new Date().toISOString(),
    overrides: nextOverrides,
  };

  if (dryRun) {
    console.log("[dry-run] Computed overrides payload:");
    console.log(JSON.stringify(output, null, 2));
  } else {
    await writeFile(overridesPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(`[write] Updated ${overridesPath}`);
  }

  if (failureCount === sources.length) {
    console.error("[error] Sync failed for all configured repositories.");
    process.exitCode = 1;
    return;
  }

  console.log(
    `[done] Synced ${successCount}/${sources.length} repositories (${failureCount} warnings).`,
  );
}

main().catch((error) => {
  console.error(`[error] Unhandled sync failure: ${error.message}`);
  process.exitCode = 1;
});
