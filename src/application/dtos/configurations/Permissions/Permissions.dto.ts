export interface PermissionsUpsertDto {
  permissionsId?: number;
  businessId?: number;
  permissionsCode?: string;
  permissionsName: string;
  permissionsDescription?: string;
  usersBy?: string;
}
export interface PermissionsStatusDto {
  permissionsId?: number;
  businessId?: number;
  permissionsCode?: string;
  status: string;
  usersBy?: string;
}
