import { createTempQuotattionService, type TempQuickQuotationHttpClient } from "../../src/features/temp-quick-quotation/services/tempQuotattion.service.factory";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function testGetListSerializesFilters(): Promise<void> {
  let capturedParams: Record<string, string | number> | undefined;

  const fakeClient: TempQuickQuotationHttpClient = {
    async get<T>(_url: string, config?: { params?: Record<string, string | number> }): Promise<{ data: T }> {
      capturedParams = config?.params;
      return {
        data: {
          success: true,
          message: "ok",
          exceptionMessage: "",
          errors: [],
          timestamp: new Date().toISOString(),
          statusCode: 200,
          className: "ApiResponse",
          data: {
            items: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 20,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        } as T,
      };
    },
    async post<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
    async put<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
    async delete<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
  };

  const service = createTempQuotattionService(fakeClient);

  await service.getList({
    pageNumber: 2,
    pageSize: 50,
    sortBy: "id",
    sortDirection: "desc",
    filters: [{ column: "customerName", operator: "Contains", value: "Acme" }],
  });

  assert(!!capturedParams, "query params should be captured");
  assert(capturedParams?.pageNumber === 2, "pageNumber should be 2");
  assert(capturedParams?.pageSize === 50, "pageSize should be 50");
  assert(typeof capturedParams?.filters === "string", "filters should be serialized string");
}

async function testGetByIdThrowsWhenApiFails(): Promise<void> {
  const fakeClient: TempQuickQuotationHttpClient = {
    async get<T>(): Promise<{ data: T }> {
      return {
        data: {
          success: false,
          message: "custom-fail",
          exceptionMessage: "",
          errors: [],
          timestamp: new Date().toISOString(),
          statusCode: 500,
          className: "ApiResponse",
          data: null,
        } as T,
      };
    },
    async post<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
    async put<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
    async delete<T>(): Promise<{ data: T }> {
      throw new Error("not used");
    },
  };

  const service = createTempQuotattionService(fakeClient);

  let thrown = "";
  try {
    await service.getById(10);
  } catch (error) {
    thrown = error instanceof Error ? error.message : String(error);
  }

  assert(thrown === "custom-fail", "service should throw API message on failure");
}

export async function runTempQuotattionServiceFactoryTests(): Promise<void> {
  await testGetListSerializesFilters();
  await testGetByIdThrowsWhenApiFails();
}
