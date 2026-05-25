export interface ContactTypeUpsertDto {
  contactTypeId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface ContactTypeStatusDto {
  contactTypeId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface ContactTypeResponseDto {
  contactTypeId: number;
  businessId: number;
  description: string;
  status: string;
  contactTypeCount: number;
}
