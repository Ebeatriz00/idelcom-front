export interface SupportStateSelectDto {
  supportStateId: number;
  statusDesc: string;
  statusColor: string;
}

export interface SupportStateGetByIdDto {
  supportStateId: number;
  businessId: number;
  statusDesc: string;
  statusColor: string;
}
