import React from "react";
import { Link } from "react-router-dom";
import { PROJECTS, ProjectStatus } from "../src/config/projects";
import { useProjectLastUpdated } from "../src/hooks/useProjectLastUpdated";
import { formatProjectTimestamp } from "../src/utils/projectDateTime";
import ProjectChatDrawer from "./ProjectChatDrawer";
import SharedLayout from "./SharedLayout";

const statusColorClass: Record<ProjectStatus, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

const formatPhase = (phase: string) => phase.charAt(0).toUpperCase() + phase.slice(1);

const ProjectDashboard: React.FC = () => {
  const { resolveLastUpdated } = useProjectLastUpdated(PROJECTS);

  return (
    <SharedLayout>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Project Command Center
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            Portfolio status overview across active dvo88 properties, products, and tools.
          </p>
        </div>

        {PROJECTS.length === 0 ? (
          <div className="text-center bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-10">
            <p className="text-sm text-slate-600 dark:text-slate-300">No projects configured.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => {
              const lastUpdated = resolveLastUpdated(project.slug, project.lastUpdated);
              const displayedStack = project.techStack.slice(0, 4);
              const overflowCount = Math.max(project.techStack.length - displayedStack.length, 0);

              return (
                <article
                  key={project.slug}
                  className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusColorClass[project.status]}`}></span>
                      {project.status}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {formatPhase(project.phase)}
                    </span>
                  </div>

                  <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-1">{project.name}</h2>

                  <div className="mb-3 min-h-5">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors break-all"
                      >
                        {project.url}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">No public URL</span>
                    )}
                  </div>

                  <p
                    className="text-sm text-slate-500 dark:text-slate-400 mb-4 min-h-11"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {project.oneLiner}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {displayedStack.map((tech) => (
                      <span
                        key={`${project.slug}-${tech}`}
                        className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200">
                        +{overflowCount} more
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Last updated: {formatProjectTimestamp(lastUpdated)}
                    </span>
                    <Link
                      to={`/project/${project.slug}`}
                      className="text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ProjectChatDrawer />
    </SharedLayout>
  );
};

export default ProjectDashboard;
