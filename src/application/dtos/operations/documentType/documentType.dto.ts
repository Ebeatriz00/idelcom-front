export interface SsomaDocumentTypeUpsertDto {
  ssomaDocumentTypeId?: number;
  businessId?: number;
  ssomaDocumentTypeDesc?: string;
  usersBy?: number; 
}

export interface SsomaDocumentTypeResponseDto {
  ssomaDocumentTypeId: number;
  businessId: number;
  ssomaDocumentTypeDesc: string;
  status: string;
}

export interface SsomaDocumentTypeByIdDto {
  ssomaDocumentTypeId?: number;
  businessId?: number;
  ssomaDocumentTypeDesc?: string;
}

export interface SsomaDocumentTypeStatusDto {
  ssomaDocumentTypeId?: number;
  businessId?: number;
  status: string;
  usersBy?: number; 
}