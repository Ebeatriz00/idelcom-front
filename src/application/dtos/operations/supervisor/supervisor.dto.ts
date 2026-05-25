export interface OperationsSupervisorResponseDto {
  supervisorId: number;
  operationsId: number;
  workerId: number;
  workerName: string;
  isMain: boolean;
  registrationDate: string;
}

export interface OperationsSupervisorCreateDto {
  operationsId: number;
  workerId: number;
  isMain: boolean;
}

export interface OperationsSupervisorUpdateDto extends OperationsSupervisorCreateDto {
  supervisorId: number;
}
