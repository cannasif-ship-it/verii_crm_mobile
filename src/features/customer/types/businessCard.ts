export interface AddressParts {
  neighborhood: string | null;
  street: string | null;
  avenue: string | null;
  boulevard: string | null;
  sitePlaza: string | null;
  block: string | null;
  buildingNo: string | null;
  floor: string | null;
  apartment: string | null;
  postalCode: string | null;
  district: string | null;
  province: string | null;
  country: string | null;
}

export interface BusinessCardOcrResult {
  customerName?: string;
  contactNameAndSurname?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  address?: string;
  website?: string;
  notes?: string;
  imageUri?: string;
}

export interface BusinessCardExtractionSocial {
  linkedin: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
}

export interface BusinessCardExtraction {
  contactNameAndSurname: string | null;
  name: string | null;
  title: string | null;
  company: string | null;
  phones: string[];
  emails: string[];
  website: string | null;
  address: string | null;
  addressParts: AddressParts;
  social: BusinessCardExtractionSocial;
  notes: string[];
}
