export interface AttendanceMatrixProjectDto {
  opporId: number;
  opporDesc: string;
  clientsName: string;
}

export interface AttendanceMatrixWorkOrderDto {
  opporId: number;
  workOrderId: number;
  workOrderCode: string;
  workOrderName: string;
}

export interface AttendanceMatrixSquadDto {
  workOrderId: number;
  squadId: number;
  squadName: string;
}

export interface AttendanceMatrixDetailDto {
  checkInId?: number | null;
  checkOutId?: number | null;
  checkInSessionId?: number | null;
  checkOutSessionId?: number | null;
  opporId: number;
  workOrderId: number;
  squadId: number;
  assignmentId: number;
  workerId: number;
  workerName: string;
  workerDocument: string;
  attendanceDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  attendanceStatusId: number;
  statusDesc: string;
  isLate: boolean;
  lateMinutes: number;
  earlyExitMinutes?: number | null;
  observation: string;
  clientsName: string;
  checkInGroupPhotoUid?: string | null;
  checkOutGroupPhotoUid?: string | null;
  checkInPhotoUid?: string | null;
  checkOutPhotoUid?: string | null;
}

export interface AttendanceMatrixResponseDto {
  projects: AttendanceMatrixProjectDto[];
  workOrders: AttendanceMatrixWorkOrderDto[];
  squads: AttendanceMatrixSquadDto[];
  details: AttendanceMatrixDetailDto[];
  totalWorkers: number;
}
