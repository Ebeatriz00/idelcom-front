import type {
  Paginated,
  AttendanceStatusResponseDto,
  AttendanceStatusSelectItemDto,
} from "@/application";
import http from "@/infrastructure";


export async function fetchAttendanceStatusSelect(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<AttendanceStatusSelectItemDto>> {
  const { data } = await http.get<Paginated<AttendanceStatusSelectItemDto>>(
    "/AttendanceStatus/GetSelect",
    {
      params: { page, pageSize, search },
    }
  );
  return data;
}


export async function fetchAttendanceStatusById(
  attendanceStatusId: number
): Promise<AttendanceStatusResponseDto> {
  const { data } = await http.get<AttendanceStatusResponseDto>(
    "/AttendanceStatus/GetById",
    {
      params: { attendanceStatusId },
    }
  );
  return data;
}
