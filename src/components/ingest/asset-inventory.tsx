"use client";

import { DEMO_ASSETS } from "@/lib/demo-data";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { AssetStatus } from "@/lib/types";

const STATUS_STYLES: Record<AssetStatus, string> = {
  VULNERABLE: "text-accent-red border-accent-red/30 bg-accent-red/10",
  COMPROMISED: "text-accent-red border-accent-red/40 bg-accent-red/15",
  "AT RISK": "text-accent-amber border-accent-amber/30 bg-accent-amber/10",
  MONITORING: "text-accent-blue border-accent-blue/30 bg-accent-blue/10",
  PROTECTED: "text-accent-green border-accent-green/30 bg-accent-green/10",
};

export function AssetInventory() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-text-muted">
            <th className="text-left py-2 px-3 font-medium">Asset ID</th>
            <th className="text-left py-2 px-3 font-medium">Name</th>
            <th className="text-left py-2 px-3 font-medium">Category</th>
            <th className="text-left py-2 px-3 font-medium">Risk</th>
            <th className="text-left py-2 px-3 font-medium">Severity</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {DEMO_ASSETS.map((a) => (
            <tr key={a.id} className="hover:bg-bg-elevated/40 transition-colors">
              <td className="py-2.5 px-3 font-mono text-xs text-text-secondary">{a.id}</td>
              <td className="py-2.5 px-3 font-medium text-text-primary">{a.name}</td>
              <td className="py-2.5 px-3 text-text-secondary text-xs">{a.category}</td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-text-primary text-xs">{a.riskScore.toFixed(1)}</span>
                  <div className="w-16 h-1 bg-bg-elevated rounded overflow-hidden">
                    <div
                      className={`h-full ${
                        a.riskScore >= 9
                          ? "bg-accent-red"
                          : a.riskScore >= 7
                            ? "bg-accent-amber"
                            : "bg-accent-blue"
                      }`}
                      style={{ width: `${(a.riskScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-3"><SeverityBadge severity={a.severity} /></td>
              <td className="py-2.5 px-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border tracking-widest uppercase ${STATUS_STYLES[a.status]}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
