"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { friendlyError } from "@/lib/error-helper";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { ReportRenderer } from "@/components/report/report-renderer";
import { ApprovalModal } from "@/components/review/approval-modal";
import { usePipeline } from "@/lib/pipeline-context";

interface ChatMsg {
  role: "user" | "system" | "assistant";
  text: string;
  timestamp: string;
}

const QUICK_EDITS = [
  "Strengthen the confidence language throughout",
  "Add a paragraph addressing FERPA implications specifically",
  "Make the executive summary more concise",
  "Add specific remediation timelines (24h, 72h, 30d)",
  "Remove any references to internal asset names for external sharing",
  "Add a risk score or severity rating to each finding",
  "Include detection signatures or YARA rules if applicable",
  "Rewrite the recommended actions in priority order (P1/P2/P3)",
  "Add context about how peer organizations are responding",
  "Strengthen the business impact section with financial estimates",
];

export default function ReviewPage() {
  const router = useRouter();
  const {
    activeReportType,
    generatedReports,
    updateActiveReport,
    addEdit,
    editHistory,
    approvalData,
    setApproval,
    selectedModel,
    loadDemoForStage,
    resetStage,
  } = usePipeline();

  const activeReport = generatedReports.find((r) => r.type === activeReportType);
  const [originalLength] = useState(activeReport?.content.length ?? 0);
  const [originalContent] = useState(activeReport?.content ?? "");
  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "system",
      text: "Analyst review session initialized. Type natural-language edit instructions below — for example, 'remove org name from paragraph 3' or 'strengthen the confidence language'.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  if (!activeReport) {
    return (
      <div>
        <PageHeader stage={5} title="Analyst Review" description="No active report selected." />
        <div className="px-8 py-12 max-w-2xl mx-auto">
          <Panel>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <AlertCircle className="size-4 text-accent-amber" />
              <span>Generate a report first.</span>
              <button onClick={() => router.push("/generate")} className="btn-primary ml-auto">
                Go to Generation <ArrowRight className="size-4" />
              </button>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  async function submitEdit(instruction: string) {
    if (!instruction.trim() || busy) return;
    if (!activeReport) return;
    const userMsg: ChatMsg = { role: "user", text: instruction, timestamp: new Date().toISOString() };
    setChat((c) => [...c, userMsg]);
    setInput("");
    setBusy(true);
    setError(null);
    const before = activeReport.content.length;
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportContent: activeReport.content,
          instruction,
          reportType: activeReport.type,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Edit failed");
      updateActiveReport(data.result);
      addEdit({
        instruction,
        timestamp: new Date().toISOString(),
        beforeLength: before,
        afterLength: data.result.length,
      });
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: `Edit applied. Report updated (${data.result.length.toLocaleString()} chars; Δ ${(
            data.result.length - before
          ).toLocaleString()}).`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      const msg = friendlyError(e);
      setError(msg);
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          text: msg,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const editPercent = (() => {
    if (!originalContent || !activeReport) return 0;
    const max = Math.max(originalContent.length, activeReport.content.length, 1);
    let common = 0;
    const len = Math.min(originalContent.length, activeReport.content.length);
    for (let i = 0; i < len; i++) {
      if (originalContent[i] === activeReport.content[i]) common++;
      else break;
    }
    return Math.min(100, Math.round(((max - common) / max) * 100));
  })();

  return (
    <div>
      <PageHeader
        stage={5}
        eyebrow="Pipeline"
        title="Analyst Review"
        description="Iteratively refine the report with natural-language instructions, then approve & sign."
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Generate", href: "/generate" },
          { label: "Review" },
        ]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("review")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("review")} className="btn-secondary" title="Clear edits and approval">
              <RotateCcw className="size-4" /> Reset
            </button>
            {approvalData ? (
              <>
                <button onClick={() => window.print()} className="btn-secondary" title="Save the approved report as a PDF">
                  <Download className="size-4" /> Export PDF
                </button>
                <button onClick={() => router.push("/feedback")} className="btn-primary">
                  Continue to Feedback <ArrowRight className="size-4" />
                </button>
              </>
            ) : (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <CheckCircle2 className="size-4" /> Approve & Sign
              </button>
            )}
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div data-print-region>
            <div data-print-only className="px-6 pt-4 pb-3 border-b-2 border-black">
              <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-600">
                ARGUS Intelligence Product · Approved & Signed
              </div>
              <div className="mt-1 text-xl font-bold text-black">
                Cycle #0001 — {activeReport.type.toUpperCase()} REPORT
              </div>
              {approvalData && (
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-700">
                  <div>
                    <span className="uppercase tracking-widest text-slate-500">Approved by:</span>{" "}
                    <span className="font-semibold text-black">{approvalData.analyst}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-widest text-slate-500">Signed:</span>{" "}
                    <span className="font-mono">{new Date(approvalData.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-widest text-slate-500">Edits applied:</span>{" "}
                    <span className="font-mono">{editHistory.length}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-widest text-slate-500">Length change:</span>{" "}
                    <span className="font-mono">~{editPercent}%</span>
                  </div>
                </div>
              )}
            </div>
          <Panel
            title={`${activeReport.type.toUpperCase()} REPORT`}
            subtitle={`Cycle in progress · ${editHistory.length} edit${editHistory.length === 1 ? "" : "s"} applied · ~${editPercent}% changed`}
            noPadding
            className="min-h-[600px]"
          >
            <ReportRenderer
              content={activeReport.content}
              type={activeReport.type}
              modelId={activeReport.modelId}
              modelLabel={activeReport.modelLabel}
              timestamp={activeReport.timestamp}
            />
          </Panel>
          </div>

          <div className="space-y-4" data-print-hide>
            <Panel title="Analyst Chat" subtitle="Natural-language edit instructions" noPadding>
              <div className="flex flex-col h-[460px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chat.map((m, i) => (
                    <ChatBubble key={i} msg={m} />
                  ))}
                  {busy && (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Applying edit…</span>
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>

                {!approvalData && (
                  <div className="border-t border-border p-3 space-y-2">
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {QUICK_EDITS.map((q) => (
                        <button
                          key={q}
                          onClick={() => submitEdit(q)}
                          disabled={busy}
                          className="text-[11px] px-2 py-1 rounded border border-border bg-bg-elevated text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        placeholder="Type an edit instruction…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitEdit(input)}
                        disabled={busy}
                      />
                      <button onClick={() => submitEdit(input)} disabled={busy || !input.trim()} className="btn-primary">
                        <Send className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Edit Log" subtitle={`${editHistory.length} action${editHistory.length === 1 ? "" : "s"}`}>
              {editHistory.length === 0 ? (
                <div className="text-xs text-text-muted">No edits yet.</div>
              ) : (
                <ul className="space-y-2">
                  {editHistory.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-text-muted">#{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1">
                        <div className="text-text-primary">{e.instruction}</div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {new Date(e.timestamp).toLocaleTimeString()} · Δ {(
                            (e.afterLength ?? 0) - (e.beforeLength ?? 0)
                          ).toLocaleString()} chars
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {approvalData && (
              <div className="panel border-accent-green/40 bg-accent-green/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-accent-green shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">Report approved</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      Signed by <span className="text-text-primary font-medium">{approvalData.analyst}</span>
                      {" · "}
                      {new Date(approvalData.timestamp).toLocaleString()}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-text-muted font-mono">
                      <span>Edits: {editHistory.length}</span>
                      <span>~{editPercent}% changed</span>
                      <span>Length: {activeReport.content.length.toLocaleString()}</span>
                      <span>Original: {originalLength.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => router.push("/feedback")} className="btn-primary w-full mt-3">
                  Continue to Feedback <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {error && (
              <div className="panel border-accent-red/40 bg-accent-red/5 p-3 text-xs text-accent-red">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApprovalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={({ analyst, consent }) => {
          setApproval({ analyst, consent, timestamp: new Date().toISOString() });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "system") {
    return (
      <div className="text-[11px] text-text-muted leading-relaxed border-l-2 border-accent-blue/40 pl-2">
        <Sparkles className="inline size-3 mr-1 text-accent-blue" />
        {msg.text}
      </div>
    );
  }
  if (msg.role === "user") {
    return (
      <div className="flex items-start gap-2">
        <div className="size-6 rounded bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center shrink-0">
          <User className="size-3 text-accent-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-primary bg-bg-elevated rounded p-2 border border-border">
            {msg.text}
          </div>
          <div className="text-[10px] font-mono text-text-muted mt-0.5">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="size-6 rounded bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center shrink-0">
        <MessageSquare className="size-3 text-accent-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-primary bg-bg-elevated rounded p-2 border border-border">
          {msg.text}
        </div>
        <div className="text-[10px] font-mono text-text-muted mt-0.5">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
