export interface StockGetDto {
  id: number;
  erpStockCode: string;
  stockName: string;
  unit?: string;
  ureticiKodu?: string;
  branchCode: number;
  stockImages?: StockImageDto[];
  parentRelations?: StockRelationDto[];
}

export interface StockImageDto {
  id: number;
  stockId: number;
  filePath: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface StockRelationDto {
  id: number;
  stockId: number;
  relatedStockId: number;
  relatedStockName?: string;
  relatedStockCode?: string;
  quantity: number;
  description?: string;
  isMandatory: boolean;
}

export interface StockRelationCreateDto {
  stockId: number;
  relatedStockId: number;
  quantity: number;
  description?: string;
  isMandatory?: boolean;
}
