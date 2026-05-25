export interface BoxesUpsertDto{
    boxesId?: number;
    businessId?: number;
    currencyId?: number;
    description: string;
    usersBy?: string;
}

export interface BoxesStatusDto{
    boxesId?: number;
    businessId?: number;
    status?: string;
    usersBy?: string;
}