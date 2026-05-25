import type { OptionItem } from "@/application";
import { cn } from "@/sharedKernel";
import {
  Check,
  Lock,
  Paperclip,
  Pencil,
  PlusCircle,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { PriorityChip } from "./ui/priorityChip";
import { StatusChip } from "./ui/statusChip";

const FALLBACK_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-amber-400",
  3: "bg-blue-500",
  4: "bg-green-500",
  0: "bg-blue-500",
};

const formatDateLong = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export interface TaskItem {
  tasksId: string;
  titleTasks: string;
  statusTasks: string;
  tasksResp?: string;
  workerId?: number;
  endRegister?: Date | string;
  priorityDesc?: string;
  priorityStateId?: number;
  stateTaskId?: number;
  description?: string;
  time?: string;
  status: string;
  stateColor?: string;
  taskColor?: string;
  priorityColor?: string;
  color?: string;
  statusProgress?: number;
  numPercPro?: number;
  isDeliverable?: boolean;
}

type Props = {
  t: TaskItem;
  workerOptions: OptionItem[];
  priorityOptions: OptionItem[];
  onUpdate: (task: TaskItem, changes: Partial<TaskItem>) => void;
  onToggle: (token: string) => void;
  onOpenStatus: (t: any, el: HTMLElement) => void;
  onOpenPriority: (t: any, el: HTMLElement) => void;
  onDelete?: (t: any) => void;
  onAddSubTask?: (t: any) => void;
  projectEndDate?: string | Date;
  onOpenTaskModal?: (t: TaskItem) => void;
  onOpenFiles?: (t: TaskItem) => void; // Propiedad para archivos
};

export function TaskRowInline({
  t,
  workerOptions,
  priorityOptions,
  onUpdate,
  onOpenStatus,
  onOpenPriority,
  onDelete,
  onAddSubTask,
  projectEndDate,
  onOpenFiles,
}: Props) {
  const isDone = (t.statusTasks || "").toUpperCase().includes("COMPLETAD");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(t.titleTasks);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const priorityOption = priorityOptions.find(
    (opt) => Number(opt.value) === t.priorityStateId,
  );
  const colorFromOption = (priorityOption as any)?.color;
  const finalPriorityColor =
    t.color ||
    t.priorityColor ||
    colorFromOption ||
    FALLBACK_COLORS[t.priorityStateId || 0];

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  const saveTitle = () => {
    if (titleValue.trim() !== t.titleTasks && titleValue.trim() !== "") {
      onUpdate(t, { titleTasks: titleValue });
    } else {
      setTitleValue(t.titleTasks);
    }
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setTitleValue(t.titleTasks);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") cancelTitle();
  };

  const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    if (val !== t.workerId) onUpdate(t, { workerId: val });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentDateStr = t.endRegister
      ? String(t.endRegister).split("T")[0]
      : "";

    if (val === currentDateStr) return;

    if (projectEndDate && val) {
      const limitStr = String(projectEndDate).split("T")[0];

      if (val > limitStr) {
        const niceDate = formatDateLong(limitStr);

        Swal.fire({
          title: "Fecha fuera de rango",
          html: `El proyecto finaliza el <b>${niceDate}</b>.<br/>No puedes programar tareas después de esa fecha.`,
          icon: "warning",
          confirmButtonColor: "#EF4444",
          confirmButtonText: "Entendido",
          focusConfirm: true,
          customClass: { popup: "rounded-2xl font-sans" },
        });

        e.target.value = currentDateStr;
        return;
      }
    }
    onUpdate(t, { endRegister: val });
  };

  const AddSubTaskButton = () =>
    onAddSubTask && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddSubTask(t);
        }}
        className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover/row:opacity-100 transition-all p-1 hover:bg-emerald-50 rounded"
        title="Agregar Sub-Tarea"
      >
        <PlusCircle size={14} />
      </button>
    );

  return (
    <>
      <div className="group/row grid grid-cols-[1fr_220px_120px_200px] gap-4 items-center px-3 py-1 rounded-md hover:bg-gray-50 transition-colors text-sm border-b border-gray-200">
        <div className="flex items-center gap-3 overflow-hidden pl-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStatus(t, e.currentTarget);
            }}
            className="flex-shrink-0 focus:outline-none"
          >
            <StatusChip
              label={t.statusTasks}
              stateColor={t.stateColor || t.taskColor}
              numPercPro={t.numPercPro || t.statusProgress}
              onlyIcon={true}
            />
          </button>

          <div
            className={cn(
              "flex-1 min-w-0 relative flex items-center gap-2 rounded-md px-1 -mx-1 cursor-pointer",
              "hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-400",
            )}
            role="button"
            tabIndex={0}
            title="Clic para ver detalle"
          >
            {t.isDeliverable ? (
              <div className="flex items-center gap-1.5 text-gray-700 w-full">
                <span
                  className={cn(
                    "font-semibold truncate select-text cursor-default",
                    isDone && "text-gray-400 line-through decoration-gray-300",
                  )}
                  title={t.titleTasks}
                >
                  {t.titleTasks}
                </span>
                <div title="Entregable derivado">
                  <Lock size={12} className="text-gray-300 shrink-0" />
                </div>

                <AddSubTaskButton />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFiles?.(t);
                  }}
                  className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover/row:opacity-100 transition-all p-1 hover:bg-emerald-50 rounded"
                  title="Agregar Archivos"
                >
                  <Paperclip size={14} />
                </button>
              </div>
            ) : isEditingTitle ? (
              <div className="flex items-center gap-1 w-full animate-in fade-in zoom-in-95 duration-200">
                <input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2 py-0.5 text-sm border border-blue-500 rounded-md focus:outline-none shadow-sm font-semibold"
                />
                <button
                  onMouseDown={saveTitle}
                  className="text-green-600 hover:bg-green-50 p-0.5 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onMouseDown={cancelTitle}
                  className="text-red-600 hover:bg-red-50 p-0.5 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <input type="hidden" value={t.tasksId} />
                <span
                  className={cn(
                    "font-semibold text-gray-700 truncate cursor-pointer hover:text-blue-600 transition-colors",
                    isDone && "text-gray-400 line-through decoration-gray-300",
                  )}
                  onClick={() => setIsEditingTitle(true)}
                  title="Clic para editar nombre"
                >
                  {t.titleTasks}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="text-gray-400 hover:text-blue-600 opacity-0 group-hover/row:opacity-100 transition-all p-1 hover:bg-blue-50 rounded"
                  title="Editar Nombre"
                >
                  <Pencil size={12} />
                </button>

                <AddSubTaskButton />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFiles?.(t);
                  }}
                  className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover/row:opacity-100 transition-all p-1 hover:bg-emerald-50 rounded"
                  title="Agregar Archivos"
                >
                  <Paperclip size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative w-full group/select">
            <select
              value={t.workerId && t.workerId > 0 ? t.workerId : 0}
              onChange={handleWorkerChange}
              className={cn(
                "w-full appearance-none bg-transparent rounded px-2 py-1 pr-6 text-xs cursor-pointer truncate transition-colors focus:ring-1 focus:ring-blue-500 outline-none",
                t.workerId && t.workerId > 0
                  ? "text-gray-700 font-medium hover:bg-white border border-transparent hover:border-gray-200"
                  : "text-gray-400 hover:bg-gray-100",
              )}
              title="Asignar responsable"
            >
              <option value={0}>- Sin asignar -</option>
              {workerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <User className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none group-hover/select:text-gray-600" />
          </div>
        </div>

        <div className="flex items-center justify-start">
          <div className="w-[110px]">
            <input
              type="date"
              value={t.endRegister ? String(t.endRegister).split("T")[0] : ""}
              onChange={handleDateChange}
              className="w-full bg-transparent rounded px-2 py-1 text-xs cursor-pointer outline-none text-left text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 pl-2 pr-1">
          <button
            onClick={(e) => onOpenPriority(t, e.currentTarget)}
            className="hover:bg-gray-50 rounded p-1 transition-colors focus:outline-none"
          >
            <PriorityChip desc={t.priorityDesc} color={finalPriorityColor} />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(t)}
              className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover/row:opacity-100 transition-all"
              title="Eliminar tarea"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}