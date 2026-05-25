import type { OptionItem, PagedSelect } from "@/application";
import http from "@/infrastructure";

type ApiEnvelope<T> = { data: T };

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  return (payload as any)?.data ?? (payload as T);
}

export async function fetchDepartmentSelect(
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Localtion/DepartmentSelect", {
    params: { page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchProvinceSelect(
  departmentId: number,
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Localtion/ProvinceSelect", {
    params: { departmentId: departmentId, page, pageSize, search },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}

export async function fetchDistrictSelect(
  departmentId: number,
  provinceId: number,
  page: number,
  search: string,
  pageSize: number
): Promise<PagedSelect<OptionItem>> {
  const { data } = await http.get<
    ApiEnvelope<PagedSelect<OptionItem>> | PagedSelect<OptionItem>
  >("/Localtion/DistrictSelect", {
    params: {
      departmentId: departmentId,
      provinceId: provinceId,
      page,
      pageSize,
      search,
    },
  });

  return unwrap<PagedSelect<OptionItem>>(data);
}
