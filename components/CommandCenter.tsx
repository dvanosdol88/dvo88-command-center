import React from "react";
import { Link } from "react-router-dom";
import { PROJECTS, type ProjectStatus } from "../src/config/projects";
import { useProjectLastUpdated } from "../src/hooks/useProjectLastUpdated";
import { formatProjectTimestamp, parseProjectTimestamp } from "../src/utils/projectDateTime";
import {
  Server,
  Clock,
  AlertTriangle,
  Rocket,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import ProjectChatDrawer from "./ProjectChatDrawer";

/* helpers */
const statusLabel: Record<ProjectStatus, string> = {
  green: "Healthy",
  yellow: "Warning",
  red: "Critical",
};

const statusBadge: Record<ProjectStatus, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
};

const statusDot: Record<ProjectStatus, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
};

const formatPhase = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

function daysSince(d: string) {
  const parsed = parseProjectTimestamp(d);
  if (!parsed) return 0;
  return Math.floor((Date.now() - parsed.getTime()) / 86400000);
}

/* summary metrics */
function computeMetrics(resolveLastUpdated: (slug: string, fallback: string) => string) {
  const counts = { green: 0, yellow: 0, red: 0 };
  PROJECTS.forEach((p) => counts[p.status]++);

  const mostRecent = [...PROJECTS].sort((a, b) => {
    const aTime = parseProjectTimestamp(resolveLastUpdated(a.slug, a.lastUpdated))?.getTime() ?? 0;
    const bTime = parseProjectTimestamp(resolveLastUpdated(b.slug, b.lastUpdated))?.getTime() ?? 0;
    return bTime - aTime;
  })[0];
  const lastDeploy = mostRecent
    ? daysSince(resolveLastUpdated(mostRecent.slug, mostRecent.lastUpdated))
    : 0;

  const totalIssues = PROJECTS.reduce((n, p) => n + p.knownIssues.length, 0);

  return {
    total: PROJECTS.length,
    healthy: counts.green,
    warnings: counts.yellow,
    critical: counts.red,
    lastDeploy: lastDeploy === 0 ? "Today" : lastDeploy === 1 ? "1d ago" : `${lastDeploy}d ago`,
    openIssues: totalIssues,
  };
}

/* CommandCenter dashboard content */
const CommandCenter: React.FC = () => {
  const { resolveLastUpdated } = useProjectLastUpdated(PROJECTS);
  const m = computeMetrics(resolveLastUpdated);

  return (
    <>
      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={Server} label="Total Projects" value={String(m.total)} accent="text-lime-400" />
        <MetricCard icon={Rocket} label="Last Deploy" value={m.lastDeploy} accent="text-emerald-400" />
        <MetricCard icon={AlertTriangle} label="Open Issues" value={String(m.openIssues)} accent="text-amber-400" />
        <MetricCard icon={Clock} label="Warnings" value={String(m.warnings)} accent="text-amber-400" />
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {PROJECTS.map((project) => {
          const lastUpdated = resolveLastUpdated(project.slug, project.lastUpdated);
          return (
            <article
              key={project.slug}
              className="group bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-5 hover:border-lime-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDot[project.status]}`} />
                <h3 className="text-base font-bold text-white">{project.name}</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge[project.status]}`}>
                {statusLabel[project.status]}
              </span>
            </div>

            {/* URL */}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-lime-400 transition-colors mb-3 truncate"
              >
                <ExternalLink size={12} />
                {project.url.replace(/^https?:\/\//, "")}
              </a>
            )}

            {/* One-liner */}
            <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{project.oneLiner}</p>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.slice(0, 4).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-slate-700/50 text-[11px] font-medium text-slate-300">
                  {t}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-[11px] font-medium text-slate-500">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
              <span className="text-xs text-slate-500">
                {formatPhase(project.phase)} - Updated {formatProjectTimestamp(lastUpdated)}
              </span>
              <Link
                to={`/project/${project.slug}`}
                className="flex items-center gap-1 text-xs font-semibold text-lime-500 hover:text-lime-400 transition-colors"
              >
                Details <ChevronRight size={14} />
              </Link>
            </div>
          </article>
          );
        })}
      </div>

      <ProjectChatDrawer />
    </>
  );
};

/* MetricCard sub-component */
interface MetricCardProps {
  icon: React.FC<{ size?: number }>;
  label: string;
  value: string;
  accent: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-lg bg-slate-700/30 ${accent}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
    </div>
  </div>
);

export default CommandCenter;

