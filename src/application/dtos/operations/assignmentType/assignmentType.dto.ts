export interface AssignmentTypeUpsertDto {
  ssomaAssignamentTypeId?: number;
  businessId?: number;
  ssomaAssignamentName?: string;
  usersBy?: string;
}

export interface AssignmentTypeResponseDto {
  ssomaAssignamentTypeId: number;
  businessId: number;
  ssomaAssignamentName: string;
  status: string;
}
export interface AssignmentTypeByIdDto {
  ssomaAssignamentTypeId?: number;
  businessId?: number;
  ssomaAssignamentName?: string;
}
export interface AssignmentTypeStatusDto {
  ssomaAssignamentTypeId?: number;
  businessId?: number;
  status: string;
  usersBy?: string;
}
