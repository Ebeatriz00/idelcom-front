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
  isRequireOvertime: boolean;
  isRequireOvertimeApproval: boolean;
  shift: number;
}
