export interface TasksUpsertDto {
  linkToken?: string;
  businessId?: number;
  opporToken: string;
  stateTaskId?: number;
  workerId?: number;
  title: string;
  description: string;
  endDate?: Date | string;
  priorityStateId?: number;
  time: string;
  usersBy?: string;
}

export interface TasksStatusDto {
  linkToken?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface TasksCompletedDto {
  linkToken?: string;
  businessId?: number;
  usersBy?: string;
}
export interface TasksChangeStateDto {
  linkToken?: string;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface TaskChangePriorityStateDto {
  linkToken?: string;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface TaskOpporDeleteDto {
  linkToken?: string;
  opporToken?: string;
}
