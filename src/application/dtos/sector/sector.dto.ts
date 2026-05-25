export interface SectorUpsertDto {
  sectorId?: number;
  businessId?: number;
  description: string;
  usersBy?: string;
}

export interface SectorStatusDto {
  sectorId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface SectorResponseDto {
  sectorId: number;
  businessId: number;
  description: string;
  status: string;
  SectorCount: number;
}
