import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";

export async function fetchMeasurementUnitSelect(
  page: number,
  pageSize: number,
  search?: string
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<PagedSelect<OptionItem>>(
    "/MeasurementUnit/GetSelect",
    {
      params: { page, pageSize, search },
    }
  );
  return data;
}
