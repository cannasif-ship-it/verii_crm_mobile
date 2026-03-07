import type {
  TempQuickQuotationRepository,
  TempQuickQuotationPagedParams,
  TempQuotattionCreateDto,
  TempQuotattionExchangeLineCreateDto,
  TempQuotattionExchangeLineGetDto,
  TempQuotattionExchangeLineUpdateDto,
  TempQuotattionGetDto,
  TempQuotattionLineCreateDto,
  TempQuotattionLineGetDto,
  TempQuotattionLineUpdateDto,
  TempQuotattionUpdateDto,
} from "../models/tempQuotattion.model";
import type { TempQuotattionService } from "../services/tempQuotattion.service.factory";

export class TempQuickQuotationRepositoryImpl implements TempQuickQuotationRepository {
  constructor(private readonly service: TempQuotattionService) {}

  getList(params?: TempQuickQuotationPagedParams) {
    return this.service.getList(params);
  }

  getById(id: number) {
    return this.service.getById(id);
  }

  create(payload: TempQuotattionCreateDto) {
    return this.service.create(payload);
  }

  update(id: number, payload: TempQuotattionUpdateDto) {
    return this.service.update(id, payload);
  }

  setApproved(id: number) {
    return this.service.setApproved(id);
  }

  remove(id: number) {
    return this.service.remove(id);
  }

  getLinesByHeaderId(tempQuotattionId: number): Promise<TempQuotattionLineGetDto[]> {
    return this.service.getLinesByHeaderId(tempQuotattionId);
  }

  getLineById(lineId: number): Promise<TempQuotattionLineGetDto> {
    return this.service.getLineById(lineId);
  }

  createLine(payload: TempQuotattionLineCreateDto): Promise<TempQuotattionLineGetDto> {
    return this.service.createLine(payload);
  }

  createLines(payload: TempQuotattionLineCreateDto[]): Promise<TempQuotattionLineGetDto[]> {
    return this.service.createLines(payload);
  }

  updateLine(lineId: number, payload: TempQuotattionLineUpdateDto): Promise<TempQuotattionLineGetDto> {
    return this.service.updateLine(lineId, payload);
  }

  removeLine(lineId: number): Promise<void> {
    return this.service.removeLine(lineId);
  }

  getExchangeLinesByHeaderId(tempQuotattionId: number): Promise<TempQuotattionExchangeLineGetDto[]> {
    return this.service.getExchangeLinesByHeaderId(tempQuotattionId);
  }

  getExchangeLineById(exchangeLineId: number): Promise<TempQuotattionExchangeLineGetDto> {
    return this.service.getExchangeLineById(exchangeLineId);
  }

  createExchangeLine(
    payload: TempQuotattionExchangeLineCreateDto
  ): Promise<TempQuotattionExchangeLineGetDto> {
    return this.service.createExchangeLine(payload);
  }

  updateExchangeLine(
    exchangeLineId: number,
    payload: TempQuotattionExchangeLineUpdateDto
  ): Promise<TempQuotattionExchangeLineGetDto> {
    return this.service.updateExchangeLine(exchangeLineId, payload);
  }

  removeExchangeLine(exchangeLineId: number): Promise<void> {
    return this.service.removeExchangeLine(exchangeLineId);
  }

  revise(id: number, payload: TempQuotattionUpdateDto): Promise<TempQuotattionGetDto> {
    return this.service.update(id, payload);
  }

  async approveAndConvertToQuotation(id: number): Promise<TempQuotattionGetDto> {
    // Backend conversion endpoint will be connected here when finalized.
    return this.service.setApproved(id);
  }
}
