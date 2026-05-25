export interface ProductTypesUpsertDto {
  productTypesId?: number;
  businessId?: number;
  description: string;
  isConsumable: boolean;
  isReturnable: boolean;
  requiresSerial: boolean;
  usersBy?: string;
}

export interface ProductTypesStatusDto {
  productTypesId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}