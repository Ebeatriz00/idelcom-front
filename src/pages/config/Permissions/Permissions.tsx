import type { PermissionsResponseDto } from "@/application/dtos/configurations/Permissions/PermissionsResponse.dto";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import {
  usePermissionsList,
  usePermissionsMutations,
} from "@/sharedKernel/hooks/permissions/usePermissions";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { useState } from "react";
import { PermissionsFormModal } from "./components/PermissionsFromModal";
import { PermissionsTable } from "./components/table/PermissionsTable";
import { usePermissionsFormModal } from "./hooks/usePermissionsFormModal";

export default function Permissions() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { data, isLoading, error } = usePermissionsList(
    pagination.pageIndex,
    pagination.pageSize
  );

  const rows: PermissionsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { statusMut } = usePermissionsMutations();

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
  } = usePermissionsFormModal();

  function onEdit(row: PermissionsResponseDto) {
    if (row.permissionsId) openEdit(row.permissionsId);
  }

  async function onToggleStatus(row: PermissionsResponseDto) {
    const current = statusToBool(row.status);
    console.log(row.permissionsId);
    await statusMut.mutateAsync({
      permissionsId: row.permissionsId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: PermissionsResponseDto) {
    // TODO: confirmar + soft-delete
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Sidebar genérico */}

      <section className="lg:col-span-9 space-y-4">
        {/* Breadcrumb genérico */}
        <Breadcrumb
          items={[
            { label: "Sistemas", href: "#" },
            { label: "Permisos", current: true },
          ]}
          createLabel="Nuevo permiso"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay pemisos registrados."
        >
          <PermissionsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onVisibleCountChange={setVisibleCount}
          />
        </AsyncState>
      </section>

      <PermissionsFormModal
        open={open}
        title={editingId ? "Editar permiso" : "Nuevo permiso"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
