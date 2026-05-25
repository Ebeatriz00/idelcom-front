export interface OperationsWorkOrderActivityResponseDto {
  activityId: number;
  workOrderId: number;
  activityName: string;
  measurementUnitId: number;
  measurementUnitName?: string;
  measurementUnitSymbol?: string;
  complexityId: number;
  complexityName?: string;
  weightFactor: number;
  targetQuantity: number;
  currentQuantity: number;
  progressPercentage: number;
}

export interface OperationsWorkOrderActivityCreateDto {
  workOrderId: number;
  activityName: string;
  measurementUnitId: number;
  complexityId: number;
  targetQuantity: number;
}

export interface OperationsWorkOrderActivityUpdateDto {
  activityId: number;
  workOrderId: number;
  activityName: string;
  measurementUnitId: number;
  complexityId: number;
  targetQuantity: number;
}

export interface OperationsWorkOrderActivitySelectItem {
  activityId: number;
  activityName: string;
}
