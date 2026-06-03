export interface PersonnelHomologationListItemDto {
  personnelOperationsId: number;
  workerId: number;
  personnelFullName: string;
  generalPercentage: number;
  homologationStatus: string;
  status: string;
}

export interface PersonnelHomologationBaseItem {
  ssomaHomologationPersonnelDocumentId?: number;
  homologationPersonnelId?: number;
  requirementId?: number;
  requeriment: string;
  fileName: string;
  filePath?: string;
  validationStatus: string;
  validationStatusId?: number;
  fileExpiration?: string;
  fileReview?: string;
  issueDate?: string;
  observation?: string;
  fileUrl?: string;
  fileUid?: string;
}

export interface PersonnelHomologationGeneralItem extends PersonnelHomologationBaseItem {}

export interface PersonnelHomologationOperationsItem extends PersonnelHomologationBaseItem {
  operationsName?: string;
}

export interface PersonnelOperationsItem {
  personnelOperationsId: number;
  workerId: number;
  personnelFullName: string;
  personnelDocument: string;
  personnelPosittion: string;
  status: string;
  personnelHomologationGeneralItems: Array<{
    ssomaHomologationPersonnelDocumentId?: number;
    homologationPersonnelId?: number;
    requirementId?: number;
    requeriment: string;
    fileName: string;
    filePath?: string;
    validationStatus: string;
    validationStatusId?: number;
    fileExpiration: string;
    fileReview: string;
    issueDate?: string;
    observation?: string;
    fileUrl: string;
    fileUid?: string;
  }>;
  personnelHomologationOperationsItem: Array<{
    ssomaHomologationPersonnelDocumentId?: number;
    homologationPersonnelId?: number;
    requirementId?: number;
    operationsId?: number;
    operationsName: string;
    requeriment: string;
    fileName: string;
    filePath?: string;
    validationStatus: string;
    validationStatusId?: number;
    fileExpiration: string;
    fileReview: string;
    issueDate?: string;
    observation?: string;
    fileUrl: string;
    fileUid?: string;
  }>;
  personnelHomologationSummaryItem: Array<{
    activeProject: number;
    currentDocuments: number;
    totalDocuments: number;
    summaryCurrentDocuments: string;
    pendings: number;
    observations: number;
    expired: number;
    toExpired: number;
    generalShortages: number;
    operationsShortages: number;
    shortages: number;
    generalPercentage: number;
  }>;
}

export interface PersonnelOperationsByWorkerItemDto {
  operationsRequirementId: number;
  requirementId: number;
  requirementName: string;
  duration: number;
  requirementDescription: string;
  isMandatory: boolean;
  requiresFile: boolean;
  requiresExpiration: boolean;
  maxFileSize: number;
  allowedExtensions: string;
  allowInternalReuse: number;
  internalDocumentId?: number;
  internalFileName?: string;
  internalFileUrl?: string;
  internalFilePath?: string;
  internalIssueDate?: string;
  internalExpirationDate?: string;
  internalValidationStatusId?: number;
  internalReviewDate?: Date;
  internalObservation?: string;
  operationDocumentId?: number;
  operationFileName?: string;
  operationFileUrl?: string;
  operationFilePath?: string;
  operationIssueDate?: Date;
  operationlExpirationDate?: Date;
  operationValidationStatusId?: number;
  operationReviewDate?: Date;
  operationObservation?: number;
  sourceType?: string;
  sourceDocumentId?: number;
  requirementState: string;
  isSatisfied?: boolean;
  needsUpload?: boolean;
}
