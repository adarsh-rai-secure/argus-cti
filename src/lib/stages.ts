import type { StageId } from "./types";

export interface StageMeta {
  id: StageId;
  number: number | null;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
}

export const STAGES: StageMeta[] = [
  {
    id: "dashboard",
    number: null,
    label: "Dashboard",
    shortLabel: "Dashboard",
    description: "Pipeline overview & operational status",
    href: "/",
  },
  {
    id: "context",
    number: 1,
    label: "Organizational Context",
    shortLabel: "Context",
    description: "Sector, regulatory & critical-asset profile — informs prioritization downstream",
    href: "/context",
  },
  {
    id: "ingest",
    number: 2,
    label: "Data Ingestion",
    shortLabel: "Ingest",
    description: "Import threats, upload documents, or load demo scenarios",
    href: "/ingest",
  },
  {
    id: "enrich",
    number: 3,
    label: "Enrichment",
    shortLabel: "Enrich",
    description: "ATT&CK mapping, actor attribution, asset cross-reference",
    href: "/enrich",
  },
  {
    id: "generate",
    number: 4,
    label: "Report Generation",
    shortLabel: "Generate",
    description: "Operational, strategic, or external sharing reports",
    href: "/generate",
  },
  {
    id: "review",
    number: 5,
    label: "Analyst Review",
    shortLabel: "Review",
    description: "Edit, refine, and approve",
    href: "/review",
  },
  {
    id: "feedback",
    number: 6,
    label: "Feedback",
    shortLabel: "Feedback",
    description: "Quality rating & cycle summary",
    href: "/feedback",
  },
];

export const PIPELINE_STAGES = STAGES.filter((s) => s.number !== null);
