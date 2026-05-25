export interface OperationsPersonnelAssignmentResponseDto {
  assignmentId: number;
  businessId: number;
  squadId: number;
  squadName: string;
  workerId: number;
  workerName: string;
  assignmentDate: string;
  assignmentStatusId: number;
  assignmentStatusName: string;
  startDate: string;
  finishDate: string;
  notes: string;
  registrationDate: string;
}

export interface OperationsPersonnelAssignmentCreateDto {
  squadId: number;
  workerId: number;
  assignmentDate: string;
  assignmentStatusId: number;
  startDate: string;
  finishDate: string;
  notes: string;
}

export interface OperationsPersonnelAssignmentUpdateDto extends OperationsPersonnelAssignmentCreateDto {
  assignmentId: number;
}
