export interface StateOpportunityMetric {
    stateOpportunityId: number;
    stateName: string;
    stateColor: string;
    quantity: number;
}

export interface ClientMetric {
    quantity: number;
}

export interface QuarterMetric{
    quarterNum: number;
    quantity: number;
}

export interface CombinedMetric{
  quarterNum: number;
  stateName: string;
  stateColor: string;
  quantity: number;

}
export interface ProbabilityMetric {
    stateOpportunityId: number;
    porcentProgressPro: number;
    totalAmount: number;
}

export interface CommercialEvolutionMetric {
    year: number;
    month: number;
    stateOpportunityId: number;
    totalAmount: number;
}

export interface CommercialClosingMetric {
    year: number;
    month: number;
    stateOpportunityId: number;
    totalAmount: number;
}

export interface CommercialClientMetric {
  clientId: number;
  clientName: string;
  stateOpportunityId: number;
  totalAmount: number;
  stateName: string;
  stateColor: string;
}

export interface CommercialQuotationMetric {
    totalQty: number;
    totalAmount: number;
    wonQty: number;
    wonAmount: number;
    conversionRate: number;
}