export interface StateTaskUpsertDto {
  stateTaskId?: number;
  businessId?: number;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  numOrder: number;
  usersBy?: string;
}

export interface StateTaskStatusDto {
  stateTaskId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface StateTaskResponseDto {
  stateTaskId: number;
  businessId: number;
  stateDesc: string;
  numPercPro: number;
  status: string;
  taskDescription?: string;
  responsibleName?: string;
  registrationDate?: string; 
  priorityDesc?: string;
  lineToken?: string;
}

export interface StateTaskByIdDto {
  stateTaskId?: number;
  businessId?: number;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  numOrder: number;
}

export interface StateTaskSelectDto {
  lineToken: string;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  stateTaskId: number;
}
