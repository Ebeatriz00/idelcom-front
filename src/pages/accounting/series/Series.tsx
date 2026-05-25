import { useEffect, useState } from "react";

import type { SeriesResponseDto } from "@/application";
import { AsyncState } from "@/layouts";
import { Breadcrumb } from "@/layouts/presentation/breadcrumb";
import { useDebouncedValue } from "@/sharedKernel";
import {
  useSeriesList,
  useSeriesMutations,
} from "@/sharedKernel/hooks/accounting/useSeries";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { SeriesFormModal } from "./components/SeriesFormModal";
import { SeriesTable } from "./components/table/SeriesTable";
import { useAccSeriesPerms } from "./hooks/series.perms";
import { useSeriesFormModal } from "./hooks/useSeriesFormModal";

export default function Series() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [, setVisibleCount] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useSeriesList(
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
    paymentTypeLabel,
  } = useSeriesFormModal();

  const {
    canCreateSeries,
    canEditSeries,
    canEditStatusSeries,
    canDeleteSeries,
    canExportSeries,
  } = useAccSeriesPerms();

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);
  const { statusMut } = useSeriesMutations();

  const rows: SeriesResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  function onEdit(row: SeriesResponseDto) {
    if (!canEditSeries) return;
    openEdit(row);
  }

  async function onToggleStatus(row: SeriesResponseDto) {
    if (!canEditStatusSeries) return;
    const currentStatus = statusToBool(row.status);
    await statusMut.mutateAsync({
      seriesId: row.seriesId,
      status: boolToStatusString(!currentStatus),
    });
  }

  async function onDelete(_row: SeriesResponseDto) {
    if (!canDeleteSeries) return;
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        {isLoading && (
          <div className="rounded-xl border bg-white p-4 text-sm">
            Cargando series…
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
            { label: "Series", current: true },
          ]}
          createLabel="Nueva Serie"
          onCreate={canCreateSeries ? openCreate : undefined}
        />

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay cuentas registradas."
        >
          <SeriesTable
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
            canEditSeries={canEditSeries}
            canEditStatusSeries={canEditStatusSeries}
            canExportSeries={canExportSeries}
          />
        </AsyncState>
      </section>

      <SeriesFormModal
        open={open}
        title={editingId ? "Editar Serie" : "Nueva Serie"}
        loadingDetail={Boolean(editingId) && isFetching}
        defaultValues={defaultValues}
        onClose={close}
        onSubmit={submit}
        saving={saving}
        paymentTypeLabel={paymentTypeLabel}
      />
    </div>
  );
}
