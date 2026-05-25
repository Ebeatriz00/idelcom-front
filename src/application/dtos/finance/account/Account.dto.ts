export interface AccountUpsertDto{
    accountId?: number;
    businessId?: number;
    currencyId?: number;
    bankId?: number;
    accountPlanId?: number;
    description: string;
    usersBy?: string;
}

export interface AccountStatusDto{
    accountId?: number;
    businessId?: number;
    status?: string;
    usersBy?: string;
}