export interface PreSaleProyectsDetailDto {
    preSaleProyectId: number;
    businessId: number;
    linkToken?: string;
    description: string;      
    clientsName: string;     
    responsibleDescription: string; 
    endDate: Date;            
    proyectNum: string;             
    clientsSector: string;          
    presupuestoEstimado: string;   
    createDate: Date;               
    closeDate: Date;    
    statePreSaleId: number;           
    statePreSaleDescription: string; 
    clientsRuc: string;
    clientsAddress: string;
    clientsCity: string;
    clientsPhone: string;
    clientsWeb: string;
    contactName: string;
    contactJob: string;
    contactPhone: string;
    contactEmail: string;
    contactType: string;
    stateStatusProject?: string; 
    numPercPro?: number;
    porcentProgressPro?: number;
    finishDate?: Date;
 


  tasksList: Array <{
  tasksToken: string;
  priorityToken?: string;
  titleTasks?: string;     
  descTasks?: string;     
  priorityColor?: string;   
  priorityDesc?: string;    
  tasksResp?: string;       
  statusTasks?: string;    
  statusProgress?: number;
  stateColor?: string;
  endRegister?: Date;      
}>;

historyChanges: Array<{
  history?: string;
  usersName?: string;
  dateChange?: Date;
}>;

activityList: Array<{
  linkToken: string;
  activitys?: string;
  messageAddition?: string;
  dateActivity?: Date;
  workerName?: string;
  activityState?: string;
  activityStateColor?: string;
  activityIcon?: string;
  activity?: string;
  activityPriority?: string;
  activityPriorityColor?: string;
  }>;
  
  filetrackingList: Array<{
    linkToken: string;
    fileTitle?: string;
    fileUrl?: string;
    relativePath?: string;
    commentFile?: string;
    dateUpload?: Date;
    codeProject?: string;
  }>;

}

export interface FileTrackingProjectCreateDto {
  businessId?: number;
  projectToken?: string;
  fileTitle?: string;
  relativePath?: string;
  fileUrl?: string;
  comment?: string;
  usersBy?: number;
}

export interface FileTrackingProjectDeleteDto {
  linkToken?: number;
  projectToken?: string;
}