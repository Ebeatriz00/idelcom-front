export interface ProductTypesResponseDto {
  productTypesId: number;
  businessId: number;
  description: string;
  isConsumable: boolean;
  isReturnable: boolean;
  requiresSerial: boolean;
  status: string;
  productTypesCount?: number;
}
