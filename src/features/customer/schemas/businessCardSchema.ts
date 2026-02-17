import { z } from "zod";
import type { BusinessCardExtraction, BusinessCardOcrResult } from "../types/businessCard";

export const BusinessCardExtractionSchema = z.object({
  name: z.string().nullable(),
  title: z.string().nullable(),
  company: z.string().nullable(),
  phones: z.array(z.string()),
  emails: z.array(z.string()),
  website: z.string().nullable(),
  address: z.string().nullable(),
  social: z.object({
    linkedin: z.string().nullable(),
    instagram: z.string().nullable(),
    x: z.string().nullable(),
    facebook: z.string().nullable(),
  }),
  notes: z.array(z.string()),
});

function normalizeNullable(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCompanySuffix(value: string | null): string | null {
  if (!value) return null;
  return value
    .replace(/\bA\.?\s?S\.?\b/gi, "A.Ş.")
    .replace(/\bLTD\.?\s*STI\.?\b/gi, "Ltd. Şti.");
}

function normalizeAddress(value: string | null): string | null {
  if (!value) return null;
  return value
    .replace(/\b(mahalle|mah\.?|mh\.?)\b/gi, "Mah.")
    .replace(/\b(caddesi|cad\.?)\b/gi, "Cad.")
    .replace(/\b(sokak|sk\.?)\b/gi, "Sk.")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;
    if (!out.includes(cleaned)) out.push(cleaned);
  }
  return out;
}

function normalizePhone(raw: string): { phone: string | null; note?: string } {
  const source = raw.replace(/\s+/g, " ").trim();
  if (!source) return { phone: null };

  const extMatch = source.match(/(?:dahili|ext\.?|x)\s*[:.]?\s*(\d{1,6})/i);
  const faxMatch = source.match(/\bfax\b/i);
  if (faxMatch) {
    return { phone: null, note: `Fax: ${source}` };
  }
  if (extMatch?.[1]) {
    return { phone: null, note: `Dahili: ${extMatch[1]}` };
  }

  const digitsOnly = source.replace(/\D/g, "");
  if (!digitsOnly) return { phone: null };

  let local = digitsOnly;
  if (local.startsWith("0") && local.length >= 11) {
    local = local.slice(1);
  } else if (local.startsWith("90") && local.length >= 12) {
    local = local.slice(2);
  }

  if (local.length === 10) {
    const normalized = `+90${local}`;
    if (/^\+90\d{10}$/.test(normalized)) return { phone: normalized };
  }

  return { phone: null, note: `Phone?: ${source}` };
}

function normalizePhones(values: string[], notes: string[]): string[] {
  const normalized: string[] = [];
  for (const value of values) {
    const result = normalizePhone(value);
    if (result.phone && !normalized.includes(result.phone)) {
      normalized.push(result.phone);
    }
    if (result.note) {
      notes.push(result.note);
    }
  }
  return normalized;
}

function normalizeEmails(values: string[]): string[] {
  const emails = values
    .map((x) => x.trim())
    .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))
    .map((x) => x.toLowerCase());
  return uniqueStrings(emails);
}

function normalizeWebsite(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, "").trim();
  return cleaned.length ? cleaned : null;
}

function normalizeSocialHandle(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, "").trim();
  return cleaned.length ? cleaned : null;
}

export function repairJsonString(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const firstBrace = input.indexOf("{");
  const lastBrace = input.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  let candidate = input.slice(firstBrace, lastBrace + 1).trim();
  candidate = candidate.replace(/,\s*([}\]])/g, "$1");

  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    const withDoubleQuotes = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
    const safe = withDoubleQuotes.replace(/,\s*([}\]])/g, "$1");
    try {
      JSON.parse(safe);
      return safe;
    } catch {
      return null;
    }
  }
}

export function validateAndNormalizeBusinessCardExtraction(input: unknown): BusinessCardExtraction {
  const parsed = BusinessCardExtractionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("LLM extraction JSON schema validation failed.");
  }

  const notes = uniqueStrings(parsed.data.notes);
  const phones = normalizePhones(parsed.data.phones, notes);
  const emails = normalizeEmails(parsed.data.emails);

  return {
    name: normalizeNullable(parsed.data.name),
    title: normalizeNullable(parsed.data.title),
    company: normalizeCompanySuffix(normalizeNullable(parsed.data.company)),
    phones,
    emails,
    website: normalizeWebsite(normalizeNullable(parsed.data.website)),
    address: normalizeAddress(normalizeNullable(parsed.data.address)),
    social: {
      linkedin: normalizeSocialHandle(normalizeNullable(parsed.data.social.linkedin)),
      instagram: normalizeSocialHandle(normalizeNullable(parsed.data.social.instagram)),
      x: normalizeSocialHandle(normalizeNullable(parsed.data.social.x)),
      facebook: normalizeSocialHandle(normalizeNullable(parsed.data.social.facebook)),
    },
    notes: uniqueStrings(notes),
  };
}

export function toBusinessCardOcrResult(extraction: BusinessCardExtraction): BusinessCardOcrResult {
  return {
    customerName: extraction.name ?? extraction.company ?? undefined,
    phone1: extraction.phones[0],
    email: extraction.emails[0],
    address: extraction.address ?? undefined,
    website: extraction.website ?? undefined,
  };
}
