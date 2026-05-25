import { useEffect, useState } from "react";

import type { ConceptGroupsResponseDto } from "@/application";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useConceptGroupsList,
  useConceptGroupsMutations,
} from "@/sharedKernel/hooks/accounting/useConceptGroups";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { ConceptGroupsFormModal } from "./components/ConceptGroupsFormModal";
import { ConceptGroupsTable } from "./components/table/ConceptGroupsTable";
import { useConceptGroupsFormModal } from "./hooks/useConceptGroupsFormModal";
import { AsyncState } from "@/layouts";
import { useAccGroupsPerms } from "./hooks/conGroups.perms";

export default function ConceptGroups() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useConceptGroupsList(
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
    conceptTypeLabel,
  } = useConceptGroupsFormModal();

  const {
    canCreateAccGroups,
    canEditAccGroups,
    canEditStatusAccGroups,
    canDeleteAccGroups,
    canExportAccGroups,
  } = useAccGroupsPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useConceptGroupsMutations();

  const rows: ConceptGroupsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ConceptGroupsResponseDto) {
    if (!canEditAccGroups) return;
    openEdit(row);
  }

  async function onToggleStatus(row: ConceptGroupsResponseDto) {
    if (!canEditStatusAccGroups) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      conceptGroupsId: row.conceptGroupsId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: ConceptGroupsResponseDto) {
    if (!canDeleteAccGroups) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">

      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando grupos de conceptos…
          </div>
        )}
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Ocurrió un error al cargar los datos."}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Catálogos contables", href: "#" },
            { label: "Grupos de Conceptos", current: true },
          ]}
          createLabel="Nuevo Grupo"
          onCreate={canCreateAccGroups ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
          >
          <ConceptGroupsTable
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
            canExportAccGroups={canExportAccGroups}
            canEditAccGroups={canEditAccGroups}
            canEditStatusAccGroups={canEditStatusAccGroups}

          />
        </AsyncState>
      </section>

      {}
      <ConceptGroupsFormModal
        open={open}
        title={
          editingId ? "Editar Grupo de Conceptos" : "Nuevo Grupo de Conceptos"
        }
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        conceptTypeLabel={conceptTypeLabel}
      />
    </div>
  );
}
