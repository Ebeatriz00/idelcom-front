import type { BoxesResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useBoxesList,
  useBoxesMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { BoxesTable } from "./components/table/BoxesTable";

import { BoxesFormModal } from "./components/BoxesFormModal";
import { useFinBoxesPerms } from "./hooks/boxes.perms";
import { useBoxesFormModal } from "./hooks/useBoxesFormModal";

export default function Boxes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useBoxesList(
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
    detail,
  } = useBoxesFormModal();

  const {
    canCreateBoxes,
    canEditBoxes,
    canEditStatusBoxes,
    canExportBoxes,
  } = useFinBoxesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useBoxesMutations();

  const rows: BoxesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: BoxesResponseDto) {
    if (!canEditBoxes) return;
    if (row.boxesId) openEdit(row.boxesId);
  }

  async function onToggleStatus(row: BoxesResponseDto) {
    if (!canEditStatusBoxes) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      boxesId: row.boxesId,
      status: boolToStatusString(!current),
    });
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error"}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Tesorería", href: "#" },
            { label: "Cajas", current: true },
          ]}
          createLabel="Nueva Caja"
          onCreate={canCreateBoxes ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <BoxesTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canExportBoxes={canExportBoxes}
            canEditBoxes={canEditBoxes}
            canEditStatusBoxes={canEditStatusBoxes}
          />
        </AsyncState>
      </section>

      <BoxesFormModal
        open={open}
        title={editingId ? "Editar Caja" : "Nueva Caja"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        currencyLabel={detail?.currencyDescription}
      />
    </div>
  );
}
