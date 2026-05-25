import type { ContactTypeResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useContactTypeList,
  useContactTypeMutations,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { ContactTypeFormModal } from "./components/modal/ContactTypeFormModal";
import { ContactTypeTable } from "./components/table/ContactTypeTable";
import { useCrmContactsTypePerms } from "./hooks/permissions/contact-type.perms";
import { useContactTypeFormModal } from "./hooks/useContactTypeModal";

export default function ContactType() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useContactTypeList(
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
  } = useContactTypeFormModal();

  const {
    canCreateContactsType,
    canEditContactsType,
    canEditStatusContactsType,
    canDeleteContactsType,
    canExportContactsType,
  } = useCrmContactsTypePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useContactTypeMutations();

  const rows: ContactTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ContactTypeResponseDto) {
    if (!canEditContactsType) return;
    if (row.contactTypeId) openEdit(row.contactTypeId);
  }

  async function onToggleStatus(row: ContactTypeResponseDto) {
    if (!canEditStatusContactsType) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      contactTypeId: row.contactTypeId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: ContactTypeResponseDto) {
    if (!canDeleteContactsType) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Leads", href: "#" },
            { label: "Tipo", current: true },
          ]}
          createLabel="Nuevo tipo lead"
          onCreate={canCreateContactsType ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay tipo lead registradas."
        >
          <ContactTypeTable
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
            canExportContactType={canExportContactsType}
            canEditContactType={canEditContactsType}
            canEditStatusContactType={canEditStatusContactsType}
          />
        </AsyncState>
      </section>

      <ContactTypeFormModal
        open={open}
        title={editingId ? "Editar Tipo lead" : "Nueva Tipo lead"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
