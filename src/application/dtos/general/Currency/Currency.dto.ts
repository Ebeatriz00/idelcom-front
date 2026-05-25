export interface CurrencyUpsertDto {
  currencyId?: number;
  businessId?: number;
  code: string;             
  codeSunat: string;        
  description: string;      
  symbol: string;        
  usersBy?: string;
}

export interface CurrencyStatusDto {
  currencyId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}