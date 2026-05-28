/**
 * DTO para la entidad central de Operaciones
 */
export interface OperationsResponseDto {
  operationsId: number;
  businessId: number;
  opporId: number;
  qualitySupervisorId?: number | null;
  qualitySupervisorName?: string | null;
  projectManagerId?: number | null;
  projectManagerName?: string | null;
  requeredSsoma?: boolean | null;
  plannedStartDate?: string | null;
  actualStartDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  operationsStatusId?: number | null;
  operationStatusDesc?: string | null;
  progressPercentage?: number | null;
  status?: string | null;
  stateColor?: string | null;
  closurePdfFileUid?: string | null;
}

export interface OperationsCreateDto {
  businessId: number;
  opporId: number;
  qualitySupervisorId?: number | null;
  projectManagerId?: number | null;
  requeredSsoma?: boolean | null;
  plannedStartDate?: string | null;
  actualStartDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  operationsStatusId?: number | null;
  progressPercentage?: number | null;
}

export interface OperationsUpdateDto extends OperationsCreateDto {
  operationsId: number;
}
