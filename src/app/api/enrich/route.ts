import { NextRequest, NextResponse } from "next/server";
import { callLlm, extractJson } from "@/lib/llm";
import { DEMO_ASSETS } from "@/lib/demo-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const ENRICHMENT_INSTRUCTION = `You are the enrichment engine of the ARGUS CTI system. Given raw threat data, produce a structured enrichment object.

Use your knowledge of MITRE ATT&CK, threat actor profiles, and kill chain phases to produce a thorough mapping.

Return ONLY a JSON object inside a single \`\`\`json fenced block. Schema:

{
  "attckTechniques": [
    { "id": "T####.###", "name": "...", "tactic": "...", "description": "1-sentence behavior observed" }
  ],
  "threatActors": [
    { "name": "...", "aliases": ["..."], "assessment": "1-2 sentence assessment using estimative language" }
  ],
  "affectedAssets": [
    { "assetId": "AST-####", "name": "asset name", "relevance": "why this asset is impacted" }
  ],
  "killChainPhase": "single most-advanced phase reached",
  "killChainPhases": ["Reconnaissance", "Weaponization", "Delivery", "Exploitation", "Installation", "Command & Control", "Actions on Objectives"],
  "confidence": "HIGH|MEDIUM|LOW",
  "rawNotes": "1-2 sentences of analyst commentary"
}

Constraints:
- "killChainPhases" must include only phases observed/likely in this campaign (in order).
- "affectedAssets" must reference IDs from the asset inventory provided.
- Do not include any fields outside the schema. Do not include prose before or after the fenced JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ingestedData = body.ingestedData;
    const model = body.model as string | undefined;

    const prompt = `## ASSET INVENTORY
${JSON.stringify(DEMO_ASSETS, null, 2)}

## INGESTED THREAT DATA
${JSON.stringify(ingestedData, null, 2)}`;

    const { text, modelUsed } = await callLlm(prompt, {
      model,
      temperature: 0.2,
      maxOutputTokens: 2000,
      systemInstruction: ENRICHMENT_INSTRUCTION,
    });

    const parsed = extractJson(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse enrichment response", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsed, modelUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
