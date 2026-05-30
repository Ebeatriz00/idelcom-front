import {
  fetchWorkDayStatusById,
  fetchWorkDayStatusSelect,
} from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";
import { qkWorkDayStatus } from "./workdaystatus.qk";

export function useWorkDayStatusSelect(
  page: number,
  pageSize: number,
  search: string = ""
) {
  return useQuery({
    queryKey: qkWorkDayStatus.select(page, pageSize, search),
    queryFn: () => fetchWorkDayStatusSelect(page, pageSize, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useWorkDayStatusById(workdayStatusId?: number) {
  return useQuery({
    queryKey: qkWorkDayStatus.detail(workdayStatusId ?? 0),
    queryFn: () => fetchWorkDayStatusById(workdayStatusId!),
    enabled: !!workdayStatusId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}
