export interface TasksProjectUpsertDto{
    tasksId?: number;
    linkToken?: string;
    businessId?: number;
    opporToken?: string | null;
    projectToken?: string | null;
    stateTaskId?: number;
    workerId?: number;
    title: string
    description: string;
    endDate?: Date | string;
    priorityStateId?: number;
    time: string;
    usersBy?: string
    numPercPro: number;
}

export interface TasksProjectStatusDto {
  tasksId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface TasksProjectCompletedDto {
  linkToken?: string;
  businessId?: number;
  usersBy?: string;
}
export interface TasksProjectChangeStateDto {
  linkToken?: string;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface TasksProjectChangePriorityStateDto {
  linkToken?: string;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface TaskProjectDeleteDto {
  linkToken?: string;
  projectToken?: string;
}