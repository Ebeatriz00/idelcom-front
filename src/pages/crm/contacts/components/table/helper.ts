import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import { fetchContactsList } from "@/infrastructure/api-clients/crm/contacts/contacts.client";
import { pickItems, type Paged } from "@/sharedKernel";
import { usePagedExport } from "@/sharedKernel/utils/export/usePagedExport";
import { useAuth } from "@/stores/auth";
import { useMemo } from "react";
import { useCrmContactsPerms } from "../../hooks/permissions/contacts.perms";

type Params = {
  search: string;
};
export function useContactsExportAll(search?: string) {
  const { canViewAllContacts, isLoadingPerms } = useCrmContactsPerms();
  const workerIdStr = useAuth((s) => s.workerId);
  const workerId = workerIdStr != null ? Number(workerIdStr) : undefined;

  const usersBy = canViewAllContacts ? undefined : workerId;
  const canFetch = !isLoadingPerms && (canViewAllContacts || !!workerId);

  const params = useMemo<Params>(
    () => ({ search: (search ?? "").trim(), usersBy }),
    [search, usersBy],
  );

  const { getAllForExport, getForPdfLimit } = usePagedExport<
    ContactsResponseDto,
    Params
  >({
    canFetch,
    params,
    exportPageSize: 1000,
    fetchPage: async ({ page, pageSize, params }) => {
      const r = (await fetchContactsList(
        page,
        pageSize,
        params.search,
      )) as Paged<ContactsResponseDto>;

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
