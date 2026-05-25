import type {
  ModulesPermissionsResponseByIdDto,
  ModulesPermissionsResponseDto,
  ModulesPermissionsStatusDto,
} from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useModulesPermissionsList,
  useModulesPermissionsMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ModulesPermissionsFormModal } from "./components/ModulesPermissionsFromModal";
import { ModulesPermissionsTable } from "./components/table/ModulesPermissionsTable";
import { useModulesPermissionsFormModal } from "./hooks/useModulesPermissionsFormModal";

export default function PermissionsModules() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useModulesPermissionsList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );

  const rows: ModulesPermissionsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = useModulesPermissionsMutations();

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
  } = useModulesPermissionsFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  function onEdit(row: ModulesPermissionsResponseByIdDto) {
    if (row.modulesPermissionsId) openEdit(row.modulesPermissionsId);
  }

  async function onToggleStatus(row: ModulesPermissionsStatusDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      modulesPermissionsId: row.modulesPermissionsId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ModulesPermissionsResponseByIdDto) {
    // TODO: confirmar + soft-delete
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Ajustes", href: "#" },
            { label: "Módulos Permisos", current: true },
          ]}
          createLabel="Nuevo módulo permiso"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ModulesPermissionsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            search={search}
            onSearchChange={setSearch}
            onVisibleCountChange={setVisibleCount}
          />
        </AsyncState>
      </section>

      <ModulesPermissionsFormModal
        open={open}
        title={editingId ? "Editar módulo permiso" : "Nuevo módulo permiso"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
