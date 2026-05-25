export interface OperationPersonnelMovementResponseDto {
  movementId: number;
  businessId: number;
  workerId: number;
  workerName: string;
  fromOperationsId?: number;
  fromOperationsName?: string;
  toOperationsId?: number;
  toOperationsName?: string;
  fromSquadId?: number;
  fromSquadName?: string;
  toSquadId?: number;
  toSquadName?: string;
  movementDate: string;
  releaseTime: string;
  reassignmentTime?: string;
  movementStatusId: number;
  movementStatusName: string;
  movementReason?: string;
  authorizedBy?: number;
  authorizedByName?: string;
  registeredBy: number;
  registeredByName: string;
  regularizedBy?: number;
  regularizedByName?: string;
  regularizedDate?: string;
  observation?: string;
  registrationDate: string;
}

export interface OperationPersonnelMovementCreateDto {
  workerId: number;
  fromOperationsId?: number;
  toOperationsId?: number;
  fromSquadId?: number;
  toSquadId?: number;
  movementDate: string;
  releaseTime: string;
  reassignmentTime?: string;
  movementStatusId: number;
  movementReason?: string;
  authorizedBy?: number;
  observation?: string;
}
