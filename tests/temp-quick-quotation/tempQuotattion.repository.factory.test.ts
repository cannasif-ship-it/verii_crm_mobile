import { TempQuickQuotationRepositoryImpl } from "../../src/features/temp-quick-quotation/repositories/tempQuotattion.repository.factory";
import type { TempQuotattionService } from "../../src/features/temp-quick-quotation/services/tempQuotattion.service.factory";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function testReviseDelegatesToUpdate(): Promise<void> {
  let capturedId = 0;
  let capturedPayload: unknown;

  const fakeService = {
    getList: async () => ({
      items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
    }),
    getById: async () => ({ id: 1 } as never),
    create: async () => ({ id: 1 } as never),
    update: async (id: number, payload: unknown) => {
      capturedId = id;
      capturedPayload = payload;
      return { id } as never;
    },
    setApproved: async () => ({ id: 1 } as never),
    remove: async () => {},
    getLinesByHeaderId: async () => [],
    getLineById: async () => ({ id: 1 } as never),
    createLine: async () => ({ id: 1 } as never),
    createLines: async () => [],
    updateLine: async () => ({ id: 1 } as never),
    removeLine: async () => {},
    getExchangeLinesByHeaderId: async () => [],
    getExchangeLineById: async () => ({ id: 1 } as never),
    createExchangeLine: async () => ({ id: 1 } as never),
    updateExchangeLine: async () => ({ id: 1 } as never),
    removeExchangeLine: async () => {},
  } satisfies TempQuotattionService;

  const repo = new TempQuickQuotationRepositoryImpl(fakeService);

  const payload = {
    customerId: 15,
    currencyCode: "TRY",
    exchangeRate: 1,
    discountRate1: 0,
    discountRate2: 0,
    discountRate3: 0,
    description: "revise",
  };

  await repo.revise(99, payload);

  assert(capturedId === 99, "revise should delegate id to update");
  assert(capturedPayload === payload, "revise should delegate same payload reference");
}

async function testApproveAndConvertCallsSetApproved(): Promise<void> {
  let calledWith = 0;

  const fakeService = {
    getList: async () => ({
      items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
    }),
    getById: async () => ({ id: 1 } as never),
    create: async () => ({ id: 1 } as never),
    update: async () => ({ id: 1 } as never),
    setApproved: async (id: number) => {
      calledWith = id;
      return { id } as never;
    },
    remove: async () => {},
    getLinesByHeaderId: async () => [],
    getLineById: async () => ({ id: 1 } as never),
    createLine: async () => ({ id: 1 } as never),
    createLines: async () => [],
    updateLine: async () => ({ id: 1 } as never),
    removeLine: async () => {},
    getExchangeLinesByHeaderId: async () => [],
    getExchangeLineById: async () => ({ id: 1 } as never),
    createExchangeLine: async () => ({ id: 1 } as never),
    updateExchangeLine: async () => ({ id: 1 } as never),
    removeExchangeLine: async () => {},
  } satisfies TempQuotattionService;

  const repo = new TempQuickQuotationRepositoryImpl(fakeService);
  await repo.approveAndConvertToQuotation(88);

  assert(calledWith === 88, "approveAndConvertToQuotation should call setApproved with same id");
}

export async function runTempQuotattionRepositoryFactoryTests(): Promise<void> {
  await testReviseDelegatesToUpdate();
  await testApproveAndConvertCallsSetApproved();
}
