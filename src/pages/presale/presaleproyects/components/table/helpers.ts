import type { PreSaleProyectsResponseDto } from "@/application/dtos/presale/PreSaleProyectsResponse.dto";
import { fetchPreSaleProyectsList } from "@/infrastructure/api-clients/presale/preSaleProyects.client";
import type { PreSaleProjectColumnFilters } from "@/infrastructure/api-clients/presale/preSaleProyects.client";
import { pickItems } from "@/sharedKernel";
import { usePagedExport } from "@/sharedKernel/utils/export/usePagedExport";
import { useAuth } from "@/stores/auth";
import { useMemo } from "react";
import { usePreSaleProyectsPerms } from "../../hooks/project.perms";

export function getPreSaleCalendarDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function formatPreSaleDate(value?: string | Date | null): string {
  const date = getPreSaleCalendarDate(value);
  if (!date) return "";

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type Params = {
  search: string;
  usersBy?: number;
  filters?: PreSaleProjectColumnFilters;
  sortBy?: string;
  sortDirection?: string;
  opporNum?: string;
  stateId?: number;
};

export function usePreSaleProyectsExportAll(
  search?: string,
  filters?: PreSaleProjectColumnFilters,
  sortBy?: string,
  sortDirection?: string,
  opporNum?: string,
  stateId?: number,
  categoryId?: number
) {
  const { canViewAllPreSaleProyects, isLoadingPerms } = usePreSaleProyectsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy = canViewAllPreSaleProyects ? undefined : workerId;
  const canFetch = !isLoadingPerms && (canViewAllPreSaleProyects || !!workerId);


  const params = useMemo<Params>(
    () => ({
      search: (search ?? "").trim(),
      usersBy,
      filters,
      sortBy,
      sortDirection,
      opporNum,
      stateId, 
      categoryId
    }),
    [search, usersBy, filters, sortBy, sortDirection, opporNum, stateId, categoryId]
  );

  const { getAllForExport, getForPdfLimit } = usePagedExport<
    PreSaleProyectsResponseDto,
    Params
  >({
    canFetch,
    params,
    exportPageSize: 1000,
    fetchPage: async ({ page, pageSize, params }) => {
      const r = await fetchPreSaleProyectsList(
        page,
        pageSize,
        params.search,
        params.usersBy,
        params.filters,
        undefined, 
        params.sortBy,
        params.sortDirection,
        params.opporNum,
        params.stateId
      );

      return {
        items: pickItems(r),
        total: r.total ?? 0,
        pageCount: r.totalPages ?? 0, 
      };
    },
  });

  return {
    canFetch,
    isLoadingPerms,
    getAllPreSaleProyectsForExport: getAllForExport,
    getForPdfLimit,
  };
}
