import { useQuery } from "@tanstack/react-query";
import { fetchAttendanceMatrix } from "@/infrastructure";
import { qkAttendance } from "./attendance.qk";

export function useAttendanceMatrix(params: {
  startDate?: string;
  endDate?: string;
  opporId?: number;
  workOrderId?: number;
  squadId?: number;
  search?: string;
  statusId?: number;
  page: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: qkAttendance.matrix(params),
    queryFn: () => fetchAttendanceMatrix(params),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}
