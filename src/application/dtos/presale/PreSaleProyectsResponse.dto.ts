export interface PreSaleProyectsResponseDto {
  linkToken: string;
  businessId?: number;
  proyectNum: string;
  description: string;
  clientsId?: number;
  clientsDescription: string;
  contactsCrmId?: number;
  contactsCrmDescription: string;
  responsibleId?: number;
  responsibleDescription: string;
  supervisorId?: number;
  supervisorDescription: string;
  ssomaId?: number;
  ssomaDescription: string;
  tecLeaderId?: number;
  tecLeaderDescription: string;
  opportunityId?: number;
  opportunityDescription: string;
  statePreSaleId?: number;
  statePreSaleDescription: string;
  quotationNumberId?: number;
  quotationNumberDescription: string;
  orderNumberId?: number;
  orderNumberDescription: string;
  stateColor: string;
  orderDate?: Date;
  startDate: Date;
  endDate: Date;
  status: string;
  numPercPro?: number;
  preSaleProyectsCount: number;
  projectToken: string;
  workerId?: number;
  contractTotalCount?: number;
  sellerDescription?: string;

  opportunityStateDesc?: string;
  opportunityStateColor?: string;
  finishDate?: string | Date;
  quoDate?: string | Date;

  opportunityNumber: string;
  stateGeneralDesc: string;
  stateGeneralColor: string;

  currencyDesc?: string;
  totalAmount?: number;
  subTotal?: number;
  costTotal?: number;
}
