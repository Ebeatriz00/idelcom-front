export interface ProfileUpsertDto {
  profilesId?: number;
  businessId?: number;
  name: string;
  description?: string;
  usersBy?: string;
}
export interface ProfileStatusDto{
  profilesId?: number;
  businessId?: number;
  status : string;
  usersBy?: string;
}
