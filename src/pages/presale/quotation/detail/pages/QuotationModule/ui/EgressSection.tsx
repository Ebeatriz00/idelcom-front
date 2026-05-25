
import { MonthStrip } from "../../../components/MonthStrip";
import { SectionTitle } from "../../../components/SectionTitle";
import { fmtMoney } from "../utils/format";

type EgressLineDto = {
  lineNo: number;
  monthNo: number;
  amount: number;
};

type EgressMonthDto = {
  monthNo: number;
  amount: number;
  lines: EgressLineDto[];
};

type Props = {
  egressByMonth: Map<number, number>;
  selectedMonth: number | null;
  onSelectMonth: (m: number) => void;
  expandedMonth: number | null;
  toggleExpandedMonth: (m: number) => void;
  egressMonths: EgressMonthDto[];
  onClearMonth?: () => void;
};

export function EgressSection({
  egressByMonth,
  selectedMonth,
  onSelectMonth,
  expandedMonth,
  toggleExpandedMonth,
  egressMonths,
  onClearMonth,
}: Props) {
  return (
    <div className="space-y-4">
      <MonthStrip
        title="Egresos"
        values={egressByMonth}
        accent="warn"
        value={selectedMonth}
        onSelect={onSelectMonth}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <SectionTitle title="Detalle de egresos" />

        <div className="overflow-x-auto">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {selectedMonth == null
                ? "Mostrando todos los meses"
                : `Mostrando MES ${String(selectedMonth).padStart(2, "0")}`}
            </span>

            {selectedMonth != null ? (
              <button
                type="button"
                onClick={onClearMonth}
                className="font-medium text-zinc-700 hover:text-zinc-900"
              >
                Ver todos
              </button>
            ) : null}
          </div>

          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Mes</th>
                <th className="px-3 py-2 text-right font-medium">Monto</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {egressMonths.map((m) => {
                const sumLines = (m.lines ?? []).reduce(
                  (acc, l) => acc + (l.amount ?? 0),
                  0
                );

                const mismatch = Math.abs(sumLines - (m.amount ?? 0)) > 0.01;

                return (
                  <tr key={m.monthNo} className="hover:bg-zinc-50">
                    <td colSpan={3} className="p-0">
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="font-medium text-zinc-900">
                          Egreso mensual · MES {String(m.monthNo).padStart(2, "0")}
                          {mismatch && (
                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              Cabecera ≠ detalle
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-zinc-900">
                            {fmtMoney(sumLines)}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpandedMonth(m.monthNo)}
                            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                          >
                            {expandedMonth === m.monthNo
                              ? "Ocultar detalle"
                              : "Ver detalle"}
                          </button>
                        </div>
                      </div>

                      {expandedMonth === m.monthNo ? (
                        (m.lines ?? []).length ? (
                          <table className="w-full border-t border-zinc-100 text-sm">
                            <tbody>
                              {m.lines.map((l) => (
                                <tr
                                  key={`${m.monthNo}-${l.lineNo}`}
                                  className="hover:bg-zinc-50"
                                >
                                  <td className="px-3 py-1.5 text-xs text-zinc-500">
                                    Línea #{l.lineNo}
                                  </td>
                                  <td className="px-3 py-1.5 text-right text-sm text-zinc-700">
                                    {fmtMoney(l.amount ?? 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="px-6 py-2 text-xs text-zinc-400">
                            Sin líneas
                          </div>
                        )
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
