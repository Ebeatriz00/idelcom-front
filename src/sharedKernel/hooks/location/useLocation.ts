import type { OptionItem, PagedSelect } from "@/application";
import {
  fetchDepartmentSelect,
  fetchDistrictSelect,
  fetchProvinceSelect,
} from "@/infrastructure";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const qkLocation = {
  all: ["location"] as const,

  selectsDepartment: () => [...qkLocation.all, "select-department"] as const,
  selectDepartment: (page: number, search: string, pageSize: number) =>
    [...qkLocation.selectsDepartment(), page, search ?? "", pageSize] as const,

  selectsProvince: () => [...qkLocation.all, "select-province"] as const,
  selectProvince: (
    departmentId: number,
    page: number,
    search: string,
    pageSize: number
  ) =>
    [
      ...qkLocation.selectsProvince(),
      departmentId,
      page,
      search ?? "",
      pageSize,
    ] as const,

  selectsDistrict: () => [...qkLocation.all, "select-district"] as const,
  selectDistrict: (
    departmentId: number,
    provinceId: number,
    page: number,
    search: string,
    pageSize: number
  ) =>
    [
      ...qkLocation.selectsDistrict(),
      departmentId,
      provinceId,
      page,
      search ?? "",
      pageSize,
    ] as const,
};


function normalizeSearch(s: string) {
  return (s ?? "")
    .trim()
    .replace(/\s+/g, " ");
}
function clampPage(p: number) {
  return Number.isFinite(p) && p > 0 ? Math.floor(p) : 1;
}
function clampPageSize(ps: number) {
  const n = Number.isFinite(ps) ? Math.floor(ps) : 10;
  return Math.min(Math.max(n, 5), 100);
}
const DEFAULT_STALE = 60_000; 
const DEFAULT_GC = 5 * 60_000;

export function useDepartmentOptions(
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const p = clampPage(page);
  const ps = clampPageSize(pageSize);
  const s = normalizeSearch(search);

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLocation.selectDepartment(p, s, ps),
    queryFn: () => fetchDepartmentSelect(p, s, ps),
    placeholderData: keepPreviousData,
    enabled: opts?.enabled ?? true,
    staleTime: DEFAULT_STALE,
    gcTime: DEFAULT_GC,
    retry: (count, error: any) => {
      const status = error?.response?.status ?? error?.status;
      if (status && status >= 400 && status < 500) return false;
      return count < 2;
    },
    meta: { feature: "location-selects", entity: "department" },
  });
}

export function useProvinceOptions(
  departmentId: number,
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const enabledDeps = Number.isFinite(departmentId) && departmentId > 0;
  const p = clampPage(page);
  const ps = clampPageSize(pageSize);
  const s = normalizeSearch(search);

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLocation.selectProvince(departmentId, p, s, ps),
    queryFn: () => fetchProvinceSelect(departmentId, p, s, ps),
    placeholderData: keepPreviousData,
    enabled: (opts?.enabled ?? true) && enabledDeps,
    staleTime: DEFAULT_STALE,
    gcTime: DEFAULT_GC,
    retry: (count, error: any) => {
      const status = error?.response?.status ?? error?.status;
      if (status && status >= 400 && status < 500) return false;
      return count < 2;
    },
    meta: { feature: "location-selects", entity: "province" },
  });
}

export function useDistrictOptions(
  departmentId: number,
  provinceId: number,
  page: number = 1,
  search: string = "",
  pageSize: number = 10,
  opts?: { enabled?: boolean }
) {
  const depsReady =
    Number.isFinite(departmentId) &&
    departmentId > 0 &&
    Number.isFinite(provinceId) &&
    provinceId > 0;

  const p = clampPage(page);
  const ps = clampPageSize(pageSize);
  const s = normalizeSearch(search);

  return useQuery<PagedSelect<OptionItem>>({
    queryKey: qkLocation.selectDistrict(departmentId, provinceId, p, s, ps),
    queryFn: () => fetchDistrictSelect(departmentId, provinceId, p, s, ps),
    placeholderData: keepPreviousData,
    enabled: (opts?.enabled ?? true) && depsReady,
    staleTime: DEFAULT_STALE,
    gcTime: DEFAULT_GC,
    retry: (count, error: any) => {
      const status = error?.response?.status ?? error?.status;
      if (status && status >= 400 && status < 500) return false;
      return count < 2;
    },
    meta: { feature: "location-selects", entity: "district" },
  });
}
