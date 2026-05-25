export interface ExchangeRateResponseDto {
  exchangeRateId: number;
  businessId: number;
  purchaseType: number;
  saleType: number;
  dateFxrate: string; 
  status: string;
  exchangeRateCount: number;
}