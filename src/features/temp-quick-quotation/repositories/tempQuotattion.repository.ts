import { tempQuotattionService } from "../services/tempQuotattion.service";
import { TempQuickQuotationRepositoryImpl } from "./tempQuotattion.repository.factory";

export const tempQuickQuotationRepository = new TempQuickQuotationRepositoryImpl(tempQuotattionService);
