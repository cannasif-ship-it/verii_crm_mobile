import type { ApiResponse } from "../../auth/types";

export interface GoogleIntegrationStatusDto {
  isConnected: boolean;
  isOAuthConfigured: boolean;
  googleEmail?: string | null;
  scopes?: string | null;
  expiresAt?: string | null;
}

export interface OutlookIntegrationStatusDto {
  isConnected: boolean;
  isOAuthConfigured: boolean;
  outlookEmail?: string | null;
  scopes?: string | null;
  expiresAt?: string | null;
}

export interface IntegrationAuthorizeUrlDto {
  url: string;
}

export interface SendCustomerMailDto {
  customerId: number;
  contactId?: number;
  to?: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml: boolean;
  templateKey?: string;
  templateName?: string;
  templateVersion?: string;
}

export interface GoogleCustomerMailSendResultDto {
  logId: number;
  isSuccess: boolean;
  googleMessageId?: string | null;
  googleThreadId?: string | null;
  sentAt?: string | null;
}

export interface OutlookCustomerMailSendResultDto {
  logId?: number | null;
  isSuccess: boolean;
  messageId?: string | null;
  conversationId?: string | null;
  sentAt?: string | null;
}

export type GoogleIntegrationStatusResponse = ApiResponse<GoogleIntegrationStatusDto>;
export type OutlookIntegrationStatusResponse = ApiResponse<OutlookIntegrationStatusDto>;
export type IntegrationAuthorizeUrlResponse = ApiResponse<IntegrationAuthorizeUrlDto>;
export type IntegrationDisconnectResponse = ApiResponse<boolean>;
export type GoogleCustomerMailSendResponse = ApiResponse<GoogleCustomerMailSendResultDto>;
export type OutlookCustomerMailSendResponse = ApiResponse<OutlookCustomerMailSendResultDto>;
