"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Sparkles,
  Building2,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Activity,
} from "lucide-react";
import { STAGES } from "@/lib/stages";
import { useStageStatuses } from "@/lib/stage-status";
import { StageIcon } from "./stage-icon";
import { usePipeline } from "@/lib/pipeline-context";

const ICONS = {
  dashboard: LayoutDashboard,
  ingest: Database,
  enrich: Sparkles,
  context: Building2,
  generate: FileText,
  review: ClipboardCheck,
  feedback: MessageSquare,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const statuses = useStageStatuses();
  const { cycleNumber } = usePipeline();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg-surface flex flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center gap-2">
        <div className="size-9 rounded-md bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/argus-logo.png"
            alt="ARGUS"
            width={28}
            height={28}
            className="object-contain"
            onError={(e) => {
              e.currentTarget.src = "/argus-logo.svg";
            }}
          />
        </div>
        <div>
          <div className="text-base font-black tracking-tight text-text-primary">ARGUS</div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">CTI Console</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Pipeline
        </div>
        <ul className="space-y-0.5 px-2">
          {STAGES.map((stage) => {
            const Icon = ICONS[stage.id];
            const isActive =
              pathname === stage.href ||
              (stage.href !== "/" && pathname.startsWith(stage.href));
            const status = statuses[stage.id];
            return (
              <li key={stage.id}>
                <Link
                  href={stage.href}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-accent-blue/10 text-text-primary border border-accent-blue/30"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {stage.number !== null && (
                        <span className="text-[10px] font-mono text-text-muted">0{stage.number}</span>
                      )}
                      <span className="truncate">{stage.shortLabel}</span>
                    </div>
                  </div>
                  {stage.id !== "dashboard" && <StageIcon status={status} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-text-muted">
          <span>Active Cycle</span>
          <span className="font-mono text-text-secondary">#{String(cycleNumber).padStart(4, "0")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Activity className="size-3 text-accent-green animate-pulse" />
          <span>System operational</span>
        </div>
      </div>
    </aside>
  );
}
