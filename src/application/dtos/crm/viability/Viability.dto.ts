export interface ViabilityDecision {
    linkToken: string;      
    businessId: number;
    usersBy: number;       
    isApproved: boolean;   
    rejectionReason?: string | null;
}


export interface ViabilityStatus {
    linkToken: string;
    businessId: number;
    status: string;
    usersBy: number;
}


export interface Viability {
    linkToken: string;
    businessId: number;
    opporNum: string;
    opporDesc: string;
    clientsId: number;
    clientsName: string;
    generalStatesId: number;
    generalStatesName: string;
    stateOpportunityId: number;
    usersBy: number;
    status: string; 
}