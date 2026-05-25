export interface MovementTypesResponseDto {
  movementTypesId?: number;
  businessId?: number;
  code?: string;
  movClasDescription?: string;
  movOperDescription?: string;
  movPerDescription?: string;
  movSunatDescription?: string;
  movVisDescription?: string;
  movementTypesCount: number;
  description?: string;
  status: string;

  movClasId?: number;
  movOperId?: number;
  movPerId?: number;
  movSunatId?: number;

  affectsStock?: boolean;
  requiresDestWare?: boolean;
  generatesAccounting?: boolean;
  IsAdjustment?: boolean;
  allowNegative?: boolean;
}
