export interface ModulesPermissionsUpsertDto {
  modulesPermissionsId?: number;  
  businessId?: number;
  modulesId?: number;
  permissionsId?: number;
  usersBy?: string;
}
export interface ModulesPermissionsStatusDto {
  modulesPermissionsId?: number;
  businessId?: number;
  modulesId?: number;
  permissionsId?: number;
  status: string;
  usersBy?: string;
}