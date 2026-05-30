export interface OperationsProjectConfigResponseDto {
  operationsProjectConfigId: number;
  businessId: number;
  operationsId: number;
  entryTime: string;
  departureTime: string;
  allowDelay: boolean;
  minutesTolerance: number;
  beforeOfficialTime: string;
  isRequirePhoto: boolean;
  isRequireOvertime: boolean;
  isRequireOvertimeApproval: boolean;
  shift: number;
  isRequireAppAttendance: boolean;
  isRequireGroupPhoto: boolean;
}

export interface OperationsProjectConfigCreateDto {
  businessId: number;
  operationsId: number;
  entryTime: string;
  departureTime: string;
  allowDelay: boolean;
  minutesTolerance: number;
  beforeOfficialTime: string;
  isRequirePhoto: boolean;
  isRequireOvertime: boolean;
  isRequireOvertimeApproval: boolean;
  shift: number;
  isRequireAppAttendance: boolean;
  isRequireGroupPhoto: boolean;
}

export interface OperationsProjectConfigUpdateDto {
  operationsProjectConfigId: number;
  businessId: number;
  operationsId: number;
  entryTime: string;
  departureTime: string;
  allowDelay: boolean;
  minutesTolerance: number;
  beforeOfficialTime: string;
  isRequirePhoto: boolean;
  isRequireAppAttendance: boolean;
  isRequireGroupPhoto: boolean;
  isRequireOvertime: boolean;
  isRequireOvertimeApproval: boolean;
  shift: number;
}
