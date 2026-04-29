"use client";

import { usePipeline } from "./pipeline-context";
import type { StageId } from "./types";

export type StageStatus = "empty" | "in-progress" | "complete";

export function useStageStatuses(): Record<StageId, StageStatus> {
  const {
    ingestedData,
    enrichmentResults,
    orgProfile,
    generatedReports,
    activeReportType,
    approvalData,
    feedbackData,
    editHistory,
  } = usePipeline();

  const ingestStatus: StageStatus = ingestedData ? "complete" : "empty";

  const enrichStatus: StageStatus = enrichmentResults
    ? "complete"
    : ingestedData
      ? "in-progress"
      : "empty";

  const orgFilled =
    orgProfile.organizationName.trim().length > 0 ||
    orgProfile.industry.length > 0 ||
    orgProfile.regulatoryFrameworks.length > 0;
  const contextStatus: StageStatus = orgFilled
    ? orgProfile.organizationName && orgProfile.industry
      ? "complete"
      : "in-progress"
    : enrichmentResults
      ? "in-progress"
      : "empty";

  const generateStatus: StageStatus =
    generatedReports.length > 0 ? "complete" : orgFilled ? "in-progress" : "empty";

  const reviewStatus: StageStatus = approvalData
    ? "complete"
    : editHistory.length > 0 || activeReportType
      ? "in-progress"
      : "empty";

  const feedbackStatus: StageStatus = feedbackData
    ? "complete"
    : approvalData
      ? "in-progress"
      : "empty";

  return {
    dashboard: "complete",
    ingest: ingestStatus,
    enrich: enrichStatus,
    context: contextStatus,
    generate: generateStatus,
    review: reviewStatus,
    feedback: feedbackStatus,
  };
}
