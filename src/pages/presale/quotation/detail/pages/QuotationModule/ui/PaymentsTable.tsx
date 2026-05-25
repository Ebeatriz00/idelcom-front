import { Fragment, useMemo } from "react";
import { fmtMoney } from "../utils/format";

type Props = {
  paymentIndexes: number[];
  pageRows: Array<{
    linePlanId?: number | null;
    mesPedido?: number | null;

    lines: Array<{
      seqNo: number;
      paymentPercent: number;
      paymentAmount: number;
      monthNo: number;
      paymentNo: number;
    }>;
  }>;
};

function monthLabel(m: number) {
  return `MES ${String(m).padStart(2, "0")}`;
}

// ✅ Fuente real del mes para una fila (plan)
function getMonthFromRow(r: Props["pageRows"][number]): number | null {
  if (r.mesPedido != null) return r.mesPedido; // si el back lo manda
  const m = r.lines?.[0]?.monthNo; // si no, de las líneas
  return m ?? null;
}

export function PaymentsTable({ paymentIndexes, pageRows }: Props) {
  const groups = useMemo(() => {
    const byMonth = new Map<number, Props["pageRows"]>();
    const months: number[] = [];

    for (const r of pageRows) {
      const mes = getMonthFromRow(r);
      if (mes == null) continue;

      if (!byMonth.has(mes)) {
        byMonth.set(mes, []);
        months.push(mes);
      }
      byMonth.get(mes)!.push(r);
    }

    months.sort((a, b) => a - b);

    return months.map((m) => {
      const rows = byMonth.get(m)!;

      const totals = paymentIndexes.map((k) => {
        let pct = 0;
        let amt = 0;

        for (const r of rows) {
          // ✅ PAGO k => paymentNo
          const pay = (r.lines ?? []).find((x) => x.paymentNo === k);
          if (!pay) continue;
          pct += pay.paymentPercent ?? 0;
          amt += pay.paymentAmount ?? 0;
        }

        return { k, pct, amt };
      });

      return { month: m, rows, totals };
    });
  }, [pageRows, paymentIndexes]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr className="bg-zinc-100 border-b border-zinc-300">
            <th className="px-3 py-3 text-left text-sm font-semibold text-zinc-800">
              MES PEDIDO
            </th>

            {paymentIndexes.map((k) => (
              <th
                key={k}
                colSpan={2}
                className="border border-zinc-300 px-3 py-2 text-center font-semibold"
              >
                PAGO {String(k).padStart(2, "0")}
              </th>
            ))}
          </tr>

          <tr className="bg-white border-b border-zinc-200">
            <th />
            {paymentIndexes.flatMap((k) => [
              <th
                key={`pct-${k}`}
                className="px-2 py-1 text-right text-xs text-zinc-600"
              >
                %
              </th>,
              <th
                key={`amt-${k}`}
                className="px-2 py-1 text-right text-xs text-zinc-600"
              >
                MONTO
              </th>,
            ])}
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {groups.map((g) => (
            <Fragment key={`m-${g.month}`}>
              {/* Header del mes */}
              <tr className="bg-white">
                <td
                  colSpan={1 + paymentIndexes.length * 2}
                  className="border border-zinc-200 px-3 py-2 font-semibold text-zinc-700"
                >
                  {monthLabel(g.month)}{" "}
                  <span className="font-normal text-zinc-500">
                    ({g.rows.length})
                  </span>
                </td>
              </tr>

              {/* Filas del mes */}
              {g.rows.map((r, idx) => {
                const mesPedido = getMonthFromRow(r);

                return (
                  <tr
                    key={`${r.linePlanId ?? "noid"}-${idx}`}
                    className="hover:bg-zinc-50"
                  >
                    <td className="border border-zinc-200 px-3 py-2 text-left">
                      {mesPedido ?? "—"}
                    </td>

                    {paymentIndexes.flatMap((k) => {
                      // ✅ PAGO k => paymentNo
                      const pay = (r.lines ?? []).find(
                        (x) => x.paymentNo === k
                      );

                      return [
                        <td
                          key={`pct-${r.linePlanId ?? "noid"}-${idx}-${k}`}
                          className="border border-zinc-200 px-2 py-2 text-right"
                        >
                          {pay
                            ? `${((pay.paymentPercent ?? 0) * 100).toFixed(2)}%`
                            : "—"}
                        </td>,
                        <td
                          key={`amt-${r.linePlanId ?? "noid"}-${idx}-${k}`}
                          className="border border-zinc-200 px-2 py-2 text-right"
                        >
                          {pay ? fmtMoney(pay.paymentAmount ?? 0) : "—"}
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })}

              {/* Total del mes */}
              <tr className="bg-white">
                <td className="border border-zinc-200 px-3 py-2 font-semibold text-right">
                  TOTAL {monthLabel(g.month)}
                </td>

                {g.totals.flatMap((t) => [
                  <td
                    key={`tpct-${g.month}-${t.k}`}
                    className="border border-zinc-200 px-2 py-2 text-right font-semibold"
                  >
                    {(t.pct * 100).toFixed(2)}%
                  </td>,
                  <td
                    key={`tamt-${g.month}-${t.k}`}
                    className="border border-zinc-200 px-2 py-2 text-right font-semibold"
                  >
                    {fmtMoney(t.amt)}
                  </td>,
                ])}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
