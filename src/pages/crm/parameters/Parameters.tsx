import type { CommercialParametersResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useCommercialParametersList,
  useCommercialParametersMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { CommercialParametersFormModal } from "./components/modal/CommParamertsFormModal";
import { CommercialParametersTable } from "./components/table/CommParametersTable";
import { useCrmParametersPerms } from "./hooks/parameters.perms";
import { useCommercialParametersFormModal } from "./hooks/useCommParameters";

export default function Parameters() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useCommercialParametersList(
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
  } = useCommercialParametersFormModal();

  const {
    canCreateCommParameters,
    canEditCommParameters,
    canEditStatusCommParameters,
    canDeleteCommParameters,
    canExportCommParameters,
  } = useCrmParametersPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useCommercialParametersMutations();

  const rows: CommercialParametersResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: CommercialParametersResponseDto) {
    if (!canEditCommParameters) return;
    if (row.commercialParametersId) openEdit(row.commercialParametersId);
  }

  async function onToggleStatus(row: CommercialParametersResponseDto) {
    if (!canEditStatusCommParameters) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      commercialParametersId: row.commercialParametersId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: CommercialParametersResponseDto) {
    if (!canDeleteCommParameters) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Parametros",current: true },
          ]}
          createLabel="Nuevo Parametro"
          onCreate={canCreateCommParameters ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay tipo Parametros comerciales registradas."
        >
          <CommercialParametersTable
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
            canEditCommParameters={canEditCommParameters}
            canEditStatusCommParameters={canEditStatusCommParameters}
            canDeleteCommParameters={canDeleteCommParameters}
            canExportCommParameters={canExportCommParameters}
          />
        </AsyncState>
      </section>

      <CommercialParametersFormModal
        open={open}
        title={editingId ? "Editar Parametro" : "Nueva Parametro"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
