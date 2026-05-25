export interface SsomaOperationsRequirementItem {
  operationsRequirementId: number;
  requirementId: number;
  requirementName: string;
  requirementDescription: string;
  isMandatory: boolean;
  requiresFile: boolean;
  requiresExpiration: boolean;
  maxFileSize: number;
  allowedExtensions: string;
}
