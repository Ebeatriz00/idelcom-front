export interface ProductLinesResponseDto {
  productLinesId: number;
  businessId: number;
  categoriesDescription: string;
  description: string;
  status: string;
  productLinesCount?: number;
  movementTypesId?: number;
}
export interface ProductLinesByIdDto {
  productLinesId: number;
  businessId: number;
  categoriesId: number;
  description: string;
}
