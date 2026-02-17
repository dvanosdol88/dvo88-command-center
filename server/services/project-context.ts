import { PROJECTS } from "../../src/config/projects.js";

function statusEmoji(status: "green" | "yellow" | "red"): string {
  if (status === "green") return "🟢";
  if (status === "yellow") return "🟡";
  return "🔴";
}

export function buildProjectSystemPrompt(): string {
  const projectSummaries = PROJECTS.map((project) => {
    const recentChanges =
      project.recentChanges.length > 0
        ? `  Recent Changes:\n${project.recentChanges.map((change) => `    - ${change.date}: ${change.summary}`).join("\n")}`
        : "  Recent Changes: none";

    const nextSteps =
      project.nextSteps.length > 0
        ? `  Next Steps:\n${project.nextSteps.map((step, index) => `    ${index + 1}. ${step}`).join("\n")}`
        : "  Next Steps: none";

    const roadmap =
      project.roadmap.length > 0
        ? `  Roadmap:\n${project.roadmap.map((item) => `    - ${item.milestone} (${item.target}) [${item.status}]`).join("\n")}`
        : "  Roadmap: none";

    const knownIssues =
      project.knownIssues.length > 0
        ? `  Known Issues:\n${project.knownIssues.map((issue) => `    ⚠ ${issue}`).join("\n")}`
        : "  Known Issues: none";

    return [
      `${statusEmoji(project.status)} ${project.name} (${project.slug})`,
      `  Status: ${project.status} | Phase: ${project.phase} | Security: ${project.securityStatus}`,
      `  URL: ${project.url || "none"}`,
      `  Summary: ${project.oneLiner}`,
      `  Tech: ${project.techStack.join(", ")}`,
      `  Last Updated: ${project.lastUpdated}`,
      recentChanges,
      nextSteps,
      roadmap,
      knownIssues,
    ].join("\n");
  }).join("\n\n---\n\n");

  return `
You are a project management AI assistant for David's development portfolio.
You have complete knowledge of all active projects and their current state.

YOUR CAPABILITIES:
- Summarize status across all projects or a specific one
- Recommend what to work on next based on priorities, statuses, and known issues
- Answer questions about any project's tech stack, roadmap, issues, or recent changes
- Generate status reports (brief or detailed)
- Identify cross-project risks or patterns

RESPONSE STYLE:
- Be concise and actionable
- Use status indicators (🟢 🟡 🔴) when referencing project health
- When recommending priorities, explain your reasoning
- Reference specific project data (dates, issues, milestones) to back up your answers

CURRENT PORTFOLIO (${PROJECTS.length} projects):

${projectSummaries}
`.trim();
}
