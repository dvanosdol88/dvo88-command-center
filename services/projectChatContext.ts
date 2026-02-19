import { PROJECTS, getProjectBySlug } from "../src/config/projects";
import type {
  ProjectChatPageContext,
  ProjectChatVisibleProjectSummary,
  ProjectCommandCenterView,
} from "../src/config/projectChat";

function summarizeVisibleProjects(projects: ProjectChatVisibleProjectSummary[]): string {
  if (projects.length === 0) {
    return "No projects are visible in the current view.";
  }

  const counts = { green: 0, yellow: 0, red: 0 };
  for (const project of projects) counts[project.status] += 1;

  const names = projects.map((project) => project.name).join(", ");
  return `${projects.length} visible project(s) (${counts.green} green, ${counts.yellow} yellow, ${counts.red} red): ${names}`;
}

function detectView(route: string): ProjectCommandCenterView {
  if (route === "/") return "command_center_dashboard";
  if (route === "/old-dashboard") return "legacy_project_dashboard";
  if (/^\/project\/[^/]+$/.test(route)) return "project_detail";
  return "unknown";
}

function toSummary(slug: string): ProjectChatVisibleProjectSummary | null {
  const project = getProjectBySlug(slug);
  if (!project) return null;
  return {
    slug: project.slug,
    name: project.name,
    status: project.status,
    phase: project.phase,
  };
}

function allProjectSummaries(): ProjectChatVisibleProjectSummary[] {
  return PROJECTS.map((project) => ({
    slug: project.slug,
    name: project.name,
    status: project.status,
    phase: project.phase,
  }));
}

export function collectProjectChatPageContext(route: string): ProjectChatPageContext {
  const view = detectView(route);
  const selectedSlug = route.startsWith("/project/") ? route.replace("/project/", "") : "";
  const selectedProject = selectedSlug ? toSummary(selectedSlug) : null;

  const visibleProjects =
    view === "project_detail" ? (selectedProject ? [selectedProject] : []) : allProjectSummaries();

  return {
    route,
    view,
    selectedProject,
    visibleProjects,
    visibleProjectsSummary: summarizeVisibleProjects(visibleProjects),
  };
}
