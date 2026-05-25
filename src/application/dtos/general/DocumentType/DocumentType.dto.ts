export interface DocumentTypeUpsertDto {
  documentTypeId?: number;
  businessId?: number;
  codeSunat: string;
  description: string;
  usersBy?: string; 
}
export interface DocumentTypeStatusDto{
  documentTypeId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}