import React from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectBySlug, ProjectStatus } from "../src/config/projects";
import ProjectChatDrawer from "./ProjectChatDrawer";
import SharedLayout from "./SharedLayout";

const statusColorClass: Record<ProjectStatus, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

const formatPhase = (phase: string) => phase.charAt(0).toUpperCase() + phase.slice(1);

const parseDateValue = (dateValue: string) => {
  const [yearStr, monthStr, dayStr] = dateValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return new Date(year, month - 1, day);
  }
  return new Date(dateValue);
};

const formatDate = (dateValue: string, withYear = true) => {
  const parsed = parseDateValue(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return parsed.toLocaleDateString(
    "en-US",
    withYear ? { month: "short", day: "numeric", year: "numeric" } : { month: "short", day: "numeric" },
  );
};

const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  return (
    <SharedLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          {project?.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
            >
              Visit Site ↗
            </a>
          )}
        </div>

        {!project ? (
          <div className="text-center bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-10">
            <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white mb-3">Project not found</h1>
            <Link
              to="/"
              className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-4 h-4 rounded-full ${statusColorClass[project.status]}`}></span>
                <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{project.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Phase: {formatPhase(project.phase)}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Security: {formatPhase(project.securityStatus)}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Last updated: {formatDate(project.lastUpdated)}
                </span>
              </div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors break-all"
                >
                  {project.url}
                </a>
              )}
            </section>

            <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Description</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
            </section>

            <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={`${project.slug}-${tech}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Recent Changes</h2>
                {project.recentChanges.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No recent changes recorded.</p>
                ) : (
                  <ul className="space-y-4">
                    {project.recentChanges.map((change, idx) => (
                      <li key={`${project.slug}-change-${idx}`}>
                        <p className="font-semibold text-xs text-slate-400 mb-1">{formatDate(change.date)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{change.summary}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">What's Next</h2>
                {project.nextSteps.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No next steps defined.</p>
                ) : (
                  <ol className="space-y-3">
                    {project.nextSteps.map((step, idx) => (
                      <li key={`${project.slug}-next-${idx}`} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>

            <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Roadmap</h2>
              {project.roadmap.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">No roadmap items defined.</p>
              ) : (
                <ul className="space-y-3">
                  {project.roadmap.map((item, idx) => (
                    <li key={`${project.slug}-roadmap-${idx}`} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColorClass[item.status]}`}></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.milestone}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{item.target}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
              <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Known Issues</h2>
              {project.knownIssues.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">No known issues - looking good!</p>
              ) : (
                <ul className="space-y-2">
                  {project.knownIssues.map((issue, idx) => (
                    <li key={`${project.slug}-issue-${idx}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-amber-500">⚠</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      <ProjectChatDrawer />
    </SharedLayout>
  );
};

export default ProjectDetailView;
