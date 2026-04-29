import { NextRequest, NextResponse } from "next/server";
import { callLlm, extractJson } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

const INGEST_INSTRUCTION = `You are the ingestion engine of the ARGUS CTI system. Given a free-text threat query (a CVE, threat-actor name, incident description, or technical IOC), use your training and reasoning to produce a structured threat record. If the query references events more recent than your training cutoff, surface uncertainty in the summary using estimative language.

Return ONLY a JSON object inside a single \`\`\`json fenced block. Schema:

{
  "title": "Concise headline (~ <100 chars)",
  "date": "Most relevant disclosure or incident date in 'Month DD, YYYY' format. If unknown, use today.",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "summary": "3-5 sentence factual summary using estimative language and citing key facts",
  "threatActor": "Named actor or 'Unknown'",
  "iocs": {
    "domains": ["..."],
    "ips": ["..."],
    "files": ["..."],
    "hashes": ["..."],
    "packages": ["..."]
  },
  "cves": ["CVE-YYYY-NNNNN"],
  "attckTechniques": ["T####", "T####.###"]
}

Rules:
- Defang IOCs (e.g. "evil[.]com", "192.168.1[.]1").
- Omit fields/arrays for which there is no evidence.
- Do not fabricate IOCs or CVE IDs. Empty arrays are acceptable.
- Output the fenced JSON block only — no prose before or after.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query ?? "";
    const model = body.model as string | undefined;

    if (!query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const prompt = `## ANALYST QUERY
${query}

Use your knowledge of CVE databases (NVD, MITRE), CISA advisories, vendor disclosures, ISAC bulletins, and security research to produce the structured record.`;

    const { text, modelUsed } = await callLlm(prompt, {
      model,
      temperature: 0.2,
      maxOutputTokens: 2000,
      systemInstruction: INGEST_INSTRUCTION,
    });

    const parsed = extractJson(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse ingest response", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsed, modelUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
