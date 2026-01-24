import { z } from "zod";
import i18n from "../../../locales";

export const createActivitySchema = () =>
  z.object({
    subject: z.string().min(1, i18n.t("validation.subjectRequired")).max(100),
    description: z.string().max(500).optional(),
    activityType: z.string().min(1, i18n.t("validation.activityTypeRequired")),
    potentialCustomerId: z.number().optional().nullable(),
    erpCustomerCode: z.string().optional().nullable(),
    productCode: z.string().optional().nullable(),
    productName: z.string().optional().nullable(),
    status: z.string().min(1, i18n.t("validation.statusRequired")),
    isCompleted: z.boolean(),
    priority: z.string().optional().nullable(),
    contactId: z.number().optional().nullable(),
    assignedUserId: z.number().optional().nullable(),
    activityDate: z.string().min(1, i18n.t("validation.dateRequired")),
  });

export const activitySchema = createActivitySchema();

export type ActivityFormData = z.infer<typeof activitySchema>;
