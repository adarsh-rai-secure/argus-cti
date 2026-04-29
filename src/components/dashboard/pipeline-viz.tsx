"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Sparkles,
  Database,
  FileText,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import { useStageStatuses } from "@/lib/stage-status";
import Link from "next/link";

const STAGES = [
  { id: "context", label: "Context", icon: Building2, href: "/context" },
  { id: "ingest", label: "Ingest", icon: Database, href: "/ingest" },
  { id: "enrich", label: "Enrich", icon: Sparkles, href: "/enrich" },
  { id: "generate", label: "Generate", icon: FileText, href: "/generate" },
  { id: "review", label: "Review", icon: ClipboardCheck, href: "/review" },
  { id: "feedback", label: "Feedback", icon: MessageSquare, href: "/feedback" },
] as const;

const SOURCES = [
  "MISP Events",
  "CrowdStrike EDR",
  "Palo Alto NGFW",
  "Splunk SIEM",
  "AlienVault OTX",
  "CISA KEV",
  "VirusTotal",
  "Internal Tickets",
];

export function PipelineViz() {
  const statuses = useStageStatuses();

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <div className="relative">
          <div className="text-[10px] font-mono tracking-widest uppercase text-text-muted mb-3">
            External Sources
          </div>
          <ul className="space-y-1.5">
            {SOURCES.map((s, i) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-center gap-2 px-2.5 py-1.5 rounded border border-border bg-bg-elevated text-[11px] text-text-secondary"
              >
                <span
                  className="size-1.5 rounded-full bg-accent-cyan"
                  style={{ animation: `pulse 2s ${i * 0.25}s infinite` }}
                />
                <span className="truncate">{s}</span>
                <DotStream delay={i * 0.35} />
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative pt-7">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
              </linearGradient>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>
            <line
              x1="40"
              y1="120"
              x2="960"
              y2="120"
              stroke="url(#flowGrad)"
              strokeWidth="2"
              strokeDasharray="6 6"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.5s" repeatCount="indefinite" />
            </line>
            <path
              d="M 940 120 Q 1000 200 940 250 L 80 250 Q 20 250 35 175 L 35 140"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
              markerEnd="url(#arrow)"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite" />
            </path>
            <text x="500" y="285" textAnchor="middle" fontSize="10" fill="#94a3b8" letterSpacing="3" className="uppercase">
              Continuous Learning Loop
            </text>
          </svg>

          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STAGES.map((s, i) => {
              const status = statuses[s.id as keyof typeof statuses];
              const Icon = s.icon;
              const isActive = status === "in-progress";
              const isComplete = status === "complete";
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={s.href}
                    className={`relative block panel hover:border-border-strong p-3 transition-colors ${
                      isActive ? "border-accent-blue/60 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]" : ""
                    } ${isComplete ? "border-accent-green/40" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-text-muted">
                        0{i + 1}
                      </span>
                      <div
                        className={`size-2 rounded-full ${
                          isComplete
                            ? "bg-accent-green"
                            : isActive
                              ? "bg-accent-blue animate-pulse"
                              : "bg-text-muted/40"
                        }`}
                      />
                    </div>
                    <Icon
                      className={`size-5 mt-2 ${
                        isComplete
                          ? "text-accent-green"
                          : isActive
                            ? "text-accent-blue"
                            : "text-text-secondary"
                      }`}
                    />
                    <div className="mt-2 text-sm font-semibold text-text-primary">{s.label}</div>
                    <div className="mt-0.5 text-[10px] text-text-muted uppercase tracking-widest">
                      {status === "complete" ? "Complete" : status === "in-progress" ? "Active" : "Idle"}
                    </div>
                    {isActive && (
                      <div className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-accent-blue to-transparent animate-scan" />
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DotStream({ delay }: { delay: number }) {
  return (
    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1 w-12 h-[2px] overflow-hidden hidden lg:block">
      <span
        className="absolute inset-y-0 w-2 rounded-full bg-accent-cyan/80"
        style={{
          animation: `argusFlow 2.4s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    </span>
  );
}
