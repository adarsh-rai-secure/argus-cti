export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type AssetStatus = "VULNERABLE" | "AT RISK" | "COMPROMISED" | "MONITORING" | "PROTECTED";
export type FeedStatus = "active" | "inactive" | "error";

export type IngestSource = "search" | "upload" | "demo";

export interface IngestedData {
  source: IngestSource;
  query?: string;
  fileName?: string;
  title: string;
  date: string;
  severity: Severity;
  summary: string;
  threatActor?: string;
  iocs?: {
    domains?: string[];
    ips?: string[];
    files?: string[];
    hashes?: string[];
    packages?: string[];
  };
  cves?: string[];
  attckTechniques?: string[];
  raw?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  description: string;
  riskScore: number;
  severity: Severity;
  status: AssetStatus;
}

export interface ThreatFeed {
  id: string;
  name: string;
  status: FeedStatus;
  lastUpdate: string;
  recordCount: number;
}

export interface AttckTechnique {
  id: string;
  name: string;
  tactic: string;
  description?: string;
}

export interface EnrichmentResults {
  attckTechniques: AttckTechnique[];
  threatActors: { name: string; aliases?: string[]; assessment: string }[];
  affectedAssets: { assetId: string; name: string; relevance: string }[];
  killChainPhase: string;
  killChainPhases: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  rawNotes?: string;
}

export interface OrgProfile {
  organizationName: string;
  industry: string;
  regulatoryFrameworks: string[];
  criticalAssetTypes: string[];
  intelligencePriorities: string;
  additionalContext: string;
}

export type ReportType = "operational" | "strategic" | "external";

export interface GeneratedReport {
  type: ReportType;
  content: string;
  timestamp: string;
  tlp: string;
  modelId: string;
  modelLabel: string;
}

export interface EditEntry {
  instruction: string;
  timestamp: string;
  beforeLength?: number;
  afterLength?: number;
}

export interface ApprovalData {
  analyst: string;
  timestamp: string;
  consent: boolean;
}

export interface FeedbackData {
  rating: number;
  edits: number;
  cycleNumber: number;
  approver: string;
  timestamp: string;
  adjustments?: string[];
}

export type StageId = "dashboard" | "ingest" | "enrich" | "context" | "generate" | "review" | "feedback";
