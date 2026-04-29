import type { Severity } from "@/lib/types";
import { cn } from "@/lib/cn";

const STYLES: Record<Severity, string> = {
  CRITICAL: "bg-accent-red/10 border-accent-red/40 text-accent-red",
  HIGH: "bg-accent-amber/10 border-accent-amber/40 text-accent-amber",
  MEDIUM: "bg-accent-blue/10 border-accent-blue/40 text-accent-blue",
  LOW: "bg-text-muted/10 border-text-muted/40 text-text-secondary",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border tracking-widest uppercase",
        STYLES[severity]
      )}
    >
      {severity}
    </span>
  );
}
