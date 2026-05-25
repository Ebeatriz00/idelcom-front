export interface TasksProjectResponseDto{
    linkToken?: string;
    tasksId?: number;
    businessId?: number;
    projectId?: number;
    projectDescription: string;
    stateTaskId?: number;
    stateTaskDescription: string;
    workerId?: number;
    wprkerDescription: string;
    priorityStateId?: number;
    priorityStateDescription: string;
    title: string
    description: string;
    endDate: Date | string;
    time: string;
    status: string;
    tasksProjectCount: number;
    deliverableId: number;
    numPercPro: number;
}