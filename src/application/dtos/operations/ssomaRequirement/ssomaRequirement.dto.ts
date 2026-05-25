export interface SsomaRequirementResponseDto {
  requirementId: number;
  businessId: number;
  name: string;
  description: string;
  scopeId: number;
  scopeName: string;
  hasExpiration: boolean;
  requiresFile: boolean;
  requiresExpiration: boolean;
  maxFileSize: number;
  allowedExtensions: string;
  isActive: boolean;
}
