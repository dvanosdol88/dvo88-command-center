import type { ProjectPhase, ProjectStatus } from "./projects";

export type ProjectCommandCenterView =
  | "command_center_dashboard"
  | "project_detail"
  | "legacy_project_dashboard"
  | "unknown";

export interface ProjectChatVisibleProjectSummary {
  slug: string;
  name: string;
  status: ProjectStatus;
  phase: ProjectPhase;
}

export interface ProjectChatPageContext {
  route: string;
  view: ProjectCommandCenterView;
  selectedProject: ProjectChatVisibleProjectSummary | null;
  visibleProjects: ProjectChatVisibleProjectSummary[];
  visibleProjectsSummary: string;
}

export const PROJECT_CHAT_ACTIONS = {
  SUGGEST_NAVIGATE_PROJECT: "suggest_navigate_project",
  MARK_PROJECT_FOCUS: "mark_project_focus",
} as const;

export type ProjectChatActionName =
  (typeof PROJECT_CHAT_ACTIONS)[keyof typeof PROJECT_CHAT_ACTIONS];

export const PROJECT_CHAT_ACTION_META: Record<
  ProjectChatActionName,
  { title: string; requiresConfirmation: boolean; destructive: boolean }
> = {
  [PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT]: {
    title: "Navigate to project",
    requiresConfirmation: false,
    destructive: false,
  },
  [PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS]: {
    title: "Mark project focus",
    requiresConfirmation: true,
    destructive: true,
  },
};

export interface SuggestNavigateProjectPayload {
  projectSlug: string;
  projectName: string;
  route: string;
}

export interface MarkProjectFocusPayload {
  projectSlug: string;
  projectName: string;
  note: string;
}

export type ProjectChatActionPayloadMap = {
  [PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT]: SuggestNavigateProjectPayload;
  [PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS]: MarkProjectFocusPayload;
};

type ProjectChatActionProposalBase<ActionName extends ProjectChatActionName> = {
  id: string;
  action: ActionName;
  title: string;
  reason: string;
  requiresConfirmation: boolean;
  destructive: boolean;
  createdAt: string;
  payload: ProjectChatActionPayloadMap[ActionName];
};

export type ProjectChatActionProposal = {
  [ActionName in ProjectChatActionName]: ProjectChatActionProposalBase<ActionName>;
}[ProjectChatActionName];

export type ProjectChatRouteResult =
  | {
      kind: "assistant";
      assistantText: string;
    }
  | {
      kind: "action_proposal";
      assistantText: string;
      actionProposal: ProjectChatActionProposal;
    };

export interface ProjectChatActionExecutionResult {
  proposalId: string;
  action: ProjectChatActionName;
  status: "approved" | "rejected";
  message: string;
  executedAt: string;
  idempotentReplay?: boolean;
  result?: Record<string, string | boolean>;
}
