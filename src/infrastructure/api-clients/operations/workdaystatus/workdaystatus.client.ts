import type {
  Paginated,
  WorkDayStatusResponseDto,
  WorkDayStatusSelectItemDto,
} from "@/application";
import http from "@/infrastructure";

export async function fetchWorkDayStatusSelect(
  page: number,
  pageSize: number,
  search?: string
): Promise<Paginated<WorkDayStatusSelectItemDto>> {
  const { data } = await http.get<Paginated<WorkDayStatusSelectItemDto>>(
    "/WorkDayStatus/GetSelect",
    {
      params: { page, pageSize, search },
    }
  );
  return data;
}

export async function fetchWorkDayStatusById(
  workdayStatusId: number
): Promise<WorkDayStatusResponseDto> {
  const { data } = await http.get<WorkDayStatusResponseDto>(
    "/WorkDayStatus/GetById",
    {
      params: { WorkdayStatusId: workdayStatusId },
    }
  );
  return data;
}
