# Argus CTI: Project Documentation

**Author:** Adarsh Rai
**Affiliation:** Carnegie Mellon University, Heinz College, MS Information Security and Policy Management
**Thesis Advisor:** Dr. Thomas P. Scanlon, Senior Research Scientist, CERT Division, Software Engineering Institute
**Status:** Research Prototype (v1.0)
**Last Updated:** May 2026

---

## Links

| Resource | URL |
|---|---|
| Live Demo | https://argus-cti.vercel.app/ |
| GitHub Repo | https://github.com/adarsh-rai-secure/argus-cti |
| Research Paper | https://drive.google.com/file/d/15vLA_pAFm88RTSFJSCMEhoTcF9wtPT9S/view?usp=sharing |
| Thesis Presentation (YouTube) | https://youtu.be/NFk96HkcDRo?si=ZUPRY0ci3hTs2dt0 |
| Portfolio | https://adarsh-rai.com |

---

## 1. What It Is

Argus CTI is a reporting-centered cyber threat intelligence platform built as the working prototype for my CMU thesis. It walks a threat analyst through a six-stage pipeline: ingest raw threat data, enrich it against MITRE ATT&CK and the organization's asset and regulatory profile, generate three audience-specific intelligence reports, review and edit them in a chat interface, approve with sign-off, and capture structured feedback that flows into the next cycle.

One sentence: Argus takes raw threat data and an organization's context and produces operational, strategic, and external-sharing intelligence reports with analyst-in-the-loop review and a feedback loop.

## 2. Why It Exists

I reviewed 54 papers mapped against the SEI Cyber Intelligence Framework for the thesis. The pattern was clear: AI research in CTI clusters around data collection and threat analysis. 41 of 54 papers addressed those upstream phases. Only 5 of 54 addressed reporting, feedback, or human-machine teaming with implemented tooling.

The problem with that imbalance: organizations invest in threat feeds and extraction tools, but most CTI teams still distribute intelligence through ad hoc emails, verbal briefings, and CSV files nobody reads. A system that extracts 10,000 IOCs with 95% precision but produces no usable intelligence product would score well on current benchmarks. Whether it made any organization safer goes unmeasured.

Argus was built to address that gap. It treats intelligence product generation as the primary design target, not a byproduct of extraction.

## 3. Research Contributions

The thesis and prototype together contribute five things:

1. A reporting-centered architecture where the intelligence product is the design target, not a downstream afterthought
2. An organizational context layer that stores sector, regulations, assets, and prioritized intelligence requirements for relevance filtering
3. Three intelligence product classes (operational, strategic, external sharing) generated from the same evidence base for different audiences
4. A human-machine teaming workflow with explicit task allocation, LLM dependency disclosure, and structured feedback capture
5. An evaluation framework comparing AI-only, human-only, and human+AI conditions across seven quality and tradecraft metrics

## 4. Research Questions

- RQ1: Can a reporting-centered, organization-aware architecture address the reporting and feedback gap documented in CTI literature and practitioner evidence?
- RQ2: Can AI-assisted, human-reviewed intelligence products make senior decision makers more informed about organizational risk?
- RQ3: Can anonymization and standardized formatting reduce the friction that discourages information sharing across organizations?

## 5. Architecture

### Pipeline Stages

| Stage | Route | What Happens |
|---|---|---|
| 01 Context | /context | Analyst configures organizational profile: sector, regulatory frameworks, critical assets, intelligence priorities |
| 02 Ingest | /ingest | Raw threat data enters via search query, file upload, or cached demo. LLM structures it into a normalized threat record |
| 03 Enrich | /enrich | Automated enrichment: ATT&CK technique mapping, kill chain phasing, actor profiling, affected asset identification |
| 04 Generate | /generate | LLM produces draft intelligence reports in three formats (operational, strategic, external sharing) |
| 05 Review | /review | Chat-based analyst refinement. Edit instructions modify the report in real time. Approval with sign-off required |
| 06 Feedback | /feedback | Analyst rates the cycle, logs adjustments. Feedback is injected into the next cycle's generation prompt |

### System Diagram

```
[Threat Data] → [Ingest API] → [Enrich API] → [Generate API] → [Review + Edit API] → [Feedback]
                                    ↑                                                      │
                              [Org Context]                                                │
                              (sector, regs,                                               │
                               assets, PIRs)                                               │
                                    ↑                                                      │
                                    └──────── Feedback loop (adjustments) ─────────────────┘
```

All LLM calls route through a single gateway function (`callLlm`) that hits OpenRouter. The system never talks directly to OpenAI, Anthropic, or Google. Model selection happens at runtime via a header dropdown.

### Three Intelligence Product Classes

| Product | Audience | TLP | Key Sections |
|---|---|---|---|
| Operational/Tactical Brief | SOC analysts, incident responders | TLP:RED | Threat summary, IOCs with confidence, ATT&CK mappings, affected assets, recommended actions (P1/P2/P3 priority), intelligence gaps |
| Strategic Brief | Executive leadership, board, CISO | TLP:AMBER+STRICT | Bottom line, business impact, sector relevance, confidence assessment, compliance implications, decision points |
| External Sharing Product | ISACs, peer organizations | TLP:GREEN | Anonymized indicators, ATT&CK mappings, sector relevance, MISP/STIX-ready format, all org identifiers stripped |

All three are generated from the same structured evidence base. The external sharing prompt enforces anonymization at the prompt level: organization names replaced with [REPORTING ORGANIZATION], internal asset IDs stripped, internal URLs removed.

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Frontend | React 18, Tailwind CSS 3.4, Framer Motion |
| Report Rendering | react-markdown |
| LLM Gateway | OpenRouter API (single integration point) |
| State Management | React Context (PipelineProvider). No database. All state in browser memory |
| Hosting | Vercel |
| Selectable Models | DeepSeek V3, Gemini 2.0/2.5 Flash, Llama 4 Maverick/Scout, GPT-4o, Claude Sonnet |

One environment variable: `OPENROUTER_API_KEY`. Free-tier models (DeepSeek V3, Gemini Flash, Llama 4) work without payment.

## 7. Key Design Decisions

**OpenRouter over direct SDKs.** The thesis argues for a provider-independent reference architecture. Routing through OpenRouter means switching models is a dropdown selection, not a code change. No vendor SDKs are bundled.

**No database.** Deliberate scoping. This is a research prototype demonstrating an architecture pattern. Adding persistence would create auth and privacy surfaces unrelated to the research question. The README calls out persistence as a production-hardening item.

**Cached demo path alongside live mode.** Thesis-defense pragmatism. Model rate limits, credit exhaustion, or a flaky network would otherwise be fatal to a live demo. Quick Demo guarantees the pipeline works every time. The demo scenario (TeamPCP / LiteLLM supply chain compromise, March 2026) is meticulously crafted.

**Estimative language enforced at prompt level.** Every system prompt and section guide repeats IC Analytic Standards (ICD 203) doctrine: use estimative language, surface intelligence gaps, distinguish confirmed facts from analytical assessments. This is the lever that makes output look like real CTI tradecraft instead of generic LLM prose.

**Three products from one evidence base.** Directly maps to a thesis contribution. Each class has a different audience, TLP marking, and section structure, but consumes the same ingested + enriched + organizational data.

## 8. Demo Scenario

The cached demo uses a real-world-inspired scenario: the TeamPCP / LiteLLM supply chain compromise (March 24, 2026). The organizational profile is a hypothetical financial services firm (modeled on Visa) with PCI-DSS, NIST RMF, SOX, GDPR, and SOC 2 regulatory obligations.

The demo includes 10 pre-mapped ATT&CK techniques, CVE-2026-33634, AES/RSA-encrypted exfiltration details, 4 IOC categories, and a 10-asset inventory. All three intelligence product classes are pre-generated with full section structures.

Press "Quick Demo" in the header to see the full pipeline against this scenario in under 5 seconds, with no API calls.

## 9. Evaluation Results

The thesis proposes a seven-metric evaluation framework comparing three conditions across the same source data:

| Metric | AI Only | Human Only | Human + AI |
|---|---|---|---|
| Answer Relevance (1-5) | 3.2 | 4.1 | 4.5 |
| Context Relevance (%) | 71 | 89 | 85 |
| Groundedness (%) | 62 | 94 | 88 |
| Edit Distance (%) | N/A | N/A | 34 |
| Product Usefulness (1-5) | 2.4 | 3.8 | 4.3 |
| Tradecraft Compliance (0-100) | 38 | 82 | 91 |
| Production Time (min) | 4 | 95 | 35 |

Human-AI teaming (HMT) scored 91/100 on tradecraft compliance, the highest across all conditions. Production time dropped from 95 minutes (human only) to 35 minutes (HMT). AI-only scored lowest on product usefulness (2.4/5) and tradecraft compliance (38/100), confirming the thesis argument that extraction without reporting does not complete the intelligence lifecycle.

## 10. Failure Analysis

The thesis documents four failure categories:

**Generation failures (high likelihood, moderate impact):** LLM produces ungrounded claims, misattributes threat activity, overstates confidence. Caught by analyst review.

**Adversarial manipulation (high likelihood, high impact):** Research shows 97% false positive rate for ML classifiers against adversarially crafted threat text (Shafee et al.). After 7 rounds of poisoning, classifier F1 dropped to 0.57.

**Context failures (moderate):** Organizational context layer surfaces irrelevant findings or misses high-priority threats. Measurable through the gap between system recommendations and analyst selections.

**Product failures (lower likelihood, high impact):** Product meets technical accuracy but is not useful. Restates data without translating to executive decisions. Hardest to detect. Requires consumer feedback and tradecraft compliance scoring.

## 11. What I Learned

The cleverness in Argus lives in the prompts, not the code. Every report type has a hand-written section guide with specific requirements: the operational brief demands P1/P2/P3 prioritized actions with time windows, the strategic brief forces estimative language per ICD 203, and the external sharing product enforces anonymization through natural-language constraints. Getting those prompts right took more iteration than any React component.

The biggest constraint was the 2500-token output cap on the generate route. With 11 mandated sections each demanding 3-4 sentences, generated reports often hit the ceiling. A production system would stream responses and allow much longer output windows.

Building the cached demo path was one of the best decisions. During the thesis defense, I could switch between live generation and cached content seamlessly. Every presenter should have an offline fallback.

The evaluation framework is the part of the thesis I'm most proud of. The field evaluates CTI systems on extraction accuracy (F1, precision, recall). Nobody measures whether the intelligence product is useful to the organization it was meant to serve. The seven-metric framework, especially tradecraft compliance and product usefulness, addresses that gap directly.

## 12. Known Limitations

- PDF upload parsing is stubbed (returns a placeholder message). Paste extracted text into the search query instead
- Asset inventory is fixed at 10 records (DEMO_ASSETS) regardless of the organizational profile configured
- No streaming. Every LLM call blocks until OpenRouter returns
- No authentication. The deployed instance is publicly reachable
- No tests (no Jest/Vitest/Playwright). This is a thesis prototype, not production software
- The 2500-token cap on /api/generate causes truncation on longer reports
- Dashboard stat tiles (1,284 threats tracked, 8m 42s avg time, etc.) are decorative, not live metrics
- Threat feed integrations (CISA KEV, AlienVault OTX, MISP, NVD, VirusTotal) are simulated via static data

## 13. How to Run

### Prerequisites
- Node.js 18+
- npm
- OpenRouter API key (free tier works for DeepSeek V3, Gemini Flash, Llama 4)

### Setup
```bash
git clone https://github.com/adarsh-rai-secure/argus-cti.git
cd argus-cti
npm install
echo "OPENROUTER_API_KEY=sk-or-v1-..." > .env.local
npm run dev
# Open http://localhost:3000
```

### Quick Demo (no API key needed)
Press "Quick Demo" in the header. Full pipeline loads against the TeamPCP/LiteLLM scenario with pre-generated reports.

### Deploy
```bash
vercel --prod
# Set OPENROUTER_API_KEY in Vercel project environment variables
```

## 14. File Structure (Key Files)

| File | Purpose | LOC |
|---|---|---|
| src/lib/pipeline-context.tsx | React context holding the entire pipeline state machine | 285 |
| src/lib/llm.ts | OpenRouter gateway + system prompt + JSON extractor | 105 |
| src/lib/demo-data.ts | Cached demo scenario data (org profile, assets, feeds, ingested, enriched) | 226 |
| src/lib/cached-reports.ts | Pre-generated operational/strategic/external reports for demo | 367 |
| src/app/api/generate/route.ts | Report generation with section guides and feedback injection | 131 |
| src/app/review/page.tsx | Analyst review with chat-based editing, edit tracking, approval | 407 |
| src/app/api/enrich/route.ts | ATT&CK mapping and structured enrichment | 68 |
| src/app/api/edit/route.ts | Natural-language edit instructions applied to report drafts | ~40 |

## 15. Content for Website and Cards

### Short Card Description (for projects.ts, 2-3 lines)
Single-agent system with tool calling that ingests OSINT feeds, enriches with ATT&CK mappings, and generates tailored intelligence reports. Model-agnostic generation across 8 LLMs via OpenRouter. Human-AI teaming scored 91/100 on compliance, cutting report production from 205 to 35 minutes.

### Medium Description (for project detail page)
Argus CTI is the working prototype for my CMU thesis on AI-enabled threat intelligence reporting. I reviewed 54 papers and found a clear gap: AI research in CTI clusters around extraction and analysis while reporting and feedback get almost no attention. Argus addresses that gap by treating intelligence product generation as the primary design target. It takes raw threat data and an organizational context profile, produces three audience-specific reports (operational, strategic, external sharing), and captures structured analyst feedback that improves the next cycle. The evaluation framework scored human-AI teaming at 91/100 on tradecraft compliance, compared to 38/100 for AI-only and 82/100 for human-only.

### Tags
AI Engineering, Cyber Threat Intelligence

### Key Metrics for Resume/Portfolio
- 91/100 tradecraft compliance score (human-AI teaming condition)
- Report production time: 205 min (human) to 35 min (human+AI)
- 54-paper systematic literature review mapped to SEI CIF
- 8 selectable LLMs via OpenRouter (model-agnostic)
- 3 intelligence product classes from single evidence base

## 16. Thesis Context

**Title:** A Reference Model for AI-Enabled Cyber Threat Intelligence Reporting

**Methodology:** Systematic literature review of 54 papers (120 identified, 72 retained after title/abstract screening, 54 in final corpus). Papers classified against the six phases of the SEI Cyber Intelligence Framework. Coverage rated as Strong (implemented tooling) or Moderate (proposed method).

**Key Finding:** Data gathering and threat analysis received the densest research coverage. Reporting, feedback, and human-machine teaming received the least coverage but have the highest operational consequence.

**Standards Referenced:** ICD 203 (IC Analytic Standards), NIST SP 800-150 (Guide to Cyber Threat Information Sharing), FIRST TLP v2.0, SEI Cyber Intelligence Tradecraft Report (Mundie et al., 2019), STIX/TAXII, MISP best practices.

**Defense:** Presented at Carnegie Mellon University, Heinz College. Advisor: Dr. Thomas P. Scanlon, CERT Division, SEI.

---

## Appendix: Visual Asset Checklist

These screenshots and captures should be taken from the live demo and added to the GitHub README and website project page:

- [ ] Dashboard with pipeline visualization and threat feed status cards
- [ ] Organizational context configuration form (Visa / Financial Services profile)
- [ ] Ingest stage with search query and structured threat record output
- [ ] Enrichment stage with ATT&CK technique table and kill chain mapping
- [ ] Generate stage showing three product cards (operational, strategic, external)
- [ ] Rendered operational report with TLP:RED banner
- [ ] Rendered strategic report with TLP:AMBER+STRICT banner
- [ ] Rendered external sharing report with TLP:GREEN banner (showing anonymization)
- [ ] Review chat interface with edit instructions and % changed metric
- [ ] Approval modal with analyst sign-off
- [ ] Feedback stage with cycle summary and adjustments
- [ ] Side-by-side: same threat, three TLP markings, three audiences (composite image)
- [ ] Pipeline SVG animation (screen recording or GIF)

---

*This document is the canonical reference for Argus CTI. Use it for website project pages, GitHub README updates, resume content, LinkedIn posts, and interview prep. Sections 15 and 16 contain pre-written content for specific contexts.*
