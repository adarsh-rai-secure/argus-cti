"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Crosshair,
  Database,
  GitBranchPlus,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { friendlyError } from "@/lib/error-helper";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { usePipeline } from "@/lib/pipeline-context";
import { DEMO_ENRICHMENT } from "@/lib/demo-data";
import type { EnrichmentResults } from "@/lib/types";

const STEPS = [
  { id: 0, label: "Mapping to MITRE ATT&CK framework", icon: Crosshair },
  { id: 1, label: "Cross-referencing organizational assets", icon: Database },
  { id: 2, label: "Identifying threat actors & TTPs", icon: ShieldAlert },
  { id: 3, label: "Computing kill chain phase", icon: GitBranchPlus },
  { id: 4, label: "Querying grounding sources", icon: Target },
  { id: 5, label: "Computing confidence assessment", icon: Sparkles },
];

export default function EnrichPage() {
  const router = useRouter();
  const { ingestedData, enrichmentResults, setEnrichmentResults, selectedModel, loadDemoForStage, resetStage } = usePipeline();
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ingestedData && !enrichmentResults && !running) {
      runEnrichment();
    }
  }, [ingestedData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(t);
  }, [running]);

  async function runEnrichment() {
    if (!ingestedData) return;
    setRunning(true);
    setError(null);
    setStepIdx(0);

    if (ingestedData.source === "demo") {
      // For demo, simulate the LLM steps but use the canonical enrichment.
      await new Promise((r) => setTimeout(r, STEPS.length * 900 + 200));
      setEnrichmentResults(DEMO_ENRICHMENT);
      setRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingestedData, model: selectedModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrichment failed");
      const result = data.result as EnrichmentResults;
      setEnrichmentResults(result);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setRunning(false);
    }
  }

  if (!ingestedData) {
    return (
      <div>
        <PageHeader stage={2} title="Enrichment" description="No ingested data found. Begin by selecting a threat source." />
        <div className="px-8 py-12 max-w-2xl mx-auto">
          <Panel>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <AlertCircle className="size-4 text-accent-amber" />
              <span>You need to ingest a threat first.</span>
              <button onClick={() => router.push("/ingest")} className="btn-primary ml-auto">
                Go to Ingest <ArrowRight className="size-4" />
              </button>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        stage={3}
        eyebrow="Pipeline"
        title="Enrichment"
        description="Map raw indicators to MITRE ATT&CK, attribute actors, identify affected assets, and compute confidence."
        crumbs={[{ label: "Dashboard", href: "/" }, { label: "Ingest", href: "/ingest" }, { label: "Enrich" }]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("enrich")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("enrich")} className="btn-secondary" title="Clear enrichment results">
              <RotateCcw className="size-4" /> Reset
            </button>
            <button onClick={runEnrichment} disabled={running} className="btn-secondary">
              <RefreshCw className={`size-4 ${running ? "animate-spin" : ""}`} /> Re-run
            </button>
            {enrichmentResults && (
              <button onClick={() => router.push("/generate")} className="btn-primary">
                Continue to Generate <ArrowRight className="size-4" />
              </button>
            )}
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        {(running || (!enrichmentResults && !error)) && (
          <Panel title="Enrichment in Progress" subtitle="Multi-stage analytical pipeline">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STEPS.map((s, i) => {
                const isDone = i < stepIdx;
                const isActive = i === stepIdx && running;
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`panel-elevated p-3 flex items-center gap-3 ${
                      isActive ? "border-accent-blue/60" : isDone ? "border-accent-green/30" : ""
                    }`}
                  >
                    <div
                      className={`size-8 rounded flex items-center justify-center border ${
                        isDone
                          ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                          : isActive
                            ? "bg-accent-blue/10 border-accent-blue/40 text-accent-blue"
                            : "bg-bg border-border text-text-muted"
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isDone ? (
                        <Zap className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-text-primary">{s.label}</div>
                      <div className="text-[10px] uppercase tracking-widest font-mono text-text-muted">
                        {isDone ? "complete" : isActive ? "running" : "pending"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Panel>
        )}

        {error && (
          <Panel>
            <div className="flex items-start gap-3 text-sm text-accent-red">
              <AlertCircle className="size-4 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Enrichment failed</div>
                <div className="text-text-secondary">{error}</div>
              </div>
              <button onClick={runEnrichment} className="btn-secondary">Retry</button>
            </div>
          </Panel>
        )}

        <AnimatePresence>
          {enrichmentResults && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Panel title="Confidence" subtitle="Aggregated assessment">
                  <ConfidenceMeter level={enrichmentResults.confidence} />
                </Panel>
                <Panel title="Kill Chain" subtitle="Most-advanced phase reached">
                  <KillChain phases={enrichmentResults.killChainPhases} current={enrichmentResults.killChainPhase} />
                </Panel>
                <Panel title="Threat Actor" subtitle="Attribution & assessment">
                  <ActorList actors={enrichmentResults.threatActors} />
                </Panel>
              </div>

              <Panel title="MITRE ATT&CK Mapping" subtitle={`${enrichmentResults.attckTechniques.length} techniques identified`} noPadding>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-text-muted">
                        <th className="text-left py-2 px-3 font-medium">ID</th>
                        <th className="text-left py-2 px-3 font-medium">Technique</th>
                        <th className="text-left py-2 px-3 font-medium">Tactic</th>
                        <th className="text-left py-2 px-3 font-medium">Observed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {enrichmentResults.attckTechniques.map((t) => (
                        <tr key={t.id} className="hover:bg-bg-elevated/40">
                          <td className="py-2.5 px-3 font-mono text-xs text-accent-cyan">{t.id}</td>
                          <td className="py-2.5 px-3 text-text-primary">{t.name}</td>
                          <td className="py-2.5 px-3 text-text-secondary text-xs">{t.tactic}</td>
                          <td className="py-2.5 px-3 text-text-secondary text-xs">{t.description ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Affected Organizational Assets" subtitle="Cross-referenced against asset inventory">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrichmentResults.affectedAssets.map((a) => (
                    <div key={a.assetId} className="panel-elevated p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-text-muted">{a.assetId}</span>
                        <span className="text-sm font-semibold text-text-primary">{a.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">{a.relevance}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConfidenceMeter({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const value = level === "HIGH" ? 85 : level === "MEDIUM" ? 55 : 30;
  const color =
    level === "HIGH" ? "bg-accent-green" : level === "MEDIUM" ? "bg-accent-amber" : "bg-accent-red";
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-text-primary">{level}</span>
        <span className="text-xs uppercase tracking-widest text-text-muted">confidence</span>
      </div>
      <div className="mt-3 h-1.5 bg-bg-elevated rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-2 text-xs text-text-muted">
        Multi-source corroboration · grounded outputs
      </div>
    </div>
  );
}

function KillChain({ phases, current }: { phases: string[]; current: string }) {
  return (
    <div className="space-y-2">
      {phases.map((p) => {
        const isCurrent = p === current;
        return (
          <div key={p} className="flex items-center gap-2 text-xs">
            <span
              className={`size-2 rounded-full ${
                isCurrent ? "bg-accent-red animate-pulse" : "bg-accent-blue/60"
              }`}
            />
            <span className={isCurrent ? "text-accent-red font-semibold" : "text-text-primary"}>{p}</span>
            {isCurrent && <span className="ml-auto badge-red">CURRENT</span>}
          </div>
        );
      })}
    </div>
  );
}

function ActorList({ actors }: { actors: { name: string; aliases?: string[]; assessment: string }[] }) {
  if (!actors?.length)
    return <div className="text-sm text-text-muted">No actor attribution available.</div>;
  return (
    <div className="space-y-3">
      {actors.map((a) => (
        <div key={a.name}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-accent-red" />
            <span className="text-sm font-semibold text-text-primary">{a.name}</span>
          </div>
          {a.aliases && a.aliases.length > 0 && (
            <div className="mt-1 text-[11px] text-text-muted">
              aliases: {a.aliases.join(", ")}
            </div>
          )}
          <div className="mt-1 text-xs text-text-secondary leading-relaxed">{a.assessment}</div>
        </div>
      ))}
    </div>
  );
}
