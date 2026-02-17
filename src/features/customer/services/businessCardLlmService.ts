import { apiClient } from "../../../lib/axios";
import { buildBusinessCardUserPrompt, BUSINESS_CARD_SYSTEM_PROMPT } from "./businessCardPromptTemplates";

type LlmExtractRequest = {
  systemPrompt: string;
  userPrompt: string;
  rawText: string;
};

type LlmExtractResponse = {
  success?: boolean;
  data?: unknown;
  message?: string;
};

function coerceToString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const candidates = [record.outputText, record.text, record.content, record.result, record.json];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }
  return null;
}

export async function extractBusinessCardViaLLM(rawText: string): Promise<string> {
  const text = rawText?.trim();
  if (!text) {
    throw new Error("Empty OCR text.");
  }

  const payload: LlmExtractRequest = {
    systemPrompt: BUSINESS_CARD_SYSTEM_PROMPT,
    userPrompt: buildBusinessCardUserPrompt(text),
    rawText: text,
  };

  const response = await apiClient.post<LlmExtractResponse>("/api/ai/business-card/extract", payload);
  const body = response.data;

  if (body?.success === false) {
    throw new Error(body.message || "LLM extraction failed.");
  }

  const topLevelText = coerceToString(body);
  if (topLevelText) return topLevelText;

  const nestedText = coerceToString(body?.data);
  if (nestedText) return nestedText;

  if (body?.data && typeof body.data === "object") {
    return JSON.stringify(body.data);
  }

  throw new Error("LLM extraction response is not parseable.");
}
