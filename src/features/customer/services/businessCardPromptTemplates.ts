const SCHEMA_EXAMPLE_JSON = `{
  "name": "string | null",
  "title": "string | null",
  "company": "string | null",
  "phones": ["string"],
  "emails": ["string"],
  "website": "string | null",
  "address": "string | null",
  "social": {
    "linkedin": "string | null",
    "instagram": "string | null",
    "x": "string | null",
    "facebook": "string | null"
  },
  "notes": ["string"]
}`;

export const BUSINESS_CARD_SYSTEM_PROMPT =
  "You are a strict OCR information extraction engine. Return ONLY valid JSON. Never add explanations.";

export function buildBusinessCardUserPrompt(rawText: string): string {
  return `Aşağıdaki OCR metninden kartvizit alanlarını çıkar.
Kurallar:
SADECE JSON döndür. Markdown yok, açıklama yok, code fence yok.
OCR metninde olmayan bilgiyi uydurma. Emin değilsen null veya [].
phones, emails, notes her zaman array olmalı (yoksa []).
social her zaman bu 4 alanla dönmeli: linkedin/instagram/x/facebook (yoksa null).
Telefonları Türkiye E.164 formatına normalize etmeye çalış: +90XXXXXXXXXX. Dahili numaraları phones içine koyma, notes içine "Dahili: ..." yaz.
Fax/KEP/MERSİS/VKN gibi şeyleri notes içine yaz.
En sonda şu JSON şemasına birebir uy:
${SCHEMA_EXAMPLE_JSON}
OCR TEXT:
<<<
${rawText}
>>>`;
}
