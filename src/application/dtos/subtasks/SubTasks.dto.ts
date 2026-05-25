export interface SubTasksCreateDto {
    taskToken: string; 
    businessId: number;
    workerId: number;
    title: string;
    description: string;
    endDate?: Date | string | null;
    time?: string | null;
    stateTaskId: number;
    priorityStateId: number;
    usersBy: number;
}

export interface SubTasksUpdateDto {
    linkToken: string; 
    businessId: number;
    workerId: number;
    title: string;
    description: string;
    endDate?: Date | string | null;
    time?: string | null;
    stateTaskId: number;
    priorityStateId: number;
    usersBy: number;
}

export interface SubTasksDeleteDto {
    linkToken: string;
    usersBy: number;
}

export interface SubTasksResponseDto {
    subTasksId: number;
    linkToken: string;    
    
    tasksId: number;
    taskToken: string;     
    
    title: string;
    description: string;
    endDate: string | null;
    time: string | null;  
    
    workerId?: number;
    workerDescription: string;
    
    priorityStateId?: number;
    priorityStateDescription: string;
    
    stateTaskId?: number;
    stateTaskDescription: string;
    
    areaId?: number;
    areaDescription: string;
    
    status: string;
}