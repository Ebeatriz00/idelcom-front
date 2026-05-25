export interface ProjectObservationDto {
    obsId: number;             
    businessId: number;       
    opporToken: string;        
    obsType?: number;         
    obsSeverity?: number;    
    obsStatusId?: number;     
    obsReason?: string;        
    dueDate?: string;
    openedByName?: string;     
    dueSetByName?: string;     
    openedAt?: string;         
    status?: string;
    obsSeverityDesc?: string; 
    affectsQuotation?: boolean;
}

export interface ProjectObservationListResponse {
    items: ProjectObservationDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface UpdateObservationDto {
    obsId: number;
    isApproved: boolean;   
    rejectionReason?: string;  
    usersBy: number;
}


export interface UpdateObservationDateDto{
    obsId: number;
    dueDate?: string;
    obsStatusId?: number;
}