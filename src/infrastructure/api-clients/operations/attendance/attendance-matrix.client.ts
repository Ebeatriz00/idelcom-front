import type { AttendanceMatrixResponseDto } from "@/application";
import http from "@/infrastructure";


export async function fetchAttendanceMatrix(params: {
  startDate?: string;
  endDate?: string;
  opporId?: number;
  workOrderId?: number;
  squadId?: number;
  search?: string;
  statusId?: number;
  page: number;
  pageSize: number;
}): Promise<AttendanceMatrixResponseDto> {
  const { data } = await http.get<AttendanceMatrixResponseDto>(
    "/OperationsAttendance/GetAllMatrix",
    {
      params,
    }
  );
  return data;
}
