"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  stage?: number;
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ stage, eyebrow, title, description, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-bg-surface/40 backdrop-blur">
      <div className="px-8 py-6">
        {(crumbs?.length || eyebrow || stage) && (
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-text-muted mb-2">
            {stage !== undefined && (
              <span className="font-mono text-accent-blue">STAGE {String(stage).padStart(2, "0")}</span>
            )}
            {eyebrow && <span>{eyebrow}</span>}
            {crumbs?.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-3" />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-text-secondary max-w-3xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
