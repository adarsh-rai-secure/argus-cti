import { NextRequest, NextResponse } from "next/server";
import { callLlm } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

const EDIT_INSTRUCTION = `You are the analyst-edit engine of the ARGUS CTI system. You will receive a draft intelligence report (Markdown) and a natural-language edit instruction. Apply the edit faithfully and return the FULL revised report — not a diff, not a summary.

Rules:
- Apply the analyst's edit instruction to the SPECIFIC section(s) it refers to. If the instruction says "strengthen confidence language throughout", modify confidence-related language across ALL sections, not just the summary. If it says "add a paragraph about X", insert a new paragraph in the most appropriate section. Return the COMPLETE updated report with changes applied throughout.
- If the instruction targets a single section by name, change only that section.
- If the instruction targets a global property (tone, anonymization, structure, priority ordering), apply it across all relevant sections.
- Preserve TLP markings and the overall section structure unless the edit explicitly asks to change them.
- Maintain estimative language and analytical tone.
- If the instruction is ambiguous, make the smallest reasonable change that satisfies it.
- Output ONLY the revised Markdown report. Do not wrap in code fences. Do not add commentary.`;

interface EditBody {
  reportContent: string;
  instruction: string;
  reportType?: string;
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { reportContent, instruction, reportType, model } = (await req.json()) as EditBody;

    if (!reportContent || !instruction) {
      return NextResponse.json(
        { error: "reportContent and instruction are required" },
        { status: 400 }
      );
    }

    const prompt = `## REPORT TYPE
${reportType ?? "unspecified"}

## ANALYST EDIT INSTRUCTION
${instruction}

## CURRENT REPORT (Markdown)
${reportContent}`;

    const { text, modelUsed } = await callLlm(prompt, {
      model,
      temperature: 0.2,
      maxOutputTokens: 2500,
      systemInstruction: EDIT_INSTRUCTION,
    });

    return NextResponse.json({ result: text, modelUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
