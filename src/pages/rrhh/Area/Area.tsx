import { useEffect, useState } from "react";

import type { AreaResponseDto } from "@/application";

import {
  boolToStatusString,
  statusToBool,
  useAreaList,
  useAreaMutations,
} from "@/sharedKernel";

import { AsyncState, Breadcrumb } from "@/layouts";
import { useDebouncedValue } from "@/sharedKernel";
import { AreaFormModal } from "./components/AreaFormModal";
import { AreasTable } from "./components/table/AreaTable";
import { useHrAreaPerms } from "./hooks/area.perms";
import { useAreaFormModal } from "./hooks/useAreaFormModal";

export default function Area() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading, error } = useAreaList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const rows: AreaResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useAreaMutations();

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
  } = useAreaFormModal();

  const {
    canCreateArea,
    canEditArea,
    canEditStatusArea,
    canDeleteArea,
    canExportArea,
  } = useHrAreaPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  function onEdit(row: AreaResponseDto) {
    if (canEditArea) if (row.areaId) openEdit(row.areaId);
  }

  async function onToggleStatus(row: AreaResponseDto) {
    if (!canEditStatusArea) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      areaId: row.areaId,
      businessId: Number(row.businessId),
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: AreaResponseDto) {
    if (!canDeleteArea) return;
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

        {}
        <Breadcrumb
          items={[
            { label: "Ajustes", href: "#" },
            { label: "Áreas", current: true },
          ]}
          createLabel="Nueva área"
          onCreate={canCreateArea ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay áreas registradas."
        >
          <AreasTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            search={search}
            onVisibleCountChange={setVisibleCount}
            onSearchChange={setSearch}
            canEditArea={canEditArea}
            canEditStatusArea={canEditStatusArea}
            canExportArea={canExportArea}
          />
        </AsyncState>
      </section>

      <AreaFormModal
        open={open}
        title={editingId ? "Editar área" : "Nueva área"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
