import type {
  ProjectChatActionExecutionResult,
  ProjectChatActionName,
  ProjectChatActionProposal,
  ProjectChatPageContext,
  ProjectChatRouteResult,
} from "../src/config/projectChat";

type ApiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ProjectChatMessage {
  role: "user" | "assistant";
  text: string;
}

export type ProjectChatResponse =
  | { kind: "assistant"; text: string }
  | { kind: "action_proposal"; text: string; proposal: ProjectChatActionProposal };

function createErrorDetails(data: any): string {
  return data?.cause ? `${data.error} (${data.cause})` : data?.error || "Unknown AI error";
}

async function requestProjectAi(
  messages: ApiChatMessage[],
  pageContext: ProjectChatPageContext,
  sessionId: string,
): Promise<ProjectChatResponse> {
  const resp = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      context: "projects",
      sessionId,
      projectPageContext: pageContext,
    }),
  });

  let data: any = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok || !data?.ok) {
    throw new Error(createErrorDetails(data));
  }

  const chatResult: ProjectChatRouteResult | undefined = data?.chatResult;
  if (chatResult?.kind === "action_proposal" && chatResult.actionProposal) {
    return {
      kind: "action_proposal",
      text: chatResult.assistantText,
      proposal: chatResult.actionProposal,
    };
  }

  const assistantText =
    chatResult?.assistantText || data?.response?.message?.content || "No response received.";
  return { kind: "assistant", text: assistantText };
}

export async function getProjectChatResponse(
  history: ProjectChatMessage[],
  message: string,
  pageContext: ProjectChatPageContext,
  sessionId: string,
): Promise<ProjectChatResponse> {
  const mappedHistory: ApiChatMessage[] = history.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.text,
  }));

  return requestProjectAi([...mappedHistory.slice(-12), { role: "user", content: message }], pageContext, sessionId);
}

export function createChatIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function confirmProjectChatAction(opts: {
  proposalId: string;
  proposal?: ProjectChatActionProposal;
  decision: "confirm" | "reject";
  sessionId: string;
  expectedAction?: ProjectChatActionName;
  idempotencyKey?: string;
}): Promise<ProjectChatActionExecutionResult> {
  const resp = await fetch("/api/ai/chat/action/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proposalId: opts.proposalId,
      proposal: opts.proposal,
      decision: opts.decision,
      sessionId: opts.sessionId,
      expectedAction: opts.expectedAction,
      idempotencyKey: opts.idempotencyKey || createChatIdempotencyKey(),
    }),
  });

  let data: any = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok || !data?.ok) {
    throw new Error(createErrorDetails(data));
  }

  return data.actionResult as ProjectChatActionExecutionResult;
}
