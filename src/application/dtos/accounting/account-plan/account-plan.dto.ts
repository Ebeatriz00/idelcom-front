export interface AccountPlanUpsertDto {
  accountPlanId?: number;
  businessId?: number;
  accountCode: string;
  accountName: string;
  accountTypeId?: number;
  accountLevelId?: number;
  typeAnalysisId?: number;
  currencyId?: number;
  auxiliaryTypeId?: number;
  difereceChange?: string;
  docControl?: string;
  accountAmarreDebit?: number;
  accountAmarreCredit?: number;
  usersBy?: string;
}

export interface AccountPlanResponseDto {
  accountPlanId?: number;
  businessId?: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountPlanCount: number;
  status?: string;
}

export interface AccountPlanByIdDto {
  accountPlanId?: number;
  businessId?: number;
  accountCode: string;
  accountName: string;
  accountTypeId?: number;
  accountLevelId?: number;
  typeAnalysisId?: number;
  currencyId?: number;
  auxiliaryTypeId?: number;
  difereceChange?: string;
  docControl?: string;
  accountAmarreDebit?: number;
  accountAmarreCredit?: number;
}

export interface AccountPlanStatusDto {
  accountPlanId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
