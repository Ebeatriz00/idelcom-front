export interface TasksResponseDto{
    linkToken?: string;
    businessId?: number;
    opporToken?: number;
    opporDescription: string;
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
    tasksCount: number;
}