import { useEffect, useState } from "react";

import type { UomResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useUomList,
  useUomMutations,
} from "@/sharedKernel/hooks/general/useUom";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { UomTable } from "./components/table/UomTable";
import { UomFormModal } from "./components/UomFormModal";
import { useGeneralUomPerms } from "./hooks/Uom.perms";
import { useUomFormModal } from "./hooks/useUomModal";

export default function Uom() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useUomList(
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
  } = useUomFormModal();

  const {
    canCreateUom,
    canEditUom,
    canEditStatusUom,
    canDeleteUom,
    canExportUom,
  } = useGeneralUomPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useUomMutations();

  const rows: UomResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: UomResponseDto) {
    if (!canEditUom) return;
    if (row.uomId) openEdit(row.uomId); // Usa uomId
  }

  async function onToggleStatus(row: UomResponseDto) {
    if (!canEditStatusUom) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      uomId: row.uomId, // Usa uomId
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: UomResponseDto) {
    if (!canDeleteUom) return;
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
            { label: "General", href: "#" },
            { label: "Unidades de Medida", current: true },
          ]}
          createLabel="Nueva unidad de medida"
          onCreate={canCreateUom ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay unidades de medida registradas."
        >
          <UomTable
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
            canExportUom={canExportUom}
            canEditUom={canEditUom}
            canEditStatusUom={canEditStatusUom}
          />
        </AsyncState>
      </section>

      <UomFormModal
        open={open}
        title={editingId ? "Editar unidad de medida" : "Nueva unidad de medida"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
