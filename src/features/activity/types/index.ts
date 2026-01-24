import type { ApiResponse } from "../../auth/types";

export interface PagedFilter {
  column: string;
  operator: string;
  value: string;
}

export interface PagedParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: PagedFilter[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type PagedApiResponse<T> = ApiResponse<PagedResponse<T>>;

export interface ActivityTypeDto {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface PotentialCustomerDto {
  id: number;
  name: string;
  customerCode?: string;
}

export interface ContactDto {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface AssignedUserDto {
  id: number;
  fullName?: string;
  userName?: string;
}

export interface ActivityDto {
  id: number;
  subject: string;
  description?: string;
  activityType: string;
  activityTypeId?: number;
  potentialCustomerId?: number;
  potentialCustomer?: PotentialCustomerDto;
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  contact?: ContactDto;
  assignedUserId?: number;
  assignedUser?: AssignedUserDto;
  activityDate: string;
  createdDate: string;
  updatedDate?: string;
  createdByFullUser?: string;
  updatedByFullUser?: string;
}

export interface CreateActivityDto {
  subject: string;
  description?: string;
  activityType: string;
  potentialCustomerId?: number;
  erpCustomerCode?: string;
  productCode?: string;
  productName?: string;
  status: string;
  isCompleted: boolean;
  priority?: string;
  contactId?: number;
  assignedUserId?: number;
  activityDate: string;
}

export interface UpdateActivityDto extends CreateActivityDto {}

export type ActivityStatus = "Scheduled" | "InProgress" | "Completed" | "Cancelled" | "Postponed";

export type ActivityPriority = "Low" | "Medium" | "High";

export const ACTIVITY_STATUSES: { value: ActivityStatus; labelKey: string }[] = [
  { value: "Scheduled", labelKey: "activity.statusScheduled" },
  { value: "InProgress", labelKey: "activity.statusInProgress" },
  { value: "Completed", labelKey: "activity.statusCompleted" },
  { value: "Cancelled", labelKey: "activity.statusCancelled" },
  { value: "Postponed", labelKey: "activity.statusPostponed" },
];

export const ACTIVITY_PRIORITIES: { value: ActivityPriority; labelKey: string }[] = [
  { value: "Low", labelKey: "activity.priorityLow" },
  { value: "Medium", labelKey: "activity.priorityMedium" },
  { value: "High", labelKey: "activity.priorityHigh" },
];
