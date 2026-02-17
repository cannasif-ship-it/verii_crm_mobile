export interface BusinessCardOcrResult {
  customerName?: string;
  phone1?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface BusinessCardExtractionSocial {
  linkedin: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
}

export interface BusinessCardExtraction {
  name: string | null;
  title: string | null;
  company: string | null;
  phones: string[];
  emails: string[];
  website: string | null;
  address: string | null;
  social: BusinessCardExtractionSocial;
  notes: string[];
}
