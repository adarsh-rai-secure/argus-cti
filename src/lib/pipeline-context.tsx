"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  ApprovalData,
  EditEntry,
  EnrichmentResults,
  FeedbackData,
  GeneratedReport,
  IngestedData,
  OrgProfile,
  ReportType,
  StageId,
} from "./types";
import { DEFAULT_MODEL_ID, getModelMeta } from "./models";
import { DEMO_ENRICHMENT, DEMO_INGESTED, DEMO_ORG_PROFILE } from "./demo-data";
import { CACHED_EXTERNAL_REPORT, CACHED_OPERATIONAL_REPORT, CACHED_STRATEGIC_REPORT } from "./cached-reports";

interface PipelineState {
  cycleNumber: number;
  ingestedData: IngestedData | null;
  enrichmentResults: EnrichmentResults | null;
  orgProfile: OrgProfile;
  generatedReports: GeneratedReport[];
  activeReportType: ReportType | null;
  editHistory: EditEntry[];
  approvalData: ApprovalData | null;
  feedbackData: FeedbackData | null;
  previousFeedback: FeedbackData | null;
  currentStage: StageId;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  setIngestedData: (d: IngestedData | null) => void;
  setEnrichmentResults: (r: EnrichmentResults | null) => void;
  setOrgProfile: (p: OrgProfile | ((prev: OrgProfile) => OrgProfile)) => void;
  addReport: (r: GeneratedReport) => void;
  updateActiveReport: (content: string) => void;
  setActiveReportType: (t: ReportType | null) => void;
  addEdit: (e: EditEntry) => void;
  setApproval: (a: ApprovalData | null) => void;
  setFeedback: (f: FeedbackData | null) => void;
  setStage: (s: StageId) => void;
  startNewCycle: () => void;
  resetAll: () => void;
  resetStage: (s: StageId) => void;
  loadDemoForStage: (s: StageId) => void;
  loadFullDemo: () => void;
}

const DEFAULT_ORG_PROFILE: OrgProfile = {
  organizationName: "",
  industry: "",
  regulatoryFrameworks: [],
  criticalAssetTypes: [],
  intelligencePriorities: "",
  additionalContext: "",
};

const PipelineContext = createContext<PipelineState | null>(null);

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [cycleNumber, setCycleNumber] = useState(1);
  const [ingestedData, setIngestedData] = useState<IngestedData | null>(null);
  const [enrichmentResults, setEnrichmentResults] = useState<EnrichmentResults | null>(null);
  const [orgProfile, setOrgProfile] = useState<OrgProfile>(DEFAULT_ORG_PROFILE);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [activeReportType, setActiveReportType] = useState<ReportType | null>(null);
  const [editHistory, setEditHistory] = useState<EditEntry[]>([]);
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [previousFeedback, setPreviousFeedback] = useState<FeedbackData | null>(null);
  const [currentStage, setStage] = useState<StageId>("dashboard");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  const addReport = useCallback((r: GeneratedReport) => {
    setGeneratedReports((prev) => {
      const next = prev.filter((existing) => existing.type !== r.type);
      return [...next, r];
    });
    setActiveReportType(r.type);
  }, []);

  const updateActiveReport = useCallback((content: string) => {
    setGeneratedReports((prev) =>
      prev.map((r) =>
        r.type === activeReportType
          ? { ...r, content, timestamp: new Date().toISOString() }
          : r
      )
    );
  }, [activeReportType]);

  const addEdit = useCallback((e: EditEntry) => {
    setEditHistory((prev) => [...prev, e]);
  }, []);

  const startNewCycle = useCallback(() => {
    setPreviousFeedback(feedbackData);
    setCycleNumber((c) => c + 1);
    setIngestedData(null);
    setEnrichmentResults(null);
    setGeneratedReports([]);
    setActiveReportType(null);
    setEditHistory([]);
    setApprovalData(null);
    setFeedbackData(null);
    setStage("ingest");
  }, [feedbackData]);

  const resetAll = useCallback(() => {
    setCycleNumber(1);
    setIngestedData(null);
    setEnrichmentResults(null);
    setOrgProfile(DEFAULT_ORG_PROFILE);
    setGeneratedReports([]);
    setActiveReportType(null);
    setEditHistory([]);
    setApprovalData(null);
    setFeedbackData(null);
    setPreviousFeedback(null);
    setStage("dashboard");
  }, []);

  const resetStage = useCallback((stage: StageId) => {
    if (stage === "context") setOrgProfile(DEFAULT_ORG_PROFILE);
    else if (stage === "ingest") setIngestedData(null);
    else if (stage === "enrich") setEnrichmentResults(null);
    else if (stage === "generate") {
      setGeneratedReports([]);
      setActiveReportType(null);
    } else if (stage === "review") {
      setEditHistory([]);
      setApprovalData(null);
    } else if (stage === "feedback") {
      setFeedbackData(null);
    }
  }, []);

  const loadDemoForStage = useCallback((stage: StageId) => {
    const ts = new Date().toLocaleString();
    if (stage === "context") {
      setOrgProfile(DEMO_ORG_PROFILE);
    } else if (stage === "ingest") {
      setIngestedData(DEMO_INGESTED);
    } else if (stage === "enrich") {
      if (!ingestedData) setIngestedData(DEMO_INGESTED);
      setEnrichmentResults(DEMO_ENRICHMENT);
    } else if (stage === "generate") {
      const meta = getModelMeta(selectedModel);
      const reports: GeneratedReport[] = [
        { type: "operational", content: CACHED_OPERATIONAL_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:RED", modelId: selectedModel, modelLabel: meta.label },
        { type: "strategic", content: CACHED_STRATEGIC_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:AMBER+STRICT", modelId: selectedModel, modelLabel: meta.label },
        { type: "external", content: CACHED_EXTERNAL_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:GREEN", modelId: selectedModel, modelLabel: meta.label },
      ];
      setGeneratedReports(reports);
      setActiveReportType("operational");
    } else if (stage === "review") {
      const meta = getModelMeta(selectedModel);
      if (generatedReports.length === 0) {
        setGeneratedReports([{
          type: "operational",
          content: CACHED_OPERATIONAL_REPORT(ts),
          timestamp: new Date().toISOString(),
          tlp: "TLP:RED",
          modelId: selectedModel,
          modelLabel: meta.label,
        }]);
        setActiveReportType("operational");
      }
      setEditHistory([
        { instruction: "Strengthen the confidence language throughout", timestamp: new Date(Date.now() - 4 * 60_000).toISOString(), beforeLength: 8200, afterLength: 8410 },
        { instruction: "Add specific remediation timelines (24h, 72h, 30d)", timestamp: new Date(Date.now() - 2 * 60_000).toISOString(), beforeLength: 8410, afterLength: 8612 },
        { instruction: "Rewrite the recommended actions in priority order (P1/P2/P3)", timestamp: new Date(Date.now() - 30_000).toISOString(), beforeLength: 8612, afterLength: 8745 },
      ]);
      setApprovalData({
        analyst: "Adarsh Rai",
        timestamp: new Date().toISOString(),
        consent: true,
      });
    } else if (stage === "feedback") {
      setFeedbackData({
        rating: 4,
        edits: 3,
        cycleNumber,
        approver: "Adarsh Rai",
        timestamp: new Date().toISOString(),
        adjustments: [
          "Tighten executive summaries (3 sentences max)",
          "Surface compliance implications earlier in the report",
        ],
      });
      if (!approvalData) {
        setApprovalData({
          analyst: "Adarsh Rai",
          timestamp: new Date().toISOString(),
          consent: true,
        });
      }
    }
  }, [ingestedData, generatedReports.length, selectedModel, approvalData, cycleNumber]);

  const loadFullDemo = useCallback(() => {
    const ts = new Date().toLocaleString();
    const meta = getModelMeta(selectedModel);
    setOrgProfile(DEMO_ORG_PROFILE);
    setIngestedData(DEMO_INGESTED);
    setEnrichmentResults(DEMO_ENRICHMENT);
    const reports: GeneratedReport[] = [
      { type: "operational", content: CACHED_OPERATIONAL_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:RED", modelId: selectedModel, modelLabel: meta.label },
      { type: "strategic", content: CACHED_STRATEGIC_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:AMBER+STRICT", modelId: selectedModel, modelLabel: meta.label },
      { type: "external", content: CACHED_EXTERNAL_REPORT(ts), timestamp: new Date().toISOString(), tlp: "TLP:GREEN", modelId: selectedModel, modelLabel: meta.label },
    ];
    setGeneratedReports(reports);
    setActiveReportType("operational");
  }, [selectedModel]);

  const value = useMemo<PipelineState>(
    () => ({
      cycleNumber,
      ingestedData,
      enrichmentResults,
      orgProfile,
      generatedReports,
      activeReportType,
      editHistory,
      approvalData,
      feedbackData,
      previousFeedback,
      currentStage,
      selectedModel,
      setSelectedModel,
      setIngestedData,
      setEnrichmentResults,
      setOrgProfile,
      addReport,
      updateActiveReport,
      setActiveReportType,
      addEdit,
      setApproval: setApprovalData,
      setFeedback: setFeedbackData,
      setStage,
      startNewCycle,
      resetAll,
      resetStage,
      loadDemoForStage,
      loadFullDemo,
    }),
    [
      cycleNumber,
      ingestedData,
      enrichmentResults,
      orgProfile,
      generatedReports,
      activeReportType,
      editHistory,
      approvalData,
      feedbackData,
      previousFeedback,
      currentStage,
      selectedModel,
      addReport,
      updateActiveReport,
      addEdit,
      startNewCycle,
      resetAll,
      resetStage,
      loadDemoForStage,
      loadFullDemo,
    ]
  );

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used within a PipelineProvider");
  return ctx;
}
