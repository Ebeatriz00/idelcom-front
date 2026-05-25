import { fetchConsultExchangeRate } from "@/infrastructure";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkExchangeApi = {
  all: ["exchange-rate.api-peru"] as const,
  byDate: (fecha: string) => [...qkExchangeApi.all, "by-date", fecha] as const,
};

export function useExchangeRate(fecha?: string, opts?: { enabled?: boolean }) {
  const f = (fecha ?? "").trim();
  const qc = useQueryClient();
  const key = f ? qkExchangeApi.byDate(f) : qkExchangeApi.all;

  const cached = qc.getQueryData<any>(key);
  const enabled = (opts?.enabled ?? true) && !!f;

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const hit = qc.getQueryData<any>(key);
      if (hit) return hit;                
      return fetchConsultExchangeRate(f);
    },
    initialData: () => cached,
    initialDataUpdatedAt: cached ? Date.now() : undefined,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60 * 24 * 365,
    gcTime:    1000 * 60 * 60 * 24 * 30,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
