import { NextRequest, NextResponse } from "next/server";
import { callLlm } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

const SECTION_GUIDES: Record<string, string> = {
  operational: `Generate an OPERATIONAL / TACTICAL intelligence report for blue-team consumption.

Begin the report with this exact line: "TLP:RED — FOR NAMED RECIPIENTS ONLY. Not for disclosure outside of designated recipients. Sources may specify intended recipients."

Required sections, in this exact order, using H2 headings:
1. Threat Summary
2. Affected Organizational Assets  (reference each asset by its AST-#### ID with risk score and a paragraph of justification)
3. ATT&CK Technique Mapping
4. Indicators of Compromise  (group by type: Domains, IPs, Files, Hashes, Packages — render IOCs as inline code)
5. Organizational Relevance
6. Kill Chain Analysis  (numbered list, one phase per item, full sentences)
7. Recommended Actions  (split into P1 within 24h, P2 within 72h, P3 within 30 days)
8. Compliance Implications
9. Confidence Assessment
10. Intelligence Gaps
11. Sources`,

  strategic: `Generate a STRATEGIC intelligence report for executive leadership.

Begin the report with this exact line: "TLP:AMBER+STRICT — RESTRICTED TO THE ORGANIZATION ONLY. Recipients may not share outside their organization."

Required sections, in this order, using H2 headings:
1. Executive Summary  (Bottom Line Up Front — 4-6 sentences max)
2. Business Impact Assessment  (quantify financial exposure where possible — operational disruption, data exposure, regulatory penalties, reputational damage)
3. Sector Relevance
4. Risk to Organizational Objectives
5. Compliance Implications
6. Decision Points for Leadership  (frame each as a question, with two named options and tradeoffs)
7. Confidence Statement
8. Intelligence Gaps
9. Recommended Posture Changes  (immediate / 30-day / 90-day / ongoing)
10. Sources

Tone: avoid technical jargon when possible. Quantify business impact where data exists. Speak to budgets, roadmaps, regulatory exposure.`,

  external: `Generate an EXTERNAL SHARING report for ISAC / community distribution.

Begin the report with this exact line: "TLP:GREEN — COMMUNITY WIDE. Recipients may share within their community or sector, but not via publicly accessible channels."

CRITICAL: This product MUST anonymize all organizational identifiers. Replace any organization name with [REPORTING ORGANIZATION]. Strip internal asset IDs, internal URLs, employee references, internal team names, and any details that could be used to fingerprint the reporting organization. Do not reveal sector specifics beyond a high-level industry descriptor.

Required sections, in this order, using H2 headings:
1. TLP Marking & Distribution Statement
2. Anonymized Threat Summary
3. Indicators of Compromise
4. ATT&CK Mapping
5. Sector Relevance
6. Detection Guidance  (numbered list of concrete checks)
7. Recommended Mitigations  (numbered list)
8. STIX / MISP Compatibility Note
9. Source Handling
10. Feedback Request
11. Sources`,
};

const SHARED_DIRECTIVES = `## OUTPUT REQUIREMENTS

- Use Markdown only — no HTML.
- Use estimative language and surface intelligence gaps explicitly.
- For external reports, verify that NO organization-specific details remain.

## SECTION DEPTH

Each section of the report must be substantive — minimum 3-4 sentences per section. Do not write one-line sections. Provide specific, actionable detail. Include concrete examples, specific asset references, and precise technical details.

## ATT&CK MAPPING FORMAT

For ATT&CK Technique Mapping, DO NOT use a markdown table. Instead, use a bulleted list with this exact format:
- **T1195.002 — Compromise Software Supply Chain** (Initial Access): 2-3 sentences explaining how the technique was used in this specific campaign.
- **T1078 — Valid Accounts** (Persistence): 2-3 sentences describing the observed behavior with specific detail.

Each entry must have 2-3 sentences explaining how the technique was used in this specific campaign.

## SOURCES SECTION

End the report with a SOURCES section as a numbered Markdown list. Each source must be a real, relevant URL where the reader can find more information about the threat, vulnerability, or campaign discussed. Prefer CISA advisories, vendor security blogs, MITRE ATT&CK pages, NVD entries, and reputable security research. Format as: \`1. Title — https://example.com/path\`.`;

interface GenerateBody {
  reportType: "operational" | "strategic" | "external";
  ingestedData: unknown;
  enrichmentResults: unknown;
  orgProfile: unknown;
  feedbackAdjustments?: string[];
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;
    const { reportType, ingestedData, enrichmentResults, orgProfile, feedbackAdjustments, model } = body;

    if (!reportType || !SECTION_GUIDES[reportType]) {
      return NextResponse.json({ error: "Invalid reportType" }, { status: 400 });
    }

    const adjustmentsSection = feedbackAdjustments?.length
      ? `\n\n## FEEDBACK FROM PREVIOUS CYCLE (apply these adjustments)\n${feedbackAdjustments.map((a) => `- ${a}`).join("\n")}`
      : "";

    const prompt = `${SECTION_GUIDES[reportType]}

## THREAT DATA (ingested)
${JSON.stringify(ingestedData, null, 2)}

## ENRICHMENT RESULTS
${JSON.stringify(enrichmentResults, null, 2)}

## ORGANIZATIONAL PROFILE
${JSON.stringify(orgProfile, null, 2)}${adjustmentsSection}

${SHARED_DIRECTIVES}`;

    const { text, modelUsed } = await callLlm(prompt, {
      model,
      temperature: 0.3,
      maxOutputTokens: 2500,
    });

    return NextResponse.json({ result: text, modelUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
