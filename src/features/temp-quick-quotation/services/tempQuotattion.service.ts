import { apiClient } from "../../../lib/axios";
import { createTempQuotattionService } from "./tempQuotattion.service.factory";

export const tempQuotattionService = createTempQuotattionService(apiClient);
