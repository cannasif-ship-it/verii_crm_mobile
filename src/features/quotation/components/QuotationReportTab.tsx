import React from "react";
import { ReportTab } from "./ReportTab";
import type { QuotationLineFormState } from "../types";
import { DocumentRuleType } from "../types";
import { createBuiltInQuotationReportPdf } from "../utils/createBuiltInQuotationReportPdf";

interface QuotationReportTabProps {
  quotationId: number;
  offerNo?: string | null;
  customerName?: string | null;
  currency?: string | null;
  lines: QuotationLineFormState[];
  representativeName?: string | null;
  address?: string | null;
  shippingAddress?: string | null;
  erpCustomerCode?: string | null;
  offerDate?: string | null;
  deliveryDate?: string | null;
  validUntil?: string | null;
  paymentTypeName?: string | null;
  salesTypeName?: string | null;
  projectCode?: string | null;
  description?: string | null;
  notes?: string[];
  metaFields?: Array<{ label: string; value?: string | null }>;
}

export function QuotationReportTab({
  quotationId,
  offerNo,
  customerName,
  currency,
  lines,
  representativeName,
  address,
  shippingAddress,
  erpCustomerCode,
  offerDate,
  deliveryDate,
  validUntil,
  paymentTypeName,
  salesTypeName,
  projectCode,
  description,
  notes,
  metaFields,
}: QuotationReportTabProps): React.ReactElement {
  return (
    <ReportTab
      entityId={quotationId}
      ruleType={DocumentRuleType.Quotation}
      builtInTemplates={[
        {
          id: "__builtin_windo_teklif_yap__",
          title: "Windo Teklif Yap",
          isDefault: true,
          generate: () =>
            createBuiltInQuotationReportPdf({
              offerNo,
              customerName,
              currencyCode: currency || "TRY",
              lines,
              representativeName,
              address,
              shippingAddress,
              erpCustomerCode,
              offerDate,
              deliveryDate,
              validUntil,
              paymentTypeName,
              salesTypeName,
              projectCode,
              description,
              notes,
              metaFields,
            }),
        },
      ]}
    />
  );
}
