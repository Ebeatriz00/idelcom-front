export interface PreSaleProyectsUpsertDto{
    linkToken?: string;
    businessId?: number;
    proyectNum?: string;
    description: string;
    clientsId?: number;
    contactsCrmId?: number;
    responsibleId?: number;
    supervisorId?: number;
    ssomaId?: number;
    tecLeaderId?: number;
    opportunityId?: number;
    statePreSaleId?: number;
    quotationNumberId?: number;
    orderNumberId?: number;
    orderDate?: Date;
    startDate: Date;
    endDate: Date;
    usersBy?: string;
}


export interface PreSaleProyectsStatusDto{
    linkToken?: string;
    businessId?: number;
    status?: string;
    usersBy?: string;

}


export interface ProjectsResponsibleDto{
    linkToken: string;
    businessId: number;
    workerId: number;
    projectCategory: number;
    usersBy?: number;
}


export interface ProjectsUpdateStatusDto{
    linkToken?: string;
    businessId?: number;
    statePreSaleId: number;
    usersBy?: number;
    obsType?: number;
    obsSeverity?: number;  
    obsReason?: string[];
    obsStatusId?: number;
    obsDueDate?: string;
    assignedWorkerId?: number[];
    isIntegrator?: boolean;
 
}
