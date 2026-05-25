export interface ProcessTypeUpsertDto {
  processTypeId?: number;
  businessId?: number;
  descType: string;
  usersBy?: string;
}

export interface ProcessTypeStatusDto {
  processTypeId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface ProcessTypeResponseDto {
  processTypeId: number;
  businessId: number;
  descType: string;
  status: string;
}
