export interface CommercialParametersUpsertDto {
  commercialParametersId?: number;
  businessId?: number;
  parametersName: string;
  parametersValue: number;
  minValue?: number;
  usersBy?: string;
}

export interface CommercialParametersStatusDto {
  commercialParametersId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}
export interface CommercialParametersResponseDto {
  commercialParametersId: number;
  businessId: number;
  parametersName: string;
  parametersValue: number;
  minValue?: number;
  status: string;
}
