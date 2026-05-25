import type { DeliverableItemDto } from "@/application";
import { useEffect, useMemo, useState } from "react";
import type { DeliverablesHiringErrors } from "../deliverablesHiring/opporDeliverablesHiringSection";

type Props = {
  value: DeliverableItemDto[];
  onChange: (value: DeliverableItemDto[]) => void;
  disabled?: boolean;
  errors?: DeliverablesHiringErrors;
};

const PAGE_SIZE = 5;

export function HiringDeliverablesSection({
  value,
  onChange,
  disabled,
  errors,
}: Props) {
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
    field: keyof DeliverableItemDto,
    newValue: string,
  ) => {
    if (disabled && field !== "dueDate") return;

    const updated = (value ?? []).map((item) => {
      if (item.deliverablesId !== id) return item;

      if (field === "dueDate") {
        return {
          ...item,
          dueDate: newValue ? new Date(`${newValue}T00:00:00`) : undefined,
        };
      }

      return { ...item, [field]: newValue };
    });

    onChange(updated);
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900">
            Entregables para contratación
          </label>
          <p className="text-xs text-gray-500">
            Las consultas generadas al inicio del registro de la oportunidad, se
            convierten en entregables para el área de contratación. Aquí puedes
            revisar y ajustar las fechas de compromiso de entrega.
          </p>
        </div>
        {totalItems > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Entregable</th>
                    <th className="px-3 py-2">Comentario</th>
                    <th className="px-3 py-2">Nueva Fecha compromiso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedItems.map((item) => {
                    const isRowLocked = item.fromDb === true;
                    const rowDisabled = disabled || isRowLocked;

                    const realIndex = (value ?? []).findIndex(
                      (x) => x.deliverablesId === item.deliverablesId,
                    );
                    const showErrors =
                      !!errors && Object.keys(errors).length > 0;

                    const dueErr =
                      showErrors && realIndex >= 0
                        ? errors?.[realIndex]?.dueDate?.message
                        : undefined;
                    return (
                      <tr key={item.deliverablesId}>
                        <td className="px-3 py-2 align-top text-[13px] font-medium text-gray-800">
                          {item.name?.trim()}
                          {isRowLocked && (
                            <span className="ml-1 text-[10px] text-gray-400">
                              <span className="inline-flex items-center gap-1 rounded bg-black-50 px-1.5 py-0.5 text-[10px] text-emerald-500">
                                {item.state}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Detalle para preventa…"
                            disabled={rowDisabled}
                            value={item.comment ?? ""}
                            onChange={(e) =>
                              updateField(
                                item.deliverablesId,
                                "comment",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="date"
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={false}
                            required
                            value={
                              item.dueDate
                                ? new Date(item.dueDate)
                                    .toISOString()
                                    .slice(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              updateField(
                                item.deliverablesId,
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
                      </tr>
                    );
                  })}
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
            No hay entregables agregados aún.
          </p>
        )}
      </section>
    </>
  );
}
