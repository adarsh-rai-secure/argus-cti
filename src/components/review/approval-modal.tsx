"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onApprove: (data: { analyst: string; consent: boolean }) => void;
}

export function ApprovalModal({ open, onClose, onApprove }: Props) {
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const valid = name.trim().length > 0 && consent;

  const submit = async () => {
    if (!valid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onApprove({ analyst: name.trim(), consent });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="panel w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-accent-green" />
            <span className="text-sm font-semibold text-text-primary uppercase tracking-widest">
              Approve & Sign
            </span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-text-secondary">
            Approving binds your name to this intelligence product as the responsible analyst. The signed cycle is
            persisted to the RAG knowledge base for future retrieval and learning.
          </p>
          <div>
            <label className="label">Analyst Name</label>
            <input
              className="input"
              placeholder="e.g. Adarsh Rai"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-accent-green"
            />
            <span>
              I attest that I have reviewed this report, that estimative language reflects my analytical
              judgment, and that any external-sharing variant has been properly anonymized.
            </span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={!valid || submitting} className="btn-primary">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Approve & Sign
          </button>
        </div>
      </div>
    </div>
  );
}
