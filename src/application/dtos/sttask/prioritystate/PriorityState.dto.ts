export interface PriorityStateResponseDto {
  linkToken?: string;
  priorityStateId: number;
  priorityDesc: string;
  color: string;
}

export interface PriorityStateSelectDto {
  linkToken: string;
  priorityDesc: string;
  color: string;
}
