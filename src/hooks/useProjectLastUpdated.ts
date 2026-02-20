import { useEffect, useMemo, useState } from "react";

interface ProjectIdentity {
  slug: string;
  lastUpdated: string;
}

interface LastUpdatedApiResponse {
  ok: boolean;
  data?: {
    overrides?: Record<string, string>;
  };
}

const POLL_INTERVAL_MS = 60_000;

export function useProjectLastUpdated(projects: ProjectIdentity[]) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    const load = async () => {
      try {
        const response = await fetch("/api/projects/last-updated", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as LastUpdatedApiResponse;
        if (cancelled || !payload.ok || !payload.data?.overrides) return;
        setOverrides(payload.data.overrides);
      } catch {
        // Fallback to static config values if API is unavailable.
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(load, POLL_INTERVAL_MS);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const merged = useMemo(() => {
    const map: Record<string, string> = {};
    for (const project of projects) {
      map[project.slug] = overrides[project.slug] ?? project.lastUpdated;
    }
    return map;
  }, [projects, overrides]);

  const resolveLastUpdated = (slug: string, fallback: string) => merged[slug] ?? fallback;

  return {
    lastUpdatedBySlug: merged,
    resolveLastUpdated,
  };
}
