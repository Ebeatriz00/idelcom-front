export interface QualificationsUpsertDto {
  leadsQualificationsId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface QualificationsStatusDto {
  leadsQualificationsId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface QualificationsResponseDto {
  leadsQualificationsId: number;
  businessId: number;
  description: string;
  status: string;
  leadsQualificationsCount: number;
}
