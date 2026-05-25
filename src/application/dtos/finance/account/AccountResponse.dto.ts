export interface AccountResponseDto{
    accountId?: number;
    businessId?: number;
    currencyId?: number;
    currencyDescription: string;
    bankId?: number;
    bankDescription: string
    accountPlanId?: number;
    accountPlanDescription: string;
    description:string
    status: string;
    accountCount: number;
}