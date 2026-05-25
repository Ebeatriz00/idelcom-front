export interface StateOpportunityUpsertDto {
  stateOpportunityId?: number;
  businessId?: number;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  numOrder: number;
  usersBy?: string;
}

export interface StateOpportunityStatusDto {
  stateOpportunityId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface StateOpportunityResponseDto {
  stateOpportunityId: number;
  businessId: number;
  stateDesc: string;
  numPercPro: number;
  status: string;
}
export interface StateOpportunityByIdDto {
  stateOpportunityId?: number;
  businessId?: number;
  stateColor: string;
  stateDesc: string;
  numPercPro: number;
  numOrder: number;
}
