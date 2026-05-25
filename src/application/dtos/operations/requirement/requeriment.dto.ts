export interface RequirementUpsertDto {
  requirementId?: number;
  name?: string;
  description?: string;
  duration?: number;
  scopeId?: number;
  hasExpiration?: boolean;
  requiresFile?: boolean;
  requiresExpiration?: boolean;
  maxFileSize?: number;
  allowedExtensions?: string;
  allowInternalReuse?: boolean;
}

export interface RequirementResponseItemDto {
  requirementId?: number;
  name?: string;
  description?: string;
  duration?: number;
  scopeName?: string;
  hasExpiration?: string;
  requiresFile?: string;
  maxFileSize?: number;
  allowedExtensions?: string;
  allowInternalReuse?: string;
  isActive?: string;
}

export interface RequirementByIdDto {
  requirementId?: number;
  name?: string;
  description?: string;
  duration?: number;
  scopeId?: number;
  hasExpiration?: boolean;
  requiresFile?: boolean;
  requiresExpiration?: boolean;
  maxFileSize?: number;
  allowedExtensions?: string;
  allowInternalReuse?: boolean;
}