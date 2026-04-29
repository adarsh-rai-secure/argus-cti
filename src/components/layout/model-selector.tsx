"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Cpu } from "lucide-react";
import { AVAILABLE_MODELS, getModelMeta } from "@/lib/models";
import { usePipeline } from "@/lib/pipeline-context";

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = usePipeline();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const current = getModelMeta(selectedModel);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-border bg-bg-elevated hover:border-border-strong transition-colors min-w-[200px]"
      >
        <Cpu className="size-3.5 text-text-muted shrink-0" />
        <span className={`size-2 rounded-full ${current.dot} shrink-0`} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12px] font-medium text-text-primary leading-tight truncate">
            {current.label}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted leading-tight truncate">
            {current.provider}
          </div>
        </div>
        <ChevronDown
          className={`size-3.5 text-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className="absolute right-0 top-full mt-1.5 w-[280px] panel-elevated overflow-hidden shadow-lg z-50"
          >
            <li className="px-3 py-2 border-b border-border bg-bg-surface/40">
              <div className="text-[10px] uppercase tracking-widest text-text-muted">
                Inference Model
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                Routed via OpenRouter
              </div>
            </li>
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = m.id === selectedModel;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-bg-elevated transition-colors ${
                      isSelected ? "bg-accent-blue/5" : ""
                    }`}
                  >
                    <span className={`size-2 rounded-full ${m.dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-primary leading-tight truncate">
                        {m.label}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted leading-tight truncate">
                        {m.provider}
                      </div>
                    </div>
                    {m.free && (
                      <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border border-accent-green/40 text-accent-green bg-accent-green/10 shrink-0">
                        FREE
                      </span>
                    )}
                    {isSelected && <Check className="size-3.5 text-accent-blue shrink-0" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
