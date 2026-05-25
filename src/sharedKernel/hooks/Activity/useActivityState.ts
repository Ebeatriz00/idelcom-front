import type {
  ActivityStateSelectDto,
  OptionItem,
  PagedSelect,
} from "@/application";
import {
  fetchActivityStateSearchSelect,
  fetchActivityStateSelectSelectOp,
} from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";

export const qkActivityState = {
  all: ["activityState"] as const,

  selects: () => [...qkActivityState.all, "select"] as const,
  select: (page: number, search: string, pageSize: number) =>
    [...qkActivityState.selects(), page, search ?? "", pageSize] as const,

  selectsOp: () =>
    [...qkActivityState.all, "select-option-activity-state"] as const,
  selectOp: () => [...qkActivityState.selects()] as const,
};

export function useActivityStateOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const s = (search ?? "").trim();
  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkActivityState.select(page, s, pageSize),
    queryFn: () => fetchActivityStateSearchSelect(page, s, pageSize),
    placeholderData: (prev) => prev,
    enabled: opts?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useActivityState() {
  return useQuery<ActivityStateSelectDto[]>({
    queryKey: qkActivityState.selectOp(),
    queryFn: fetchActivityStateSelectSelectOp,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
