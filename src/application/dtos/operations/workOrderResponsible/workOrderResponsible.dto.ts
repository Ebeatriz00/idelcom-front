export interface OperationsWorkOrderResponsibleResponseDto {
  workOrderResponsibleId: number;
  operationsWorkOrderResponsibleId?: number;
  businessId: number;
  workOrderId: number;
  workerId: number;
  workerName?: string;
  isMain: boolean;
  createUser: number;
  createDate: string;
  updateUser: number | null;
  updateDate: string | null;
  status: string | null;
}

export interface OperationsWorkOrderResponsibleCreateDto {
  workOrderId: number;
  workerId: number;
  isMain: boolean;
}

export interface OperationsWorkOrderResponsibleUpdateDto {
  workOrderResponsibleId: number;
  workOrderId: number;
  workerId: number;
  isMain?: boolean | null;
}

export interface OperationsWorkOrderResponsibleByIdDto {
  workOrderResponsibleId: number;
  businessId: number;
  workOrderId: number;
  workerId: number;
  isMain: boolean;
  createUser: number;
  createDate: string;
  updateUser: number | null;
  updateDate: string | null;
  status: string | null;
}
