export interface AttendanceStatusResponseDto {
  attendanceStatusId: number;
  businessId: number;
  statusDesc: string;
  stateColor: string;
}

export interface AttendanceStatusSelectItemDto {
  value: number;
  label: string;
  stateColor: string;
}
