export interface UomUpsertDto {
  uomId?: number;       
  businessId?: number;  
  codeSunat: string;
  symbol: string;
  description: string;
  usersBy?: string;    
}

export interface UomStatusDto {
  uomId?: number;
  businessId?: number;
  status?: string;    
  usersBy?: string;
}