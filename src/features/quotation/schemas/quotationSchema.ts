import { z } from "zod";
import i18n from "../../../locales";

export const createQuotationSchema = () =>
  z.object({
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
  });

export const quotationSchema = createQuotationSchema();

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;
