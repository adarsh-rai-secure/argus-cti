import type {
  Asset,
  EnrichmentResults,
  IngestedData,
  ThreatFeed,
} from "./types";

export const DEMO_ASSETS: Asset[] = [
  {
    id: "AST-0001",
    name: "api-gateway-prod",
    category: "AI/ML Infrastructure",
    description: "LiteLLM Proxy v1.82.x — production AI gateway",
    riskScore: 9.4,
    severity: "CRITICAL",
    status: "VULNERABLE",
  },
  {
    id: "AST-0002",
    name: "k8s-ml-cluster",
    category: "Container Orchestration",
    description: "Kubernetes 1.28 — ML workload cluster",
    riskScore: 7.8,
    severity: "HIGH",
    status: "AT RISK",
  },
  {
    id: "AST-0003",
    name: "cicd-runner-pool",
    category: "CI/CD Infrastructure",
    description: "GitHub Actions self-hosted runners",
    riskScore: 8.1,
    severity: "HIGH",
    status: "COMPROMISED",
  },
  {
    id: "AST-0004",
    name: "dev-workstations",
    category: "Endpoint",
    description: "Developer engineering machines (n=240)",
    riskScore: 6.5,
    severity: "MEDIUM",
    status: "AT RISK",
  },
  {
    id: "AST-0005",
    name: "secrets-vault",
    category: "Identity & Secrets",
    description: "HashiCorp Vault / AWS Secrets Manager",
    riskScore: 5.2,
    severity: "CRITICAL",
    status: "MONITORING",
  },
  {
    id: "AST-0006",
    name: "exchange-mail-01",
    category: "Communication Systems",
    description: "Microsoft Exchange Server 2019 CU14",
    riskScore: 7.2,
    severity: "HIGH",
    status: "AT RISK",
  },
  {
    id: "AST-0007",
    name: "palo-fw-edge",
    category: "Perimeter Security",
    description: "Palo Alto PA-5260 NGFW — GlobalProtect VPN enabled",
    riskScore: 6.8,
    severity: "HIGH",
    status: "MONITORING",
  },
  {
    id: "AST-0008",
    name: "splunk-indexer-01",
    category: "Security Operations",
    description: "Splunk Enterprise 9.2 — 14TB indexed daily",
    riskScore: 4.1,
    severity: "MEDIUM",
    status: "PROTECTED",
  },
  {
    id: "AST-0009",
    name: "s3-data-lake",
    category: "Cloud Infrastructure",
    description: "AWS S3 — ML training data, model artifacts, logs",
    riskScore: 6.0,
    severity: "MEDIUM",
    status: "AT RISK",
  },
  {
    id: "AST-0010",
    name: "oracle-findb-prod",
    category: "Financial Systems",
    description: "Oracle 19c — core financial transaction database",
    riskScore: 8.5,
    severity: "CRITICAL",
    status: "VULNERABLE",
  },
];

export const DEMO_ORG_PROFILE = {
  organizationName: "Visa",
  industry: "Financial Services",
  regulatoryFrameworks: ["PCI DSS", "NIST RMF", "SOX", "GDPR", "SOC 2"],
  criticalAssetTypes: [
    "Financial Systems",
    "Cloud Infrastructure",
    "AI/ML Pipelines",
    "Identity Providers",
    "Source Code Repositories",
  ],
  intelligencePriorities:
    "Protect cardholder data environments and AI/ML inference pipelines. Maintain PCI DSS compliance posture. Surface supply chain risks affecting payments and identity infrastructure.",
  additionalContext:
    "Multi-cloud (AWS + GCP). Zero-trust architecture rollout in progress. Recent ransomware tabletop completed. Board-level focus on AI infrastructure risk after a near-miss in Q1.",
};

export const DEMO_FEEDS: ThreatFeed[] = [
  { id: "feed-cisa", name: "CISA KEV", status: "active", lastUpdate: "12 min ago", recordCount: 1284 },
  { id: "feed-otx", name: "AlienVault OTX", status: "active", lastUpdate: "3 min ago", recordCount: 48172 },
  { id: "feed-misp", name: "MISP Community", status: "active", lastUpdate: "1 min ago", recordCount: 22910 },
  { id: "feed-nvd", name: "NVD / NIST", status: "active", lastUpdate: "27 min ago", recordCount: 256441 },
  { id: "feed-vt", name: "VirusTotal", status: "inactive", lastUpdate: "—", recordCount: 0 },
  { id: "feed-siem", name: "Internal SIEM", status: "active", lastUpdate: "live", recordCount: 9912 },
];

export const DEMO_INGESTED: IngestedData = {
  source: "demo",
  query: "TeamPCP / LiteLLM supply chain",
  title: "TeamPCP Supply Chain Campaign — LiteLLM Compromise",
  date: "March 24, 2026",
  severity: "CRITICAL",
  summary:
    "On March 24, 2026, threat actor TeamPCP compromised LiteLLM versions 1.82.7 and 1.82.8 on PyPI. LiteLLM is an AI proxy library with ~3.4 million daily downloads. The compromise originated from a prior attack on the Trivy security scanner (CVE-2026-33634, CVSS 9.4) embedded in LiteLLM's CI/CD pipeline, which allowed exfiltration of PyPI publishing tokens. Malicious versions contained a credential harvester targeting SSH keys, cloud credentials, Kubernetes secrets, and environment files; lateral movement modules abusing privileged Kubernetes pods; and a persistent systemd backdoor. Collected data was encrypted with AES-256/RSA-4096 and exfiltrated to attacker-controlled infrastructure. Malicious packages were live for approximately three hours before PyPI quarantine.",
  threatActor: "TeamPCP (possibly linked to LAPSUS$)",
  iocs: {
    domains: ["models.litellm[.]cloud", "checkmarx[.]zone"],
    ips: ["83.142.209[.]203"],
    files: ["litellm_init.pth", "proxy_server.py"],
    packages: ["litellm==1.82.7", "litellm==1.82.8", "telnyx==4.87.1", "telnyx==4.87.2"],
  },
  cves: ["CVE-2026-33634"],
  attckTechniques: [
    "T1195.002",
    "T1078",
    "T1059.006",
    "T1555",
    "T1552.001",
    "T1041",
    "T1573",
    "T1053.006",
    "T1610",
    "T1071.001",
  ],
};

export const DEMO_ENRICHMENT: EnrichmentResults = {
  attckTechniques: [
    { id: "T1195.002", name: "Compromise Software Supply Chain", tactic: "Initial Access" },
    { id: "T1078", name: "Valid Accounts", tactic: "Initial Access / Persistence" },
    { id: "T1059.006", name: "Command and Scripting Interpreter: Python", tactic: "Execution" },
    { id: "T1555", name: "Credentials from Password Stores", tactic: "Credential Access" },
    { id: "T1552.001", name: "Unsecured Credentials: Files", tactic: "Credential Access" },
    { id: "T1041", name: "Exfiltration Over C2 Channel", tactic: "Exfiltration" },
    { id: "T1573", name: "Encrypted Channel", tactic: "Command and Control" },
    { id: "T1053.006", name: "Scheduled Task/Job: Systemd Timers", tactic: "Persistence" },
    { id: "T1610", name: "Deploy Container", tactic: "Defense Evasion" },
    { id: "T1071.001", name: "Application Layer Protocol: Web Protocols", tactic: "Command and Control" },
  ],
  threatActors: [
    {
      name: "TeamPCP",
      aliases: ["possible LAPSUS$ linkage"],
      assessment:
        "Financially-motivated extortion crew with demonstrated capability against AI/ML supply chains. Moderate confidence in attribution based on TTP overlap and infrastructure reuse.",
    },
  ],
  affectedAssets: [
    { assetId: "AST-0001", name: "api-gateway-prod", relevance: "Direct exposure — runs LiteLLM Proxy v1.82.x" },
    { assetId: "AST-0003", name: "cicd-runner-pool", relevance: "TTP-aligned — Trivy-based CI runners" },
    { assetId: "AST-0002", name: "k8s-ml-cluster", relevance: "Lateral movement target via privileged pods" },
    { assetId: "AST-0005", name: "secrets-vault", relevance: "Targeted by credential harvester" },
  ],
  killChainPhase: "Actions on Objectives",
  killChainPhases: ["Weaponization", "Delivery", "Installation", "Command & Control", "Actions on Objectives"],
  confidence: "HIGH",
};

export const INDUSTRY_OPTIONS = [
  "Higher Education / Research",
  "Healthcare & Life Sciences",
  "Financial Services",
  "Energy & Utilities",
  "Government / Public Sector",
  "Defense / DIB",
  "Technology / SaaS",
  "Manufacturing",
  "Critical Infrastructure",
  "Retail & Consumer",
];

export const REGULATORY_FRAMEWORKS = [
  "NIST RMF",
  "PCI DSS",
  "HIPAA",
  "SOX",
  "FERPA",
  "FISMA",
  "CMMC",
  "GDPR",
  "SOC 2",
  "ISO 27001",
];

export const CRITICAL_ASSET_TYPES = [
  "Research / Intellectual Property",
  "Student / PII Records",
  "Financial Systems",
  "Identity Providers",
  "Cloud Infrastructure",
  "AI/ML Pipelines",
  "Source Code Repositories",
  "Industrial Control Systems",
  "Endpoint Fleet",
  "Backup & Recovery Systems",
];
