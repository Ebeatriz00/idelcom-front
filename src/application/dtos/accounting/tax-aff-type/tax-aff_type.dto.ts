export interface TaxAffTypeUpsertDto {
  taxAffTypeId?: number;
  businessId?: number;
  code: string;
  description: string;
  usersBy?: string;
}

export interface TaxAffTypeStatusDto {
  taxAffTypeId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface TaxAffTypeResponseDto {
  taxAffTypeId: number;
  businessId: number;
  code: string;
  description: string;
  status: string;
  taxAffCount: number;
}
