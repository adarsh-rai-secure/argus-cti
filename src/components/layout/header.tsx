"use client";

import { Bell, GraduationCap, Search, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "./model-selector";
import { usePipeline } from "@/lib/pipeline-context";

export function Header() {
  const router = useRouter();
  const { loadFullDemo } = usePipeline();

  const onQuickDemo = () => {
    loadFullDemo();
    router.push("/generate");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <header className="h-16 shrink-0 border-b border-border bg-bg-surface flex items-center px-6 gap-6">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/argus-logo.png"
          alt="ARGUS logo"
          width={36}
          height={36}
          className="object-contain"
          onError={(e) => {
            e.currentTarget.src = "/argus-logo.svg";
          }}
        />
        <h1 className="text-3xl font-black tracking-tight text-text-primary leading-none">ARGUS</h1>
        <span className="hidden md:inline self-center text-xs uppercase tracking-widest text-text-secondary border-l border-border pl-3">
          AI-Enabled Threat Intelligence Reporting
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3 text-xs text-text-secondary">
        <button
          onClick={onQuickDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-accent-amber/50 bg-accent-amber/15 text-accent-amber hover:bg-accent-amber/25 hover:border-accent-amber transition-colors text-[12px] font-semibold uppercase tracking-widest"
          title="Skip the pipeline — load the cached demo"
        >
          <Zap className="size-3.5" />
          Quick Demo
        </button>
        <ModelSelector />
        <div className="hidden lg:flex items-center gap-3 font-mono text-text-muted">
          <span>{dateStr}</span>
          <span>{timeStr} UTC</span>
        </div>
        <button className="size-8 rounded border border-border bg-bg-elevated hover:border-border-strong flex items-center justify-center" aria-label="Search">
          <Search className="size-3.5" />
        </button>
        <button className="size-8 rounded border border-border bg-bg-elevated hover:border-border-strong flex items-center justify-center relative" aria-label="Alerts">
          <Bell className="size-3.5" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-accent-red" />
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="size-8 rounded-full bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center">
            <GraduationCap className="size-4 text-accent-blue" />
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-text-primary text-[13px] font-medium">Adarsh Rai</div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Carnegie Mellon University</div>
          </div>
        </div>
      </div>
    </header>
  );
}
