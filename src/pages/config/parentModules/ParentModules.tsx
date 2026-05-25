import type {
  ParentModulesResponseDto,
  ParentModulesStatusDto,
} from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useParentModulesList,
  useParentModulesMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ParentModulesFormModal } from "./components/ParentModulesFromModal";
import { ParentModulesTable } from "./components/table/ParentModulesTable";
import { useParentModulesFormModal } from "./hooks/useParentModules";

export default function ParentModules() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useParentModulesList(
    debouncedSearch,
    pagination.pageIndex,
    pagination.pageSize
  );

  const rows: ParentModulesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useParentModulesMutations();

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
  } = useParentModulesFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  function onEdit(row: ParentModulesResponseDto) {
    if (row.parentModulesId) openEdit(row.parentModulesId);
  }

  async function onToggleStatus(row: ParentModulesStatusDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      parentModulesId: row.parentModulesId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ParentModulesResponseDto) {
    // TODO: confirmar + soft-delete
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

        {/* Breadcrumb genérico */}
        <Breadcrumb
          items={[
            { label: "Sistemas", href: "#" },
            { label: "Módulos Permissions", current: true },
          ]}
          createLabel="Nuevo módulo padre"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ParentModulesTable
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
            loading={isFetching}
          />
        </AsyncState>
      </section>

      <ParentModulesFormModal
        open={open}
        title={editingId ? "Editar módulo padre" : "Nuevo módulo padre"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
