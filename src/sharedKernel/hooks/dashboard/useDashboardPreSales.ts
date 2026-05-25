import { fetchDashboardPreSalesByCategory, fetchDashboardPreSalesByEngineer, fetchDashboardPreSalesByEngineerDetails, fetchDashboardPreSalesCollaborator, fetchDashboardPreSalesCollaboratorDetails, fetchDashboardPreSalesCombined, fetchDashboardPreSalesIntegrator, fetchDashboardPreSalesIntegratorDetails, fetchDashboardPreSalesMatriz, fetchDashboardPreSalesStates, fetchDashboardQuotationTotal } from "@/infrastructure/api-clients/dashboard/dashboardPreSales.client";
import { UseDashCommercial } from "@/pages/Dashboard/hooks/commercial.perms";
import { useAuth } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";


export const qkDashboardPreSales = {
  all: ["dashboard"] as const,
metricsQuotationTotal: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboardPreSales.all, "metrics-quotation-total", usersId, quarter, usersKey, year] as const,

metricsPreSalesStates: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-states", usersId, quarter, usersKey, year] as const,

metricsPreSalesCombined: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-combined", usersId, quarter, usersKey, year] as const,

metricsPreSalesByEngineer: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-engineer", usersId, quarter, usersKey, year, stateId] as const,

metricsPreSalesMatriz: (usersId?: number, quarter?: number, usersKey?: string, year?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-matriz", usersId, quarter, usersKey, year] as const,

metricsPreSalesCollaborator: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-collaborator", usersId, quarter, usersKey, year, stateId] as const,

metricsPreSalesIntegrator: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) => 
    [...qkDashboardPreSales.all, "metrics-presales-integrator", usersId, quarter, usersKey, year, stateId] as const,

metricsPreSalesByEngineerDetails: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) =>
    [...qkDashboardPreSales.all, "metrics-presales-engineer-details", usersId, quarter, usersKey, year, stateId] as const,

metricsPreSalesIntegratorDetails: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) =>
    [...qkDashboardPreSales.all, "metrics-presales-integrator-details", usersId, quarter, usersKey, year, stateId] as const,

metricsPreSalesCollaboratorDetails: (usersId?: number, quarter?: number, usersKey?: string, year?: number, stateId?: number) =>
    [...qkDashboardPreSales.all, "metrics-presales-collaborator-details", usersId, quarter, usersKey, year, stateId] as const,
metricsPreSalesByCategory: (usersId?: number, quarter?: number, usersKey?: string, year?: number) =>
    [...qkDashboardPreSales.all, "metrics-presales-by-category", usersId, quarter, usersKey, year] as const,
};

export function useDashboardMetricsQuotationTotal(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboardPreSale
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsQuotationTotal(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardQuotationTotal(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}


export function useDashboardMetricsPreSalesStates(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboardPreSale
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesStates(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardPreSalesStates(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}

export function useDashboardMetricsPreSalesCombined(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersBy: number | undefined = canViewDashboardPreSale 
    ? undefined
    : userId ?? undefined;
    
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesCombined(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardPreSalesCombined(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}


export function useDashboardMetricsPreSalesByEngineer(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesByEngineer(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesByEngineer(usersId, quarter, year, stateId), 
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}


export function useDashboardMetricsPreSalesMatriz(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined; 

  const usersBy: number | undefined = canViewDashboardPreSale
    ? undefined
    : userId ?? undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesMatriz(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardPreSalesMatriz(usersId, quarter, usersBy, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}


export function useDashboardMetricsPreSalesCollaborator(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesCollaborator(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesCollaborator(usersId, quarter, year, stateId),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  }); 
}


export function useDashboardMetricsPreSalesIntegrator(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);   
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";
  
  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesIntegrator(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesIntegrator(usersId, quarter, year, stateId),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  }); 
}


export function useDashboardMetricsPreSalesByEngineerDetails(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesByEngineerDetails(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesByEngineerDetails(usersId, quarter, year, stateId),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}

export function useDashboardMetricsPreSalesIntegratorDetails(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesIntegratorDetails(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesIntegratorDetails(usersId, quarter, year, stateId),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}

export function useDashboardMetricsPreSalesCollaboratorDetails(
  usersId?: number, 
  quarter?: number,
  year?: number,
  stateId?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesCollaboratorDetails(usersId, quarter, usersKeyPart, year, stateId),
    queryFn: () => fetchDashboardPreSalesCollaboratorDetails(usersId, quarter, year, stateId),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}
  
export function useDashboardMetricsPreSalesCategory(
  usersId?: number, 
  quarter?: number,
  year?: number
) {
  const { canViewDashboardPreSale, isLoadingPerms } = UseDashCommercial();
  const userIdStr = useAuth((s) => s.workerId);
  const userId = userIdStr != null ? Number(userIdStr) : undefined;
  const usersKeyPart: string = canViewDashboardPreSale ? "all" : userIdStr ?? "all";

  const enabled = !isLoadingPerms && (canViewDashboardPreSale || !!userId);

  return useQuery({
    queryKey: qkDashboardPreSales.metricsPreSalesByCategory(usersId, quarter, usersKeyPart, year),
    queryFn: () => fetchDashboardPreSalesByCategory(usersId, quarter, year),
    staleTime: 60_000,
    placeholderData: [], 
    enabled,
  });
}