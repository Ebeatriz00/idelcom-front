export interface DashboardPreSalesQuotationSales {
    quantity: number;
}

export interface DashboardPreSalesStates{
    statePreSaleId: number;
    stateName : string;
    stateColor : string;
    quantity : number;
}

export interface DashboardPreSalesCombined{
    quarterNum : number;
    stateName : string;
    stateColor : string;
    quantity : number;
}

export interface DashboardPreSalesByEngineer{
    responsible: string;
    totalVersions: number;
    generalAmount: number;
    closedAmount: number;
}

export interface DashboardPreSalesMatriz{
    workerId: number;
    workerName: string;
    monthNum: number;
    wonAmount: number;
    generalAmount: number;
    totalQuotations: number;
}

export interface DashboardPreSalesCollaborator{
    collaboratorName: string;
    totalVersions: number;
    generalAmount: number;
    closedAmount: number;
}


export interface DashboardPreSalesIntegrator{
    integrators: string;
    totalVersions: number;
    generalAmount: number;
    closedAmount: number;
}

export interface DashboardPreSalesByEngineerDetails{
    responsible: string;
    opporNum: string;
    opporDesc: string;
    generalAmount: number;
}

export interface DashboardPreSalesIntegratorDetails{
    integrators: string;
    opporNum: string;
    opporDesc: string;
}   

export interface DashboardPreSalesCollaboratorDetails{
    collaborators: string;
    opporNum: string;
    opporDesc: string;
}

export interface DashboardPreSalesByCategory{
    categoryName: string;
    projectQuantity: number;
    totalAmount: number;
    wonAmount: number;
}