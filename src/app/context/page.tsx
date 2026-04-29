"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { usePipeline } from "@/lib/pipeline-context";
import {
  CRITICAL_ASSET_TYPES,
  INDUSTRY_OPTIONS,
  REGULATORY_FRAMEWORKS,
} from "@/lib/demo-data";

export default function ContextPage() {
  const router = useRouter();
  const { orgProfile, setOrgProfile, loadDemoForStage, resetStage } = usePipeline();

  const update = <K extends keyof typeof orgProfile>(key: K, value: (typeof orgProfile)[K]) =>
    setOrgProfile((p) => ({ ...p, [key]: value }));

  const toggleArr = (key: "regulatoryFrameworks" | "criticalAssetTypes", value: string) => {
    setOrgProfile((p) => {
      const current = p[key];
      return {
        ...p,
        [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const ready = orgProfile.organizationName.trim().length > 0 && orgProfile.industry.length > 0;

  return (
    <div>
      <PageHeader
        stage={1}
        eyebrow="Pipeline"
        title="Organizational Context"
        description="Provide sector, regulatory, and asset profile so generated reports map to your specific environment. Captured first because it shapes downstream prioritization."
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Context" },
        ]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("context")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("context")} className="btn-secondary" title="Clear org profile">
              <RotateCcw className="size-4" /> Reset
            </button>
            <button
              onClick={() => router.push("/ingest")}
              disabled={!ready}
              className="btn-primary"
            >
              Continue to Ingest <ArrowRight className="size-4" />
            </button>
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1100px] mx-auto space-y-6">
        <Panel
          title="Organization Profile"
          subtitle="Required — drives prioritization, framing, and compliance mapping"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Organization Name</label>
              <input
                className="input"
                placeholder="e.g. Carnegie Mellon University"
                value={orgProfile.organizationName}
                onChange={(e) => update("organizationName", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Industry / Sector</label>
              <select
                className="input"
                value={orgProfile.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                <option value="">Select sector…</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Panel>

        <Panel title="Regulatory Frameworks" subtitle="Select all that apply">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {REGULATORY_FRAMEWORKS.map((f) => {
              const checked = orgProfile.regulatoryFrameworks.includes(f);
              return (
                <label
                  key={f}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-sm transition-colors ${
                    checked
                      ? "bg-accent-blue/10 border-accent-blue/40 text-text-primary"
                      : "bg-bg-elevated border-border text-text-secondary hover:border-border-strong"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-accent-blue"
                    checked={checked}
                    onChange={() => toggleArr("regulatoryFrameworks", f)}
                  />
                  <span>{f}</span>
                </label>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Critical Asset Types"
          subtitle="What ARGUS should weight heavily when scoring relevance"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CRITICAL_ASSET_TYPES.map((a) => {
              const checked = orgProfile.criticalAssetTypes.includes(a);
              return (
                <label
                  key={a}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-sm transition-colors ${
                    checked
                      ? "bg-accent-cyan/10 border-accent-cyan/40 text-text-primary"
                      : "bg-bg-elevated border-border text-text-secondary hover:border-border-strong"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-accent-cyan"
                    checked={checked}
                    onChange={() => toggleArr("criticalAssetTypes", a)}
                  />
                  <span>{a}</span>
                </label>
              );
            })}
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Intelligence Priorities" subtitle="What matters most to your stakeholders">
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="e.g. Protect research IP, ensure FERPA compliance for student data, defend AI/ML pipeline integrity…"
              value={orgProfile.intelligencePriorities}
              onChange={(e) => update("intelligencePriorities", e.target.value)}
            />
          </Panel>

          <Panel title="Additional Context" subtitle="Recent incidents, programs, constraints">
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="e.g. Multi-cloud (AWS + GCP), zero-trust rollout in progress, recent ransomware tabletop, board-level interest in AI risk…"
              value={orgProfile.additionalContext}
              onChange={(e) => update("additionalContext", e.target.value)}
            />
          </Panel>
        </div>

        <div className="panel p-4 flex items-center gap-3 border-accent-blue/30 bg-accent-blue/5">
          {ready ? (
            <ShieldCheck className="size-5 text-accent-green shrink-0" />
          ) : (
            <Building2 className="size-5 text-accent-blue shrink-0" />
          )}
          <div className="flex-1 text-sm text-text-secondary">
            {ready
              ? "Organization profile complete. Generated reports will be tailored to this context."
              : "Provide an organization name and industry to proceed. The remaining fields are optional but improve relevance."}
          </div>
          <button
            onClick={() => router.push("/ingest")}
            disabled={!ready}
            className="btn-primary"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
