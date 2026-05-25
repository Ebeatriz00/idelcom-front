export interface BusinessLineUpsertDto {
  businessLineId?: number;
  businessId?: number;
  descLine: string;
  usersBy?: string;
}

export interface BusinessLineStatusDto {
  businessLineId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface BusinessLineResponseDto {
  businessLineId: number;
  businessId: number;
  descLine: string;
  status: string;
}
