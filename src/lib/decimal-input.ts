export const DECIMAL_INPUT_SCALE = 6;
export const DECIMAL_INPUT_MAX_INTEGER_DIGITS = 18;
export const DECIMAL_INPUT_STEP = "0.000001";
export const DECIMAL_INPUT_PLACEHOLDER = "0.000001";

type SanitizeDecimalOptions = {
  maxFractionDigits?: number;
  maxIntegerDigits?: number;
};

export function sanitizeDecimalInput(
  value: string,
  options: SanitizeDecimalOptions = {}
): string {
  const maxFractionDigits = options.maxFractionDigits ?? DECIMAL_INPUT_SCALE;
  const maxIntegerDigits =
    options.maxIntegerDigits ?? DECIMAL_INPUT_MAX_INTEGER_DIGITS;

  if (value === "") return "";

  const normalized = value.replace(",", ".");
  const cleaned = normalized.replace(/[^0-9.]/g, "");

  if (cleaned === "") return "";
  if (cleaned === ".") return ".";

  const [rawIntegerPart = "", ...fractionParts] = cleaned.split(".");
  const integerPart = rawIntegerPart.slice(0, maxIntegerDigits);
  const fractionPart = fractionParts.join("").slice(0, maxFractionDigits);
  const hasTrailingSeparator = cleaned.endsWith(".") && fractionPart.length === 0;

  if (fractionPart.length > 0) {
    return `${integerPart}.${fractionPart}`;
  }

  return hasTrailingSeparator ? `${integerPart}.` : integerPart;
}

export function parseDecimalInput(value: string, fallback = 0): number {
  const sanitized = sanitizeDecimalInput(value);
  if (sanitized === "" || sanitized === ".") return fallback;

  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatDecimalForInput(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return sanitizeDecimalInput(String(value));
}
