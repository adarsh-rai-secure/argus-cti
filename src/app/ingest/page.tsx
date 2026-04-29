"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  Zap,
  AlertCircle,
} from "lucide-react";
import { friendlyError } from "@/lib/error-helper";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { AssetInventory } from "@/components/ingest/asset-inventory";
import { FeedCards } from "@/components/dashboard/feed-cards";
import { IngestedSummary } from "@/components/ingest/ingested-summary";
import { usePipeline } from "@/lib/pipeline-context";
import { DEMO_INGESTED } from "@/lib/demo-data";
import type { IngestedData } from "@/lib/types";

type Mode = "search" | "upload" | "demo";

export default function IngestPage() {
  const router = useRouter();
  const { ingestedData, setIngestedData, selectedModel, loadDemoForStage, resetStage } = usePipeline();
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model: selectedModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingest failed");
      const ingested: IngestedData = {
        ...data.result,
        source: "search",
        query,
      };
      setIngestedData(ingested);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setError(null);
    try {
      const text = await readFileText(file);
      setFilePreview(text.slice(0, 2000));
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `The analyst uploaded a document called "${file.name}". Treat the following extracted text as the primary source for the threat record. Extract the cleanest signal you can.\n\n---\n${text.slice(0, 12000)}`,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload analysis failed");
      const ingested: IngestedData = {
        ...data.result,
        source: "upload",
        fileName: file.name,
      };
      setIngestedData(ingested);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [setIngestedData, selectedModel]);

  const loadDemo = () => {
    setIngestedData(DEMO_INGESTED);
    setError(null);
  };

  const goNext = () => router.push("/enrich");

  return (
    <div>
      <PageHeader
        stage={2}
        eyebrow="Pipeline"
        title="Data Ingestion"
        description="Pull threat intelligence from search, files, or pre-built scenarios. ARGUS routes the ingested record into enrichment automatically."
        crumbs={[{ label: "Dashboard", href: "/" }, { label: "Context", href: "/context" }, { label: "Ingest" }]}
        actions={
          <>
            <button onClick={() => loadDemoForStage("ingest")} className="btn-amber">
              <Zap className="size-4" /> Quick Demo
            </button>
            <button onClick={() => resetStage("ingest")} className="btn-secondary" title="Clear ingested data">
              <RotateCcw className="size-4" /> Reset
            </button>
            {ingestedData ? (
              <button onClick={goNext} className="btn-primary">
                Continue to Enrichment <ArrowRight className="size-4" />
              </button>
            ) : null}
          </>
        }
      />

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        <Panel
          title="Threat Source"
          subtitle="Choose an input mode"
          actions={
            <div className="flex items-center gap-1 bg-bg-elevated border border-border rounded-md p-0.5">
              <ModeBtn active={mode === "search"} onClick={() => setMode("search")} icon={Search} label="Search" />
              <ModeBtn active={mode === "upload"} onClick={() => setMode("upload")} icon={Upload} label="Upload" />
              <ModeBtn active={mode === "demo"} onClick={() => setMode("demo")} icon={Zap} label="Quick Load" />
            </div>
          }
        >
          {mode === "search" && (
            <div className="space-y-3">
              <label className="label">Query — CVE, threat actor, incident, IOC</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="e.g. CVE-2026-33634, Salt Typhoon, BlackBasta ransomware, TeamPCP LiteLLM"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runQuery()}
                />
                <button onClick={runQuery} disabled={loading || !query.trim()} className="btn-primary">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Analyze
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="size-1.5 rounded-full bg-accent-cyan animate-pulse" />
                <span>Routed via OpenRouter · model selectable in the header · works for any active threat</span>
              </div>
            </div>
          )}

          {mode === "upload" && (
            <div
              className="border-2 border-dashed border-border rounded-md p-8 text-center bg-bg-elevated/40 cursor-pointer hover:border-accent-blue/50 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.csv,.tsv,.xlsx,.xls,.txt,.json,.md"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {loading ? (
                <Loader2 className="size-8 mx-auto text-accent-blue animate-spin" />
              ) : (
                <Upload className="size-8 mx-auto text-text-muted" />
              )}
              <div className="mt-3 text-sm text-text-primary font-medium">
                {fileName ? fileName : "Drop a file or click to select"}
              </div>
              <div className="mt-1 text-xs text-text-muted">PDF, Excel/CSV, JSON, Markdown, plain text</div>
              {filePreview && (
                <pre className="mt-4 text-left text-[11px] font-mono text-text-secondary bg-bg p-3 rounded border border-border max-h-48 overflow-auto">
                  {filePreview}{filePreview.length >= 2000 && "\n…"}
                </pre>
              )}
            </div>
          )}

          {mode === "demo" && (
            <div className="space-y-4">
              <div className="panel-elevated p-4 flex items-start gap-3">
                <Zap className="size-5 text-accent-cyan shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary">
                    TeamPCP / LiteLLM Supply Chain Compromise
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">
                    Pre-built scenario for thesis defense. Loads instantly without API call. Demonstrates the
                    full pipeline against a real March 2026 incident affecting AI/ML infrastructure.
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="badge-red">CRITICAL</span>
                    <span className="badge-mono">CVE-2026-33634</span>
                    <span className="badge-mono">10 ATT&CK Techniques</span>
                    <span className="badge-mono">PyPI Supply Chain</span>
                  </div>
                </div>
                <button onClick={loadDemo} className="btn-primary shrink-0">
                  <Zap className="size-4" /> Quick Load
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 panel p-3 border-accent-red/40 bg-accent-red/5 flex items-start gap-2 text-sm text-accent-red">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </Panel>

        {ingestedData && (
          <Panel
            title="Ingested Threat Record"
            subtitle="Structured intake — ready for enrichment"
            actions={
              <button onClick={goNext} className="btn-primary">
                Enrich <ArrowRight className="size-4" />
              </button>
            }
          >
            <IngestedSummary data={ingestedData} />
          </Panel>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel
            title="Asset Inventory"
            subtitle="5 assets tracked — used for relevance scoring"
            className="xl:col-span-2"
            noPadding
          >
            <AssetInventory />
          </Panel>

          <Panel
            title="Threat Feeds"
            subtitle="Continuous integrations"
          >
            <FeedCards />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
        active
          ? "bg-accent-blue/15 text-accent-blue"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}

async function readFileText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return `[PDF: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]\nNote: Server-side PDF text extraction is not enabled in this build. Pasting the abstract or analyst notes alongside upload yields best results.`;
  }
  return await file.text();
}
