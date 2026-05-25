export interface WarehousesUpsertDto {
  warehousesId?: number;
  description: string;
  address: string;
  departmentId: number;
  provinceId: number;
  districtId: number;
}

export interface WarehousesStatusDto {
  warehousesId?: number;
  status?: string;
}
