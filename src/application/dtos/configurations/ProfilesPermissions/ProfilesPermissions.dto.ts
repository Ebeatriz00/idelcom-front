export interface ProfilesPermissionsUpsertDto {
  profilesPermissionsId?: number;  
  businessId?: number;
  profilesId?: number;
  modulesPermissionsId?: number[];
  usersBy?: string;
}
export interface ProfilesPermissionsStatusDto {
  profilesPermissionsId?: number;
  businessId?: number;
  profilesId?: number;
  modulesPermissionsId?: number;
  status: string;
  usersBy?: string;
}