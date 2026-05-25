
export interface HiringUpsertDto {
  businessId?: number;
  opporId: number;
  derivablesHirings?: DeliverableHiringItemDto[];
  usersBy?: string;
}
export interface DeliverableHiringItemDto {
  deliverablesId: number;
  name?: string;
  comment?: string;
  dueDate?: Date | null;
  fromDb?: boolean;
  state?: string;
}

export interface HiringResponseDto{
  opporId: number;        
  linkToken: string;
  hiringId: number;
  opporNum?: string;
  opporDesc?: string;
  clientsName?: string;
  hiriginStatus?: string;
  opporStatus?: string;
  hiriginColor?: string;
  opporColor?: string;
  licStatusId?: number;
  hiringStatus?: string;
  stateOpportunityId?: number;
  tasksId?: number;       
  stateTaskId?: number;
  taskDesc?: string;
  taskColor?: string;
  requestNote?: string;

}


export interface HiringUpdateStatusDto {
  hiringId?: number;
  businessId?: number;
  licStatusId?: number;
  usersBy?: number;
  hiringFiles?: { 
      fileTitle: string; 
      fileUrl: string; 
      relativePath: string; 
  }[];
} 

export interface MarkFileReadDto {
  businessId: number;
  usersBy: number;      
  opporToken: string;  
}
