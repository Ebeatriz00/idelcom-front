import type { OptionItem, PagedSelect } from "@/application";
import type { UseOptionsHook } from "@/layouts";
import {
  useDepartmentOptions,
  useDistrictOptions,
  useProvinceOptions,
} from "@/sharedKernel";

// Departamento
export function useOptionsDepartment(): UseOptionsHook {
  return (page, search, pageSize, opts) => {
    const q = useDepartmentOptions(page, search, pageSize, {
      enabled: opts?.enabled ?? true,
    });

    // normaliza la data para que SIEMPRE tenga pageSize
    const raw = q.data as
      | (PagedSelect<OptionItem> & Partial<{ pageSize: number }>)
      | undefined;
    const data = raw
      ? { ...raw, pageSize: raw.pageSize ?? pageSize }
      : undefined;

    return {
      data,
      isLoading: q.isLoading,
      isFetching: q.isFetching,
      refetch: q.refetch,
    };
  };
}

// Provincia (depende de departmentId)
export function makeUseOptionsProvince(
  departmentId: number | null
): UseOptionsHook {
  return (page, search, pageSize, opts) => {
    const enabled =
      (opts?.enabled ?? true) && !!departmentId && departmentId > 0;
    const q = useProvinceOptions(departmentId ?? 0, page, search, pageSize, {
      enabled,
    });

    const raw = q.data as
      | (PagedSelect<OptionItem> & Partial<{ pageSize: number }>)
      | undefined;
    const data = raw
      ? { ...raw, pageSize: raw.pageSize ?? pageSize }
      : undefined;

    return {
      data,
      isLoading: q.isLoading,
      isFetching: q.isFetching,
      refetch: q.refetch,
    };
  };
}

// Distrito (depende de departmentId + provinceId)
export function makeUseOptionsDistrict(
  departmentId: number | null,
  provinceId: number | null
): UseOptionsHook {
  return (page, search, pageSize, opts) => {
    const enabled =
      (opts?.enabled ?? true) &&
      !!departmentId &&
      departmentId > 0 &&
      !!provinceId &&
      provinceId > 0;
    const q = useDistrictOptions(
      departmentId ?? 0,
      provinceId ?? 0,
      page,
      search,
      pageSize,
      { enabled }
    );

    const raw = q.data as
      | (PagedSelect<OptionItem> & Partial<{ pageSize: number }>)
      | undefined;
    const data = raw
      ? { ...raw, pageSize: raw.pageSize ?? pageSize }
      : undefined;

    return {
      data,
      isLoading: q.isLoading,
      isFetching: q.isFetching,
      refetch: q.refetch,
    };
  };
}
