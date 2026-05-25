export interface CategoriesUpsertDto {
  categoriesId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface CategoriesStatusDto {
  categoriesId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}