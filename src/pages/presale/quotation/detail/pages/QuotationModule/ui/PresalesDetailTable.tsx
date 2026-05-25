import { cn } from "@/sharedKernel";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { QuotationLine } from "../types";
import {
  computeDescCount,
  filterVisibleRows,
} from "../utils/detailLines.collapse";
import { money, parseDescripcion, pct } from "../utils/helpers";
import { filterPresalesTree } from "./filterPresalesTree";

type Props = { rows: QuotationLine[] };

function rowTone(l: QuotationLine) {
  const isRedGroup = l.kind === "GROUP";
  const isRedItem = l.kind === "ITEM" && l.isPresales; 

  const isBlue = !isRedItem && (l.kind === "PARENT" || l.isChild); 

  return cn(
    "hover:bg-zinc-50",
    isRedGroup && "text-rose-700 font-semibold",
    isBlue && "text-blue-700",
    isRedItem && "text-rose-700"
  );
}

function isContainerRow(l: QuotationLine) {
  return l.kind === "PARENT" || l.kind === "GROUP";
}

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("dragging");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onLeave = () => (isDown = false);
    const onUp = () => (isDown = false);

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  return ref;
}

export function PresalesDetailTable({ rows }: Props) {
  const presalesTree = useMemo(() => filterPresalesTree(rows), [rows]);

  const descCount = useMemo(
    () => computeDescCount(presalesTree),
    [presalesTree]
  );

  const [collapsed, setCollapsed] = useState<Set<string | number>>(
    () => new Set()
  );

  const toggleGroup = (id: string | number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canToggle = (id: string | number) => (descCount.get(id) ?? 0) >= 1;
  const dragRef = useDragScroll();
  const visibleRows = useMemo(
    () => filterVisibleRows(presalesTree, collapsed),
    [presalesTree, collapsed]
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            Detalle preventa
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            Padres/hijos para contexto + solo ítems rojos
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {visibleRows.filter((x) => x.kind === "ITEM").length} ítems
        </div>
      </div>

      <div
        ref={dragRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing"
      >
        <table className="min-w-[1350px] w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr className="border-b border-zinc-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Descripción
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                P.U. Costo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                Costo total
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                Margen
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                P.U. Venta
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                Total venta
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Preventa
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {visibleRows.map((r, i) => {
              const indent = Math.max(0, (r.levelNo ?? 0) - 1) * 14;
              const { title, items } = parseDescripcion(r.description);
              const container = isContainerRow(r);

              return (
                <tr
                  key={String(r.id)}
                  className={cn(
                    rowTone(r),
                    i % 2 === 0 ? "bg-white" : "bg-zinc-50/30",
                    "cursor-grab active:cursor-grabbing select-none"
                  )}
                >
                  {/* Item */}
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span
                      className={cn(
                        "tabular-nums",
                        container && "font-semibold"
                      )}
                    >
                      {r.displayNo || ""}
                    </span>
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-2">
                      <div style={{ width: indent }} />

                      {r.isCollapsible && canToggle(r.id) ? (
                        <button
                          type="button"
                          onClick={() => toggleGroup(r.id)}
                          className="mt-0.5 text-zinc-500 hover:text-zinc-800"
                          title={collapsed.has(r.id) ? "Expandir" : "Contraer"}
                        >
                          {collapsed.has(r.id) ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-4" />
                      )}

                      <div className="min-w-0 flex-1">
                        {items.length ? (
                          <div
                            className={cn(
                              "leading-relaxed",
                              r.isCollapsible && "uppercase"
                            )}
                          >
                            {title ? (
                              <div className="font-medium">{title}</div>
                            ) : null}
                            <ul className="mt-1 list-disc pl-5 space-y-1 text-zinc-700">
                              {items.map((it, idx) => (
                                <li key={idx} className="break-words">
                                  {it}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "leading-relaxed break-words whitespace-pre-line",
                              r.isCollapsible && "uppercase",
                              container && "font-semibold"
                            )}
                          >
                            {r.description || "—"}

                            {!container ? (
                              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-600">
                                {r.modelName ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Modelo: {r.modelName}
                                  </span>
                                ) : null}

                                {r.typeName ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Tipo: {r.typeName}
                                  </span>
                                ) : null}

                                {r.systemName ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Sistema: {r.systemName}
                                  </span>
                                ) : null}

                                {r.suppliersName ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Mayorista: {r.suppliersName}
                                  </span>
                                ) : null}

                                {r.deliveryDays != null ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Entrega: {r.deliveryDays} días
                                  </span>
                                ) : null}

                                {r.pmConditionName ? (
                                  <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                    Condición: {r.pmConditionName}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* NUMS: si es contenedor, que no “grite” con $0.00 */}
                  <td className="px-4 py-4 align-top text-right tabular-nums whitespace-nowrap">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      money(r.unitCost)
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-right tabular-nums whitespace-nowrap">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      money(r.lineCostTotal)
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-right tabular-nums whitespace-nowrap">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      pct(r.margenPorcentLine)
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-right tabular-nums whitespace-nowrap">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      money(r.unitSalePrice)
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-right tabular-nums whitespace-nowrap font-semibold">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      money(r.lineSaleTotal ?? r.totalPrice)
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    {container ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      r.assignedTo ?? "—"
                    )}
                  </td>
                </tr>
              );
            })}

            {!visibleRows.length ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-12 text-center text-sm text-zinc-500"
                >
                  Sin ítems rojos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
