import type { 
ClientMetric, 
CombinedMetric, 
CommercialClientMetric, 
CommercialClosingMetric, 
CommercialEvolutionMetric, 
CommercialQuotationMetric, 
ProbabilityMetric, 
QuarterMetric, 
StateOpportunityMetric } 
from "@/application/dtos/dashboard/stateOpportunity.dto";
import http from "@/infrastructure/http/httpClient";
type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchDashboardMetricsState(
  usersId?: number, 
  quarter?: number,
  usersBy?: number,
  year?: number 
): Promise<StateOpportunityMetric[]> {
  const params = { usersId, quarter, usersBy, year };
  
  const { data } = await http.get<
    ApiEnvelope<StateOpportunityMetric[]> | StateOpportunityMetric[]
  >(
    "/DashboardCommercial/metricState",
    { params }               
  );

  return unwrap<StateOpportunityMetric[]>(data);
}

export async function fetchDashboardMetricsClients(
  usersId?: number, 
  quarter?: number,
  usersBy?: number,
  year? : number
): Promise<ClientMetric[]> {
  const params = { usersId, quarter, usersBy, year };
  
  const { data } = await http.get<ApiEnvelope<ClientMetric[]
  >>("/DashboardCommercial/metrics-clients", 
  { 
    params 
  });

  return unwrap(data);
}

export async function fetchDashboardMetricsQuarter(
  usersId?: number, 
  quarter?: number,
  usersBy?: number, 
  year? : number
): Promise<QuarterMetric[]> {
  const params = { usersId, quarter, usersBy, year };
  const { data } = await http.get<ApiEnvelope<QuarterMetric[]
  >>("/DashboardCommercial/metrics-quarter", 
  { 
    params
  });
  return unwrap(data);
}

export async function fetchDashboardMetricsCombined(
  usersId?: number, 
  quarter?: number,
  usersBy?: number,
  year? : number
): Promise<CombinedMetric[]> {
  const params = { usersId, quarter, usersBy, year };
  const { data } = await http.get<ApiEnvelope<CombinedMetric[]
  >>("/DashboardCommercial/metrics-combined", 
  { 
    params 
  });
  return unwrap(data);
}

export async function fetchDashboardMetricsProbability(
  usersId?: number, 
  quarter?: number,
  usersBy?: number,
  probability?: number,
  year?: number
): Promise<ProbabilityMetric[]> {
  const params = { usersId, quarter, usersBy, probability, year };
  
  const { data } = await http.get<
    ApiEnvelope<ProbabilityMetric[]> | ProbabilityMetric[]
  >(
    "/DashboardCommercial/metrics-probability",
    { params }              
  );

  return unwrap<ProbabilityMetric[]>(data);
}

export async function fetchDashboardMetricsEvolution(
  usersId?: number, 
  year?: number,     
  quarter?: number,
  usersBy?: number
): Promise<CommercialEvolutionMetric[]> {
  const params = { usersId, year, quarter, usersBy };
  
  const { data } = await http.get<
    ApiEnvelope<CommercialEvolutionMetric[]> | CommercialEvolutionMetric[]
  >(
    "/DashboardCommercial/metrics-evolution",
    { params }              
  );

  return unwrap<CommercialEvolutionMetric[]>(data);
}
   
export async function fetchDashboardMetricsClosing(
  usersId?: number, 
  year?: number,   
  quarter?: number,
  usersBy?: number
): Promise<CommercialClosingMetric[]> {
  const params = { usersId, year, quarter, usersBy };
  
  const { data } = await http.get<
    ApiEnvelope<CommercialClosingMetric[]> | CommercialClosingMetric[]
  >(
    "/DashboardCommercial/metrics-closing",
    { params }              
  );

  return unwrap<CommercialClosingMetric[]>(data);
}

export async function fetchDashboardMetricsClientOpportunity(
  usersId?: number, 
  year?: number,   
  quarter?: number,
  usersBy?: number,
  clientId?: number 
): Promise<CommercialClientMetric[]> {
  const params = { usersId, year, quarter, usersBy, clientId };
  
  const { data } = await http.get<
    ApiEnvelope<CommercialClientMetric[]> | CommercialClientMetric[]
  >(
    "/DashboardCommercial/metrics-client-opportunity",
    { params }              
  );

  return unwrap<CommercialClientMetric[]>(data);
}

export async function fetchDashboardMetricsQuotation(
  usersId?: number,
  quarter?: number,
  usersBy?: number, 
  year?: number
): Promise<CommercialQuotationMetric[]> {
  const params = { usersId, quarter, usersBy, year };

  const { data } = await http.get<
    ApiEnvelope<CommercialQuotationMetric[]> | CommercialQuotationMetric[]
  >("/DashboardCommercial/metricsQuotation",
  { params });
  return unwrap<CommercialQuotationMetric[]>(data);
}

  