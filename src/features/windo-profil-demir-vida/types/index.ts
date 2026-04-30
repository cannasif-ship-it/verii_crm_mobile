export interface WindoDefinitionDto {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface WindoDefinitionOption {
  id: number;
  name: string;
  code?: string;
}
