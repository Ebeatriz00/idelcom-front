export interface OperationsWorkOrderSummaryDto {
  workOrderId: number;
  workOrderCode: string | null;
  progressPercentage: number;
  startDate: string;
  endDate: string | null;
  responsibleName: string | null;
}

export interface OperationsWorkOrderProgressDetailDto {
  progressId: number;
  activityId: number;
  activityName: string | null;
  reportedDate: string;
  reportedQuantity: number;
  workerId: number | null;
  workerName: string | null;
  observations: string | null;
  targetQuantity: number | null;
  currentQuantity: number | null;
  measurementUnitSymbol: string | null;
  activityProgressPercentage: number | null;
}

export interface OperationsWorkOrderProgressReportResponseDto {
  summaries: OperationsWorkOrderSummaryDto[];
  details: OperationsWorkOrderProgressDetailDto[];
}
