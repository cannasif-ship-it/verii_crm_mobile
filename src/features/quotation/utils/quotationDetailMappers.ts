import type { CreateQuotationSchema } from "../schemas";
import type {
  QuotationDetailGetDto,
  QuotationLineDetailGetDto,
  QuotationExchangeRateDetailGetDto,
  QuotationLineFormState,
  QuotationExchangeRateFormState,
  CurrencyOptionDto,
} from "../types";
import { calculateLineTotals } from "./calculations";

export interface LineGroup {
  key: string;
  main: QuotationLineDetailGetDto;
  related: QuotationLineDetailGetDto[];
}

export function groupQuotationLines(
  lines: QuotationLineDetailGetDto[]
): LineGroup[] {
  const map = new Map<string, QuotationLineDetailGetDto[]>();
  for (const line of lines) {
    const k = line.relatedProductKey?.trim()
      ? line.relatedProductKey.trim()
      : `standalone-${line.id}`;
    const list = map.get(k) ?? [];
    list.push(line);
    map.set(k, list);
  }
  const result: LineGroup[] = [];
  for (const [k, list] of map) {
    const sorted = [...list].sort((a, b) => {
      if (a.isMainRelatedProduct && !b.isMainRelatedProduct) return -1;
      if (!a.isMainRelatedProduct && b.isMainRelatedProduct) return 1;
      return a.id - b.id;
    });
    result.push({ key: k, main: sorted[0], related: sorted.slice(1) });
  }
  result.sort((a, b) => a.main.id - b.main.id);
  return result;
}

export function totalsFromDetailLines(
  lines: QuotationLineDetailGetDto[]
): { subtotal: number; totalVat: number; grandTotal: number } {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalVat = lines.reduce((s, l) => s + l.vatAmount, 0);
  const grandTotal = lines.reduce((s, l) => s + l.lineGrandTotal, 0);
  return { subtotal, totalVat, grandTotal };
}

function toDateOnly(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const s = iso.split("T")[0];
  return s || null;
}

export function mapDetailHeaderToForm(
  h: QuotationDetailGetDto
): CreateQuotationSchema["quotation"] {
  return {
    potentialCustomerId: h.potentialCustomerId ?? null,
    erpCustomerCode: h.erpCustomerCode ?? null,
    deliveryDate: toDateOnly(h.deliveryDate),
    shippingAddressId: h.shippingAddressId ?? null,
    representativeId: h.representativeId ?? null,
    status: h.status ?? null,
    description: h.description ?? null,
    paymentTypeId: h.paymentTypeId ?? null,
    documentSerialTypeId: h.documentSerialTypeId ?? null,
    offerType: h.offerType || "Domestic",
    offerDate: toDateOnly(h.offerDate),
    offerNo: h.offerNo ?? null,
    revisionNo: h.revisionNo ?? null,
    revisionId: h.revisionId ?? null,
    currency: h.currency || "",
  };
}

function mapDetailLineToFormState(d: QuotationLineDetailGetDto): QuotationLineFormState {
  const base: QuotationLineFormState = {
    id: `line-${d.id}`,
    productId: d.productId ?? null,
    productCode: d.productCode ?? "",
    productName: d.productName,
    groupCode: d.groupCode ?? null,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
    discountRate1: d.discountRate1,
    discountAmount1: d.discountAmount1,
    discountRate2: d.discountRate2,
    discountAmount2: d.discountAmount2,
    discountRate3: d.discountRate3,
    discountAmount3: d.discountAmount3,
    vatRate: d.vatRate,
    vatAmount: d.vatAmount,
    lineTotal: d.lineTotal,
    lineGrandTotal: d.lineGrandTotal,
    description: d.description ?? null,
    pricingRuleHeaderId: d.pricingRuleHeaderId ?? null,
    relatedStockId: d.relatedStockId ?? null,
    relatedProductKey: d.relatedProductKey ?? null,
    isMainRelatedProduct: d.isMainRelatedProduct,
    approvalStatus: d.approvalStatus,
    isEditing: false,
  };
  return calculateLineTotals(base);
}

export function mapDetailLinesToFormState(
  lines: QuotationLineDetailGetDto[]
): QuotationLineFormState[] {
  const map = new Map<string, QuotationLineDetailGetDto[]>();
  for (const line of lines) {
    const k = line.relatedProductKey?.trim()
      ? line.relatedProductKey.trim()
      : `standalone-${line.id}`;
    const list = map.get(k) ?? [];
    list.push(line);
    map.set(k, list);
  }
  const groups: QuotationLineFormState[][] = [];
  for (const [, list] of map) {
    const sorted = [...list].sort((a, b) => {
      if (a.isMainRelatedProduct && !b.isMainRelatedProduct) return -1;
      if (!a.isMainRelatedProduct && b.isMainRelatedProduct) return 1;
      return a.id - b.id;
    });
    const main = mapDetailLineToFormState(sorted[0]);
    const related = sorted.slice(1).map(mapDetailLineToFormState);
    if (related.length > 0) main.relatedLines = related;
    groups.push([main, ...related]);
  }
  groups.sort((ga, gb) => {
    const a = parseInt(String(ga[0]?.id ?? "").replace(/^line-(\d+).*/, "$1"), 10) || 0;
    const b = parseInt(String(gb[0]?.id ?? "").replace(/^line-(\d+).*/, "$1"), 10) || 0;
    return a - b;
  });
  return groups.flat();
}

export function mapDetailRatesToFormState(
  rates: QuotationExchangeRateDetailGetDto[],
  currencyOptions: CurrencyOptionDto[]
): QuotationExchangeRateFormState[] {
  return rates.map((r) => {
    const opt = currencyOptions.find(
      (c) => c.code === r.currency || String(c.dovizTipi) === r.currency
    );
    const dovizTipi = opt?.dovizTipi;
    const currency = opt ? String(opt.dovizTipi) : r.currency;
    return {
      id: `rate-${r.id}`,
      currency,
      exchangeRate: r.exchangeRate,
      exchangeRateDate: r.exchangeRateDate.split("T")[0] || r.exchangeRateDate,
      isOfficial: r.isOfficial,
      dovizTipi,
    };
  });
}
