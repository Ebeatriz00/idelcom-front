import type { AssignmentTypeResponseDto } from "@/application";
import { fetchUpdateAssignmentTypeStatus } from "@/infrastructure";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useAssignmentTypeList,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { AssignmentTypeFormModal } from "./Components/modal/AssignmentTypeFormModal";
import { AssignmentTypeTable } from "./Components/table/AssignmentTypeTable";
import { useAssignmentTypeFormModal } from "./hooks/useAssignmentTypeFormModal";

export default function AssignmentType() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error, refetch } = useAssignmentTypeList(
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
  } = useAssignmentTypeFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: AssignmentTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: AssignmentTypeResponseDto) {
    if (row.ssomaAssignamentTypeId) openEdit(row.ssomaAssignamentTypeId);
  }

  async function onToggleStatus(row: AssignmentTypeResponseDto) {
    const current = statusToBool(row.status);
    await fetchUpdateAssignmentTypeStatus({
      ssomaAssignamentTypeId: row.ssomaAssignamentTypeId,
      status: boolToStatusString(!current),
    });
    refetch();
  }

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Operaciones", href: "#" },
            { label: "SSOMA", href: "#" },
            { label: "Tipos de Asignación", current: true },
          ]}
          createLabel="Nueva Asignación"
          onCreate={openCreate}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay tipos de documento registrados."
        >
          <AssignmentTypeTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            search={search}
            onSearchChange={setSearch} onDelete={function (): void {
              throw new Error("Function not implemented.");
            } }
          />
        </AsyncState>
      </section>
      <AssignmentTypeFormModal
        open={open}
        title={
          editingId
            ? "Editar Tipo de Asignamiento"
            : "Nuevo Tipo de Asignamiento"
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
