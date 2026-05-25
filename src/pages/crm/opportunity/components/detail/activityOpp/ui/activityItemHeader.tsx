import { useCrmOpporPerms } from "@/pages/crm/opportunity/hooks/oppor.perms";
import { Trash2, User2 } from "lucide-react";
import { toast } from "sonner";
import { PriorityChip } from "./PriorityChip";
import { StateChip } from "./stateChip";

type Props = {
  title?: string;
  state?: string;
  stateColor?: string | null;
  priority?: string;
  priorityColor?: string | null;
  fallbackTitle?: string;
  responsibleName?: string | null;
  responsibleAvatarUrl?: string | null;

  onOpenPriority?: (anchor: HTMLElement) => void;
  onOpenState?: (anchor: HTMLElement) => void;
  onDelete?: () => void;
};

export function ActivityItemHeader({
  title,
  state,
  stateColor,
  priority,
  priorityColor,
  fallbackTitle,
  responsibleName,
  responsibleAvatarUrl,
  onOpenPriority,
  onOpenState,
  onDelete,
}: Props) {
  const finalTitle = title?.trim() || fallbackTitle || "";

  const initials = (name?: string | null) =>
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");

  const {
    canEditStateActivityComm,
    canEditPriorityActivityComm,
    canDeleteActivityComm,
  } = useCrmOpporPerms();
  return (
    <div className="flex flex-col gap-1.5">
      {/* Título */}
      <h4
        className="text-[14px] font-semibold text-gray-800 leading-5 line-clamp-2"
        title={finalTitle}
      >
        {finalTitle}
      </h4>

      {responsibleName && (
        <div className="flex items-center gap-2 text-[12px] text-gray-600">
          {/* Avatar */}
          {responsibleAvatarUrl ? (
            <img
              src={responsibleAvatarUrl}
              alt={responsibleName}
              className="size-5 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span
              aria-hidden
              className="inline-grid size-5 place-items-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700"
              title={responsibleName}
            >
              {initials(responsibleName) || <User2 className="size-3.5" />}
            </span>
          )}

          <span className="truncate" title={responsibleName}>
            {responsibleName}
          </span>
        </div>
      )}

      {/* Chips y acciones */}
      <div className="mt-0.5 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-y-1 gap-x-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {priority && (
            <button
              type="button"
              onClick={(e) => {
                if (!canEditPriorityActivityComm) {
                  toast.warning(
                    "No tienes permiso para cambiar la prioridad de esta actividad."
                  );
                  return;
                }
                onOpenPriority?.(e.currentTarget);
              }}
              className="rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 p-0.5"
              aria-label="Cambiar prioridad"
              title="Cambiar prioridad"
            >
              <PriorityChip label={priority} priorityColor={priorityColor} />
            </button>
          )}

          {state && (
            <button
              type="button"
              onClick={(e) => {
                if (!canEditStateActivityComm) {
                  toast.warning(
                    "No tienes permiso para cambiar el estado de esta actividad."
                  );
                  return;
                }
                onOpenState?.(e.currentTarget);
              }}
              className="rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 p-0.5"
              aria-label="Cambiar estado"
              title="Cambiar estado"
            >
              <StateChip label={state} stateColor={stateColor} />
            </button>
          )}

          {canDeleteActivityComm && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                if (!canEditPriorityActivityComm) {
                  toast.warning(
                    "No tienes permiso para cambiar la prioridad de esta actividad."
                  );
                  return;
                }
                onOpenPriority?.(e.currentTarget);
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
    </div>
  );
}
