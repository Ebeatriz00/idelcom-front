import type { SsomaDocumentTypeResponseDto } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import {
  boolToStatusString,
  statusToBool,
  useDebouncedValue,

} from "@/sharedKernel";
import { useEffect, useState } from "react";
import { fetchUpdateSsomaDocumentTypeStatus } from "@/infrastructure";

import { SsomaDocumentTypeTable } from "./components/table/SsomaDocumentTypeTable";
import { useSsomaDocumentTypeList } from "@/sharedKernel/hooks/operations/documentType/useSsomaDocumentType";
import { useSsomaDocumentTypeFormModal } from "./components/hooks/useSsomaDocumentTypeModal";
import { SsomaDocumentTypeFormModal } from "./components/modal/SsomaDocumentTypeFormModal";

export default function SsomaDocumentType() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error, refetch } = useSsomaDocumentTypeList(
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
  } = useSsomaDocumentTypeFormModal();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const rows: SsomaDocumentTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: SsomaDocumentTypeResponseDto) {
    if (row.ssomaDocumentTypeId) openEdit(row.ssomaDocumentTypeId);
  }

  async function onToggleStatus(row: SsomaDocumentTypeResponseDto) {
    const current = statusToBool(row.status);
    await fetchUpdateSsomaDocumentTypeStatus({
      ssomaDocumentTypeId: row.ssomaDocumentTypeId,
      status: boolToStatusString(!current),
    });
    refetch();
  }

  return (
    <div className="min-h-[80vh] grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Operaciones", href: "#" },
            { label: "SSOMA", href: "#" },
            { label: "Tipos de Documento", current: true },
          ]}
          createLabel="Nuevo tipo"
          onCreate={openCreate}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay tipos de documento registrados."
        >
          <SsomaDocumentTypeTable
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

      <SsomaDocumentTypeFormModal
        open={open}
        title={editingId ? "Editar Tipo de Documento" : "Nuevo Tipo de Documento"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}