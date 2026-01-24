import { z } from "zod";
import i18n from "../../../locales";

export const createContactSchema = () =>
  z.object({
    fullName: z.string().min(1, i18n.t("validation.fullNameRequired")).max(100),
    email: z.string().email(i18n.t("validation.invalidEmail")).max(100).optional().or(z.literal("")),
    phone: z.string().max(20).optional(),
    mobile: z.string().max(20).optional(),
    notes: z.string().max(250).optional(),
    customerId: z.number().min(1, i18n.t("validation.customerRequired")),
    titleId: z.number().min(1, i18n.t("validation.titleRequired")),
  });

export const contactSchema = createContactSchema();

export type ContactFormData = z.infer<typeof contactSchema>;
