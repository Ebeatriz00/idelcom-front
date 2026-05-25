import { 
  fetchDashboardMetricsClientOpportunity,
  fetchDashboardMetricsClients, 
  fetchDashboardMetricsClosing, 
  fetchDashboardMetricsCombined, 
  fetchDashboardMetricsEvolution, 
  fetchDashboardMetricsProbability, 
  fetchDashboardMetricsQuarter, 
  fetchDashboardMetricsQuotation, 
  fetchDashboardMetricsState 
} from "@/infrastructure/api-clients/dashboard/dashboardCommercial.client";
import { UseDashCommercial } from "@/pages/Dashboard/hooks/commercial.perms";
import { useAuth } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";

export const qkDashboard = {
  all: ["dashboard"] as const,
  metricsState: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboard.all, "metrics-state", usersId, quarter, usersKey, year] as const,

  metricsClients: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboard.all, "metrics-clients", usersId, quarter, usersKey, year] as const,

  metricsQuarter: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboard.all, "metrics-quarter", usersId, quarter, usersKey, year] as const,

  metricsCombined: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboard.all, "metrics-combined", usersId, quarter, usersKey, year] as const,

  metricsProbability: (usersId?: number, quarter?: number, usersKey?: string, probability?: number, year?: number) => 
    [...qkDashboard.all, "metrics-probability", usersId, quarter, usersKey, probability, year] as const,

  metricsEvolution: (usersId?: number, year?: number, quarter?: number, usersKey?: string) => 
    [...qkDashboard.all, "metrics-evolution", usersId, year, quarter, usersKey] as const,

  metricsClosing: (usersId?: number, year?: number, quarter?: number, usersKey?: string) => 
    [...qkDashboard.all, "metrics-closing", usersId, year, quarter, usersKey] as const,

  metricsClientOpportunity: (usersId?: number, year?: number, quarter?: number, usersKey?: string, clientId?: number) => 
    [...qkDashboard.all, "metrics-client-opportunity", usersId, year, quarter, usersKey, clientId] as const,

  metricsQuotation: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboard.all, "metrics-quotation", usersId, quarter, usersKey, year] as const,
};

export function useDashboardMetricsState( 
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsState(usersId, quarter, usersKeyPart, year), 
    queryFn: () => fetchDashboardMetricsState(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [],
    enabled,
  });
}

export function useDashboardMetricsClients(
  usersId?: number, 
  quarter?: number,
  year? : number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsClients(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardMetricsClients(usersId, quarter, usersBy, year),
    staleTime: 60_000, 
    enabled,
  });
}

export function useDashboardMetricsQuarter(
  usersId?: number, 
  quarter?: number, 
  year? : number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsQuarter(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardMetricsQuarter(usersId, quarter, usersBy, year),
    staleTime: 60_000, 
    enabled,
  });
}

export function useDashboardMetricsCombined(
  usersId?: number, 
  quarter?: number,
  year? : number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsCombined(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardMetricsCombined(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    enabled,
  });
}

export function useDashboardMetricsProbability(
  usersId?: number, 
  quarter?: number,
  probability?: number,
  year?: number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsProbability(usersId, quarter, usersKeyPart, probability, year),
    queryFn: () => fetchDashboardMetricsProbability(usersId, quarter, usersBy, probability, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}

export function useDashboardMetricsEvolution(
  usersId?: number, 
  quarter?: number,
  year?: number 
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsEvolution(usersId, year, quarter, usersKeyPart),
    queryFn: () => fetchDashboardMetricsEvolution(usersId, year, quarter, usersBy),
    
    staleTime: 60_000,
    placeholderData: [],
    enabled,
  });
}


export function useDashboardMetricsClosing(
  usersId?: number, 
  quarter?: number,
  year?: number 
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsClosing(usersId, year, quarter, usersKeyPart),
    queryFn: () => fetchDashboardMetricsClosing(usersId, year, quarter, usersBy),
    
    staleTime: 60_000,
    placeholderData: [],
    enabled,
  });
}

export function useDashboardMetricsClientOpportunity(
  usersId?: number, 
  quarter?: number,
  year?: number,
  clientId?: number 
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard ? undefined : userId ?? undefined;
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsClientOpportunity(usersId, year, quarter, usersKeyPart, clientId),
    queryFn: () => fetchDashboardMetricsClientOpportunity(usersId, year, quarter, usersBy, clientId),
    staleTime: 60_000,
    placeholderData: [],
    enabled,
  });
}

export function useDashboardMetricsQuotation(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboard, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboard
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewDashboard ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboard || !!userId);

  return useQuery({
    queryKey: qkDashboard.metricsQuotation(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardMetricsQuotation(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}