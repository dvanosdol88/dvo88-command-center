type ApiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ProjectChatMessage {
  role: "user" | "assistant";
  text: string;
}

async function requestProjectAi(messages: ApiChatMessage[]): Promise<string> {
  const resp = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context: "projects" }),
  });

  let data: any = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok || !data?.ok) {
    const details = data?.cause ? `${data.error} (${data.cause})` : data?.error || "Unknown AI error";
    throw new Error(details);
  }

  return data?.response?.message?.content || "No response received.";
}

export async function getProjectChatResponse(
  history: ProjectChatMessage[],
  message: string,
): Promise<string> {
  const mappedHistory: ApiChatMessage[] = history.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: item.text,
  }));

  return requestProjectAi([...mappedHistory.slice(-12), { role: "user", content: message }]);
}
