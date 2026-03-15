import type { QuotationLineFormState } from "../../quotation/types";
import { createBuiltInQuotationReportPdf } from "../../quotation/utils/createBuiltInQuotationReportPdf";

interface CreateBuiltInTempQuickQuotationReportPdfParams {
  tempQuotationId?: number;
  customerName?: string | null;
  customerCode?: string | null;
  currencyCode: string;
  lines: QuotationLineFormState[];
  offerDate?: string | null;
  description?: string | null;
}

export async function createBuiltInTempQuickQuotationReportPdf({
  tempQuotationId,
  customerName,
  customerCode,
  currencyCode,
  lines,
  offerDate,
  description,
}: CreateBuiltInTempQuickQuotationReportPdfParams): Promise<string> {
  return createBuiltInQuotationReportPdf({
    offerNo: tempQuotationId != null ? `HT-${tempQuotationId}` : "HT-TASLAK",
    customerName,
    erpCustomerCode: customerCode,
    currencyCode,
    lines,
    offerDate,
    description,
    notes: description?.trim() ? [description.trim()] : ["Hızlı teklif üzerinden oluşturulan PDF çıktısı."],
    metaFields: [
      { label: "Doküman Türü", value: "Hızlı Teklif" },
      tempQuotationId != null ? { label: "Hızlı Teklif No", value: `#${tempQuotationId}` } : null,
    ].filter((field): field is { label: string; value: string } => field != null),
  });
}
