import { cn } from "@/lib/cn";

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

export function Panel({ title, subtitle, actions, children, className, noPadding, ...rest }: PanelProps) {
  return (
    <div className={cn("panel", className)} {...rest}>
      {(title || actions) && (
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {title && (
              <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {title}
              </div>
            )}
            {subtitle && <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-4")}>{children}</div>
    </div>
  );
}
