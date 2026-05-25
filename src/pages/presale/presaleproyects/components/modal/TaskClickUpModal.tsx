import { cn } from "@/sharedKernel";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar, CheckCircle2, ChevronDown, Circle, CircleDashed, Flag, GitMerge, User, X } from "lucide-react";
import { useEffect, useState } from "react";

export type TaskItem = {
  tasksId: string;
  titleTasks: string;
  statusTasks: string;
  tasksResp?: string;
  endRegister?: Date | string;
  priorityDesc?: string;
  description?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: TaskItem | null;
  subtasks: TaskItem[];
};

export function TaskClickUpModal({
  open,
  onOpenChange,
  task,
  subtasks,
}: Props) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setActiveTaskId(task.tasksId);
    }
  }, [task?.tasksId]);

  if (!task) return null;

  const activeTask =
    activeTaskId === task.tasksId
      ? task
      : (subtasks.find((s) => s.tasksId === activeTaskId) ?? task);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />

        <Dialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[98vw] h-[96vh]",
            "bg-white shadow-2xl overflow-hidden",
            "rounded-2xl focus:outline-none",
          )}
        >
          {/* HEADER */}
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Tarea</span>
              <span className="text-gray-300">/</span>

              <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
                <span className="font-mono text-xs text-gray-700">
                  {activeTask.titleTasks}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Dialog.Close asChild>
                <button className="p-2 rounded hover:bg-gray-100 text-gray-600">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-[280px_1fr_380px] h-[calc(100%-56px)]">
            {/* LEFT SIDEBAR */}
            <aside className="border-r border-gray-200 overflow-y-auto">
              <div className="px-4 py-3 text-sm font-semibold text-gray-900">
                <GitMerge size={16} className="inline mr-2" /> Subtareas
              </div>

              <nav className="px-2 pb-3">
                {/* PADRE */}
                <button
                  onClick={() => setActiveTaskId(task.tasksId)}
                  className={cn(
                    "w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm",
                    activeTaskId === task.tasksId
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "hover:bg-gray-50 text-gray-700",
                  )}
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 shrink-0"
                  />
                  <span className="truncate">{task.titleTasks}</span>
                  {subtasks.length > 0 && (
                    <span className="ml-auto text-[11px] text-gray-400 font-semibold">
                      {subtasks.length}
                    </span>
                  )}
                </button>

                {/* SUBTASKS ANIDADAS */}
                {subtasks.length > 0 && (
                  <div className="ml-6 mt-1 border-l border-gray-200 pl-3 space-y-1">
                    {subtasks.map((s) => (
                      <button
                        key={s.tasksId}
                        onClick={() => setActiveTaskId(s.tasksId)}
                        className={cn(
                          "w-full flex items-center gap-2 text-left px-2 py-2 rounded-lg text-sm",
                          activeTaskId === s.tasksId
                            ? "bg-gray-100 font-semibold text-gray-900"
                            : "hover:bg-gray-50 text-gray-700",
                        )}
                      >
                        <Circle size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{s.titleTasks}</span>
                      </button>
                    ))}
                  </div>
                )}
              </nav>
            </aside>

            {/* CENTER PANEL */}
            <main className="overflow-y-auto">
              <div className="px-10 py-6">
                <h1 className="text-[32px] font-black tracking-tight text-gray-900">
                  {activeTask.titleTasks}
                </h1>

                <div className="mt-5 grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                  <Field label="Estado" icon={<CircleDashed size={14} className="text-gray-600" />}>
                    <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold text-xs">
                      {activeTask.statusTasks || "Vaciar"}
                    </span>
                  </Field>

                  <Field label="Asignados" icon={<User size={14} className="text-gray-600" />}>
                    <span className="text-gray-500">
                      {activeTask.tasksResp || "Vaciar"}
                    </span>
                  </Field>

                  <Field label="Fecha" icon={<Calendar size={14} className="text-gray-600" />}>
                    <span className="text-gray-500">
                      {activeTask.endRegister
                        ? String(activeTask.endRegister).split("T")[0]
                        : "Vaciar"}
                    </span>
                  </Field>

                  <Field label="Prioridad" icon={<Flag size={14} className="text-gray-600" />}>
                    <span className="text-gray-500">
                      {activeTask.priorityDesc || "Vaciar"}
                    </span>
                  </Field>
                </div>

                <div className="mt-6 border-t border-gray-200" />

                <div className="mt-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Descripción
                  </div>
                  <div className="mt-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
                    {activeTask.description?.trim() || "-"}
                  </div>
                </div>
              </div>
            </main>

            {/* RIGHT PANEL */}
            <aside className="border-l border-gray-200 overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 text-sm font-semibold">
                Actividad • {activeTask.titleTasks}
              </div>

              <div className="px-4 py-4 text-sm text-gray-500">
                Aquí cargarías actividad por taskId:
                <div className="mt-2 font-mono text-xs text-gray-400">
                  {activeTask.tasksId}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Escribe un comentario..."
                />
              </div>
            </aside>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


function Field({
  label,
  children,
   icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
        
       <div className="flex items-center gap-2 text-gray-500 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-gray-900">{children}</div>
    </div>
  );
}
