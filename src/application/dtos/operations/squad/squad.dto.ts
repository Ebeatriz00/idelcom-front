export interface OperationsSquadResponseDto {
  squadId: number;
  businessId: number;
  workOrderId: number;
  workOrderNum: string;
  squadName: string;
  techLeaderId: number;
  techLeaderName: string;
  description: string;
  registrationDate: string;
  state: number;
  operationsProjectConfigId: number | null;
  squadCategory: string;
}

export interface OperationsSquadCreateDto {
  workOrderId: number;
  squadName: string;
  techLeaderId: number;
  description: string;
  operationsProjectConfigId: number | null;
  squadCategory: string;
}

export interface OperationsSquadUpdateDto extends OperationsSquadCreateDto {
  squadId: number;
}
