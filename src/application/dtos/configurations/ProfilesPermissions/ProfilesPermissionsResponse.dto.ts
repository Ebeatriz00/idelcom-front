export interface ProfilesPermissionsResponseDto{
    profilesPermissionsId: number;
    modulesName : string;
    permissionsName: string;
    status: string;
}

export interface ProfilesPermissionsByIdDto{
    profilesPermissionsId: number;
    profilesId: number;
    modulesPermissionsId: number;
}