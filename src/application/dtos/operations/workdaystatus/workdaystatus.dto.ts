export interface WorkDayStatusResponseDto {
  workDayStatusId: number;
  businessId: number;
  statusDesc: string;
  statusColor: string;
}

export interface WorkDayStatusSelectItemDto {
  value: number;
  label: string;
  color: string;
}
