import type { DeliverableItemDto } from "@/application";
import { DeliverablesHiringOptions } from "@/sharedKernel";
import { useEffect, useMemo, useState } from "react";
import StatusPickerDialog from "../../detail/taskOpp/states/statusPickerDialog";
import { StatusChip } from "../../detail/taskOpp/ui/statusChip";
import { useTaskPickers } from "../../detail/taskOpp/useTaskPickers";

const COLOR_MAP: Record<string, string> = {
  "bg-gray-400": "#9CA3AF",
  "bg-gray-100 text-gray-600": "#F3F4F6",
  "bg-blue-500": "#3B82F6",
  "bg-blue-600": "#2563EB",
  "bg-green-500": "#22C55E",
  "bg-green-600": "#16A34A",
  "bg-yellow-500": "#EAB308",
  "bg-amber-500": "#F59E0B",
  "bg-red-500": "#EF4444",
  "bg-rose-500": "#F43F5E",
};

export type DeliverablesHiringErrors =
  | Array<{ dueDate?: { message?: string }; comment?: { message?: string } }>
  | undefined;

type Props = {
  value: DeliverableItemDto[];
  onChange: (value: DeliverableItemDto[]) => void;
  disabled?: boolean;
  errors?: DeliverablesHiringErrors;
  hideSelect?: boolean;
  taskStateOptions?: any[];
  onTaskStatusChange?: (taskId: string, newStateId: string) => void;
};

const PAGE_SIZE = 5;

export function OpporDeliverablesHiringSection({
  value,
  onChange,
  disabled,
  hideSelect = false,
  taskStateOptions = [],
  errors,
  onTaskStatusChange,
}: Props) {
  const { data } = DeliverablesHiringOptions();
  const options = useMemo(() => data?.items ?? [], [data]);
  const [page, setPage] = useState(0);

  const showStatusColumn = useMemo(() => {
    return value.some((item) => {
      const itemAny = item as any;
      return (
        itemAny.typeDeliverable === 2 && !!(itemAny.tasksId || itemAny.taskId)
      );
    });
  }, [value]);

  const { panel, anchorEl, currentStateId, openStatus, close, selectStatus } =
    useTaskPickers(
      taskStateOptions,
      [],
      (taskId, newStateId) => {
        if (onTaskStatusChange) onTaskStatusChange(taskId, newStateId!);

        const newState = taskStateOptions.find(
          (o) => String(o.stateTaskId || o.id) === String(newStateId),
        );
        if (newState) {
          const updated = value.map((item): DeliverableItemDto => {
            const itemAny = item as any;
            const currentId = itemAny.tasksId || itemAny.taskId;
            if (String(currentId) === String(taskId)) {
              return {
                ...item,
                taskStateDesc: newState.stateDesc || newState.name,
                taskStateColor: newState.stateColor || newState.color,
              } as any;
            }
            return item;
          });
          onChange(updated);
        }
      },
      () => {},
    );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((value.length || 1) / PAGE_SIZE));
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [value.length, page]);

  const startIndex = page * PAGE_SIZE;
  const pagedItems = value.slice(startIndex, startIndex + PAGE_SIZE);

  const resolveName = (id: number) =>
    options.find((o: any) => o.value === id)?.label ?? `#${id}`;

  const updateComment = (id: number, newComment: string) => {
    if (disabled) return;

    const updated = value.map((item): DeliverableItemDto => {
      if (item.deliverablesId !== id) return item;
      if (item.fromDb) return item;
      return {
        ...item,
        comment: newComment,
      };
    });

    onChange(updated);
  };

  const updateDueDate = (id: number, dateValue: string) => {
    if (disabled) return;

    let newDueDate: Date | undefined = undefined;

    if (dateValue) {
      const [year, month, day] = dateValue.split("-").map(Number);
      newDueDate = new Date(year, month - 1, day);
    }

    const updated = value.map((item): DeliverableItemDto => {
      if (item.deliverablesId !== id) return item;
      if (item.fromDb) return item;
      return {
        ...item,
        dueDate: newDueDate,
      };
    });

    onChange(updated);
  };

  const getError = (idx: number, field: "comment" | "dueDate") =>
    errors?.[idx]?.[field]?.message;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        {!hideSelect && (
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={disabled || options.length === 0}
            defaultValue=""
            onChange={(e) => {
              const id = Number(e.target.value);
              if (!id || value.some((d) => d.deliverablesId === id)) return;
              const opt = options.find((o: any) => Number(o.value) === id);
              onChange([
                ...value,
                {
                  deliverablesId: id,
                  comment: "",
                  name: opt?.label ?? "",
                  dueDate: undefined,
                  fromDb: false,
                } as DeliverableItemDto,
              ]);
              e.target.value = "";
            }}
          >
            <option value="">Selecciona consultas…</option>
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Entregable</th>
                <th className="px-3 py-2">Comentario</th>
                <th className="px-3 py-2">Fecha compromiso</th>
                {showStatusColumn && (
                  <th className="px-3 py-2 text-center">Estado</th>
                )}
                {!hideSelect && (
                  <th className="px-3 py-2 text-center">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {pagedItems.map((item, i) => {
                const realIndex = startIndex + i;
                const itemAny = item as any;
                const taskId = itemAny.tasksId || itemAny.taskId;

                const rawColor =
                  itemAny.taskStateColor || "bg-gray-100 text-gray-600";
                const displayColor = COLOR_MAP[rawColor] || rawColor;

                const d = item.dueDate ? new Date(item.dueDate) : null;
                const formattedDate =
                  d && !isNaN(d.getTime())
                    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                    : "";

                return (
                  <tr key={item.deliverablesId}>
                    <td className="px-3 py-2 text-[13px] font-medium text-gray-800">
                      {item.name || resolveName(item.deliverablesId)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-2 py-1"
                        value={item.comment ?? ""}
                        onChange={(e) =>
                          updateComment(item.deliverablesId, e.target.value)
                        }
                        disabled={disabled || item.fromDb}
                      />
                      {getError(realIndex, "comment") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getError(realIndex, "comment")}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        className="rounded-md border border-gray-300 px-2 py-1"
                        value={formattedDate}
                        onChange={(e) => {
                          updateDueDate(item.deliverablesId, e.target.value);
                        }}
                        disabled={disabled || item.fromDb}
                      />
                      {getError(realIndex, "dueDate") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getError(realIndex, "dueDate")}
                        </p>
                      )}
                    </td>
                    {showStatusColumn && (
                      <td className="px-3 py-2 text-center">
                        {taskId ? (
                          <button
                            type="button"
                            onClick={(e) =>
                              openStatus(
                                {
                                  tasksToken: String(taskId),
                                  statusTasks:
                                    itemAny.taskStateDesc || "Pendiente",
                                } as any,
                                e.currentTarget,
                              )
                            }
                            className="focus:outline-none"
                          >
                            <StatusChip
                              label={itemAny.taskStateDesc || "Pendiente"}
                              stateColor={displayColor}
                              statusProgress={itemAny.numPercPro}
                            />
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    )}
                    {!hideSelect && (
                      <td className="px-3 py-2 text-center">
                        {!item.fromDb && (
                          <button
                            type="button"
                            onClick={() =>
                              onChange(
                                value.filter(
                                  (d) =>
                                    d.deliverablesId !== item.deliverablesId,
                                ),
                              )
                            }
                            className="text-rose-600"
                          >
                            Quitar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StatusPickerDialog
        open={panel === "status"}
        anchorEl={anchorEl}
        options={taskStateOptions}
        valueId={currentStateId}
        onSelect={selectStatus}
        onClose={close}
      />
    </section>
  );
}