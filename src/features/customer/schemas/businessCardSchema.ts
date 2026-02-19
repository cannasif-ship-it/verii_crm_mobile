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

const PHONE_E164_TR_REGEX = /^\+90\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_TOKEN_REGEX = /@|www\.|https?:\/\/|e-?mail|email|tel\.?|telefon|gsm|mobile|fax|faks/i;
const ADDRESS_HINT_REGEX =
  /\b(mah(?:\.|alle(?:si)?)?|cad(?:\.|de(?:si)?)?|sok(?:\.|ak|ağı)?|sk\.?|bulvar[ıi]?|bulv\.?|blv\.?|blok|no\s*:|kat\b|daire|apt|plaza|han|san\.?\s*sit\.?|sit\.?|osb|bölge(?:si)?|organize|posta|pk|ilçe|istanbul|ankara|izmir|adana|bursa|kocaeli|esenyurt|beşiktaş|nilüfer|dikilitaş|bayrampaşa|ataşehir|kadıköy|üsküdar|beylikdüzü|başakşehir|antalya|konya|gaziantep|mersin|kayseri|gebze|misis)\b/i;
const WEBSITE_CANDIDATE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9.-]*\.(?:com(?:\.tr)?|net|org|tr|edu(?:\.tr)?|gov(?:\.tr)?|io|biz|info|me|tv)(?:\/[^\s]*)?/gi;
const WEBSITE_TLD_REGEX = /\.(?:com(?:\.tr)?|net|org|tr|edu(?:\.tr)?|gov(?:\.tr)?|io|biz|info|me|tv)(?:\/|$)/i;
const WEBSITE_BLACKLIST_REGEX = /\b(A\.?\s?Ş|AŞ|LTD|ŞT[İI]|SAN|T[İI]C|DIŞ|AKS|ORTAKLIĞI)\b/i;
const COMPANY_MARKER_REGEX = /\b(A\.?\s?Ş|AŞ|LTD|ŞT[İI]|SAN|T[İI]C|ORTAKLIĞI)\b/i;
const PHONE_CANDIDATE_REGEX =
  /(?:\+?\s*90[\s().-]*)?(?:0[\s().-]*)?\(?\d{3}\)?[\s().-]*\d{3}[\s().-]*\d{2}[\s().-]*\d{2}(?:\s*\/\s*\d{1,6}|\s*\(\d{1,6}\))?/gi;

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
  return sanitizeAddress(value);
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

function pushNote(notes: string[], note: string): void {
  const cleaned = note.replace(/\s+/g, " ").trim();
  if (!cleaned) return;
  if (!notes.includes(cleaned)) notes.push(cleaned);
}

function stripPhoneLabel(value: string): string {
  return value
    .replace(/\b(tel|telefon|gsm|mobile|cep|fax|faks)\b\s*:?/gi, " ")
    .replace(/^[TM]\s*[|:I]\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripContactFragments(value: string): string {
  const marker = /\b(e-?mail|email|www|http|tel\.?|telefon|gsm|mobile|fax|faks)\b|@/i;
  const idx = value.search(marker);
  if (idx === -1) return value.trim();
  return value.slice(0, idx).replace(/[-,:;|/]+$/g, "").trim();
}

function normalizePhone(raw: string): { phone: string | null; note?: string } {
  const source = raw.replace(/\s+/g, " ").trim();
  if (!source) return { phone: null };

  const extByWord = source.match(/\b(?:dahili|ext\.?|x)\s*[:.]?\s*(\d{1,6})\b/i)?.[1];
  const extBySlash = source.match(/\/\s*(\d{2,6})\b/)?.[1];
  const extByTailParen = source.match(/\((\d{2,6})\)\s*$/)?.[1];
  const extension = extByWord || extBySlash || extByTailParen;
  const isFax = /\bfax|faks\b/i.test(source);

  let baseSource = source;
  if (extension) {
    if (extByWord) {
      baseSource = source.replace(/\b(?:dahili|ext\.?|x)\s*[:.]?\s*\d{1,6}\b/i, "").trim();
    } else if (extBySlash) {
      baseSource = source.replace(/\/\s*\d{2,6}\b/, "").trim();
    } else if (extByTailParen) {
      baseSource = source.replace(/\(\d{2,6}\)\s*$/, "").trim();
    }
  }

  const phoneLikeMatch = baseSource.match(
    /(?:\+?\s*90[\s().-]*)?(?:0[\s().-]*)?\(?\d{3}\)?[\s().-]*\d{3}[\s().-]*\d{2}[\s().-]*\d{2}/
  );
  const sourceForNormalization = phoneLikeMatch?.[0] ?? baseSource;

  let compact = stripPhoneLabel(sourceForNormalization).replace(/[^\d+]/g, "");
  if (!compact) {
    if (extension) {
      return { phone: null, note: isFax ? `Fax Dahili: ${extension}` : `Dahili: ${extension}` };
    }
    return { phone: null };
  }

  if (compact.startsWith("+")) {
    compact = `+${compact.slice(1).replace(/\+/g, "")}`;
  } else {
    compact = compact.replace(/\+/g, "");
  }

  if (compact.startsWith("00")) {
    compact = compact.slice(2);
  }

  let digits = compact.startsWith("+") ? compact.slice(1) : compact;
  if (digits.startsWith("0")) {
    digits = `90${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `90${digits}`;
  } else if (!digits.startsWith("90")) {
    if (extension) {
      return { phone: null, note: isFax ? `Fax Dahili: ${extension}` : `Dahili: ${extension}` };
    }
    return { phone: null, note: `Şüpheli telefon: ${source}` };
  }

  const normalized = `+${digits}`;
  if (!PHONE_E164_TR_REGEX.test(normalized)) {
    if (extension) {
      return { phone: null, note: isFax ? `Fax Dahili: ${extension}` : `Dahili: ${extension}` };
    }
    return { phone: null, note: `Şüpheli telefon: ${source}` };
  }

  if (isFax) {
    const note = extension ? `Fax: ${normalized}, Dahili: ${extension}` : `Fax: ${normalized}`;
    return { phone: null, note };
  }

  const note = extension ? `Dahili: ${extension}` : undefined;
  return { phone: normalized, note };
}

function normalizePhones(values: string[], notes: string[]): string[] {
  const normalized: string[] = [];
  for (const value of values) {
    const result = normalizePhone(value);
    if (result.phone && !normalized.includes(result.phone)) {
      normalized.push(result.phone);
    }
    if (result.note) {
      pushNote(notes, result.note);
    }
  }
  const mobile = normalized.filter((x) => /^\+905\d{9}$/.test(x));
  const landline = normalized.filter((x) => !/^\+905\d{9}$/.test(x));
  return [...mobile, ...landline];
}

function normalizeEmails(values: string[], notes: string[]): string[] {
  const emails: string[] = [];
  for (const value of values) {
    const cleaned = value
      .replace(/\b(e-?mail|email|mail)\b\s*:?/gi, " ")
      .replace(/[;,]+$/g, "")
      .trim()
      .toLowerCase();
    if (!cleaned) continue;
    if (!EMAIL_REGEX.test(cleaned)) continue;
    if (!emails.includes(cleaned)) emails.push(cleaned);
    if (/\bkep\b/i.test(cleaned)) {
      pushNote(notes, `KEP olabilir: ${cleaned}`);
    }
  }
  return emails;
}

function extractPhoneCandidatesFromRawText(rawText: string): string[] {
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(PHONE_CANDIDATE_REGEX.source, "gi");
  while ((match = regex.exec(rawText)) !== null) {
    const value = match[0]?.replace(/\s+/g, " ").trim();
    if (value && !candidates.includes(value)) {
      candidates.push(value);
    }
  }
  return candidates;
}

function extractEmailCandidatesFromRawText(rawText: string): string[] {
  const matches = rawText.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g) ?? [];
  return uniqueStrings(matches.map((x) => x.replace(/[;,]+$/g, "")));
}

function extractDomainFromWebsite(value: string): string {
  const withoutProtocol = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  return withoutProtocol.split("/")[0]?.toLowerCase() ?? "";
}

function isValidWebsite(candidate: string): boolean {
  const lower = candidate.toLowerCase();
  if (!lower.includes(".")) return false;
  if (!WEBSITE_TLD_REGEX.test(lower)) return false;
  return true;
}

function normalizeWebsite(value: string | null, notes?: string[]): string | null {
  if (!value) return null;

  const original = value.replace(/\s+/g, " ").trim();
  let candidate = original
    .replace(/\b(web|website)\b\s*:?/gi, " ")
    .trim()
    .replace(/^[("']+/, "")
    .replace(/[)"',;:]+$/g, "");

  if (!candidate) return null;
  if (candidate.includes(" ")) {
    candidate = candidate.split(/\s+/)[0] ?? "";
  }

  if (!candidate) return null;
  if (candidate.includes("@")) return null;
  if (WEBSITE_BLACKLIST_REGEX.test(candidate.toUpperCase())) {
    if (notes) pushNote(notes, `Şirket satırı parçası olabilir: ${original}`);
    return null;
  }

  const lowered = candidate.toLowerCase();
  if (!isValidWebsite(lowered)) return null;
  return lowered;
}

function extractWebsiteCandidatesFromRawText(rawText: string): string[] {
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(WEBSITE_CANDIDATE_REGEX.source, "gi");
  while ((match = regex.exec(rawText)) !== null) {
    const normalized = normalizeWebsite(match[0]);
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  }
  return candidates;
}

function pickWebsiteFromRawText(rawText: string | undefined, emails: string[], notes: string[]): string | null {
  if (!rawText) return null;
  if (!/(www|http|\.com|\.com\.tr|\.net|\.org|\.tr)/i.test(rawText)) {
    return null;
  }

  const candidates = extractWebsiteCandidatesFromRawText(rawText);
  if (candidates.length === 0) return null;

  const emailDomains = emails.map((x) => x.split("@")[1]?.toLowerCase()).filter(Boolean) as string[];
  if (emailDomains.length > 0) {
    const matched = candidates.find((candidate) => {
      const domain = extractDomainFromWebsite(candidate);
      return emailDomains.some((emailDomain) => domain.includes(emailDomain) || emailDomain.includes(domain));
    });
    if (matched) return matched;
  }

  if (candidates.length > 1) {
    for (const extra of candidates.slice(1)) {
      pushNote(notes, `Marka/ek website: ${extra}`);
    }
  }
  return candidates[0] ?? null;
}

export function sanitizeAddress(address: string | null): string | null {
  if (!address) return null;

  const lines = address
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const kept = lines
    .map((line) => stripContactFragments(line))
    .filter((line) => !CONTACT_TOKEN_REGEX.test(line) && line.length > 0);
  if (kept.length === 0) return null;

  const filtered = kept.filter((line) => ADDRESS_HINT_REGEX.test(line) || (/\d/.test(line) && /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(line)));
  const merged = (filtered.length > 0 ? filtered : kept).join(", ");
  const normalized = merged
    .replace(/\b(mahallesi|mahalle|mah\.?|mh\.?)\b/gi, "Mah.")
    .replace(/\b(caddesi|cadde|cad\.?)\b/gi, "Cad.")
    .replace(/\b(sokağı|sokak|sok\.?|sk\.?)\b/gi, "Sk.")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return null;
  if (CONTACT_TOKEN_REGEX.test(normalized)) return null;
  return normalized;
}

function buildAddressFromRawText(rawText: string | undefined, notes: string[]): string | null {
  if (!rawText) return null;
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const addressLines: string[] = [];
  for (const line of lines) {
    if (CONTACT_TOKEN_REGEX.test(line)) {
      pushNote(notes, `Adres dışı iletişim satırı: ${line}`);
      const stripped = stripContactFragments(line);
      if (stripped && ADDRESS_HINT_REGEX.test(stripped)) {
        addressLines.push(stripped);
      }
      continue;
    }
    if (ADDRESS_HINT_REGEX.test(line)) {
      addressLines.push(line);
    }
  }

  if (addressLines.length === 0) return null;
  return sanitizeAddress(addressLines.join("\n"));
}

export function sanitizePhones(phones: string[]): string[] {
  return normalizePhones(phones, []);
}

function sanitizeName(value: string | null): string | null {
  if (!value) return null;
  if (COMPANY_MARKER_REGEX.test(value)) return null;
  if (CONTACT_TOKEN_REGEX.test(value)) return null;
  const tokens = value.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return null;
  return value;
}

function sanitizeTitle(value: string | null): string | null {
  if (!value) return null;
  if (COMPANY_MARKER_REGEX.test(value) && !/\b(manager|müdür|architect|satın|export|purchasing|logistics|chief|yönetmeni|director|sales)\b/i.test(value)) {
    return null;
  }
  if (CONTACT_TOKEN_REGEX.test(value)) return null;
  return value;
}

function sanitizeCompany(value: string | null): string | null {
  if (!value) return null;
  if (/@|www\.|https?:\/\//i.test(value)) return null;
  return normalizeCompanySuffix(value);
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

export function validateAndNormalizeBusinessCardExtraction(
  input: unknown,
  rawText?: string
): BusinessCardExtraction {
  const parsed = BusinessCardExtractionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("LLM extraction JSON schema validation failed.");
  }

  const notes = uniqueStrings(parsed.data.notes);
  let phones = normalizePhones(parsed.data.phones, notes);
  let emails = normalizeEmails(parsed.data.emails, notes);
  if (phones.length === 0 && rawText) {
    phones = normalizePhones(extractPhoneCandidatesFromRawText(rawText), notes);
  }
  if (emails.length === 0 && rawText) {
    emails = normalizeEmails(extractEmailCandidatesFromRawText(rawText), notes);
  }
  const website =
    normalizeWebsite(normalizeNullable(parsed.data.website), notes) ??
    pickWebsiteFromRawText(rawText, emails, notes);
  const address =
    normalizeAddress(normalizeNullable(parsed.data.address)) ??
    buildAddressFromRawText(rawText, notes);

  return {
    name: sanitizeName(normalizeNullable(parsed.data.name)),
    title: sanitizeTitle(normalizeNullable(parsed.data.title)),
    company: sanitizeCompany(normalizeNullable(parsed.data.company)),
    phones,
    emails,
    website,
    address,
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
  const noteParts: string[] = [];
  if (extraction.company && extraction.name) {
    noteParts.push(`İlgili: ${extraction.name}`);
  }
  if (extraction.title) {
    noteParts.push(`Ünvan: ${extraction.title}`);
  }
  for (const note of extraction.notes) {
    noteParts.push(note);
  }

  return {
    customerName: extraction.company ?? extraction.name ?? undefined,
    phone1: extraction.phones[0],
    phone2: extraction.phones[1],
    email: extraction.emails[0],
    address: extraction.address ?? undefined,
    website: extraction.website ?? undefined,
    notes: noteParts.length > 0 ? noteParts.join(", ") : undefined,
  };
}
