export interface ParentModulesUpsertDto {
  parentModulesId?: number;
  businessId?: number;
  code?: string;
  title?: string;
  stickyBottom?: boolean;
  orderNo: number;
  usersBy?: string;
}
export interface ParentModulesStatusDto {
  parentModulesId?: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}
