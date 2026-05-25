export interface OpportunitiesUpsertDto {
  linkToken?: string;
  businessId?: number;
  typeOppor?: number;
  parentOpporId?: number;
  negotiationStagesId: number;
  opporDesc: string;
  clientsId: number;
  contactsId: number;
  businessLineId?: number;
  workerId?: number;
  currencyId?: number;
  dateRegister?: Date;
  dateFinish?: Date;
  consultDate?: Date;
  quoDate?: Date;
  opporAmount?: number;
  porcentProgressPro?: number;

  isAprovedViability?: boolean;
  isPreOpportunity?: boolean;
  decisionManager?: string;

  followupEnabled?: boolean;
  followupEveryDay?: number;

  isHiring?: boolean;
  deliverablesHiring?: DeliverableItemDto[];
  opporNumber?: number;
  hiringFiles?: HiringFileItemDto[];
  flowTypeId?: number;
  pmConditionId?: number;
  usersBy?: number;
}

export interface OpportunitiesResponseDto {
  linkToken?: string;
  businessId: number;
  typeOpporDesc?: string;
  negotiationStagesDesc: string;
  opporDesc: string;
  opporNumber: string;
  clientsName: string;
  salesName: string;
  salesPre: string;
  tasks: number;
  stateOpporDesc: string;
  porcentProgressPro?: number;
  stateColor: string;
  status: string;
  commentsCount: number;
  unreadCommentsCount: number;
  stateGeneral: string;
  colorState: string;
  deliverablesCount: number;
  decisionManager?: string;
  dateRegister: Date;
  dateFinish: Date;
  isOpporManager?: boolean;

  followupEnabled?: boolean;
  followupSuspended?: boolean;
  followupNextAt?: Date;
  isHiring?: boolean;

  obsNotResolved?: number;
  obsNotApproved?: number;
  obsApproved?: number;
  obsNotDate?: number;

  //flag preventa
  obsNotResolvedPre?: number;
  obsNotApprovedPre?: number;
  obsApprovedPre?: number;
  obsNotDatePre?: number;
  obsQuo?: number;
  existQuo?: number;
  obsQuoResolved?: number;
  preSalesDelivered?: number;
  goesToPresales?: number;

  //flag copntrataiones
  obsNotResolvedLic?: number;
  obsNotApprovedLic?: number;
  obsApprovedLic?: number;
  obsNotDateLic?: number;
  licDocDelivered?: number;
  licConsultDelivered?: number;

  canChangeStateByDelivery?: number;

  typeObsClientsId?: number;
  typeObsEconomic?: number;

  statePresales?: string;
  colorStatePresales?: string;

  currencyDesc?: string;
  totalAmount?: number;
  quoDate?: Date;
}

export interface OpportunitiesByIdDto {
  linkToken?: string;
  businessId?: number;
  opporDesc: string;
  typeOppor?: number;
  parentOpporId?: number;
  negotiationStagesId: number;
  opporNumber: string;
  opporNumInternal: number;
  clientsId: number;
  contactsId?: number;
  businessLineId?: number;
  stateOpporId?: number;
  workerId?: number;
  currencyId?: number;
  dateRegister?: Date;
  dateFinish?: Date;
  opporAmount?: number;
  consultDate?: Date;
  quoDate?: Date;
  porcentProgressPro?: number;
  isAprovedViability: boolean;
  isPreOpportunity: boolean;
  isHiring?: boolean;
  deliverablesHiring?: DeliverableItemDto[];
  hiringFiles?: HiringFileItemDto[];
  flowTypeId?: number;
  pmConditionId?: number;
}

export interface OpportunitiesStateGetByIdDto {
  linkToken?: string;
  businessId?: number;
  stateOpporId?: number;
  reasonRejectionId?: number;
  reasonRejection?: string;
}

export interface OpportunitiesClientsGetByIdDto {
  linkToken?: string;
  businessId?: number;
  clientsId?: number;
  reasonRejection?: string;
}

export interface OpportunitiesClientsUpdateDto {
  linkToken?: string;
  businessId?: number;
  clientsId?: number;
  reasonRejection?: string;
  usersBy?: number;
}

export interface OpportunitiesStateUpdateDto {
  linkToken?: string;
  opporNumber?: string;
  businessId?: number;
  stateOpporId?: number;

  negotationOutcomeId?: number;
  typeObsClientsId?: number;
  reasonObsClients?: string;
  typeObsEconomic?: number;

  reasonRejectionId?: number;
  reasonRejection?: string;
  usersBy?: number;
  proposalComment?: string;

  viabilityScore?: number;
  compliance?: number;
  partialCompliance?: number;
  nonCompliance?: number;
  authority?: number;
  authorityDesc?: string;
  budget?: number;
  budgetDesc?: string;
  need?: number;
  needDesc?: string;
  term?: number;
  termDesc?: string;

  contractMethod?: number;
  contractMethodDesc?: string;
  requiresIsos?: number;
  requiresIsosDesc?: string;

  companyExperience?: number;
  companyExperienceDesc?: string;
  workerExperience?: number;
  workerExperienceDesc?: string;
  staffExperience?: number;
  staffExperienceDesc?: string;
  ability?: number;
  abilityDesc?: string;
  shedule?: number;
  sheduleDesc?: string;
  minScore?: number;
  maxScore?: number;

  wonComment?: string;
  currencyId?: number;
  deliverablesName?: string;

  excelFile?: File;
  fileTitle?: string;
  fileUrl?: string;
  relativePath?: string;
  archiveType?: string;

  dateFinish?: Date;
  dateRegister?: Date;
  isHiring?: boolean;
  isReEvaluation?: boolean;
  brandAproach?: number;
  brandAproachDesc?: string;
  TechnicalChanges?: number;
  TechnicalChangesDesc?: string;

  deliverables?: DeliverableItemDto[];
  deliverablesHiring?: DeliverableItemDto[];
  observations?: ObservationOpporItemDto[];

  proposalPresentated?: boolean;
  quotationVerId?: number;
  callDate?: Date;
  followupEnabled?: boolean;
  stateOpporGenId?: number;
  pmConditionId?: number;
}

export interface DeliverableItemDto {
  deliverablesId: number;
  name?: string;
  comment?: string;
  dueDate?: Date;
  fromDb?: boolean;
  state?: string;
}

export interface HiringFileItemDto {
  fileId?: number;
  fileTitle?: string;
  fileUrl?: string;
  relativePath?: string;
  archiveType?: string;
}

export interface OpportunitiesStatusDto {
  linkToken?: string;
  businessId?: number;
  status?: string;
  usersBy?: string;
}

export interface ObservationOpporItemDto {
  obsId?: number;
  obsSeverity?: number;
  obsComment?: string;
  dueDate?: Date | null;

  obsSeverityDesc?: string;
  obsColor?: string;
}

export interface OpportunitiesUploadNewVerDto {
  linkToken?: string;
  businessId?: number;
  opporNumber?: string;
  proposalComment?: string;
  excelFile?: File;
  fileTitle?: string;
  fileUrl?: string;
  relativePath?: string;
  archiveType?: string;
  usersBy?: number;
}
