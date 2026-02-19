import { randomUUID } from "node:crypto";
import { getProjectBySlug, PROJECTS, type ProjectConfig } from "../../src/config/projects.js";
import {
  PROJECT_CHAT_ACTIONS,
  PROJECT_CHAT_ACTION_META,
  type MarkProjectFocusPayload,
  type ProjectChatActionExecutionResult,
  type ProjectChatActionName,
  type ProjectChatActionPayloadMap,
  type ProjectChatActionProposal,
  type ProjectChatPageContext,
  type SuggestNavigateProjectPayload,
} from "../../src/config/projectChat.js";

type ProposalStatus = "pending" | "approved" | "rejected";

interface StoredProposal {
  proposal: ProjectChatActionProposal;
  status: ProposalStatus;
  executionResult?: ProjectChatActionExecutionResult;
}

interface SessionState {
  proposals: Map<string, StoredProposal>;
  idempotency: Map<string, ProjectChatActionExecutionResult>;
  focusMarkers: Map<string, { projectSlug: string; note: string; updatedAt: string }>;
}

const sessions = new Map<string, SessionState>();

interface ActionExecutionOutcome {
  message: string;
  result?: Record<string, string | boolean>;
}

type ActionHandler<Name extends ProjectChatActionName> = (args: {
  payload: ProjectChatActionPayloadMap[Name];
  session: SessionState;
}) => ActionExecutionOutcome;

const actionRegistry: {
  [PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT]: ActionHandler<typeof PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT>;
  [PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS]: ActionHandler<typeof PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS>;
} = {
  [PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT]: ({ payload }) => {
    const typedPayload = payload as SuggestNavigateProjectPayload;
    return {
      message: `Navigation approved. Open ${typedPayload.projectName}.`,
      result: {
        projectSlug: typedPayload.projectSlug,
        projectName: typedPayload.projectName,
        navigateTo: typedPayload.route,
      },
    };
  },
  [PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS]: ({ payload, session }) => {
    const typedPayload = payload as MarkProjectFocusPayload;
    const updatedAt = new Date().toISOString();
    session.focusMarkers.set(typedPayload.projectSlug, {
      projectSlug: typedPayload.projectSlug,
      note: typedPayload.note,
      updatedAt,
    });

    return {
      message: `Focus marker saved for ${typedPayload.projectName}.`,
      result: {
        projectSlug: typedPayload.projectSlug,
        focusMarked: true,
        note: typedPayload.note,
      },
    };
  },
};

export class ProjectChatActionError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ProjectChatActionError";
    this.statusCode = statusCode;
  }
}

function getSessionState(sessionId: string): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const created: SessionState = {
    proposals: new Map(),
    idempotency: new Map(),
    focusMarkers: new Map(),
  };
  sessions.set(sessionId, created);
  return created;
}

function findTargetProject(text: string, pageContext?: ProjectChatPageContext): ProjectConfig | null {
  const normalized = text.toLowerCase();
  const explicit =
    PROJECTS.find(
      (project) =>
        normalized.includes(project.slug.toLowerCase()) ||
        normalized.includes(project.name.toLowerCase()),
    ) || null;
  if (explicit) return explicit;

  const selectedSlug = pageContext?.selectedProject?.slug;
  if (selectedSlug) return getProjectBySlug(selectedSlug) || null;

  if ((pageContext?.visibleProjects.length || 0) === 1) {
    const onlySlug = pageContext!.visibleProjects[0].slug;
    return getProjectBySlug(onlySlug) || null;
  }

  return null;
}

function detectActionIntent(userMessage: string): ProjectChatActionName | null {
  const normalized = userMessage.toLowerCase();
  const markFocusIntent =
    /(mark|set|make|pin|flag)\b.{0,24}\b(focus|priority)/.test(normalized) ||
    /\bfocus on\b/.test(normalized);
  if (markFocusIntent) return PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS;

  const navigateIntent = /\b(navigate|go to|open|switch to|take me to|show me)\b/.test(normalized);
  if (navigateIntent) return PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT;

  return null;
}

function createNavigatePayload(project: ProjectConfig): SuggestNavigateProjectPayload {
  return {
    projectSlug: project.slug,
    projectName: project.name,
    route: `/project/${project.slug}`,
  };
}

function createFocusPayload(project: ProjectConfig, userMessage: string): MarkProjectFocusPayload {
  return {
    projectSlug: project.slug,
    projectName: project.name,
    note: userMessage.slice(0, 220),
  };
}

function validateStatelessProposal(proposal: ProjectChatActionProposal): void {
  const project = getProjectBySlug(proposal.payload.projectSlug);
  if (!project) {
    throw new ProjectChatActionError("Unknown project in action proposal.", 400);
  }
  if (project.name !== proposal.payload.projectName) {
    throw new ProjectChatActionError("Action proposal project mismatch.", 400);
  }

  if (proposal.action === PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT) {
    const expectedRoute = `/project/${project.slug}`;
    if (proposal.payload.route !== expectedRoute) {
      throw new ProjectChatActionError("Invalid route in action proposal.", 400);
    }
    return;
  }

  if (proposal.payload.note.trim().length === 0 || proposal.payload.note.length > 240) {
    throw new ProjectChatActionError("Invalid focus note in action proposal.", 400);
  }
}

export function maybeCreateProjectActionProposal(opts: {
  sessionId: string;
  userMessage: string;
  pageContext?: ProjectChatPageContext;
}): { proposal: ProjectChatActionProposal; assistantText: string } | null {
  const action = detectActionIntent(opts.userMessage);
  if (!action) return null;

  const targetProject = findTargetProject(opts.userMessage, opts.pageContext);
  if (!targetProject) return null;

  const session = getSessionState(opts.sessionId);
  const createdAt = new Date().toISOString();
  let proposal: ProjectChatActionProposal;
  let assistantText = "";

  if (action === PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT) {
    const metadata = PROJECT_CHAT_ACTION_META[PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT];
    proposal = {
      id: randomUUID(),
      action: PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT,
      title: `${metadata.title}: ${targetProject.name}`,
      reason: `Requested by user from ${opts.pageContext?.view || "unknown"} view.`,
      requiresConfirmation: metadata.requiresConfirmation,
      destructive: metadata.destructive,
      createdAt,
      payload: createNavigatePayload(targetProject),
    };
    assistantText = `I can navigate you to ${targetProject.name}. Approve this action if you want to continue.`;
  } else {
    const metadata = PROJECT_CHAT_ACTION_META[PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS];
    proposal = {
      id: randomUUID(),
      action: PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS,
      title: `${metadata.title}: ${targetProject.name}`,
      reason: `Requested by user from ${opts.pageContext?.view || "unknown"} view.`,
      requiresConfirmation: metadata.requiresConfirmation,
      destructive: metadata.destructive,
      createdAt,
      payload: createFocusPayload(targetProject, opts.userMessage),
    };
    assistantText = `I can mark ${targetProject.name} as a focus project. Review and confirm this action.`;
  }

  session.proposals.set(proposal.id, {
    proposal,
    status: "pending",
  });

  return { proposal, assistantText };
}

export function resolveProjectActionProposal(opts: {
  sessionId: string;
  proposalId: string;
  proposal?: ProjectChatActionProposal;
  decision: "confirm" | "reject";
  idempotencyKey: string;
  expectedAction?: ProjectChatActionName;
}): ProjectChatActionExecutionResult {
  if (!/^[a-zA-Z0-9._:-]{8,120}$/.test(opts.idempotencyKey)) {
    throw new ProjectChatActionError("Invalid idempotencyKey format.", 400);
  }

  const session = getSessionState(opts.sessionId);

  const idempotencyBucketKey = `${opts.sessionId}:${opts.idempotencyKey}`;
  const previousByIdempotency = session.idempotency.get(idempotencyBucketKey);
  if (previousByIdempotency) {
    return {
      ...previousByIdempotency,
      idempotentReplay: true,
    };
  }

  let stored = session.proposals.get(opts.proposalId);
  if (!stored) {
    if (!opts.proposal || opts.proposal.id !== opts.proposalId) {
      throw new ProjectChatActionError("Action proposal not found.", 404);
    }
    validateStatelessProposal(opts.proposal);
    stored = {
      proposal: opts.proposal,
      status: "pending",
    };
    session.proposals.set(opts.proposalId, stored);
  }

  if (opts.expectedAction && stored.proposal.action !== opts.expectedAction) {
    throw new ProjectChatActionError("Action proposal type mismatch.", 400);
  }

  if (stored.status !== "pending" && stored.executionResult) {
    session.idempotency.set(idempotencyBucketKey, stored.executionResult);
    return {
      ...stored.executionResult,
      idempotentReplay: true,
    };
  }

  const executedAt = new Date().toISOString();
  if (opts.decision === "reject") {
    const rejected: ProjectChatActionExecutionResult = {
      proposalId: stored.proposal.id,
      action: stored.proposal.action,
      status: "rejected",
      message: `Action rejected: ${stored.proposal.title}.`,
      executedAt,
    };
    stored.status = "rejected";
    stored.executionResult = rejected;
    session.idempotency.set(idempotencyBucketKey, rejected);
    return rejected;
  }

  let output: ActionExecutionOutcome;
  if (stored.proposal.action === PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT) {
    output = actionRegistry[PROJECT_CHAT_ACTIONS.SUGGEST_NAVIGATE_PROJECT]({
      payload: stored.proposal.payload,
      session,
    });
  } else if (stored.proposal.action === PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS) {
    output = actionRegistry[PROJECT_CHAT_ACTIONS.MARK_PROJECT_FOCUS]({
      payload: stored.proposal.payload,
      session,
    });
  } else {
    throw new ProjectChatActionError("No action handler registered for proposal.", 500);
  }

  const approved: ProjectChatActionExecutionResult = {
    proposalId: stored.proposal.id,
    action: stored.proposal.action,
    status: "approved",
    message: output.message,
    result: output.result,
    executedAt,
  };

  stored.status = "approved";
  stored.executionResult = approved;
  session.idempotency.set(idempotencyBucketKey, approved);

  return approved;
}
