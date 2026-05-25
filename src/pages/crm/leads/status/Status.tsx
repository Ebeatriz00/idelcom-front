import type { LeadsStatusResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useLeadsStatusList,
  useLeadsStatusMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { StatusFormModal } from "./components/modal/StatusFormModal";
import { StatusTable } from "./components/table/StatusTable";
import { useCrmStatusPerms } from "./hooks/status.perms";
import { useLeadsStatusFormModal } from "./hooks/useStatusModal";

export default function Status() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useLeadsStatusList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const {
    open,
    isFetching,
    defaultValues,
    openCreate,
    openEdit,
    close,
    submit,
    saving,
    editingId,
  } = useLeadsStatusFormModal();

  const {
    canCreateStatus,
    canEdit,
    canEditStatus,
    canDeleteStatus,
    canExportStatus,
  } = useCrmStatusPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useLeadsStatusMutations();

  const rows: LeadsStatusResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: LeadsStatusResponseDto) {
    if (!canEdit) return;
    if (row.leadsStatusId) openEdit(row.leadsStatusId);
  }

  async function onToggleStatus(row: LeadsStatusResponseDto) {
    if (!canEditStatus) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      leadsStatusId: row.leadsStatusId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: LeadsStatusResponseDto) {
    if (!canDeleteStatus) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Leads", href: "#" },
            { label: "Estado", current: true },
          ]}
          createLabel="Nuevo estado"
          onCreate={canCreateStatus ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay estados registrados."
        >
          <StatusTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canEditStatus={canEditStatus}
            canEdit={canEdit}
            canExportStatus={canExportStatus}
          />{" "}
        </AsyncState>
      </section>

      <StatusFormModal
        open={open}
        title={editingId ? "Editar Estado" : "Nueva Estado"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
