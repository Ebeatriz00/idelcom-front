import type { ProcessTypeResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useProcessTypeList,
  useProcessTypeMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ProcessFormModal } from "./components/modal/ProcessFromModal";
import { ProcessTable } from "./components/table/ProcessTable";
import { useCrmProcessPerms } from "./hooks/process.perms";
import { useProcessTypeFormModal } from "./hooks/useProcessTypeModal";

export default function Processes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useProcessTypeList(
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
  } = useProcessTypeFormModal();

  const {
    canCreateProcess,
    canEditProcess,
    canEditStatusProcess,
    canDeleteProcess,
    canExportProcess,
  } = useCrmProcessPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useProcessTypeMutations();

  const rows: ProcessTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ProcessTypeResponseDto) {
    if (!canEditProcess) return;
    if (row.processTypeId) openEdit(row.processTypeId);
  }

  async function onToggleStatus(row: ProcessTypeResponseDto) {
    if (!canEditStatusProcess) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      processTypeId: row.processTypeId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ProcessTypeResponseDto) {
    if (!canDeleteProcess) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Oportunidades", href: "#" },
            { label: "Tipos", current: true },
          ]}
          createLabel="Nuevo tipo de procesos"
          onCreate={canCreateProcess ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ProcessTable
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
            canExportProcess={canExportProcess}
            canEditProcess={canEditProcess}
            canEditStatusProcess={canEditStatusProcess}
          />
        </AsyncState>
      </section>

      <ProcessFormModal
        open={open}
        title={editingId ? "Editar Tipo de proceso" : "Nueva Tipo de proceso"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
