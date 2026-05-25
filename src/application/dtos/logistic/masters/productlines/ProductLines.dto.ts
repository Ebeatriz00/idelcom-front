export interface ProductLinesUpsertDto {
  productLinesId?: number;
  businessId?: number;
  categoriesId: number;
  description: string;
  usersBy?: string;
  movementTypesId?: number;
}

export interface ProductLinesStatusDto {
  productLinesId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
  
}