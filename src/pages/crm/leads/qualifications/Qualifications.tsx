import type { QualificationsResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
  useQualificationsList,
  useQualificationsMutations,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { QualificationsFormModal } from "./components/modal/QualificationsFormModal";
import { QualificationsTable } from "./components/table/QualificationsTable";
import { useCrmQualificationPerms } from "./hooks/permissions/qual.perms";
import { useQualificationsFormModal } from "./hooks/useQualificationsModal";

export default function Qualifications() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useQualificationsList(
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
  } = useQualificationsFormModal();

  const {
    canCreateQualification,
    canEditQualification,
    canEditStatusQualification,
    canDeleteQualification,
    canExportQualification,
  } = useCrmQualificationPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useQualificationsMutations();

  const rows: QualificationsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: QualificationsResponseDto) {
    if (!canEditQualification) return;
    if (row.leadsQualificationsId) openEdit(row.leadsQualificationsId);
  }

  async function onToggleStatus(row: QualificationsResponseDto) {
    if (!canEditStatusQualification) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      leadsQualificationsId: row.leadsQualificationsId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: QualificationsResponseDto) {
    if (!canDeleteQualification) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Leads", href: "#" },
            { label: "Calificación", current: true },
          ]}
          createLabel="Nueva calificación"
          onCreate={canCreateQualification ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay calificaciones registradas."
        >
          <QualificationsTable
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
            canEditQualification={canEditQualification}
            canExportQualification={canExportQualification}
            canEditStatusQualification={canEditStatusQualification}
          />
        </AsyncState>
      </section>

      <QualificationsFormModal
        open={open}
        title={editingId ? "Editar Calificación" : "Nueva Calificación"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
