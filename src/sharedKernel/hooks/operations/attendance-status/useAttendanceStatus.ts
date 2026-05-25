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
    staleTime: 5 * 60_000,
  });
}

export function useAttendanceStatusById(attendanceStatusId?: number) {
  return useQuery({
    queryKey: qkAttendanceStatus.detail(attendanceStatusId ?? 0),
    queryFn: () => fetchAttendanceStatusById(attendanceStatusId!),
    enabled: !!attendanceStatusId,
    staleTime: 5 * 60_000,
  });
}
