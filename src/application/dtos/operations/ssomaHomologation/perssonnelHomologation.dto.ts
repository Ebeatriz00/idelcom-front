export interface HomologationPersonnelUpsertDto {
  homologationScopeId: number;
  operationsId?: number;
  workerId: number;
  medicalAptitudeId: number;
  validFrom: string;
  ssomaApproved: boolean;
  adminApproved: boolean;
  notes?: string;
}

export interface HomologationPersonnelDocumentUpsertDto {
  requirementId: number;
  fileName: string;
  fileUrl?: string;
  filePath: string;
  issueDate: string;
  expirationDate: string;
  reviewDate: string;
  observation: string;
  file?: File;
}

export interface HomologationPersonnelRequestDto {
  homologationPersonnel: HomologationPersonnelUpsertDto;
  documents: HomologationPersonnelDocumentUpsertDto[];
}

export interface SsomaHomologationPersonnelDocumentReplaceDto {
  ssomaHomologationPersonnelDocumentId?: number;
  homologationPersonnelId: number;
  requirementId: number;
  fileName: string;
  fileUrl: string;
  filePath: string;
  issueDate?: string;
  expirationDate?: string;
  validationStatusId: number;
  reviewDate?: string;
  observation: string;
  replacementReason?: string;
  file?: any;
  clinicId?: number;
}

export interface SsomaHomologationPersonnelDocumentReplaceRequestDto extends SsomaHomologationPersonnelDocumentReplaceDto {
  documents?: SsomaHomologationPersonnelDocumentReplaceDto[];
}
