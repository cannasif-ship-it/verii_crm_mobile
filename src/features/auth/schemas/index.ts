import { z } from "zod";
import i18n from "../../../locales";

export const createLoginSchema = () =>
  z.object({
    branchId: z.string().min(1, i18n.t("validation.branchRequired")),
    email: z
      .string()
      .min(1, i18n.t("validation.emailRequired"))
      .email(i18n.t("validation.invalidEmail")),
    password: z.string().min(1, i18n.t("validation.passwordRequired")),
    rememberMe: z.boolean().default(true),
  });

export const loginSchema = createLoginSchema();

export type LoginFormData = z.infer<typeof loginSchema>;
