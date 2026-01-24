export interface ShippingAddressDto {
  id: number;
  address: string;
  postalCode?: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  customerId: number;
  customerName?: string;
  countryId?: number;
  countryName?: string;
  cityId?: number;
  cityName?: string;
  districtId?: number;
  districtName?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  deletedDate?: string;
  isDeleted: boolean;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
  createdByFullUser?: string;
  updatedByFullUser?: string;
  deletedByFullUser?: string;
}

export interface CreateShippingAddressDto {
  address: string;
  postalCode?: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  customerId: number;
  countryId?: number;
  cityId?: number;
  districtId?: number;
}

export interface UpdateShippingAddressDto {
  address: string;
  postalCode?: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  customerId: number;
  countryId?: number;
  cityId?: number;
  districtId?: number;
}
