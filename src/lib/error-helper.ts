export function friendlyError(raw: unknown): string {
  const msg = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : "";
  if (!msg) return "Generation temporarily unavailable.";
  if (/credit|quota|402|insufficient/i.test(msg)) {
    return "Model has insufficient credits for this request. Switch to a free model in the header dropdown, or load the demo report.";
  }
  if (/rate.?limit|429/i.test(msg)) {
    return "Provider rate limit hit. Try a different model or wait 30 seconds.";
  }
  if (/not a valid model|400|invalid/i.test(msg)) {
    return "Selected model is currently unavailable. Try another model from the header.";
  }
  if (/timeout|aborted|network|fetch/i.test(msg)) {
    return "Network timeout reaching the model provider. Try again or load the demo.";
  }
  return "Generation temporarily unavailable. Click 'Quick Demo' to load a pre-built example.";
}
