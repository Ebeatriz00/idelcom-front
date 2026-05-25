import type { OpportunitiesResponseDto } from "@/application";
import { fetchOpportunitiesList } from "@/infrastructure";
import { pickItems } from "@/sharedKernel";
import type { Paged } from "@/sharedKernel/utils/export/types";
import { usePagedExport } from "@/sharedKernel/utils/export/usePagedExport";
import { useAuth } from "@/stores/auth";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCrmOpporPerms } from "../../hooks/oppor.perms";

export type ReminderState = "ACTIVE" | "SUSPENDED" | "EXPIRED" | "NONE";

type Params = {
  search: string;
  usersBy?: number;
  stateId?: number;
  filterStartDate?: string;
  filterFinishDate?: string;
  filterYear?: number;
  workerId?: number;
};

export function getReminderState(
  enabled: boolean,
  suspended: boolean,
  date: Date | null,
): ReminderState {
  if (!enabled) return "NONE";
  if (suspended) return "SUSPENDED";
  if (date && date.getTime() < Date.now()) return "EXPIRED";
  return "ACTIVE";
}

export function useOpporRowSelection() {
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [selectedOpporId, setSelectedOpporId] = useState<string>("");

  const selectRow = useCallback((id: string) => {
    setActiveRowId(id);
    setSelectedOpporId(id);
  }, []);

  return {
    activeRowId,
    selectedOpporId,
    selectRow,
    clear: () => setActiveRowId(null),
  };
}

export const toastWarn = (msg: string) =>
  toast.warning(msg, { position: "bottom-right" });

export function useOpporExportAll(
  search?: string,
  stateId?: number,
  filterStartDate?: string,
  filterFinishDate?: string,
  filterYear?: number,
  workerId?: number,
) {
  const { canViewAllOppor, isLoadingPerms } = useCrmOpporPerms();

  const myWorkerIdStr = useAuth((s) => s.workerId);
  const myWorkerId = myWorkerIdStr != null ? Number(myWorkerIdStr) : undefined;

  const effectiveWorkerId = canViewAllOppor ? workerId : myWorkerId;

  const usersBy = effectiveWorkerId;

  const canFetch = !isLoadingPerms && (canViewAllOppor || !!myWorkerId);

  const params = useMemo<Params>(
    () => ({
      search: (search ?? "").trim(),
      usersBy,
      stateId,
      filterStartDate,
      filterFinishDate,
      filterYear,
      workerId: effectiveWorkerId,
    }),
    [
      search,
      usersBy,
      stateId,
      filterStartDate,
      filterFinishDate,
      filterYear,
      effectiveWorkerId,
    ],
  );

  const { getAllForExport, getForPdfLimit } = usePagedExport<
    OpportunitiesResponseDto,
    Params
  >({
    canFetch,
    params,
    exportPageSize: 1000,
    fetchPage: async ({ page, pageSize, params }) => {
      const r = (await fetchOpportunitiesList(
        page,
        pageSize,
        params.search,
        params.usersBy,
        params.stateId,
        params.filterStartDate ? new Date(params.filterStartDate) : undefined,
        params.filterFinishDate ? new Date(params.filterFinishDate) : undefined,
        params.filterYear,
      )) as Paged<OpportunitiesResponseDto>;

      return {
        items: pickItems(r),
        total: r.total ?? 0,
        pageCount: r.pageCount ?? 0,
      };
    },
  });

  return {
    canFetch,
    isLoadingPerms,
    getAllOpporForExport: getAllForExport,
    getForPdfLimit,
  };
}
