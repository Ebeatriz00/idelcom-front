import type { ConceptsResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useConceptsList,
  useConceptsMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ConceptsFormModal } from "./components/ConceptsFormModal";
import { ConceptsTable } from "./components/table/ConceptsTable";
import { useAccConceptPerms } from "./hooks/concepts.perms";
import { useConceptsFormModal } from "./hooks/useConcepts";

export default function Concepts() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useConceptsList(
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
    detail,
  } = useConceptsFormModal();

  const {
    canCreateConcept,
    canEditConcept,
    canEditStatusConcept,
    canDeleteConcept,
    canExportConcept,
  } = useAccConceptPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useConceptsMutations();

  const rows: ConceptsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ConceptsResponseDto) {
    if (!canEditConcept) return;
    if (row.conceptsId) openEdit(row.conceptsId);
  }

  async function onToggleStatus(row: ConceptsResponseDto) {
    if (!canEditStatusConcept) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      conceptsId: row.conceptsId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ConceptsResponseDto) {
    if (!canDeleteConcept) return;
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

        <Breadcrumb
          items={[
            { label: "Catálogos contables", href: "#" },
            { label: "Conceptos", current: true },
          ]}
          createLabel="Nuevo Concepto"
          onCreate={canCreateConcept ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <ConceptsTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onVisibleCountChange={setVisibleCount}
            search={search}
            onSearchChange={setSearch}
            canEditConcept={canEditConcept}
            canEditStatusConcept={canEditStatusConcept}
            canExportConcept={canExportConcept}
            onDelete={onDelete}
          />
        </AsyncState>
      </section>

      <ConceptsFormModal
        open={open}
        title={editingId ? "Editar Concepto" : "Nuevo Concepto"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        conceptGroupsLabel={detail?.conceptGroupsDescription}
        accountPlanLabel={detail?.accountPlanDescription}
      />
    </div>
  );
}
