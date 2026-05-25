import type { SalesQuotationResponse } from "@/application";
import { AsyncState, Breadcrumb } from "@/layouts";
import { useDebouncedValue, useQuotationList } from "@/sharedKernel";
import { useEffect, useState } from "react";
import { QuotesTable } from "./components/table/quotesTable";

export default function Quotes() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, error } = useQuotationList(
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch
  );
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);
  const rows: SalesQuotationResponse[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  async function onToggleStatus(_row: SalesQuotationResponse) {
    /*const current = statusToBool(row.status);
      await statusMut.mutateAsync({
        linkToken: row.linkToken,
        status: boolToStatusString(!current),
      });*/
  }

  return (
    <div className="min-h-[80vh]  grid-cols-1 lg:grid-cols-12 gap-4">
      <section className="lg:col-span-9 space-y-4">
        <Breadcrumb
          items={[
            { label: "Pre - Venta", href: "#" },
            { label: "Cotizaciones", current: true },
          ]}
        />
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={rows.length === 0}
          emptyMessage="No hay proyecto proyectos en etapa de cotización."
        >
          <QuotesTable
            data={rows}
            total={total}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onToggleStatus={onToggleStatus}
            search={search}
            onSearchChange={setSearch}
          />
        </AsyncState>
      </section>
    </div>
  );
}
