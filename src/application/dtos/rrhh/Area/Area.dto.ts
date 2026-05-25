export interface AreaUpsertDto {
  areaId?: number;
  businessId?: number;
  description?: string;
  usersBy?: string;
}
export interface AreaStatusDto{
  areaId?: number;
  businessId?: number;
  status : string;
  usersBy?: string;
}