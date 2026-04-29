"use client";

import { Calendar, FileSearch, Skull, Tag } from "lucide-react";
import type { IngestedData } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/severity-badge";

export function IngestedSummary({ data }: { data: IngestedData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-text-muted">
            <FileSearch className="size-3" />
            <span>{data.source === "search" ? "Live Query" : data.source === "upload" ? "File Upload" : "Demo Scenario"}</span>
            {data.fileName && <span className="font-mono">· {data.fileName}</span>}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold text-text-primary">{data.title}</h3>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <SeverityBadge severity={data.severity} />
            <span className="badge-mono">
              <Calendar className="size-3" /> {data.date}
            </span>
            {data.threatActor && (
              <span className="badge-red">
                <Skull className="size-3" /> {data.threatActor}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-text-primary leading-relaxed">{data.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.cves && data.cves.length > 0 && (
          <IocBlock label="CVEs" items={data.cves} accent="amber" />
        )}
        {data.attckTechniques && data.attckTechniques.length > 0 && (
          <IocBlock label="ATT&CK Techniques" items={data.attckTechniques} accent="blue" />
        )}
        {data.iocs?.domains && data.iocs.domains.length > 0 && (
          <IocBlock label="Domains" items={data.iocs.domains} />
        )}
        {data.iocs?.ips && data.iocs.ips.length > 0 && (
          <IocBlock label="IP Addresses" items={data.iocs.ips} />
        )}
        {data.iocs?.files && data.iocs.files.length > 0 && (
          <IocBlock label="Files" items={data.iocs.files} />
        )}
        {data.iocs?.hashes && data.iocs.hashes.length > 0 && (
          <IocBlock label="Hashes" items={data.iocs.hashes} />
        )}
        {data.iocs?.packages && data.iocs.packages.length > 0 && (
          <IocBlock label="Packages" items={data.iocs.packages} accent="cyan" />
        )}
      </div>
    </div>
  );
}

function IocBlock({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent?: "amber" | "blue" | "cyan";
}) {
  const cls =
    accent === "amber" ? "badge-amber" : accent === "blue" ? "badge-blue" : accent === "cyan" ? "badge-cyan" : "badge-mono";
  return (
    <div className="panel-elevated p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted mb-2">
        <Tag className="size-3" />
        <span>{label}</span>
        <span className="font-mono ml-auto">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className={cls}>{it}</span>
        ))}
      </div>
    </div>
  );
}
