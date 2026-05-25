import { CalendarDays, CheckSquare, Square, Trash2, User } from "lucide-react";
import { cn, fmtDate } from "@/sharedKernel";
import { PriorityChip } from "./ui/priorityChip";
import { StatusChip } from "./ui/statusChip";
import type { PreSaleProyectsDetailDto } from "@/application/dtos/presale/PreSaleProyectsDetail.dto";
import { usePreSaleProyectsPerms } from "../../../hooks/project.perms";
import { toast } from "sonner";


type TaskItem = NonNullable<PreSaleProyectsDetailDto["tasksList"]>[number];

export function TaskRow({
  t,
  onToggle,
  onOpenStatus,
  onOpenPriority,
  onDelete
}: {
  t: TaskItem;
  onToggle: (token: string) => void;
  onOpenStatus: (t: TaskItem, el: HTMLElement) => void;
  onOpenPriority: (t: TaskItem, el: HTMLElement) => void;
  onDelete?: () => void;
}) {
  const isDone = (t.statusTasks ?? "") === "Completado";
  const token = (t as any).tasksToken as string;

  const { canEditStateTasksProject, canEditPriorityTasksProject } =
    usePreSaleProyectsPerms();

  return (
    <li className="rounded-2xl border px-3 py-3 sm:px-4 hover:bg-gray-50 transition">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <button
          onClick={() => onToggle(token)}
          disabled={isDone}
          className={cn("text-gray-600 sm:mt-0.5", isDone ? "opacity-50 cursor-not-allowed" : "hover:text-gray-800")}
          title={isDone ? "La tarea ya está completada" : "Marcar como completada"}
        >
          {isDone ? <CheckSquare className="size-5" /> : <Square className="size-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
            <div className="flex-1 min-w-0">
              <span
                className={cn("text-sm font-medium truncate", isDone ? "line-through text-gray-400" : "text-gray-800")}
                title={t.titleTasks ?? ""}
              >
                {t.titleTasks}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  if (!canEditStateTasksProject) {
                    toast.warning(
                      "No tienes permiso para cambiar el estado de esta tarea."
                    );
                    return;
                  }
                  onOpenStatus?.(t, e.currentTarget as HTMLElement);
                }}
                className="rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                title="Cambiar estado"
              >
                <StatusChip
                  label={t.statusTasks as any}
                  stateColor={t.stateColor as any}
                  numPercPro={t.statusProgress ?? (t as any).numPercPro}
                />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  if (!canEditPriorityTasksProject) {
                    toast.warning(
                      "No tienes permiso para cambiar la prioridad de esta tarea."
                    );
                    return;
                  }
                  onOpenPriority?.(t, e.currentTarget as HTMLElement);
                }}
                className="rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                title="Cambiar prioridad"
              >
                <PriorityChip desc={(t as any).priorityDesc} color={t.priorityColor} />
              </button>
              {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="justify-self-end sm:justify-self-end shrink-0 inline-flex items-center gap-1 
                         rounded-lg border border-red-200 bg-red-50 px-1 py-1
                         text-[10px] font-medium text-red-600 hover:bg-red-100 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-red-200"
              aria-label="Eliminar actividad"
              title="Eliminar actividad"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
            </div>
          </div>

          {t.descTasks && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.descTasks}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {t.tasksResp && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <User className="size-3 shrink-0" />
                <span className="truncate">{t.tasksResp}</span>
              </span>
            )}
            {t.endRegister && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                {fmtDate(t.endRegister)}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}