import { cn } from "@/sharedKernel";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { QuotationLine } from "../types";
import { money, parseDescripcion, toneClass } from "../utils/helpers";

export function DetailLinesTable({
  rows,
  collapsed,
  toggleGroup,
  canToggle,
}: {
  rows: QuotationLine[];
  collapsed: Set<string | number>;
  toggleGroup: (id: string | number) => void;
  canToggle: (id: string | number) => boolean;
}) {
  return (
    <table className="min-w-[1100px] w-full text-sm">
      <thead className="bg-zinc-50 text-zinc-600">
        <tr>
          <th className="px-3 py-2 text-left font-medium">Item</th>
          <th className="px-3 py-2 text-left font-medium">Descripción</th>
          <th className="px-3 py-2 text-left font-medium">Tipo</th>
          <th className="px-3 py-2 text-left font-medium">Med</th>
          <th className="px-3 py-2 text-left font-medium">Marca</th>
          <th className="px-3 py-2 text-left font-medium">Modelo</th>
          <th className="px-3 py-2 text-left font-medium">Cant</th>
          <th className="px-3 py-2 text-right font-medium">P.U</th>
          <th className="px-3 py-2 text-right font-medium">P.T</th>
          <th className="px-3 py-2 text-left font-medium">P.V.T</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-zinc-100">
        {rows.map((r) => {
          const indent = Math.max(0, (r.levelNo ?? 0) - 1) * 14;
          const { title, items } = parseDescripcion(r.description);
          const tone = toneClass(r);

          return (
            <tr
              key={String(r.id)}
              className="cursor-grab active:cursor-grabbing select-none hover:bg-zinc-50 "
            >
              <td className={cn("px-3 py-2", tone)}>{r.displayNo || ""}</td>

              <td className={cn("px-3 py-2", tone)}>
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

                  <div className="min-w-0 flex-1 w-full">
                    {items.length ? (
                      <div
                        className={cn(
                          "line-clamp-2 text-sm",
                          r.isCollapsible && "uppercase",
                        )}
                        title={r.description}
                      >
                        {title ? (
                          <div className="font-medium">{title}</div>
                        ) : null}
                        <ul className="list-disc pl-5 space-y-0.5">
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
                          "line-clamp-2 break-words whitespace-pre-line",
                          r.isCollapsible && "uppercase",
                        )}
                        title={r.description}
                      >
                        {r.description || "—"}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              <td className={cn("px-3 py-2", tone)}>{r.typeName ?? ""}</td>
              <td className={cn("px-3 py-2", tone)}>{r.uomName ?? ""}</td>
              <td className={cn("px-3 py-2", tone)}>{r.brandName ?? ""}</td>
              <td className={cn("px-3 py-2", tone)}>{r.modelName ?? ""}</td>
              <td className={cn("px-3 py-2", tone)}>{r.qty ?? ""}</td>

              <td className={cn("px-3 py-2 text-right tabular-nums", tone)}>
                {money(r.unitPrice)}
              </td>
              <td className={cn("px-3 py-2 text-right tabular-nums", tone)}>
                {money(r.totalPrice)}
              </td>
              <td className={cn("px-3 py-2", tone)}>{money(r.lineAmount)}</td>
            </tr>
          );
        })}

        {!rows.length ? (
          <tr>
            <td
              colSpan={10}
              className="px-4 py-6 text-center text-sm text-zinc-500"
            >
              Sin líneas.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
