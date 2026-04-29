# ARGUS — AI-Enabled Threat Intelligence Reporting

<div align="center">

**A reporting-centered reference architecture for AI-enabled cyber threat intelligence.**

Built as part of a Carnegie Mellon University Master's thesis at the Heinz College of Information Systems and Public Policy.

[Live Demo](https://argus-cti.vercel.app) · [Research Paper](#research) · [Architecture](#architecture)

</div>

---

## Overview

ARGUS is a working prototype that implements a six-stage, reporting-centered CTI pipeline. It addresses a gap identified through a systematic literature review of 54 papers: while AI capabilities for data gathering and threat analysis are mature, the field lacks architectures that treat **intelligence product generation** as a primary design target with organizational context, analyst review, and structured feedback loops.

The system ingests raw threat data from multiple sources, enriches it with ATT&CK mappings and threat actor attribution, contextualizes it against an organization's specific sector, assets, and regulatory environment, and generates three classes of intelligence products — each tailored for a different audience — from the same evidence base.

### Key Capabilities

- **Multi-source ingestion** — Search any threat, CVE, or actor by name. Upload PDFs or Excel files. Load pre-built scenarios. Simulated integrations with MISP, CISA KEV, AlienVault OTX, NVD, and internal SIEM.
- **Organizational context layer** — Sector, regulatory frameworks (NIST RMF, PCI DSS, HIPAA, SOX, FERPA, CMMC, GDPR, SOC 2, ISO 27001), critical asset types, and intelligence priorities drive report prioritization and compliance mapping.
- **Three intelligence product classes** from the same evidence base:
  - **Operational/Tactical Brief** (TLP:RED) — For SOC analysts, incident responders, threat hunters
  - **Strategic Brief** (TLP:AMBER+STRICT) — For CISO, executive leadership, board
  - **External Sharing Product** (TLP:GREEN) — Anonymized for ISACs and peer organizations
- **Model-agnostic generation** — Switch between LLM providers (DeepSeek, Gemini, Llama, GPT-4o, Claude) via OpenRouter. The architecture is provider-independent by design.
- **Analyst review with natural-language editing** — Chat-based interface for refining reports. The analyst remains a co-equal partner in intelligence production.
- **Approval workflow** — Named sign-off with consent logging for audit trails.
- **Feedback capture** — Star ratings, edit metrics, and free-text feedback flow back into the next generation cycle, closing the intelligence lifecycle loop.

---

## Architecture

The system implements a six-stage pipeline based on the SEI Cyber Intelligence Framework, targeting the phases with the weakest AI coverage and highest operational consequence:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 01 Context  │───▶│ 02 Ingest   │───▶│ 03 Enrich   │
│ Org Profile │    │ Data Sources│    │ ATT&CK Map  │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                   ┌─────────────────────────┘
                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 06 Feedback │◀───│ 05 Review   │◀───│ 04 Generate │
│ Quality Loop│    │ Analyst HMT │    │ 3 Products  │
└──────┬──────┘    └─────────────┘    └─────────────┘
       │
       └──────────────── Continuous Learning Loop ─────────────────▶ 01
```

### Design Constraints

1. **Reporting as primary target** — Intelligence product generation is the design goal, not a byproduct of extraction.
2. **Technical feasibility** — All components use existing tools and documented methods.
3. **Analyst as co-equal partner** — The human remains in the loop for review, editing, and approval.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| LLM Routing | OpenRouter (multi-model) |
| Models | DeepSeek V3, Gemini 2.0/2.5 Flash, Llama 4 Maverick/Scout, GPT-4o, Claude Sonnet |
| Deployment | Vercel |
| Report Rendering | react-markdown |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key (free tier available)

### Installation

```bash
git clone https://github.com/<your-username>/argus-cti.git
cd argus-cti
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Set the `OPENROUTER_API_KEY` environment variable in your Vercel project settings under **Settings → Environment Variables**.

---

## Demo Scenario

The application ships with a pre-built scenario based on the **TeamPCP/LiteLLM supply chain attack** (March 24, 2026) — a real, multi-ecosystem supply chain campaign that compromised a widely-used AI proxy library through a cascading attack originating from the Trivy security scanner. The scenario includes:

- Pre-loaded threat data with 10 ATT&CK technique mappings
- Simulated asset inventory with 10 organizational assets
- IOCs, kill chain analysis, and threat actor attribution
- Cached high-quality reports for all three product classes
- Compliance mapping across PCI DSS, NIST RMF, SOX, and GDPR

Use the **Quick Demo** button on any stage to load pre-built content instantly.

---

## Research

This prototype accompanies the following research:

> **A Reference Model for AI-Enabled Cyber Threat Intelligence Reporting**
> Adarsh Rai
> Carnegie Mellon University, Heinz College of Information Systems and Public Policy
> Master of Science in Information Security Policy and Management (MSISPM), 2026

The paper proposes a reporting-centered reference architecture for AI-enabled CTI based on a systematic literature review of 54 papers mapped against the SEI Cyber Intelligence Framework. It identifies that strategic analysis, reporting and feedback, and human-machine teaming receive substantially less AI coverage than data gathering and threat analysis, and proposes an architecture that addresses these gaps.

### Research Contributions

1. Architecture treating intelligence product generation as a primary design target
2. Organizational context layer enabling triage based on sector, assets, and regulatory requirements
3. Three intelligence product classes generated from the same evidence base
4. Human-machine teaming workflow with explicit task allocation and feedback capture
5. Evaluation framework comparing AI-only, human-only, and human+AI conditions

---

## Project Structure

```
argus-cti/
├── src/
│   ├── app/
│   │   ├── api/           # API routes (generate, enrich, edit)
│   │   ├── context/       # Stage 01: Org context questionnaire
│   │   ├── ingest/        # Stage 02: Data ingestion
│   │   ├── enrich/        # Stage 03: Enrichment
│   │   ├── generate/      # Stage 04: Report generation
│   │   ├── review/        # Stage 05: Analyst review
│   │   ├── feedback/      # Stage 06: Feedback & cycle closure
│   │   ├── layout.tsx     # Root layout with sidebar
│   │   └── page.tsx       # Dashboard
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (pipeline state)
│   └── lib/               # Utilities, prompts, demo data, types
├── public/                # Static assets
├── .env.local             # Environment variables (not committed)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Security Considerations

- API keys are stored as environment variables and never exposed to the client. All LLM calls are made server-side via Next.js API routes.
- The application does not persist user data. All pipeline state is held in browser memory and cleared on page reload.
- File uploads are processed server-side and not stored permanently.
- The external sharing report template includes automatic anonymization of organizational identifiers.
- This is a research prototype. It is not intended for production deployment with real organizational data without additional hardening (authentication, RBAC, audit logging, encryption at rest).

---

## License

This project is part of academic research at Carnegie Mellon University. All rights reserved.

---

## Acknowledgments

- Dr. Patrick Scanlon — Thesis Advisor, Carnegie Mellon University
- SEI Cyber Intelligence Tradecraft Report (2019) — Framework foundation
- MITRE ATT&CK® — Technique taxonomy
- OpenRouter — Multi-model LLM routing

---

<div align="center">

**Built by [Adarsh Rai](https://adarsh-rai.com) · Carnegie Mellon University · Heinz College · 2026**

</div>
