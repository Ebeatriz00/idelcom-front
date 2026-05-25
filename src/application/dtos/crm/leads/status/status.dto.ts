export interface LeadsStatusUpsertDto {
  leadsStatusId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface LeadsStatusStatusDto {
  leadsStatusId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface LeadsStatusResponseDto {
  leadsStatusId: number;
  businessId: number;
  description: string;
  status: string;
  leadsStatusCount: number;
}
