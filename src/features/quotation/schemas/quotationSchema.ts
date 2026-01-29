import { z } from "zod";

export const createQuotationSchema = () =>
  z
    .object({
      quotation: z.object({
        potentialCustomerId: z.number().nullable().optional(),
        erpCustomerCode: z.string().max(50).nullable().optional(),
        deliveryDate: z.string().nullable().optional(),
        shippingAddressId: z.number().nullable().optional(),
        representativeId: z.number().nullable().optional(),
        status: z.number().nullable().optional(),
        description: z.string().max(500).nullable().optional(),
        paymentTypeId: z.number().nullable().optional(),
        documentSerialTypeId: z.number().nullable().optional(),
        offerType: z.string().min(1, "Teklif tipi seçilmelidir"),
        offerDate: z.string().nullable().optional(),
        offerNo: z.string().max(50).nullable().optional(),
        revisionNo: z.string().max(50).nullable().optional(),
        revisionId: z.number().nullable().optional(),
        currency: z.string().min(1, "Para birimi seçilmelidir"),
      }),
    })
    .superRefine((data, ctx) => {
      const q = data.quotation;
      const hasCustomer =
        (q.potentialCustomerId != null && q.potentialCustomerId > 0) ||
        (q.erpCustomerCode != null && String(q.erpCustomerCode).trim().length > 0);
      if (!hasCustomer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Müşteri seçilmelidir",
          path: ["quotation", "potentialCustomerId"],
        });
      }
      if (q.paymentTypeId == null || q.paymentTypeId === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ödeme tipi seçilmelidir",
          path: ["quotation", "paymentTypeId"],
        });
      }
      if (!q.deliveryDate || String(q.deliveryDate).trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Teslimat tarihi seçilmelidir",
          path: ["quotation", "deliveryDate"],
        });
      }
    });

export const quotationSchema = createQuotationSchema();

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;
