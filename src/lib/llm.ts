import { DEFAULT_MODEL_ID } from "./models";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const SYSTEM_PROMPT = `You are ARGUS, an AI-powered cyber threat intelligence reporting system. You generate intelligence products from threat data, organizational context, and enrichment results.

Rules:
- Use estimative language ("we assess with moderate confidence", "it is likely that", "available evidence suggests")
- Attribute claims to sources when available
- Distinguish between confirmed facts and analytical assessments
- Surface intelligence gaps — state what is unknown
- Use TLP markings consistently
- Map findings to the organization's specific context, assets, and regulatory requirements
- For external sharing products: strip ALL organizational identifiers

Write in a clear, professional, analytical tone. No filler. Every sentence earns its place. Output well-formed Markdown with section headers, tables where helpful, bullet points where appropriate, and inline code for IOCs/CVEs/technique IDs.`;

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}

export interface LlmResult {
  text: string;
  modelUsed: string;
}

export async function callLlm(prompt: string, options: LlmOptions = {}): Promise<LlmResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local or your Vercel project settings."
    );
  }

  const {
    model = DEFAULT_MODEL_ID,
    temperature = 0.3,
    maxOutputTokens = 8192,
    systemInstruction = SYSTEM_PROMPT,
  } = options;

  const body = {
    model,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    temperature,
    max_tokens: maxOutputTokens,
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://argus.local",
      "X-Title": "ARGUS - AI-Enabled Threat Intelligence Reporting",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error (${response.status}) on ${model}: ${errText.slice(0, 500)}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  if (!text) {
    return {
      text: "Generation returned no content.",
      modelUsed: data.model ?? model,
    };
  }

  return { text, modelUsed: data.model ?? model };
}

export function extractJson<T>(text: string): T | null {
  if (!text) return null;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  let from: number;
  if (start === -1) from = startArr;
  else if (startArr === -1) from = start;
  else from = Math.min(start, startArr);
  if (from === -1) return null;

  const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
  if (end === -1 || end < from) return null;

  const slice = candidate.slice(from, end + 1);
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}
