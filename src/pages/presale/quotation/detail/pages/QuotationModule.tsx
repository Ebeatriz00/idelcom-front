import { useDetailQuotation } from "@/sharedKernel";
import { useMemo } from "react";
import { QuotationHeaderBlock } from "./QuotationModule/containers/QuotationHeaderBlock";
import { usePresalesMemos } from "./QuotationModule/hooks/usePresalesMemos";
import { useQuotationModuleState } from "./QuotationModule/hooks/useQuotationModuleState";
import { mapDtoLinesToUi, type Props } from "./QuotationModule/types";
import {
  DetailTotalsBar,
  EgressSection,
  PresalesDetailTable,
  PresalesSubTabsCard,
  PresalesSummaryGrid,
  QuotationHeaderBar,
  QuotationTopCard,
} from "./QuotationModule/ui";
import { DetailLinesSection } from "./QuotationModule/ui/DetailLinesSection";
import { PaymentsByMonth } from "./QuotationModule/ui/PaymentsByMonth";

export function QuotationModule({ selectedVerId, versionNo }: Props) {
  const ui = useQuotationModuleState(selectedVerId, versionNo);
  const { data, isLoading, isError } = useDetailQuotation(
    selectedVerId,
    versionNo ?? ""
  );

  const memos = usePresalesMemos(data, ui.page, ui.selectedMonth);

  const rows = useMemo(() => mapDtoLinesToUi(data?.lines ?? []), [data?.lines]);

  if (!selectedVerId)
    return <EmptyState text="Selecciona una versión para ver el detalle." />;
  if (isLoading) return <EmptyState text="Cargando detalle…" />;
  if (isError) return <ErrorState text="Error cargando detalle." />;
  if (!data) return <EmptyState text="Sin datos." />;

  return (
    <div className="min-h-screen bg-zinc-50">
      <QuotationHeaderBar
        title={`Detalle de cotización${
          data.opporId ? ` - Oportunidad #${data.opporNumber}` : ""
        }`}
        onImport={() => ui.setImportOpen(true)}
        onNew={() => {}}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-12">
        <div className="lg:col-span-12 space-y-4">
          <QuotationTopCard
            tab={ui.tab}
            setTab={ui.setTab}
            versionNo={data.versionNo ?? ""}
          />

          <QuotationHeaderBlock data={data} />

          {ui.tab === "detail" && (
            <DetailLinesSection
              data={data}
              onAddGroup={() => {}}
              onAddItem={() => {}}
              footer={
                <DetailTotalsBar
                  subTotal={data.subTotal ?? 0}
                  discountAmount={data.discountAmount ?? 0}
                  tax={data.taxAmount ?? 0}
                  total={data.total ?? 0}
                />
              }
            />
          )}

          {ui.tab === "pre_sales" && (
            <>
              <PresalesSummaryGrid
                data={data}
                quotationTotal={memos.quotationTotal}
                scheduleTotal={memos.scheduleTotal}
                diffTotal={memos.diffTotal}
              />

              <PresalesSubTabsCard
                subTab={ui.subTab}
                setSubTab={ui.setSubTab}
                versionNo={data.versionNo ?? ""}
              />

              {ui.subTab === "detail_presales" && (
                <PresalesDetailTable rows={rows} />
              )}

              {ui.subTab === "payments" && (
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
                  <PaymentsByMonth
                    paymentIndexes={memos.paymentIndexes}
                    // ✅ resumen por mes (igual que egresos)
                    months={memos.paymentsByMonth} // <- lo creas en usePresalesMemos
                    // ✅ controlado
                    selectedMonth={ui.selectedMonth}
                    onSelectMonth={(m) => ui.setSelectedMonth(m)}
                    onClearMonth={() => ui.setSelectedMonth(null)}
                    // ✅ tabla paginada (ya viene filtrada por selectedMonth)
                    pageRows={memos.pageRows ?? []}
                    page={memos.safePage}
                    totalPages={memos.totalPages}
                    totalRows={memos.totalRows}
                    pageSize={memos.PAGE_SIZE}
                    setPage={ui.setPage}
                  />
                </div>
              )}

              {ui.subTab === "egress" && (
                <EgressSection
                  egressByMonth={memos.egressByMonth}
                  selectedMonth={ui.selectedMonth}
                  onSelectMonth={ui.onSelectMonth}
                  expandedMonth={ui.expandedMonth}
                  toggleExpandedMonth={ui.toggleExpandedMonth}
                  egressMonths={memos.egressMonths}
                  onClearMonth={() => ui.setSelectedMonth(null)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-500">
      {text}
    </div>
  );
}

function ErrorState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-sm text-red-600">
      {text}
    </div>
  );
}
