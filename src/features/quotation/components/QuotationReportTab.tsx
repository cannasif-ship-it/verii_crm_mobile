import React from "react";
import { ReportTab } from "./ReportTab";
import { DocumentRuleType } from "../types";

interface QuotationReportTabProps {
  quotationId: number;
}

export function QuotationReportTab({ quotationId }: QuotationReportTabProps): React.ReactElement {
  return <ReportTab entityId={quotationId} ruleType={DocumentRuleType.Quotation} />;
}
