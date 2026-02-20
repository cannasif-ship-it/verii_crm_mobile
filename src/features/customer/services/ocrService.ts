import { Platform } from "react-native";
import TextRecognition from "@react-native-ml-kit/text-recognition";

export interface OcrLineItem {
  blockIndex: number;
  lineIndex: number;
  text: string;
}

export interface OcrResultPayload {
  rawText: string;
  lines: string[];
  lineItems: OcrLineItem[];
}

type OcrNativeLine = { text?: unknown; value?: unknown; content?: unknown; string?: unknown };
type OcrNativeBlock = { lines?: unknown; text?: unknown };
type OcrNativeResult = { text?: unknown; lines?: unknown; blocks?: unknown };

function toCleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function getLineText(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return toCleanText(value);
  }

  const line = value as OcrNativeLine;
  return (
    toCleanText(line.text) ??
    toCleanText(line.value) ??
    toCleanText(line.content) ??
    toCleanText(line.string)
  );
}

function uniqueLines(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    if (!out.includes(value)) {
      out.push(value);
    }
  }
  return out;
}

function extractLineItems(result: unknown): OcrLineItem[] {
  if (!result || typeof result !== "object") return [];

  const native = result as OcrNativeResult;
  const out: OcrLineItem[] = [];
  const blocks = Array.isArray(native.blocks) ? native.blocks : [];

  if (blocks.length > 0) {
    blocks.forEach((blockValue, blockIndex) => {
      if (!blockValue || typeof blockValue !== "object") return;
      const block = blockValue as OcrNativeBlock;
      const lines = Array.isArray(block.lines) ? block.lines : [];
      if (lines.length > 0) {
        lines.forEach((lineValue, lineIndex) => {
          const text = getLineText(lineValue);
          if (text) {
            out.push({ blockIndex, lineIndex, text });
          }
        });
        return;
      }

      const blockText = toCleanText(block.text);
      if (blockText) {
        out.push({ blockIndex, lineIndex: 0, text: blockText });
      }
    });
  }

  const topLines = Array.isArray(native.lines) ? native.lines : [];
  if (out.length === 0 && topLines.length > 0) {
    topLines.forEach((lineValue, lineIndex) => {
      const text = getLineText(lineValue);
      if (text) {
        out.push({ blockIndex: 0, lineIndex, text });
      }
    });
  }

  return out;
}

function toPayload(result: unknown): OcrResultPayload {
  const native = (result ?? {}) as OcrNativeResult;
  const rawText = toCleanText(native.text) ?? "";
  const lineItems = extractLineItems(result);

  const lineTexts = lineItems.map((item) => item.text);
  const fallbackLines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const lines = uniqueLines(lineTexts.length > 0 ? lineTexts : fallbackLines);
  return { rawText, lines, lineItems };
}

async function visionOCR(imageUri: string): Promise<OcrResultPayload> {
  const result = await TextRecognition.recognize(imageUri);
  return toPayload(result);
}

async function mlKitOCR(imageUri: string): Promise<OcrResultPayload> {
  const result = await TextRecognition.recognize(imageUri);
  return toPayload(result);
}

export async function runOCR(imageUri: string): Promise<OcrResultPayload> {
  if (!imageUri || typeof imageUri !== "string") {
    return { rawText: "", lines: [], lineItems: [] };
  }
  try {
    if (Platform.OS === "ios") {
      return await visionOCR(imageUri);
    }
    if (Platform.OS === "android") {
      return await mlKitOCR(imageUri);
    }
    return { rawText: "", lines: [], lineItems: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(
      message.includes("native") || message.includes("linking")
        ? "OCR için geliştirme build gerekli. Expo Go desteklenmez."
        : `OCR hatası: ${message}`
    );
  }
}
