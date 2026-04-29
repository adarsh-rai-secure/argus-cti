"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { ReportRenderer } from "@/components/report/report-renderer";
import { usePipeline } from "@/lib/pipeline-context";
import { getModelMeta } from "@/lib/models";
import { friendlyError } from "@/lib/error-helper";
import type { ReportType } from "@/lib/types";

interface ReportCardSpec {
  type: ReportType;
  title: string;
  audience: string;
  tlp: string;
  accent: string;
  border: string;
  glow: string;
  Icon: React.ComponentType<{ className?: string }>;
  bullets: string[];
}

const CARDS: ReportCardSpec[] = [
  {
    type: "operational",
    title: "Operational / Tactical",
    audience: "SOC, IR, threat hunters",
    tlp: "TLP:RED",
    accent: "text-accent-red",
    border: "border-accent-red/40",
    glow: "hover:shadow-[0_0_24px_-8px_rgba(239,68,68,0.5)]",
    Icon: Shield,
    bullets: [
      "ATT&CK technique map & IOCs",
      "Asset-specific impact",
      "Prioritized P1/P2/P3 actions",
      "Compliance hooks & detection guidance",
    ],
  },
  {
    type: "strategic",
    title: "Strategic",
    audience: "CISO, executive leadership, board",
    tlp: "TLP:AMBER+STRICT",
    accent: "text-accent-amber",
    border: "border-accent-amber/40",
    glow: "hover:shadow-[0_0_24px_-8px_rgba(245,158,11,0.5)]",
    Icon: ClipboardCheck,
    bullets: [
      "BLUF executive summary",
      "Quantified business & sector impact",
      "Decision points framed as questions",
      "Posture & investment recommendations",
    ],
  },
  {
    type: "external",
    title: "External Sharing",
    audience: "ISACs, peer organizations, community",
    tlp: "TLP:GREEN",
    accent: "text-accent-green",
    border: "border-accent-green/40",
    glow: "hover:shadow-[0_0_24px_-8px_rgba(34,197,94,0.5)]",
    Icon: Globe,
    bullets: [
      "Anonymized — no org identifiers",
      "STIX / MISP-compatible structure",
      "Detection guidance & mitigations",
      "Feedback channel for community input",
    ],
  },
];

export default function GeneratePage() {
  const router = useRouter();
  const {
    ingestedData,
    enrichmentResults,
    orgProfile,
    generatedReports,
    activeReportType,
    setActiveReportType,
    addReport,
    previousFeedback,
    selectedModel,
    loadDemoForStage,
    resetStage,
  } = usePipeline();

  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenTime, setRegenTime] = useState<Record<ReportType, string | null>>({
    operational: null,
    strategic: null,
    external: null,
  });

  const ready = ingestedData && enrichmentResults && orgProfile.organizationName;

  async function generate(type: ReportType, isRegen = false) {
    if (!ready) return;
    setGenerating(type);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: type,
          ingestedData,
          enrichmentResults,
          orgProfile,
          feedbackAdjustments: previousFeedback?.adjustments,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const meta = getModelMeta(selectedModel);
      addReport({
        type,
        content: data.result,
        timestamp: new Date().toISOString(),
        tlp: type === "operational" ? "TLP:RED" : type === "strategic" ? "TLP:AMBER+STRICT" : "TLP:GREEN",
        modelId: selectedModel,
        modelLabel: meta.label,
      });
      if (isRegen) setRegenTime((prev) => ({ ...prev, [type]: new Date().toISOString() }));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setGenerating(null);
    }
  }

  const activeReport = generatedReports.find((r) => r.type === activeReportType);

  if (!ready) {
    return (
      <div>
        <PageHeader
          stage={4}
          title="Report Generation"
          description="Prerequisites missing."
          actions={
            <button onClick={() => loadDemoForStage("generate")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
          }
        />
        <div className="px-8 py-12 max-w-2xl mx-auto">
          <Panel>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-accent-amber" />
                <span>Complete the upstream stages, or click Quick Demo to skip ahead.</span>
              </div>
              <ul className="text-xs space-y-1">
                <li className={orgProfile.organizationName ? "text-accent-green" : "text-accent-red"}>
                  {orgProfile.organizationName ? "✓" : "✗"} Organization profile saved
                </li>
                <li className={ingestedData ? "text-accent-green" : "text-accent-red"}>
                  {ingestedData ? "✓" : "✗"} Threat ingested
                </li>
                <li className={enrichmentResults ? "text-accent-green" : "text-accent-red"}>
                  {enrichmentResults ? "✓" : "✗"} Enrichment complete
                </li>
              </ul>
              <div className="flex gap-2 pt-2">
                <button onClick={() => router.push(orgProfile.organizationName ? "/ingest" : "/context")} className="btn-secondary">
                  Resume <ArrowRight className="size-4" />
                </button>
                <button onClick={() => loadDemoForStage("generate")} className="btn-amber">
                  <Zap className="size-4" /> Load Cached Demo
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        stage={4}
        eyebrow="Pipeline"
        title="Report Generation"
        description="Select a product type. Each report inherits ingested threat data, enrichment results, and your organizational profile."
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Context", href: "/context" },
          { label: "Generate" },
        ]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("generate")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("generate")} className="btn-secondary" title="Clear generated reports">
              <RotateCcw className="size-4" /> Reset
            </button>
            {activeReport && (
              <button onClick={() => router.push("/review")} className="btn-primary">
                Continue to Review <ArrowRight className="size-4" />
              </button>
            )}
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        {previousFeedback?.adjustments && previousFeedback.adjustments.length > 0 && (
          <div className="panel border-accent-cyan/40 bg-accent-cyan/5 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="size-4 mt-0.5 text-accent-cyan shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary">
                  Feedback from previous cycle applied
                </div>
                <ul className="mt-1 text-xs text-text-secondary space-y-0.5 list-disc list-inside">
                  {previousFeedback.adjustments.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map((c) => {
            const existing = generatedReports.find((r) => r.type === c.type);
            const isActive = activeReportType === c.type;
            const isGenerating = generating === c.type;
            return (
              <motion.div
                key={c.type}
                whileHover={{ y: -2 }}
                className={`panel p-5 border ${
                  isActive ? c.border : "border-border"
                } ${c.glow} transition-all`}
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => (existing ? setActiveReportType(c.type) : generate(c.type))}
                    className={`size-10 rounded flex items-center justify-center bg-bg-elevated border ${c.border}`}
                    aria-label={`${c.title} report`}
                  >
                    <c.Icon className={`size-5 ${c.accent}`} />
                  </button>
                  <span className={`text-[10px] font-bold tracking-widest border ${c.border} ${c.accent} px-2 py-0.5 rounded`}>
                    {c.tlp}
                  </span>
                </div>
                <button
                  onClick={() => (existing ? setActiveReportType(c.type) : generate(c.type))}
                  className="text-left w-full mt-4"
                >
                  <div className="text-base font-semibold text-text-primary">{c.title}</div>
                  <div className="mt-0.5 text-xs text-text-muted uppercase tracking-widest">{c.audience}</div>
                </button>
                <ul className="mt-3 space-y-1 text-xs text-text-secondary">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-1.5">
                      <ChevronRight className={`size-3 mt-0.5 shrink-0 ${c.accent}`} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between gap-2">
                  {isGenerating ? (
                    <span className="flex items-center gap-2 text-xs text-text-secondary">
                      <Loader2 className="size-3.5 animate-spin" /> Generating…
                    </span>
                  ) : existing ? (
                    <div className="flex items-center gap-2">
                      <span className="badge-green">
                        <Lock className="size-3" /> Generated
                      </span>
                      <button
                        onClick={() => generate(c.type, true)}
                        className="text-[11px] flex items-center gap-1 text-text-secondary hover:text-text-primary border border-border bg-bg-elevated px-2 py-1 rounded transition-colors"
                        title="Regenerate this report"
                      >
                        <RefreshCw className="size-3" /> Regenerate
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => generate(c.type)} className="text-xs text-accent-blue hover:underline">
                      Click to generate →
                    </button>
                  )}
                </div>
                {existing && regenTime[c.type] && (
                  <div className="mt-1 text-[10px] font-mono text-text-muted">
                    Regenerated {new Date(regenTime[c.type]!).toLocaleTimeString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {error && (
          <div className="panel border-accent-red/40 bg-accent-red/5 p-4 flex items-start gap-3">
            <AlertCircle className="size-4 mt-0.5 text-accent-red shrink-0" />
            <div className="flex-1 text-sm">
              <div className="font-semibold text-accent-red">Generation issue</div>
              <div className="text-text-secondary">{error}</div>
            </div>
            <button onClick={() => loadDemoForStage("generate")} className="btn-amber shrink-0">
              <Zap className="size-4" /> Load Demo
            </button>
          </div>
        )}

        {activeReport && (
          <Panel
            subtitle={`Generated ${new Date(activeReport.timestamp).toLocaleString()}`}
            actions={
              <button onClick={() => router.push("/review")} className="btn-primary">
                Send to Analyst Review <ArrowRight className="size-4" />
              </button>
            }
            noPadding
          >
            {generatedReports.map((r) => (
              <div key={`${r.type}-${r.timestamp}`} hidden={r.type !== activeReportType}>
                <ReportRenderer
                  content={r.content}
                  type={r.type}
                  modelId={r.modelId}
                  modelLabel={r.modelLabel}
                  timestamp={r.timestamp}
                />
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}
