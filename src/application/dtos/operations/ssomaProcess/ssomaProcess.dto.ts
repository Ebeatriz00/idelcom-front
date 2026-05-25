export interface SsomaProcessResponseDto {
  ssomaProcessId: number;
  operationsId: number;
  operationsName?: string;
  requiresCompanyHomologation: boolean;
  requieresOperationTeamSsoma: boolean;
  currentDesc?: string;
  requestDate: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface SsomaProcessUpsertDto {
  SsomaProcessId?: number;
  OperationsId: number;
  RequiresCompanyHomologation: boolean;
  RequieresOperationTeamSsoma: boolean;
  CurrentStatusId: number;
  RequestDate: string | null;
  SubmissionsDate: string | null;
  ApprovalDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  GeneralObservation: string;
}

export interface SsomaProcessByIdDto {
  SsomaProcessId: number;
  OperationsId: number;
  RequiresCompanyHomologation: boolean;
  RequieresOperationTeamSsoma: boolean;
  CurrentStatusId: number;
  RequestDate: string | null;
  SubmissionsDate: string | null;
  ApprovalDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  GeneralObservation: string;
}
