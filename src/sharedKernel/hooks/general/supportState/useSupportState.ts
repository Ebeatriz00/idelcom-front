import { fetchSupportStateById, fetchSupportStateSelect } from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";
import { qkSupportState } from "./supportState.qk";
import type { PagedSelect, SupportStateSelectDto } from "@/application";

export function useSupportStateSelect(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  opts?: { enabled?: boolean },
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<SupportStateSelectDto>>({
    queryKey: qkSupportState.select(page, pageSize, s),
    queryFn: () => fetchSupportStateSelect(page, pageSize, s),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useSupportStateById(id?: number) {
  return useQuery({
    queryKey: qkSupportState.detail(id ?? 0),
    queryFn: () => fetchSupportStateById(id ?? 0),
    enabled: !!id,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useSupportStateOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 20,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: qkSupportState.select(page, pageSize, search),
    queryFn: async () => {
      const data = await fetchSupportStateSelect(page, pageSize, search);
      return {
        ...data,
        items: data.items.map((item) => ({
          value: item.supportStateId,
          label: item.statusDesc,
          extraInfo: item.statusColor,
        })),
      };
    },
    enabled: opts?.enabled ?? true,
    placeholderData: (prev) => prev,
  });
}
