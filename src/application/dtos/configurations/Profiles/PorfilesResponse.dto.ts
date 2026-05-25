export interface ProfilesResposeDto{
    profilesId?: number;
    businessId: string;
    name: string;
    description?: string;
    status: string;

    usersCount: number;
}
