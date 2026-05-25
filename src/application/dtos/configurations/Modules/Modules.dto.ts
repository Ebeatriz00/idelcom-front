export interface ModulesUpsertDto {
  modulesId?: number;
  businessId?: number;
  parentModulesId: number;
  parentId: number;
  code: string;
  label: string;
  modulesDescription?: string;
  icon?: string;
  path?: string;
  orderNo: number;
  usersBy?: string;
}
export interface ModulesStatusDto {
  modulesId?: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}
