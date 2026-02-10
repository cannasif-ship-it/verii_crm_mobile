import type {
  CreateActivityDto,
  ActivityTypeDto,
  ActivityTypeRef,
  CreateActivityReminderDto,
} from "../types";

export interface ActivityFormLike {
  subject: string;
  description?: string | null;
  activityType?: string | null;
  activityTypeId?: number | null;
  isCompleted?: boolean;
  activityDate?: string;
  startDateTime?: string;
  endDateTime?: string | null;
  isAllDay?: boolean;
  status: string;
  priority?: string | null;
  assignedUserId?: number | null;
  contactId?: number | null;
  potentialCustomerId?: number | null;
  erpCustomerCode?: string | null;
  reminders?: CreateActivityReminderDto[];
}

export interface BuildCreateActivityPayloadOptions {
  activityTypes: (ActivityTypeDto | ActivityTypeRef)[];
  assignedUserIdFallback?: number;
}

function statusToNumeric(status: string): number {
  const s = status.toLowerCase().replace(/\s+/g, "");
  if (s === "completed") return 1;
  if (s === "cancelled" || s === "canceled") return 2;
  return 0;
}

function priorityToNumeric(priority: string | null | undefined): number {
  if (!priority) return 1;
  const p = priority.toLowerCase();
  if (p === "low") return 0;
  if (p === "high") return 2;
  return 1;
}

export function buildCreateActivityPayload(
  data: ActivityFormLike,
  options: BuildCreateActivityPayloadOptions
): CreateActivityDto {
  const { activityTypes, assignedUserIdFallback } = options;
  let activityTypeId = typeof data.activityTypeId === "number" ? data.activityTypeId : 0;
  if (activityTypeId === 0 && data.activityType) {
    const found = activityTypes.find(
      (t) => t.name.toLowerCase() === String(data.activityType).toLowerCase()
    );
    if (found) activityTypeId = found.id;
  }
  const startDateTime =
    data.startDateTime ?? (data.activityDate ? new Date(data.activityDate).toISOString() : new Date().toISOString());
  const endDateTime = data.endDateTime ?? undefined;
  const assignedUserId = data.assignedUserId ?? assignedUserIdFallback ?? 0;

  return {
    subject: data.subject,
    description: data.description ?? undefined,
    activityTypeId,
    startDateTime,
    endDateTime,
    isAllDay: data.isAllDay ?? false,
    status: statusToNumeric(data.status),
    priority: priorityToNumeric(data.priority),
    assignedUserId,
    contactId: data.contactId ?? undefined,
    potentialCustomerId: data.potentialCustomerId ?? undefined,
    erpCustomerCode: data.erpCustomerCode ?? undefined,
    reminders: data.reminders ?? [],
  };
}

export function buildUpdateActivityPayload(
  data: ActivityFormLike,
  options: BuildCreateActivityPayloadOptions & { existingAssignedUserId?: number }
): CreateActivityDto {
  const base = buildCreateActivityPayload(data, options);
  const assignedUserId =
    base.assignedUserId ||
    (options.assignedUserIdFallback ?? options.existingAssignedUserId ?? 0);
  return { ...base, assignedUserId };
}
