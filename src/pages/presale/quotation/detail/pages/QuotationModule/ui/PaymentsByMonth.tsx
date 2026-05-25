import { fmtMoney } from "../utils/format";
import { PaymentsTable } from "./PaymentsTable";

type MonthCard = {
  month: number;
  totalAmount: number;
  count: number;
};

type PayLine = {
  seqNo: number;
  paymentPercent: number;
  paymentAmount: number;
  monthNo: number;
  paymentNo: number;
};

type PageRow = {
  linePlanId?: number | null;
  mesPedido?: number | null;
  lines: PayLine[];
};

type Props = {
  paymentIndexes: number[];

  months: MonthCard[];

  selectedMonth: number | null;
  onSelectMonth: (m: number) => void;
  onClearMonth: () => void;

  pageRows: PageRow[];
  page: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  setPage: (p: number) => void;
};

function monthLabel(m: number) {
  return `MES ${String(m).padStart(2, "0")}`;
}

export function PaymentsByMonth({
  paymentIndexes,
  months,
  selectedMonth,
  onSelectMonth,
  onClearMonth,
  pageRows,
  page,
  totalPages,
  totalRows,
  pageSize,
  setPage,
}: Props) {
  const rangeLabel =
    months.length === 0
      ? "—"
      : `${monthLabel(months[0].month)} → ${monthLabel(months[months.length - 1].month)}`;

  return (
    <div className="space-y-4">
      {/* Header estilo egresos */}
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-zinc-900">Plan de pago</div>
        <div className="text-xs text-zinc-500">{rangeLabel}</div>
      </div>

      {/* Chips por mes */}
      <div className="flex flex-wrap gap-3">
        {months.map((c) => {
          const active = selectedMonth === c.month;

          return (
            <button
              key={c.month}
              type="button"
              onClick={() => {
                onSelectMonth(c.month);
                setPage(1); // ✅ reset paginación como egresos
              }}
              className={[
                "w-[180px] rounded-xl border px-4 py-3 text-left shadow-sm transition",
                active
                  ? "border-amber-300 bg-amber-50"
                  : "border-zinc-200 bg-white hover:bg-zinc-50",
              ].join(" ")}
            >
              <div className="text-xs font-semibold text-amber-900">
                {monthLabel(c.month)}
              </div>

              <div className="mt-1 text-lg font-bold text-amber-900">
                {fmtMoney(c.totalAmount)}
              </div>

              <div className="mt-1 text-xs text-zinc-500">{c.count} filas</div>
            </button>
          );
        })}
      </div>

      {/* Tabla del mes seleccionado */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            {selectedMonth == null
              ? "Selecciona un mes"
              : `Mostrando ${monthLabel(selectedMonth)}`}
          </div>

          {selectedMonth != null && (
            <button
              type="button"
              onClick={() => {
                onClearMonth();
                setPage(1);
              }}
              className="text-sm font-semibold text-zinc-700 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        <PaymentsTable paymentIndexes={paymentIndexes} pageRows={pageRows} />

        {/* Pager (tu estilo) */}
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Mostrando{" "}
            {totalRows === 0
              ? "0"
              : `${(page - 1) * pageSize + 1} – ${Math.min(page * pageSize, totalRows)}`}{" "}
            de {totalRows}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              {"<<"}
            </button>
            <button
              className="rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {"<"}
            </button>

            <span>
              Página <b>{page}</b> / {totalPages}
            </span>

            <button
              className="rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {">"}
            </button>
            <button
              className="rounded-md border px-2 py-1 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
