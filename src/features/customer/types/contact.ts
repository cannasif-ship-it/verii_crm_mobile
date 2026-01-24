export interface ContactDto {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  customerName?: string;
  titleId: number;
  titleName?: string;
  createdDate: string;
  updatedDate?: string;
  isDeleted: boolean;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateContactDto {
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId: number;
}

export interface UpdateContactDto {
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  notes?: string;
  customerId: number;
  titleId: number;
}
