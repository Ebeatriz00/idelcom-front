export interface OperationsWorkOrderProgressPhotoDto {
  fileUid: string;
  url: string;
}

export interface   OperationsWorkOrderProgressResponseDto {
  progressId: number;
  activityId: number;
  businessId: number;
  reportedDate: string;
  reportedQuantity: number;
  workerId?: number;
  workerName?: string;
  activityName?: string;
  targetQuantity?: number;
  currentQuantity?: number;
  runningTotal?: number;
  observations?: string;
  createUser?: number;
  createDate?: string;
  updateUser?: number;
  updateDate?: string;
  status?: string;
  photos?: OperationsWorkOrderProgressPhotoDto[];
  workOrderId?: number;
  workOrderCode?: string;
  subActivityId?: number;
  subActivityName?: string;
  measurementUnitSymbol?: string;
}

export interface OperationsWorkOrderProgressCreateDto {
  activityId: number;
  reportedQuantity: number;
  reportedDate: string;
  observations?: string;
}
