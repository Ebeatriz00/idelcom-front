import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";

export async function fetchActivityComplexitySelect(
  page: number,
  pageSize: number,
  search?: string
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<PagedSelect<OptionItem>>(
    "/ActivityComplexity/GetSelect",
    {
      params: { page, pageSize, search },
    }
  );
  return data;
}
