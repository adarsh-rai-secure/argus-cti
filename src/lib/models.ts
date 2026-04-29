export interface ModelMeta {
  id: string;
  label: string;
  provider: string;
  dot: string;
  free: boolean;
}

export const AVAILABLE_MODELS: ModelMeta[] = [
  {
    id: "deepseek/deepseek-chat-v3-0324",
    label: "DeepSeek V3",
    provider: "DeepSeek",
    dot: "bg-violet-400",
    free: true,
  },
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
    provider: "Google",
    dot: "bg-sky-400",
    free: true,
  },
  {
    id: "meta-llama/llama-4-maverick",
    label: "Llama 4 Maverick",
    provider: "Meta",
    dot: "bg-blue-400",
    free: true,
  },
  {
    id: "meta-llama/llama-4-scout",
    label: "Llama 4 Scout",
    provider: "Meta",
    dot: "bg-blue-300",
    free: true,
  },
  {
    id: "google/gemini-2.5-flash-preview",
    label: "Gemini 2.5 Flash",
    provider: "Google",
    dot: "bg-cyan-400",
    free: true,
  },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    provider: "OpenAI",
    dot: "bg-emerald-400",
    free: false,
  },
  {
    id: "anthropic/claude-sonnet-4-20250514",
    label: "Claude Sonnet",
    provider: "Anthropic",
    dot: "bg-orange-400",
    free: false,
  },
];

export const DEFAULT_MODEL_ID = "deepseek/deepseek-chat-v3-0324";

export function getModelMeta(id: string): ModelMeta {
  return AVAILABLE_MODELS.find((m) => m.id === id) ?? AVAILABLE_MODELS[0];
}
