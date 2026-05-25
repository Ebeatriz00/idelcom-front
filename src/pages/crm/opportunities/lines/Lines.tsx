import type { BusinessLineResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useBusinessLineList,
  useBusinessLineMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { LinesFormModal } from "./components/modal/LinesFormModal";
import { LinesTable } from "./components/table/LinesTable";
import { useCrmBLinesPerms } from "./hooks/bLines.perms";
import { useBusinessLineFormModal } from "./hooks/useBusinessLineModal";

export default function Lines() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useBusinessLineList(
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
  } = useBusinessLineFormModal();

  const {
    canCreateBLines,
    canEditBLines,
    canEditStatus,
    canDeleteBLines,
    canExportBLines,
  } = useCrmBLinesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useBusinessLineMutations();

  const rows: BusinessLineResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: BusinessLineResponseDto) {
    if (!canEditBLines) return;
    if (row.businessLineId) openEdit(row.businessLineId);
  }

  async function onToggleStatus(row: BusinessLineResponseDto) {
    if (!canEditStatus) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      businessLineId: row.businessLineId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: BusinessLineResponseDto) {
    if (!canDeleteBLines) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Oportunidades", href: "#" },
            { label: "Lineas de negocio", current: true },
          ]}
          createLabel="Nueva Línea de negocio"
          onCreate={canCreateBLines ? openCreate : undefined}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay líneas de negocio registradas."
        >
          <LinesTable
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
            canExportBLines={canExportBLines}
            canEditBLines={canEditBLines}
            canEditStatus={canEditStatus}
          />
        </AsyncState>
      </section>

      <LinesFormModal
        open={open}
        title={
          editingId ? "Editar Lineas de negocios" : "Nueva Lineas de negocios"
        }
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
