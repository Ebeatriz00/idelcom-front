export const SsomaAssignmentChangeType = {
  Update: 1,
  Relocation: 2,
  Replacement: 3,
} as const;

export type SsomaAssignmentChangeType = (typeof SsomaAssignmentChangeType)[keyof typeof SsomaAssignmentChangeType];

export interface OperationsTeamSsomaAssignmentDto {
  workerId?: number;
  ssomaRoleId: number;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  operationsProjectConfigId?: number | null;
}

export interface OperationsTeamSsomaAssignmentUpdateDto {
  operationsTeamSsomaId: number;
  workerId?: number;
  ssomaRoleId: number;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  operationsProjectConfigId?: number | null;
}

export interface OperationsTeamSsomaCreateDto {
  ssomaProcessId: number;
  teamSsoma: OperationsTeamSsomaAssignmentDto[];
}

export interface OperationsTeamSsomaUpdateDto {
  ssomaProcessId: number;
  teamSsoma: OperationsTeamSsomaAssignmentUpdateDto[];
}

export interface OperationsTeamSsomaListItemDto {
  operationsTeamSsomaId: number;
  ssomaProcessId: number;
  assignmentId?: number;
  workerId?: number;
  workerName?: string;
  ssomaRoleId: number;
  ssomaRoleName?: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  isActive: boolean;
  replacedAssignmentId?: number;
  clientApprovalStatusId?: number;
  clientApprovalStatusName?: string;
  comments?: string;
  operationsProjectConfigId?: number | null;
}

export interface OperationsTeamSsomaGetByIdDto {
  operationsTeamSsomaId?: number;
  businessId: number;
  ssomaProcessId: number;
  teamSsoma: OperationsTeamSsomaAssignmentDto[];
  assignmentId?: number;
  isActive: boolean;
  reasonChange?: string;
  replacedAssignmentId?: number;
  clientApprovalStatusId?: number;
  clientApprovalDate?: string;
  comments?: string;
}

export interface ProcessSsomaAssignmentChangeDto {
  changeType: SsomaAssignmentChangeType;
  operationsTeamSsomaId: number;
  ssomaProcessId: number;
  workerId?: number;
  ssomaRoleId: number;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  reasonChange?: string;
  clientApprovalStatusId?: number;
  clientApprovalDate?: string;
  comments?: string;
  replacedAssignmentId?: number;
  operationsProjectConfigId?: number | null;
  sssomaMovementTypeId: number;
  movementDate: string;
  fromSsomaProcessId?: number;
  toSsomaProcessId?: number;
  description?: string;
}

export interface ActiveSsomaAssignmentDto {
  operationsTeamSsomaId: number;
  ssomaProcessId: number;
  operationsId: number;
  opporId: number;
  opportunityName: string;
  workerId: number;
  workerName: string;
  ssomaRoleId: number;
  ssomaRoleName: string;
  startDate: string;
  isActive: boolean;
}
