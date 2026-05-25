export interface ClientsUpsertDto {
  clientsId?: number;
  businessId?: number;
  documentTypeId: number;
  documents: string;
  clientsName: string;
  clientsCompany?: string;
  clientsAddress?: string;
  clientsPhone?: string;
  workerId?: number;
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  processTypeId?: number;
  sectorId?: number;
  leadSourceId?: number;
  leadStatusId?: number;
  leadQualificationId?: number;
  website?: string;
  usersBy?: string;
}

export interface ClientsStatusDto {
  clientsId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface ClientsUpdateChangeSalesDto {
  clientsId?: number;
  businessId?: number;
  workerId: number;
  usersBy?: string;
}
export interface ClientsResponseDto {
  clientsId: number;
  businessId: number;
  documents: string;
  clientsName: string;
  sales: string;
  sector: string;
  departament: string;
  leadStatus: string;
  status: string;
  isOtherSeller: boolean;
}
export interface ClientsHistoryResponseDto {
  eventId?: number;
  changeAt: Date;
  changeUser?: string;
  description: string;
}

export interface ClientsByIdDto {
  clientsId?: number;
  businessId?: number;
  documentTypeId: number;
  documents: string;
  clientsName: string;
  clientsCompany?: string;
  clientsAddress: string;
  clientsPhone?: string;
  workerId?: number;
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  processTypeId?: number;
  sectorId?: number;
  leadSourceId?: number;
  leadStatusId?: number;
  leadQualificationId?: number;
  website?: string;
}

export interface ClientDashboardDto {
  header: ClientDashboardHeaderDto;
  pipeline: ClientDashboardPipelineDto[];
  contacts: ClientDashboardContactDto[];
  activityTrend: ClientActivityTrendDto[];
}

export interface ClientActivityTrendDto {
  monthName: string;   
  year: number;       
  monthNum: number;    
  activityCount: number; 
  
  
}

export interface ClientDashboardHeaderDto {
  clientsId: number;
  clientsName: string;
  clientAddress: string;
  departamentName: string;
  openOppCount: number;
  openOppAmount: number;
  ltvTotalAmount: number;
  lastActivityAt?: string | Date | null;
  totalQuotes: number;
  winRate: number;
}

export interface ClientDashboardPipelineDto {
  opporId: number;
  opporDesc: string;
  stateDesc: string;
  stateColor: string;
  finishDate: string; 
  status: number | string; 
  opportunityAmount: number;
}

export interface ClientDashboardContactDto {
  contactsCrmId: number;
  contactName: string;
  jobTitle: string;
}


export interface ClientActivityResponseDto {
  clientsActivityId: number;
  clientsId: number;
  description: string;
  finishDate: string;
  workerName: string;
  activity: string;      
  activityIcon: string;
  stateDesc: string;     
  stateColor: string;    
  stateIcon: string; 
  activityStateId: number;    
}

export interface ClientActivityCreateDto {
  businessId: number;
  clientsId: number;
  workerId: number;
  activityTypeId: number;  
  activityStateId: number; 
  finishDate: string | Date; 
  description: string;
  usersBy: number; 
}

export interface ClientActivityDeleteDto {
  clientsActivityId: number;
  businessId: number;
}

export interface ClientActivityUpdateDto {
  clientsActivityId: number;
  activityStateId: number;
  businessId?: number; 
  usersBy?: number;    
}