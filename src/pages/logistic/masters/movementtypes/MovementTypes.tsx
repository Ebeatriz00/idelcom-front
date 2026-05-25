import { useEffect, useState } from "react";

import type { MovementTypesResponseDto } from "@/application";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useMovementTypesList,
  useMovementTypesMutations,
} from "@/sharedKernel/hooks/logistic/masters/useMovementTypes";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { MovementTypesFormModal } from "./components/MovementTypesFormModal";
import { MovementTypesTable } from "./components/table/MovementTypesTable";
import { useMassMovTypePerms } from "./hooks/movType.perms";
import { useMovementTypesFormModal } from "./hooks/useMovementTypesFormModal";

export default function MovementTypes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useMovementTypesList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
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
    movClasLabel,
    movOperLabel,
    movPerLabel,
    movSunatLabel,
    movVisLabel,
  } = useMovementTypesFormModal();

  const {
    canCreateMovType,
    canEditMovType,
    canEditStatusMovType,
    canDeleteMovType,
    canExportMovType,
  } = useMassMovTypePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useMovementTypesMutations();

  const rows: MovementTypesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: MovementTypesResponseDto) {
    if (!canEditMovType) return;
    openEdit(row);
  }

  async function onToggleStatus(row: MovementTypesResponseDto) {
    if (!canEditStatusMovType) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      movementTypesId: row.movementTypesId ?? 0,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: MovementTypesResponseDto) {
    if (!canDeleteMovType) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando tipos de movimiento…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Catálogos", href: "#" },
            { label: "Tipos de Movimiento", current: true },
          ]}
          createLabel="Nuevo Tipo"
          onCreate={canCreateMovType ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={false}
          emptyMessage="No hay tipos de movimiento registrados."
        >
          <MovementTypesTable
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
            onCreate={canCreateMovType ? openCreate : undefined}
            canCreateMovType={canCreateMovType}
            canExportMovType={canExportMovType}
            canEditMovType={canEditMovType}
            canEditStatusMovType={canEditStatusMovType}
          />
        </AsyncState>
      </section>

      {}
      <MovementTypesFormModal
        open={open}
        title={
          editingId ? "Editar Tipo de Movimiento" : "Nuevo Tipo de Movimiento"
        }
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        movClasLabel={movClasLabel}
        movOperLabel={movOperLabel}
        movPerLabel={movPerLabel}
        movSunatLabel={movSunatLabel}
        movVisLabel={movVisLabel}
      />
    </div>
  );
}
