export interface MovementTypesUpsertDto {
  movementTypesId?: number;
  businessId?: number;
  code?: string;
  description?: string;
  movClasId?: number;
  movOperId?: number;
  movPerId?: number;
  movSunatId?: number;
  affectsStock?: boolean;
  requiresDestWare?: boolean;
  generatesAccounting?: boolean;
  IsAdjustment?: boolean;
  allowNegative?: boolean;
  usersBy?: string;
}

export interface MovementTypesStatusDto {
  movementTypesId: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}
