export interface DocumentTypeResponseDto {
  documentTypeId: number;
  businessId: number;
  codeSunat: string;
  description: string;
  abrv?: string; 
  status: string;
  documentTypeCount: number;
}
