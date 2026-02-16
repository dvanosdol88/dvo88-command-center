import OpenAI from "openai";
import type { AiProvider, ChatRequest, ChatResponse } from "@dvanosdol88/ai-core";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  private readonly client: OpenAI;
  private readonly opts: { model: string; systemPrompt: string };

  constructor(opts: { model: string; systemPrompt: string }) {
    this.opts = opts;
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: this.opts.systemPrompt },
      ...req.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await this.client.chat.completions.create({
      model: this.opts.model,
      messages,
      temperature: 0.4,
      max_tokens: 600,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    return {
      message: { role: "assistant", content: text || "[No response]" },
      model: this.opts.model,
      provider: this.name,
    };
  }
}
