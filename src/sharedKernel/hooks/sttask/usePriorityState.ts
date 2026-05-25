import type { OptionItem, PagedSelect } from "@/application";
import type { PriorityStateSelectDto } from "@/application/dtos/sttask/prioritystate/PriorityState.dto";
import {
  fetchPrioritySelectSelectOp,
  fetchPriorityStateSelect,
} from "@/infrastructure/api-clients/sttask/priorityState.client";
import { useQuery } from "@tanstack/react-query";

export const qkPriorityState = {
  all: ["priorityState"] as const,

  selects: () => [...qkPriorityState.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkPriorityState.selects(), page, search ?? "", pageSize] as const,

  selectsOp: () => [...qkPriorityState.all, "select-option-priority"] as const,
  selectOp: () => [...qkPriorityState.selects()] as const,
};

export function usePriorityStateOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkPriorityState.select(page, s, pageSize),
    queryFn: () => fetchPriorityStateSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function usePriorityState() {
  return useQuery<PriorityStateSelectDto[]>({
    queryKey: qkPriorityState.selectOp(),
    queryFn: fetchPrioritySelectSelectOp,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
