export interface ConceptsUpsertDto{
    conceptsId?: number;
    businessId?: number;
    conceptGroupsId: number;
    accountPlanId: number;
    description: string;
    usersBy?: string;
}

export interface ConceptsStatusDto{
    conceptsId?: number;
    businessId?: number;
    status?: string;
    usersBy?: string;
}