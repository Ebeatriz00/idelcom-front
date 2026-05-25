import type { StateOpportunityResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useStateOpportunityList,
  useStateOpportunityMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { StatesFormModal } from "./components/modal/StatesOpportunityFormModal";
import { StatesTable } from "./components/table/StatesTable";
import { useCrmStatePerms } from "./hooks/state.perms";
import { useStateOpportunityFormModal } from "./hooks/useStateOpportunityModal";

export default function States() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useStateOpportunityList(
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
  } = useStateOpportunityFormModal();

  const { canEditState, canEditStatusState, canDeleteState, canExportState } =
    useCrmStatePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useStateOpportunityMutations();

  const rows: StateOpportunityResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: StateOpportunityResponseDto) {
    if (!canEditState) return;
    if (row.stateOpportunityId) openEdit(row.stateOpportunityId);
  }

  async function onToggleStatus(row: StateOpportunityResponseDto) {
    if (!canEditStatusState) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      stateOpportunityId: row.stateOpportunityId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: StateOpportunityResponseDto) {
    if (!canDeleteState) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Oportunidades", href: "#" },
            { label: "Estado", current: true },
          ]}
          createLabel="Nuevo estado"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay estados registrados."
        >
          <StatesTable
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
            canExportState={canExportState}
            canEditState={canEditState}
            canEditStatusState={canEditStatusState}
          />
        </AsyncState>
      </section>

      <StatesFormModal
        open={open}
        title={editingId ? "Editar Estado" : "Nueva Estado"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
