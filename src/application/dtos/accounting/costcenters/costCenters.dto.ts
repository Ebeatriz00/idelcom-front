export interface CostCentersUpsertDto {
  costCentersId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface CostCentersStatusDto {
  costCentersId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}