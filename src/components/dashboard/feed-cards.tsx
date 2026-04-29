"use client";

import { Activity, AlertCircle, Wifi } from "lucide-react";
import { DEMO_FEEDS } from "@/lib/demo-data";

export function FeedCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
      {DEMO_FEEDS.map((f) => {
        const isActive = f.status === "active";
        return (
          <div
            key={f.id}
            className="panel-elevated p-2.5 flex items-center gap-2.5 min-w-0"
          >
            <div
              className={`size-8 shrink-0 rounded flex items-center justify-center border ${
                isActive
                  ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                  : "bg-text-muted/10 border-border text-text-muted"
              }`}
            >
              {isActive ? <Wifi className="size-3.5" /> : <AlertCircle className="size-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-text-primary truncate">{f.name}</span>
                <span
                  className={`size-1.5 shrink-0 rounded-full ${
                    isActive ? "bg-accent-green animate-pulse" : "bg-text-muted/50"
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-muted font-mono">
                <span className="truncate">
                  {isActive ? `${f.recordCount.toLocaleString()} indicators` : "offline"}
                </span>
                <span>·</span>
                <span className="truncate">{f.lastUpdate}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FeedSummary() {
  const active = DEMO_FEEDS.filter((f) => f.status === "active").length;
  const total = DEMO_FEEDS.length;
  const records = DEMO_FEEDS.reduce((sum, f) => sum + f.recordCount, 0);
  return (
    <div className="flex items-center gap-4 text-xs text-text-secondary">
      <div className="flex items-center gap-2">
        <Activity className="size-3.5 text-accent-green animate-pulse" />
        <span className="font-mono">
          {active}/{total} feeds online
        </span>
      </div>
      <div className="font-mono text-text-muted">{records.toLocaleString()} indicators</div>
    </div>
  );
}
