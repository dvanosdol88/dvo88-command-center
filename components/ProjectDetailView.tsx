import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectBySlug, ProjectStatus } from "../src/config/projects";
import ProjectChatDrawer from "./ProjectChatDrawer";
import { ArrowLeft, ExternalLink } from "lucide-react";

const statusDot: Record<ProjectStatus, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
};

const statusBadge: Record<ProjectStatus, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
};

const formatPhase = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

const formatDate = (d: string, withYear = true) => {
  const [y, m, day] = d.split("-").map(Number);
  const parsed = new Date(y, m - 1, day);
  if (isNaN(parsed.getTime())) return d;
  const opts: Intl.DateTimeFormatOptions = withYear
    ? { month: "short", day: "numeric", year: "numeric" }
    : { month: "short", day: "numeric" };
  return parsed.toLocaleDateString("en-US", opts);
};

const AI_PROVIDER_ORDER = ["openai", "anthropic", "gemini"] as const;
type AiProviderName = (typeof AI_PROVIDER_ORDER)[number];

interface AiProviderHealthEntry {
  provider: AiProviderName;
  displayName: string;
  configured: boolean;
  isLive: boolean;
  status: "green" | "red";
  reason: string;
  model: string;
  latencyMs: number | null;
  checkedAt: string;
}

interface AiProviderHealthPayload {
  status: "green" | "red";
  checkedAt: string;
  cacheTtlMs: number;
  providers: Record<AiProviderName, AiProviderHealthEntry>;
}

interface HealthApiResponse {
  aiProviders?: AiProviderHealthPayload;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* Card wrapper for consistent styling */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-6 ${className}`}>
    {children}
  </section>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-bold text-white mb-4">{children}</h2>
);

const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const isAiCoreProject = project?.slug === "ai-core";
  const [providerHealth, setProviderHealth] = useState<AiProviderHealthPayload | null>(null);
  const [providerHealthError, setProviderHealthError] = useState<string | null>(null);
  const [loadingProviderHealth, setLoadingProviderHealth] = useState(false);

  useEffect(() => {
    if (!isAiCoreProject) {
      setProviderHealth(null);
      setProviderHealthError(null);
      setLoadingProviderHealth(false);
      return;
    }

    let cancelled = false;

    const loadProviderHealth = async () => {
      setLoadingProviderHealth(true);
      try {
        const response = await fetch("/api/health", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Health endpoint returned HTTP ${response.status}`);
        }

        const payload = (await response.json()) as HealthApiResponse;
        if (!payload.aiProviders?.providers) {
          throw new Error("Health payload missing provider diagnostics");
        }

        if (!cancelled) {
          setProviderHealth(payload.aiProviders);
          setProviderHealthError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setProviderHealthError(error instanceof Error ? error.message : "Unknown provider health error");
        }
      } finally {
        if (!cancelled) {
          setLoadingProviderHealth(false);
        }
      }
    };

    loadProviderHealth();
    const intervalId = window.setInterval(loadProviderHealth, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isAiCoreProject]);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-white mb-4">Project not found</h1>
        <Link to="/" className="text-lime-500 hover:text-lime-400 text-sm font-semibold">
          <ArrowLeft size={14} className="inline mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-lime-500 hover:text-lime-400 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-lime-500 hover:text-lime-400 transition-colors">
            Visit Site <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-4 h-4 rounded-full ${statusDot[project.status]}`} />
          <h1 className="text-3xl font-extrabold text-white">{project.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge[project.status]}`}>
            {formatPhase(project.status)}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300">
            Phase: {formatPhase(project.phase)}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300">
            Security: {formatPhase(project.securityStatus)}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-400">
            Updated {formatDate(project.lastUpdated)}
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
      </Card>

      {isAiCoreProject && (
        <Card className="mb-6">
          <SectionTitle>AI Provider Health</SectionTitle>
          <p className="text-xs text-slate-500 mb-4">
            Live diagnostics from <code>/api/health</code>. Auto-refreshes every 60 seconds.
          </p>

          {providerHealthError && (
            <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
              Unable to load provider health: {providerHealthError}
            </div>
          )}

          {loadingProviderHealth && !providerHealth ? (
            <p className="text-sm text-slate-400">Running provider connectivity probes...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AI_PROVIDER_ORDER.map((providerName) => {
                const provider = providerHealth?.providers?.[providerName];
                const isGreen = provider?.status === "green";
                const lightLabel = isGreen ? "GREEN LIGHT" : "RED LIGHT";
                const reason = provider?.reason ?? "No provider health data available yet";

                return (
                  <div
                    key={providerName}
                    className={`rounded-xl border p-4 ${
                      isGreen ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-14 w-14 shrink-0 rounded-full ${
                          isGreen
                            ? "bg-emerald-500 shadow-[0_0_26px_rgba(16,185,129,0.85)]"
                            : "bg-red-500 shadow-[0_0_26px_rgba(239,68,68,0.85)]"
                        }`}
                      />
                      <div>
                        <p className={`text-lg font-extrabold tracking-wide ${isGreen ? "text-emerald-200" : "text-red-200"}`}>
                          {lightLabel}
                        </p>
                        <p className="text-sm font-semibold text-white">{provider?.displayName ?? providerName}</p>
                      </div>
                    </div>

                    <p className={`mt-3 text-sm ${isGreen ? "text-emerald-100" : "text-red-100"}`}>{reason}</p>
                    <p className="mt-2 text-xs text-slate-300">Model: {provider?.model ?? "n/a"}</p>
                    {typeof provider?.latencyMs === "number" && (
                      <p className="text-xs text-slate-300">Latency: {provider.latencyMs}ms</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {providerHealth && (
            <p className="mt-4 text-xs text-slate-500">Last checked: {formatDateTime(providerHealth.checkedAt)}</p>
          )}
        </Card>
      )}

      {/* Tech Stack */}
      <Card className="mb-6">
        <SectionTitle>Tech Stack</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-sm font-medium text-slate-200">{t}</span>
          ))}
        </div>
      </Card>

      {/* Two-column: Recent Changes + What's Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <SectionTitle>Recent Changes</SectionTitle>
          {project.recentChanges.length === 0 ? (
            <p className="text-sm text-slate-400">No recent changes recorded.</p>
          ) : (
            <div className="space-y-4">
              {project.recentChanges.map((c, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{formatDate(c.date)}</p>
                  <p className="text-sm text-slate-300">{c.summary}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>What's Next</SectionTitle>
          {project.nextSteps.length === 0 ? (
            <p className="text-sm text-slate-400">No next steps defined.</p>
          ) : (
            <div className="space-y-3">
              {project.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-500/20 text-lime-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Roadmap */}
      <Card className="mb-6">
        <SectionTitle>Roadmap</SectionTitle>
        {project.roadmap.length === 0 ? (
          <p className="text-sm text-slate-400">No roadmap items defined.</p>
        ) : (
          <div className="space-y-3">
            {project.roadmap.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusDot[item.status]}`} />
                  <span className="text-sm text-slate-300">{item.milestone}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{item.target}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Known Issues */}
      <Card>
        <SectionTitle>Known Issues</SectionTitle>
        {project.knownIssues.length === 0 ? (
          <p className="text-sm text-emerald-400">No known issues — looking good!</p>
        ) : (
          <div className="space-y-2">
            {project.knownIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-400 mt-0.5">⚠</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetailView;
