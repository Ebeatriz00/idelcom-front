export interface ExchangeRateUpsertDto {
  exchangeRateId?: number;
  businessId?: number;
  purchaseType: number;
  saleType: number;
  dateFxrate: string; 
  usersBy?: string;
}

export interface ExchangeRateStatusDto {
  exchangeRateId?: number;
  businessId?: number;
  status?: string; 
  usersBy?: string;
}