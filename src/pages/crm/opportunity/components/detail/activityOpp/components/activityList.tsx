// components/List.tsx
import type { ActivityOpporDeleteDto } from "@/application";
import { useCrmOpporPerms } from "@/pages/crm/opportunity/hooks/oppor.perms";
import {
  confirmAction,
  fmtDate,
  useACOpportunitiesMutations,
} from "@/sharedKernel";
import { CalendarDays, Plus } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActivityItem } from "../activityItem";
import { getActivityIcon as activityIconToNode } from "../ui/getActivityIcon";

type Row = {
  linkToken?: string | null;
  activity?: string | null;
  messageAddition?: string | null;
  workerName?: string | null;
  activityState?: string | null;
  activityStateColor?: string | null;
  responsibleName?: string | null;
  activityPriority?: string | null;
  activityPriorityColor?: string | null;
  dateActivity?: Date;
};

type ListProps = {
  items: Row[];
  onAdd?: () => void;
  onDelete?: (linkToken: string, opporToken: string) => Promise<void> | void;
};

export const List = memo(function List({ items, onAdd, onDelete }: ListProps) {
  const { opporId } = useParams();
  const [, setBusy] = useState(false);
  const {
    ActivitystateChangeMut,
    ActivitystateChangePriorityMut,
    delelteACMut,
  } = useACOpportunitiesMutations();

  const {
    canAddActivityComm,
    canDeleteActivityComm,
  } = useCrmOpporPerms();

  function handleChangeActivityStateFromPicker(
    lineToken: string,
    status: string | null
  ) {
    if (status === null) {
      ActivitystateChangeMut.mutate({
        linkToken: lineToken,
        status: "",
        opporToken: String(opporId),
      });
      return;
    }
    ActivitystateChangeMut.mutate({
      linkToken: lineToken,
      status,
      opporToken: String(opporId),
    });
  }

  function handleChangeActivityPriorityStateFromPicker(
    linkToken: string,
    status: string | null
  ) {
    
    if (status === null) {
      ActivitystateChangePriorityMut.mutate({
        linkToken: linkToken,
        status: "",
        opporToken: String(opporId),
      });
      return;
    }
    ActivitystateChangePriorityMut.mutate({
      linkToken: linkToken,
      status,
      opporToken: String(opporId),
    });
  }

  const confirmDeleteActivity = useCallback(
    async (linkToken: string, opporToken: string) => {
      if (!canDeleteActivityComm) {
        toast.warning("No tienes permiso para eliminar esta actividad.", {
          position: "top-right",
        });
        return;
      }

      const ok = await confirmAction({
        title: "¿Desea eliminar la actividad?",
        text: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "No, cancelar",
        icon: "warning",
      });
      if (!ok) return;

      setBusy(true);
      try {
        if (onDelete) {
          await onDelete(linkToken, opporToken);
        } else {
          await delelteACMut.mutateAsync({
            opporToken: String(opporToken),
            linkToken: String(linkToken),
          } as ActivityOpporDeleteDto);
        }
      } finally {
        setBusy(false);
      }
    },
    [onDelete, delelteACMut]
  );
  if (items.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-6 text-center">
          <CalendarDays className="size-6 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Sin actividades que cumplan los filtros.
          </p>
          {canAddActivityComm && (
            <button
              onClick={onAdd}
              className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 h-10 text-sm font-medium bg-gray-900 text-white hover:bg-black"
            >
              <Plus className="size-4" /> Agregar actividad
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
      {items.map((a) => {
        const key =
          a.linkToken ?? `${a.activity}-${a.workerName}-${a.messageAddition}`;
        return (
          <ActivityItem
            key={key}
            row={a as any}
            icon={activityIconToNode(a.activity ?? "")}
            title={`${a.activity ?? ""}  —  ${fmtDate(a.dateActivity)} `}
            responsibleName={a.workerName}
            subtitle={`${a.messageAddition ?? ""}`}
            state={a.activityState}
            stateColor={a.activityStateColor}
            priority={a.activityPriority}
            priorityColor={a.activityPriorityColor}
            onChangeStatus={handleChangeActivityStateFromPicker}
            onChangePriority={handleChangeActivityPriorityStateFromPicker}
            onDelete={() =>
              confirmDeleteActivity(a.linkToken ?? "", String(opporId))
            }
          />
        );
      })}
    </div>
  );
});
