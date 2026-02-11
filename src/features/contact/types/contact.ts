export const SALUTATION_TYPE = {
  None: 0,
  Mr: 1,
  Mrs: 2,
  Ms: 3,
  Dr: 4,
} as const;

export type SalutationType = (typeof SALUTATION_TYPE)[keyof typeof SALUTATION_TYPE];

export interface ContactDto {
  id: number;
  salutation: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  customerName?: string;
  titleId?: number | null;
  titleName?: string;
  createdDate?: string;
  updatedDate?: string;
  isDeleted?: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateContactDto {
  salutation: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId?: number | null;
}

export interface UpdateContactDto {
  salutation: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId?: number | null;
}
