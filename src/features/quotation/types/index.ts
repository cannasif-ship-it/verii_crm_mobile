import type { ApiResponse } from "../../auth/types";
import type { PagedFilter, PagedParams, PagedResponse, PagedApiResponse } from "../../customer/types/common";

export interface ApprovalActionGetDto {
  id: number;
  approvalRequestId: number;
  approvalRequestDescription?: string | null;
  stepOrder: number;
  approvedByUserId: number;
  approvedByUserFullName?: string | null;
  actionDate: string;
  status: number;
  statusName?: string | null;
  createdDate: string;
  updatedDate?: string | null;
  createdBy?: string | null;
  createdByFullName?: string | null;
  createdByFullUser?: string | null;
}

export interface ApproveActionDto {
  approvalActionId: number;
}

export interface RejectActionDto {
  approvalActionId: number;
  rejectReason?: string | null;
}

export interface QuotationLineGetDto {
  id: number;
  quotationId: number;
  lineNo: number;
  stockCode?: string | null;
  stockName?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  total: number;
}

export interface QuotationExchangeRateGetDto {
  id: number;
  quotationId: number;
  currency: string;
  rate: number;
}

export interface QuotationGetDto {
  id: number;
  potentialCustomerId?: number | null;
  potentialCustomerName?: string | null;
  erpCustomerCode?: string | null;
  deliveryDate?: string | null;
  shippingAddressId?: number | null;
  shippingAddressText?: string | null;
  representativeId?: number | null;
  representativeName?: string | null;
  status?: number | null;
  description?: string | null;
  paymentTypeId?: number | null;
  paymentTypeName?: string | null;
  documentSerialTypeId?: number | null;
  offerType: string;
  offerDate?: string | null;
  offerNo?: string | null;
  revisionNo?: string | null;
  revisionId?: number | null;
  currency: string;
  total: number;
  grandTotal: number;
  hasCustomerSpecificDiscount: boolean;
  validUntil?: string | null;
  contactId?: number | null;
  activityId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  lines?: QuotationLineGetDto[];
  exchangeRates?: QuotationExchangeRateGetDto[];
}

export interface CreateQuotationDto {
  potentialCustomerId?: number | null;
  erpCustomerCode?: string | null;
  deliveryDate?: string | null;
  shippingAddressId?: number | null;
  representativeId?: number | null;
  status?: number | null;
  description?: string | null;
  paymentTypeId?: number | null;
  documentSerialTypeId?: number | null;
  offerType: string;
  offerDate?: string | null;
  offerNo?: string | null;
  revisionNo?: string | null;
  revisionId?: number | null;
  currency: string;
}

export interface CreateQuotationLineDto {
  quotationId: number;
  productId?: number | null;
  productCode: string;
  productName: string;
  groupCode?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
  relatedProductKey?: string | null;
  isMainRelatedProduct?: boolean;
  approvalStatus?: number;
}

export interface QuotationExchangeRateCreateDto {
  quotationId: number;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial?: boolean;
}

export interface QuotationBulkCreateDto {
  quotation: CreateQuotationDto;
  lines: CreateQuotationLineDto[];
  exchangeRates?: QuotationExchangeRateCreateDto[];
}

export interface QuotationLineFormState {
  id: string;
  productId?: number | null;
  productCode: string;
  productName: string;
  groupCode?: string | null;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
  relatedProductKey?: string | null;
  isMainRelatedProduct?: boolean;
  approvalStatus?: number;
  isEditing: boolean;
  relatedLines?: QuotationLineFormState[];
  relationQuantity?: number;
}

export interface QuotationExchangeRateFormState {
  id: string;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial?: boolean;
  dovizTipi?: number;
}

export interface PricingRuleLineGetDto {
  id: number;
  pricingRuleHeaderId: number;
  stokCode: string;
  minQuantity: number;
  maxQuantity?: number | null;
  fixedUnitPrice?: number | null;
  currencyCode: string;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UserDiscountLimitDto {
  erpProductGroupCode: string;
  salespersonId: number;
  salespersonName: string;
  maxDiscount1: number;
  maxDiscount2?: number | null;
  maxDiscount3?: number | null;
  id?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedBy?: number | null;
}

export interface PriceOfProductRequestDto {
  productCode: string;
  groupCode: string;
}

export interface PriceOfProductDto {
  productCode: string;
  groupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number | null;
  discount2?: number | null;
  discount3?: number | null;
}

export interface ExchangeRateDto {
  dovizTipi: number;
  dovizIsmi: string | null;
  kurDegeri: number;
  tarih: string;
}

export interface CurrencyOptionDto {
  code: string;
  dovizTipi: number;
  dovizIsmi: string | null;
}

export interface PaymentTypeDto {
  id: number;
  name: string;
}

export interface DocumentSerialTypeDto {
  id: number;
  serialPrefix?: string | null;
  name?: string | null;
  documentType?: number;
  customerTypeId?: number;
  salesRepId?: number;
}

export interface ApprovalScopeUserDto {
  flowId: number;
  userId: number;
  firstName: string;
  lastName: string;
  roleGroupName: string;
  stepOrder: number;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  role: string;
  fullName: string;
  isActive: boolean;
  isDeleted: boolean;
  createdDate: string;
}

export const PricingRuleType = {
  Quotation: 2,
} as const;

export const OfferType = {
  Domestic: "Domestic",
  Export: "Export",
} as const;

export type OfferTypeValue = typeof OfferType[keyof typeof OfferType];

export interface CalculationTotals {
  subtotal: number;
  totalVat: number;
  grandTotal: number;
}

export type ApprovalStatus = 0 | 1;

export type DetailApprovalStatus = 0 | 1 | 2 | 3;

export interface QuotationDetailGetDto {
  id: number;
  year: string | null;
  completionDate: string | null;
  isCompleted: boolean;
  isPendingApproval: boolean;
  approvalStatus: boolean | null;
  rejectedReason: string | null;
  approvedByUserId: number | null;
  approvalDate: string | null;
  isERPIntegrated: boolean;
  erpIntegrationNumber: string | null;
  lastSyncDate: string | null;
  countTriedBy: number | null;
  createdDate: string;
  updatedDate: string | null;
  deletedDate: string | null;
  isDeleted: boolean;
  createdByFullUser: string | null;
  updatedByFullUser: string | null;
  deletedByFullUser: string | null;
  potentialCustomerId: number | null;
  potentialCustomerName: string | null;
  erpCustomerCode: string | null;
  deliveryDate: string | null;
  shippingAddressId: number | null;
  shippingAddressText: string | null;
  representativeId: number | null;
  representativeName: string | null;
  status: DetailApprovalStatus | null;
  description: string | null;
  paymentTypeId: number | null;
  paymentTypeName: string | null;
  documentSerialTypeId: number;
  documentSerialTypeName: string | null;
  offerType: string;
  offerDate: string | null;
  offerNo: string | null;
  revisionNo: string | null;
  revisionId: number | null;
  currency: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface QuotationLineDetailGetDto {
  id: number;
  quotationId: number;
  productId: number | null;
  productCode: string | null;
  productName: string;
  groupCode: string | null;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description: string | null;
  pricingRuleHeaderId: number | null;
  relatedStockId: number | null;
  relatedProductKey: string | null;
  isMainRelatedProduct: boolean;
  approvalStatus: DetailApprovalStatus;
  createdDate: string;
  updatedDate: string | null;
  isDeleted: boolean;
  createdByFullUser: string | null;
  updatedByFullUser: string | null;
}

export interface QuotationExchangeRateDetailGetDto {
  id: number;
  quotationId: number;
  quotationOfferNo: string | null;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial: boolean;
  createdDate: string;
  updatedDate: string | null;
  isDeleted: boolean;
}

export type QuotationDetailResponse = ApiResponse<QuotationDetailGetDto>;
export type QuotationLineDetailListResponse = ApiResponse<QuotationLineDetailGetDto[]>;
export type QuotationExchangeRateDetailListResponse = ApiResponse<QuotationExchangeRateDetailGetDto[]>;

export type WaitingApprovalsResponse = ApiResponse<ApprovalActionGetDto[]>;
export type ApproveResponse = ApiResponse<boolean>;
export type RejectResponse = ApiResponse<boolean>;
export type QuotationListResponse = PagedApiResponse<QuotationGetDto>;
export type QuotationResponse = ApiResponse<QuotationGetDto>;
export type QuotationBulkCreateResponse = ApiResponse<QuotationGetDto>;
export type PriceRuleResponse = ApiResponse<PricingRuleLineGetDto[]>;
export type UserDiscountLimitResponse = ApiResponse<UserDiscountLimitDto[]>;
export type PriceOfProductResponse = ApiResponse<PriceOfProductDto[]>;
export type ExchangeRateResponse = ApiResponse<ExchangeRateDto[]>;
export type CurrencyOptionsResponse = ApiResponse<CurrencyOptionDto[]>;
export type PaymentTypesResponse = ApiResponse<PaymentTypeDto[]>;
export type DocumentSerialTypesResponse = ApiResponse<DocumentSerialTypeDto[]>;
export type RelatedUsersResponse = ApiResponse<ApprovalScopeUserDto[]>;
export type UserListResponse = ApiResponse<PagedResponse<UserDto>>;

export type { PagedFilter, PagedParams, PagedResponse };
export type { StockGetDto } from "../../stocks/types";
