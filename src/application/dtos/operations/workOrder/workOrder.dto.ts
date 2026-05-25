export interface OperationsWorkOrderResponseDto {
  workOrderId: number;
  businessId: number;
  operationsId: number;
  workOrderCode: string;
  workOrderName: string;
  orderStatusId: number;
  startDate: string;
  endDate?: string;
  location?: string;
  needLogistics: boolean;
  needSsoma: boolean;
  needAttendance: boolean;
  progressPercentage: number;
  status?: string;
  isAdministrative: boolean;

  // Campos opcionales para cuando se crea una cuadrilla administrativa por debajo
  techLeaderId?: number | null;
  description?: string | null;
  operationsProjectConfigId?: number | null;
}

export interface OperationsWorkOrderCreateDto {
  operationsId: number;
  workOrderCode: string;
  workOrderName: string;
  orderStatusId: number;
  startDate: string;
  endDate?: string;
  location?: string;
  needLogistics: boolean;
  needSsoma: boolean;
  needAttendance: boolean;
  progressPercentage?: number;
  isAdministrative: boolean;

  // Campos auxiliares para la cuadrilla administrativa
  techLeaderId?: number | null;
  description?: string | null;
  operationsProjectConfigId?: number | null;
}

export interface OperationsWorkOrderUpdateDto extends OperationsWorkOrderCreateDto {
  workOrderId: number;
}
