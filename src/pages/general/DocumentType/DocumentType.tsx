import { useEffect, useState } from "react";

import type { DocumentTypeResponseDto } from "@/application";
import { AsyncState } from "@/layouts/components/ui/loader/asyncState";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useDocumentTypeList,
  useDocumentTypeMutations,
} from "@/sharedKernel/hooks/general/useDocumentType";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { DocumentTypeFormModal } from "./components/DocumentTypeFormModal";
import { DocumentTypesTable } from "./components/table/DocumentTypeTable";
import { useGeneralDocumentTypePerms } from "./hooks/documentType.perms";
import { useDocumentTypeFormModal } from "./hooks/useDocumentTypeModal";

export default function DocumentTypes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useDocumentTypeList(
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
  } = useDocumentTypeFormModal();

  const {
    canCreateDocumentType,
    canEditDocumentType,
    canEditStatusDocumentType,
    canDeleteDocumentType,
    canExportDocumentType,
  } = useGeneralDocumentTypePerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const { statusMut } = useDocumentTypeMutations();

  const rows: DocumentTypeResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: DocumentTypeResponseDto) {
    if (!canEditDocumentType) return;
    if (row.documentTypeId) openEdit(row.documentTypeId);
  }

  async function onToggleStatus(row: DocumentTypeResponseDto) {
    if (!canEditStatusDocumentType) return;
    const current = statusToBool(row.status);
    await statusMut.mutateAsync({
      documentTypeId: row.documentTypeId,
      status: boolToStatusString(!current),
    });
  }

  async function onDelete(_row: DocumentTypeResponseDto) {
    if (!canDeleteDocumentType) return;
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
            { label: "General", href: "#" },
            { label: "Tipos de Documento", current: true },
          ]}
          createLabel="Nuevo tipo de documento"
          onCreate={canCreateDocumentType ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <DocumentTypesTable
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
            canEditDocumentType={canEditDocumentType}
            canEditStatusDocumentType={canEditStatusDocumentType}
            canExportDocumentType={canExportDocumentType}
          />
        </AsyncState>
      </section>

      <DocumentTypeFormModal
        open={open}
        title={
          editingId ? "Editar tipo de documento" : "Nuevo tipo de documento"
        }
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
      />
    </div>
  );
}
