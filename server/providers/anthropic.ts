import Anthropic from "@anthropic-ai/sdk";
import type { AiProvider, ChatRequest, ChatResponse } from "@dvanosdol88/ai-core";

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly opts: { model: string; systemPrompt: string };

  constructor(opts: { model: string; systemPrompt: string }) {
    this.opts = opts;
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const messages = req.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      })) as Array<{ role: "user" | "assistant"; content: string }>;

    const resp = await this.client.messages.create({
      model: this.opts.model,
      system: this.opts.systemPrompt,
      messages,
      max_tokens: 700,
      temperature: 0.4,
    });

    const text =
      resp.content
        ?.map((c: any) => (c.type === "text" ? c.text : ""))
        .join("")
        .trim() || "";

    return {
      message: { role: "assistant", content: text || "[No response]" },
      model: this.opts.model,
      provider: this.name,
    };
  }
}
