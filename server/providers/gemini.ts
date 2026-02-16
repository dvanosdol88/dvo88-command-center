import { GoogleGenAI } from "@google/genai";
import type { AiProvider, ChatRequest, ChatResponse } from "@dvanosdol88/ai-core";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private readonly ai: GoogleGenAI;
  private readonly opts: { model: string; systemPrompt: string };

  constructor(opts: { model: string; systemPrompt: string }) {
    this.opts = opts;
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const contents = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await this.ai.models.generateContent({
      model: this.opts.model,
      config: { systemInstruction: this.opts.systemPrompt },
      contents,
    });

    const text =
      response?.text ?? response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

    return {
      message: { role: "assistant", content: text || "[No response]" },
      model: this.opts.model,
      provider: this.name,
    };
  }
}
