import type { ClinicResponseDto } from "@/application/dtos/operations/clinics/clinic.dto";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  confirmAction,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import { useClinicListItem, useDeleteClinic } from "@/sharedKernel/hooks/operations/SSOMA/clinics/useClinic";
import { useEffect, useState } from "react";
import { ClinicFormModal } from "./Components/modal/ClinicFormModal";
import { ClinicTable } from "./Components/table/ClinicTable";
import { useClinicFormModal } from "./Hooks/useClinicFormModal";

export default function Clinics() {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error, refetch } = useClinicListItem(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  );

  const { mutateAsync: deleteClinic } = useDeleteClinic();

  const {
    open,
    isFetching,
    defaultValues,
    openEdit,
    openCreate,
    close,
    submit,
    saving,
    editingId,
  } = useClinicFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 1 }));
  }, [debouncedSearch]);

  const rows: ClinicResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ClinicResponseDto) {
    if (row.clinicId) openEdit(row);
  }

  async function onDelete(row: ClinicResponseDto) {
    if (!row.clinicId) return;
    const isActive = statusToBool(row.status);
    const confirmed = await confirmAction({
      title: "¿Cambiar Estado?",
      text: `¿Estás seguro de que deseas ${isActive ? "inactivar" : "activar"} la clínica "${row.clinicName}"?`,
      confirmText: "Sí, continuar",
      icon: "warning",
    });

    if (confirmed) {
      await deleteClinic(row.clinicId);
      refetch();
    }
  }

  return (
    <div className="min-h-[80vh] space-y-4">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "SSOMA", href: "#" },
          { label: "Clínicas", current: true },
        ]}
        createLabel="Nueva Clínica"
        onCreate={openCreate}
      />

      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
      >
        <ClinicTable
          data={rows}
          total={total}
          pageCount={pageCount}
          pagination={{
            pageIndex: pagination.pageIndex - 1,
            pageSize: pagination.pageSize,
          }}
          onPaginationChange={(updater: any) => {
            if (typeof updater === "function") {
              setPagination((prev) => {
                const next = updater({
                  pageIndex: prev.pageIndex - 1,
                  pageSize: prev.pageSize,
                });
                return {
                  pageIndex: next.pageIndex + 1,
                  pageSize: next.pageSize,
                };
              });
            } else {
              setPagination({
                pageIndex: updater.pageIndex + 1,
                pageSize: updater.pageSize,
              });
            }
          }}
          onEdit={onEdit}
          onDelete={onDelete}
          search={search}
          onSearchChange={setSearch}
        />
      </AsyncState>

      <ClinicFormModal
        open={open}
        title={editingId ? "Editar Clínica" : "Nueva Clínica"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={async (dto) => {
          await submit(dto);
          refetch();
        }}
        saving={saving}
      />
    </div>
  );
}
