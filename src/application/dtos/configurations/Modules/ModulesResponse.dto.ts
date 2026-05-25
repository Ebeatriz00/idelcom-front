export interface ModulesResponseDto {
  modulesId: number;
  businessId: number;
  parentModulesId: number;
  parentId: number;
  code: string;
  label: string;
  modulesDescription?: string;
  icon?: string;
  path?: string;
  orderNo: number;

  modulesName: string;
  status: string;

  modulesCount: number;
}
