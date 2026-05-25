import type { DeliverableItemDto } from "@/application";
import { DeliverablesOptions } from "@/sharedKernel";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type Deliverables =
  | Array<{ dueDate?: { message?: string }; comment?: { message?: string } }>
  | undefined;
type Props = {
  value: DeliverableItemDto[];
  onChange: (value: DeliverableItemDto[]) => void;
  disabled?: boolean;
  errors?: Deliverables;
};

const PAGE_SIZE = 5;

export function OpporDeliverablesSection({
  value,
  onChange,
  disabled,
  errors,
}: Props) {
  const { data } = DeliverablesOptions();
  const options = useMemo(() => data?.items ?? [], [data]);
  const [page, setPage] = useState(0);
  const [selectValue, setSelectValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((value.length || 1) / PAGE_SIZE));
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [value.length, page]);

  const totalItems = value.length;
  const totalPages = Math.max(1, Math.ceil((totalItems || 1) / PAGE_SIZE));
  const startIndex = page * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const pagedItems = value.slice(startIndex, endIndex);

  const resolveName = (id: number) =>
    options.find((o: any) => o.value === id)?.label ?? `#${id}`;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (disabled) return;

    const raw = e.target.value;
    setSelectValue(raw);
    if (!raw) return;

    if (raw === "__custom__") {
      setCustomMode(true);
      setSelectValue("");
      return;
    }

    const id = Number(raw);
    if (!id) return;

    const exists = value.some((d) => d.deliverablesId === id);
    if (exists) {
      setSelectValue("");
      return;
    }

    const opt = options.find((o: any) => Number(o.value) === id);
    const name = opt?.label ?? "";

    const updated: DeliverableItemDto[] = [
      ...value,
      {
        deliverablesId: id,
        comment: "",
        name,
        dueDate: undefined,
        fromDb: false,
      },
    ];

    onChange(updated);
    setSelectValue("");
    setError(null);

    const newTotalPages = Math.max(
      1,
      Math.ceil((updated.length || 1) / PAGE_SIZE),
    );
    setPage(newTotalPages - 1);
  };

  const handleAddCustom = () => {
    if (disabled) return;

    const trimmed = customName.trim();
    if (!trimmed) return;

    const tempId = -Date.now();

    const updated: DeliverableItemDto[] = [
      ...value,
      {
        deliverablesId: tempId,
        comment: "",
        name: trimmed,
        dueDate: undefined,
        fromDb: false,
      },
    ];

    onChange(updated);

    setCustomName("");
    setCustomMode(false);

    const newTotal = updated.length;
    const newTotalPages = Math.max(1, Math.ceil((newTotal || 1) / PAGE_SIZE));
    setPage(newTotalPages - 1);
  };

  const handleRemove = (id: number) => {
    if (disabled) return;

    const target = value.find((d) => d.deliverablesId === id);
    if (target?.fromDb) {
      return;
    }

    const updated = value.filter((d) => d.deliverablesId !== id);
    onChange(updated);
  };

  const updateField = (
    id: number,
    field: keyof DeliverableItemDto,
    newValue: string,
  ) => {
    if (disabled) return;

    const updated = value.map((item) => {
      if (item.deliverablesId !== id) return item;

      if (item.fromDb) return item;

      if (field === "dueDate") {
        return {
          ...item,
          dueDate: newValue ? new Date(newValue) : undefined,
        };
      }

      return {
        ...item,
        [field]: newValue,
      };
    });

    onChange(updated);
  };

  return (
    <section className="space-y-4">
      {/* Selector de entregables */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-900">
          Entregables para preventa / ingeniería
        </label>
        <p className="text-xs text-gray-500">Selecciona los entregables.</p>

        <select
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2
            ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
          disabled={disabled}
          value={selectValue}
          onChange={handleSelectChange}
          onBlur={() => {
            if (value.length === 0) {
              setError("Debes seleccionar o crear al menos un entregable.");
            }
          }}
        >
          <option value="">Selecciona un entregable…</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}

          {/* 🆕 opción para crear uno nuevo */}
          <option value="__custom__">+ Crear nuevo entregable…</option>
        </select>
        {options.length === 0 && (
          <p className="text-[11px] text-amber-600">
            No hay entregables en catálogo. Puedes crear uno nuevo
          </p>
        )}
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}

        {/* 🆕 input que se habilita cuando el user quiere crear uno nuevo */}
        {customMode && !disabled && (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nombre del nuevo entregable…"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="rounded-md border border-emerald-500 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomMode(false);
                setCustomName("");
              }}
              className="rounded-md border border-gray-300 px-3 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Tabla de entregables seleccionados */}
      {totalItems > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Entregable</th>
                  <th className="px-3 py-2">Comentario</th>
                  <th className="px-3 py-2">Fecha compromiso</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pagedItems.map((item, i) => {
                  const isRowLocked = item.fromDb === true;
                  const rowDisabled = disabled || isRowLocked;

                  // 🆕 si tiene name, usamos eso; si no, resolvemos por catálogo
                  const idx = startIndex + i; // ✅ índice real
                  const dueErr = errors?.[idx]?.dueDate?.message;
                  const commErr = errors?.[idx]?.comment?.message;
                  const displayName =
                    item.name?.trim() || resolveName(item.deliverablesId);

                  return (
                    <tr key={item.deliverablesId}>
                      <td className="px-3 py-2 align-top text-[13px] font-medium text-gray-800">
                        {displayName}
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
                        {commErr && (
                          <p className="mt-1 text-[11px] text-rose-600">
                            {commErr}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="date"
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={rowDisabled}
                          required={!item.fromDb}
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
                      <td className="px-3 py-2 align-top text-center">
                        {!isRowLocked && !disabled ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(item.deliverablesId)}
                            className="text-xs text-rose-600 hover:underline disabled:opacity-50"
                          >
                            Quitar
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-300">—</span>
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
          No hay entregables seleccionados aún.
        </p>
      )}
    </section>
  );
}
