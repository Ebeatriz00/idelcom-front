export interface LeadsSourcesUpsertDto {
  leadsSourcesId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface LeadsSourcesStatusDto {
  leadsSourcesId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface LeadsSourcesResponseDto {
  leadsSourcesId: number;
  businessId: number;
  description: string;
  status: string;
  leadsSourcesCount: number;
}
