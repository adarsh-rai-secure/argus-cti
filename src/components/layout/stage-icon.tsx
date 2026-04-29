"use client";

import type { StageStatus } from "@/lib/stage-status";

export function StageIcon({ status, size = 14 }: { status: StageStatus; size?: number }) {
  const stroke = "#94a3b8";
  const fill =
    status === "complete" ? "#22c55e" : status === "in-progress" ? "#3b82f6" : "transparent";
  const ringColor =
    status === "complete" ? "#22c55e" : status === "in-progress" ? "#3b82f6" : "#3a4560";

  if (status === "in-progress") {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="6" fill="none" stroke={ringColor} strokeWidth="1.5" />
        <path d="M 8 2 A 6 6 0 0 1 8 14 Z" fill={ringColor} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" fill={fill} stroke={status === "empty" ? stroke : ringColor} strokeWidth="1.5" />
      {status === "complete" && (
        <path d="M 4.5 8 L 7 10.5 L 11.5 5.5" stroke="#0a0e1a" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
