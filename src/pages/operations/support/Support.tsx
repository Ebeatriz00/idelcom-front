import type { SupportResponseDto } from "@/application/dtos/operations/support/support.dto";
import { AsyncState, Breadcrumb } from "@/layouts";
import { confirmAction, useDebouncedValue } from "@/sharedKernel";
import { useSupportList } from "@/sharedKernel/hooks/operations/support/useSupport";
import { useEffect, useState } from "react";
import { SupportFormModal } from "./Components/modal/SupportFormModal";
import { SupportTable } from "./Components/table/SupportTable";
import { useSupportFormModal } from "./Hooks/useSupportFormModal";

export default function Support() {
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error, refetch } = useSupportList(
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
  } = useSupportFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 1 }));
  }, [debouncedSearch]);

  const rows: SupportResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: SupportResponseDto) {
    if (row.supportId) openEdit(row.supportId);
  }

  async function onDelete(row: SupportResponseDto) {
    if (!row.supportId) return;
    const confirmed = await confirmAction({
      title: "¿Eliminar Apoyo?",
      text: `¿Estás seguro de eliminar el proveedor "${row.provider}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      icon: "warning",
    });

    if (confirmed) {
      await remove(row.supportId);
      refetch();
    }
  }

  return (
    <div className="min-h-[80vh] space-y-4">
      <Breadcrumb
        items={[
          { label: "Operaciones", href: "#" },
          { label: "Apoyo", current: true },
        ]}
        createLabel="Nuevo Apoyo"
        onCreate={openCreate}
      />

      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
      >
        <SupportTable
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
          search={search}
          onSearchChange={setSearch}
        />
      </AsyncState>

      <SupportFormModal
        open={open}
        title={editingId ? "Editar Apoyo" : "Nuevo Apoyo"}
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
