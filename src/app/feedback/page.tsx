"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  RefreshCw,
  RotateCcw,
  Star,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { usePipeline } from "@/lib/pipeline-context";

const PRESET_ADJUSTMENTS = [
  "Tighten executive summaries (3 sentences max)",
  "Lead with sector relevance before technical detail",
  "Use stronger estimative language for low-confidence claims",
  "Surface compliance implications earlier in the report",
  "Include more inline references to specific assets",
];

const FEEDBACK_CATEGORIES = [
  "Accuracy",
  "Completeness",
  "Actionability",
  "Timeliness",
  "Relevance to Org",
  "Compliance Mapping Quality",
  "Source Attribution",
  "Confidence Calibration",
  "ATT&CK Mapping Accuracy",
  "Readability for Target Audience",
  "Anonymization Quality",
  "Recommended Actions Quality",
];

export default function FeedbackPage() {
  const router = useRouter();
  const {
    cycleNumber,
    activeReportType,
    generatedReports,
    editHistory,
    approvalData,
    feedbackData,
    setFeedback,
    startNewCycle,
    ingestedData,
    loadDemoForStage,
    resetStage,
  } = usePipeline();

  const activeReport = generatedReports.find((r) => r.type === activeReportType);
  const [rating, setRating] = useState(feedbackData?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [adjustments, setAdjustments] = useState<string[]>(feedbackData?.adjustments ?? []);
  const [categories, setCategories] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  const submitFeedback = () => {
    if (!approvalData) return;
    const allAdjustments = [
      ...adjustments,
      ...(freeText.trim() ? [`Custom: ${freeText.trim()}`] : []),
    ];
    setFeedback({
      rating,
      edits: editHistory.length,
      cycleNumber,
      approver: approvalData.analyst,
      timestamp: new Date().toISOString(),
      adjustments: allAdjustments,
    });
  };

  const toggle = (a: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(a) ? list.filter((x) => x !== a) : [...list, a]);

  if (!approvalData || !activeReport) {
    return (
      <div>
        <PageHeader
          stage={6}
          title="Feedback"
          description="Approve a report before recording feedback."
          actions={
            <button onClick={() => loadDemoForStage("feedback")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
          }
        />
        <div className="px-8 py-12 max-w-2xl mx-auto">
          <Panel>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <AlertCircle className="size-4 text-accent-amber" />
              <span>No approved report in this cycle.</span>
              <button onClick={() => router.push("/review")} className="btn-primary ml-auto">
                Go to Review <ArrowRight className="size-4" />
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
        stage={6}
        eyebrow="Pipeline"
        title="Feedback & Cycle Closure"
        description="Capture quality signal and route improvements into the next cycle's prompt."
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Review", href: "/review" },
          { label: "Feedback" },
        ]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("feedback")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("feedback")} className="btn-secondary" title="Clear feedback">
              <RotateCcw className="size-4" /> Reset
            </button>
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="panel p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted">
              <Database className="size-3" /> RAG Knowledge Base
            </div>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-accent-green" />
              <span className="text-sm font-semibold text-text-primary">Saved to RAG</span>
            </div>
            <div className="mt-1 text-xs text-text-muted">
              Cycle #{String(cycleNumber).padStart(4, "0")} · {activeReport.type} · {activeReport.content.length.toLocaleString()} chars
            </div>
          </div>

          <div className="panel p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted">
              <Brain className="size-3" /> Analyst Engagement
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-text-primary">{editHistory.length}</span>
              <span className="text-xs text-text-secondary">edit{editHistory.length === 1 ? "" : "s"} applied</span>
            </div>
            <div className="mt-1 text-xs text-text-muted truncate">
              Approver: {approvalData.analyst}
            </div>
          </div>

          <div className="panel p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted">
              <Star className="size-3" /> Quality Signal
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-text-primary">
                {feedbackData?.rating ? `${feedbackData.rating}/5` : "—"}
              </span>
              <span className="text-xs text-text-secondary">
                {feedbackData ? "recorded" : "awaiting analyst rating"}
              </span>
            </div>
          </div>
        </div>

        <Panel
          title="Cycle Summary"
          subtitle={`Cycle #${String(cycleNumber).padStart(4, "0")} — ${ingestedData?.title ?? "untitled"}`}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field label="Threat" value={ingestedData?.title ?? "—"} />
            <Field label="Severity" value={ingestedData?.severity ?? "—"} />
            <Field label="Report Type" value={activeReport.type.toUpperCase()} />
            <Field label="TLP" value={activeReport.tlp} />
            <Field label="Edits" value={`${editHistory.length}`} />
            <Field
              label="Approved"
              value={`${approvalData.analyst} · ${new Date(approvalData.timestamp).toLocaleString()}`}
            />
          </dl>
        </Panel>

        {!feedbackData ? (
          <Panel title="Rate this Report" subtitle="Used to tune the next cycle's prompt and weighting">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`size-7 transition-colors ${
                        filled ? "fill-accent-amber text-accent-amber" : "text-text-muted"
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm text-text-secondary">{rating}/5</span>
              )}
            </div>

            <div className="mt-6">
              <div className="label">Feedback dimensions — what should we evaluate?</div>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_CATEGORIES.map((c) => {
                  const checked = categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(c, categories, setCategories)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        checked
                          ? "bg-accent-blue/15 border-accent-blue/40 text-text-primary"
                          : "bg-bg-elevated border-border text-text-secondary hover:border-border-strong"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="label">Adjustments to apply next cycle</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_ADJUSTMENTS.map((a) => {
                  const checked = adjustments.includes(a);
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
                        onChange={() => toggle(a, adjustments, setAdjustments)}
                      />
                      <span>{a}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="label">Additional feedback for future report improvement</div>
              <textarea
                className="input min-h-[100px] resize-y"
                placeholder="e.g., 'Future reports should include more context on lateral movement TTPs' or 'Compliance sections need more specific control references'"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
              />
              {freeText.trim().length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-accent-cyan">
                  <span className="size-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  <span>Will be queued for next cycle prompt injection</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={submitFeedback} disabled={rating === 0} className="btn-primary">
                <CheckCircle2 className="size-4" /> Record Feedback
              </button>
            </div>
          </Panel>
        ) : (
          <Panel
            title="Feedback Recorded"
            subtitle="Adjustments will be applied to the next cycle"
            actions={
              <button onClick={startNewCycle} className="btn-primary">
                <RefreshCw className="size-4" /> Start New Cycle
              </button>
            }
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="size-5 text-accent-green" />
              <div className="text-sm text-text-secondary">
                Cycle #{String(cycleNumber).padStart(4, "0")} closed. {feedbackData.rating}/5 quality.
              </div>
            </div>

            {feedbackData.adjustments && feedbackData.adjustments.length > 0 ? (
              <div>
                <div className="label">Adjustments queued for next cycle</div>
                <ul className="space-y-1 text-sm text-text-primary">
                  {feedbackData.adjustments.map((a) => (
                    <li key={a} className="flex items-start gap-2">
                      <ArrowRight className="size-3.5 mt-0.5 text-accent-cyan" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-[11px] text-text-muted">
                  Saved to feedback knowledge base · injected into next cycle&apos;s prompt
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-muted">No adjustments selected.</div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-elevated p-3">
      <dt className="text-[10px] uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-text-primary truncate">{value}</dd>
    </div>
  );
}
