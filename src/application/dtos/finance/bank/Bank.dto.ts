export interface BankUpsertDto{
    bankId?: number;
    businessId?: number;
    description: string;
    abrv: string;
    usersBy?: string
}

export interface BankStatusDto{
    bankId?: number;
    businessId?: number;
    status?: string;
    usersBy?: string
}