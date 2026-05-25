import type { OpportunitiesDetailDto } from "@/application";
import { TaskRow } from "./taskRow";

type TaskItem = NonNullable<OpportunitiesDetailDto["tasksList"]>[number];

export function TasksList({
  data,
  onToggle,
  onOpenStatus,
  onOpenPriority,
  onDelete,
}: {
  data: TaskItem[];
  onToggle: (token: string) => void;
  onOpenStatus: (t: TaskItem, el: HTMLElement) => void;
  onOpenPriority: (t: TaskItem, el: HTMLElement) => void;
  onDelete?: (t: TaskItem) => void;
}) {
  if (data.length === 0) {
    return (
      <ul className="p-3 sm:p-4">
        <li className="rounded-xl border border-dashed p-6 text-sm text-gray-500 text-center">
          Sin tareas que coincidan con los filtros.
        </li>
      </ul>
    );
  }

  return (
    <ul className="p-3 sm:p-4 space-y-2">
      {data.map((t) => (
        <TaskRow
          key={(t as any).tasksToken as string}
          t={t}
          onToggle={onToggle}
          onOpenStatus={onOpenStatus}
          onOpenPriority={onOpenPriority}
          onDelete={onDelete ? () => onDelete(t) : undefined}
        />
      ))}
    </ul>
  );
}
