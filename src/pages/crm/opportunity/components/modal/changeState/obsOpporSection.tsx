import type { ObservationOpporItemDto } from "@/application";
import { useEffect, useMemo, useState } from "react";

export type DeliverablesObsErrors =
  | Array<{ dueDate?: { message?: string }; comment?: { message?: string } }>
  | undefined;

type Props = {
  value: ObservationOpporItemDto[];
  onChange: (value: ObservationOpporItemDto[]) => void;
  disabled?: boolean;
  errors?: DeliverablesObsErrors;
};

const PAGE_SIZE = 5;

export function toInputDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function severityBadgeClass(sev?: number) {
  switch (sev) {
    case 1:
      return "bg-red-100 text-red-700 border-red-200";
    case 2:
      return "bg-amber-100 text-amber-700 border-amber-200";
    case 3:
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function ObsOpporSection({ value, onChange, disabled, errors }: Props) {
  const [page, setPage] = useState(0);

  const totalItems = value?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

  const pagedItems = useMemo(
    () => (value ?? []).slice(startIndex, endIndex),
    [value, startIndex, endIndex],
  );

  const updateField = (
    id: number,
    field: keyof ObservationOpporItemDto,
    newValue: string,
  ) => {
    if (disabled && field !== "dueDate") return;

    const updated = (value ?? []).map((item) => {
      if (item.obsId !== id) return item;

      if (field === "dueDate") {
        return {
          ...item,
          dueDate: newValue ? new Date(`${newValue}T00:00:00`) : null,
        };
      }

      return { ...item, [field]: newValue };
    });

    onChange(updated);
  };

  return (
    <>
      {totalItems > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Observacion</th>
                  <th className="px-3 py-2">Fecha compromiso</th>
                  <th className="px-3 py-2">Prioridad</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {pagedItems.map((item) => {
                  const realIndex = (value ?? []).findIndex(
                      (x) => x.obsId === item.obsId,
                    );
                    const showErrors =
                      !!errors && Object.keys(errors).length > 0;

                    const dueErr =
                      showErrors && realIndex >= 0
                        ? errors?.[realIndex]?.dueDate?.message
                        : undefined;
                  return(
                  <tr key={item.obsId}>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Detalle para preventa…"
                        value={item.obsComment ?? ""}
                        disabled={disabled}
                        onChange={(e) =>
                          updateField(
                            item.obsId ?? 0,
                            "obsComment",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td className="px-3 py-2 align-top">
                      <input
                        type="date"
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={toInputDate(item.dueDate)}
                        disabled={false}
                        onChange={(e) =>
                          updateField(
                            item.obsId ?? 0,
                            "dueDate",
                            e.target.value,
                          )
                        }
                      />
                      {dueErr && (
                            <p className="mt-1 text-[11px] text-rose-600">
                              {dueErr}
                            </p>
                          )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input type="hidden" value={item.obsSeverity ?? 0} />

                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          severityBadgeClass(item.obsSeverity),
                        ].join(" ")}
                      >
                        {item.obsSeverityDesc ?? "—"}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {totalItems > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2 text-[11px] text-gray-600">
              <span>
                Mostrando <strong>{startIndex + 1}</strong>–
                <strong>{endIndex}</strong> de <strong>{totalItems}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-md border px-2 py-1 disabled:opacity-40"
                >
                  Anterior
                </button>

                <span>
                  Página {page + 1} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="rounded-md border px-2 py-1 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400">
          No hay observaciones seleccionadas aún.
        </p>
      )}
    </>
  );
}
