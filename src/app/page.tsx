"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Eye,
  GitBranch,
  Globe2,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PipelineViz } from "@/components/dashboard/pipeline-viz";
import { FeedCards, FeedSummary } from "@/components/dashboard/feed-cards";
import { Panel } from "@/components/ui/panel";
import { usePipeline } from "@/lib/pipeline-context";
import { getModelMeta } from "@/lib/models";

const STATS = [
  { label: "Threats Tracked (24h)", value: "1,284", trend: "+12%", icon: Eye },
  { label: "Avg. Time to Report", value: "8m 42s", trend: "-31%", icon: Zap },
  { label: "Active Threat Actors", value: "47", trend: "+3", icon: Network },
  { label: "RAG Knowledge Records", value: "2,917", trend: "+62", icon: GitBranch },
];

export default function DashboardPage() {
  const { cycleNumber, ingestedData } = usePipeline();
  return (
    <div>
      <div className="border-b border-border bg-bg-surface/50 grid-bg">
        <div className="px-8 py-8 max-w-[1600px] mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-text-muted mb-2">
                <ShieldCheck className="size-3 text-accent-green" />
                <span>Pipeline Status</span>
                <span className="font-mono text-accent-green">OPERATIONAL</span>
                <span className="text-text-muted">·</span>
                <span className="font-mono text-text-secondary">CYCLE #{String(cycleNumber).padStart(4, "0")}</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
                AI-Augmented Threat Intelligence Pipeline
              </h2>
              <p className="mt-2 text-sm text-text-secondary max-w-2xl">
                ARGUS converts raw threat data into governed, organization-aware intelligence products.
                Six stages, continuous feedback, full analyst-in-the-loop control.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                href={ingestedData ? "/enrich" : "/context"}
                className="btn-primary"
              >
                {ingestedData ? "Continue Active Cycle" : "Start New Analysis"}
                <ArrowRight className="size-4" />
              </Link>
              <FeedSummary />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="panel p-4"
              >
                <div className="flex items-start justify-between">
                  <s.icon className="size-4 text-text-secondary" />
                  <span className="text-[11px] font-mono text-accent-green">{s.trend}</span>
                </div>
                <div className="mt-3 text-2xl font-semibold text-text-primary">{s.value}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-widest text-text-muted">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-6">
        <Panel
          title="Pipeline Topology"
          subtitle="Six-stage processing chain with continuous feedback loop"
          actions={<DashboardModelBadge />}
        >
          <PipelineViz />
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel
            title="Threat Feeds"
            subtitle="Real-time integration status"
            className="lg:col-span-2"
            actions={<FeedSummary />}
          >
            <FeedCards />
          </Panel>

          <Panel title="Coverage" subtitle="Current intelligence surface">
            <ul className="divide-y divide-border">
              <CoverageRow
                label="MITRE ATT&CK Techniques"
                value="201 of 229"
                detail="mapped (88%)"
              />
              <CoverageRow
                label="CVE Coverage (last 30d)"
                value="1,247"
                detail="vulnerabilities tracked"
              />
              <CoverageRow
                label="Sector-Specific IoCs"
                value="4,891"
                detail="indicators"
              />
              <CoverageRow
                label="Regulatory Mapping"
                value="6"
                detail="frameworks configured"
              />
            </ul>
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-muted">
              <Globe2 className="size-3.5" />
              <span>14 regions · 6 ISACs · 32 countries</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DashboardModelBadge() {
  const { selectedModel } = usePipeline();
  const meta = getModelMeta(selectedModel);
  return (
    <span className="badge-cyan">
      <Cpu className="size-3" />
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label} · model-agnostic via OpenRouter
    </span>
  );
}

function CoverageRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-2 py-2.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-right">
        <span className="font-mono text-text-primary text-sm font-semibold">{value}</span>
        <span className="ml-1 text-[11px] text-text-muted">{detail}</span>
      </span>
    </li>
  );
}
