export interface SsomaOperationsRequirementCreateDto {
  operationsId: number;
  requirementId: number;
  isMandatory: boolean;
  validDays?: number;
}
