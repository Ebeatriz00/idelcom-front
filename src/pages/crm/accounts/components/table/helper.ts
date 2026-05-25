import type { ClientsResponseDto } from "@/application";
import { fetchClientsList } from "@/infrastructure";
import { pickItems } from "@/sharedKernel";
import type { Paged } from "@/sharedKernel/utils/export/types";
import { usePagedExport } from "@/sharedKernel/utils/export/usePagedExport";
import { useAuth } from "@/stores/auth";
import { useMemo } from "react";
import { useCrmAccountsPerms } from "../../hooks/permissions/accounts.perms";

type Params = {
  search: string;
  usersBy?: number
};

export function useClientsExportAll(search?: string) {
  const { canViewAllAccount, isLoadingPerms } = useCrmAccountsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy = canViewAllAccount ? undefined : workerId;
  const canFetch = !isLoadingPerms && (canViewAllAccount || !!workerId);

  const params = useMemo<Params>(
    () => ({ search: (search ?? "").trim(), usersBy }),
    [search, usersBy],
  );

  const { getAllForExport, getForPdfLimit } = usePagedExport<
    ClientsResponseDto,
    Params
  >({
    canFetch,
    params,
    exportPageSize: 1000,
    fetchPage: async ({ page, pageSize, params }) => {
      const r = (await fetchClientsList(
        page,
        pageSize,
        params.search,
        params.usersBy
      )) as Paged<ClientsResponseDto>;

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
