import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,
} from "@/sharedKernel";
import { useEffect, useState } from "react";

import { ContactsTable } from "./components/table/ContactsTable";

import type { ContactsResponseDto } from "@/application/dtos/crm/contacts/ContactsResponse.dto";
import {
  useContactsList,
  useContactsMutations,
} from "@/sharedKernel/hooks/crm/contacts/useContacts";
import { ContactsFormModal } from "./components/ContactsFormModal";
import { useContactsFormModal } from "./hooks/useContactsFormModal";

export default function Contacts() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useContactsList(
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
  } = useContactsFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useContactsMutations();

  const rows: ContactsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: ContactsResponseDto) {
    if (row.contactsCrmId) openEdit(row.contactsCrmId);
  }

  async function onToggleStatus(row: ContactsResponseDto) {
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      contactsCrmId: row.contactsCrmId,
      status: boolToStatusString(!current),
    });
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {error && (
          <div className="rounded-xl border bg-white p-4 text-sm text-rose-600">
            {(error as any)?.message ?? "Error"}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "CRM", href: "#" },
            { label: "Contactos", current: true },
          ]}
          createLabel="Nuevo Contacto"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay contactos registradas."
        >
          <ContactsTable
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
          />
        </AsyncState>
      </section>

      <ContactsFormModal
        open={open}
        title={editingId ? "Editar Contacto" : "Nuevo Contacto"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        workerLabel={detail?.workerDescription}
        clientsLabel={detail?.clientsDescription}
        leadsSourcesLabel={detail?.leadsSourcesDescription}
        contactTypeLabel={detail?.contactTypeDescription}
      />
    </div>
  );
}
