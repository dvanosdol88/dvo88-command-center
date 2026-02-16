import { VendorResult, WeightState } from "../types";

type ApiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function requestAi(messages: ApiChatMessage[]): Promise<string> {
  const resp = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
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

const formatContext = (weights: WeightState, results: VendorResult[]) => {
  const weightsText = Object.entries(weights)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}%`)
    .join(', ');

  const ranking = results.slice(0, 5).map((r, i) => `${i + 1}. ${r.name} (${r.finalScore})`).join('\n');

  return `
    Current Configuration:
    Weights: ${weightsText}
    
    Top Rankings:
    ${ranking}
  `;
};

export const analyzeSelection = async (
  winner: VendorResult,
  weights: WeightState,
  allResults: VendorResult[]
): Promise<string> => {
  try {
    const context = formatContext(weights, allResults);
    const prompt = `
      You are an expert RIA technology consultant following a specific Philosophy:
      1. Non-Custodial Orientation (Assets stay at Fidelity/Schwab).
      2. Anti-Bloat (Systems must be simple & stable).
      3. API-First (Avoid screen scraping).
      
      ${context}

      Task:
      Provide a concise, executive summary (max 150 words).
      1. Validate why ${winner.name} is the correct choice based specifically on the user's highest weighted categories.
      2. Mention one trade-off or risk compared to the runner-up (${allResults[1]?.name}).
      3. Use a professional, strategic tone.
    `;

    return await requestAi([{ role: "user", content: prompt }]);
  } catch (error) {
    console.error("AI API Error:", error);
    return "Unable to connect to the AI consultant right now.";
  }
};

export const compareVendors = async (
  target: VendorResult,
  winner: VendorResult,
  weights: WeightState
): Promise<string> => {
  try {
    return await requestAi([
      {
        role: "user",
        content: `
        Compare ${target.name} vs ${winner.name} (The Winner).
        Context: The user values these weights: ${Object.entries(weights).filter(e => e[1] > 0).map(e => `${e[0]}=${e[1]}`).join(',')}.
        Scores: ${target.name}=${target.finalScore}, ${winner.name}=${winner.finalScore}.
        
        Provide a 2-sentence reason why ${target.name} lost to ${winner.name}, focusing on the weighted categories where they fell short.
      `,
      },
    ]);
  } catch (error) {
    return "AI comparison unavailable.";
  }
};

export const getVendorInsight = async (
    vendor: VendorResult,
    weights: WeightState
): Promise<string> => {
    try {
        return await requestAi([
          {
            role: "user",
            content: `
                Analyze ${vendor.name} for an RIA.
                User Priorities: ${Object.entries(weights).filter(e => e[1] > 10).map(e => `${e[0]}`).join(', ')}.
                
                Philosophy:
                - Prefer API/OAuth over scraping.
                - Prefer simple/stable over complex/bloated.
                
                Provide 3 concise bullet points on how this vendor fits this philosophy.
            `,
          },
        ]);
    } catch (error) {
        return "Insight unavailable.";
    }
}

export const getChatResponse = async (
  history: {role: 'user' | 'model', text: string}[],
  message: string,
  weights: WeightState,
  results: VendorResult[]
): Promise<string> => {
  try {
    const systemInstruction = `
      You are an intelligent assistant for the RIA Command Center.
      You MUST adhere to the "Technology & Vendors Master Document" philosophy:
      - Technology must enhance clarity.
      - Systems must be simple and stable.
      - Favor API-first integrations (Tier 1).
      - Avoid screen-scraping (Tier 3).
      - Non-custodial orientation.
      
      Current Matrix Context:
      ${formatContext(weights, results)}
      
      Keep answers concise (under 100 words) and helpful.
    `;

    const mappedHistory: ApiChatMessage[] = history.map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.text,
    }));

    return await requestAi([
      { role: "system", content: systemInstruction },
      ...mappedHistory.slice(-12),
      { role: "user", content: message },
    ]);
  } catch (error) {
    console.error(error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};
