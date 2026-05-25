export interface ModulesPermissionsResponseDto {
  modulesPermissionsId: number;
  modulesName: string;
  modulesDescription?: string;
  totalPermissions: number;
  activePermissions: number;
  UsedInProfiles: number;
  status: string;
  listModulesPermissions : {
    modulesPermissionsId: number;
    permissionsId?: number;
    permissionsName?: string;
  }
}


export interface ModulesPermissionsResponseByIdDto {
    modulesPermissionsId: number;
    businessId?: number;
    modulesId?: number;
    permissionsId?: number;
}