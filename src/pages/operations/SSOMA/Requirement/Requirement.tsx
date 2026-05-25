import type { RequirementResponseItemDto } from "@/application/dtos/operations/requirement/requeriment.dto";
import { fetchUpdateRequirementStatus } from "@/infrastructure";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  confirmAction,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import { useRequirementListItem } from "@/sharedKernel/hooks/operations/SSOMA/ssomaRequirement/useRequirement";
import { useEffect, useState } from "react";
import { RequirementFormModal } from "./Components/modal/RequirementFormModal";
import { RequirementTable } from "./Components/table/RequirementTable";
import { useRequirementFormModal } from "./Hooks/useRequirementFormModal";

export default function Requirement() {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error, refetch } = useRequirementListItem(
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
    remove,
    saving,
    editingId,
  } = useRequirementFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 1 }));
  }, [debouncedSearch]);

  const rows: RequirementResponseItemDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: RequirementResponseItemDto) {
    if (row.requirementId) openEdit(row.requirementId);
  }

  async function onDelete(row: RequirementResponseItemDto) {
    if (!row.requirementId) return;
    const confirmed = await confirmAction({
      title: "¿Eliminar Requerimiento?",
      text: `¿Estás seguro de eliminar "${row.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      icon: "warning",
    });

    if (confirmed) {
      await remove(row.requirementId);
      refetch();
    }
  }

  async function onToggleStatus(row: RequirementResponseItemDto) {
    if (!row.requirementId) return;
    const current = statusToBool(row.isActive);
    await fetchUpdateRequirementStatus({
      requirementId: row.requirementId,
      status: boolToStatusString(!current),
    });
    refetch();
  }

  return (
    <div className="min-h-[80vh] space-y-4">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "SSOMA", href: "#" },
          { label: "Requerimientos", current: true },
        ]}
        createLabel="Nuevo Requerimiento"
        onCreate={openCreate}
      />

      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
      >
        <RequirementTable
          data={rows}
          total={total}
          pageCount={pageCount}
          pagination={{
            pageIndex: pagination.pageIndex - 1,
            pageSize: pagination.pageSize,
          }}
          onPaginationChange={(updater) => {
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
          onToggleStatus={onToggleStatus}
          search={search}
          onSearchChange={setSearch}
        />
      </AsyncState>

      <RequirementFormModal
        open={open}
        title={editingId ? "Editar Requerimiento" : "Nuevo Requerimiento"}
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
