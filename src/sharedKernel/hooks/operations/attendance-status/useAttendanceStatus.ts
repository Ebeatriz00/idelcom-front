import {
  fetchAttendanceStatusById,
  fetchAttendanceStatusSelect,
} from "@/infrastructure";
import { useQuery } from "@tanstack/react-query";
import { qkAttendanceStatus } from "./attendance-status.qk";

export function useAttendanceStatusSelect(
  page: number,
  pageSize: number,
  search: string = ""
) {
  return useQuery({
    queryKey: qkAttendanceStatus.select(page, pageSize, search),
    queryFn: () => fetchAttendanceStatusSelect(page, pageSize, search),
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}

export function useAttendanceStatusById(attendanceStatusId?: number) {
  return useQuery({
    queryKey: qkAttendanceStatus.detail(attendanceStatusId ?? 0),
    queryFn: () => fetchAttendanceStatusById(attendanceStatusId!),
    enabled: !!attendanceStatusId,
    placeholderData: undefined,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}
