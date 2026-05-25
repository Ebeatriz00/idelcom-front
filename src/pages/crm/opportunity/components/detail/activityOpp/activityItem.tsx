// activityItem.tsx
import type { OpportunitiesDetailDto } from "@/application";
import { usePriorityState } from "@/sharedKernel";
import { useActivityState } from "@/sharedKernel/hooks/Activity/useActivityState";
import * as React from "react";
import { useActivityPickers } from "./state/useActivityPicker";
import { ActivityDialogs } from "./ui/activityDialogs";
import { ActivityItemCard } from "./ui/activityItemCard";
import { ActivityItemHeader } from "./ui/activityItemHeader";
import { ActivityItemSubtitle } from "./ui/activityItemSubtitle";

type Row = NonNullable<OpportunitiesDetailDto["activityList"]>[number];

export type ActivityItemProps = {
  row: Row;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  priority?: string | null;
  state?: string | null;
  stateColor?: string | null;
  priorityColor?: string | null;
  responsibleName?: string | null;
  onClick?: () => void;
  onChangeStatus?: (opperToken: string, lineToken: string | null) => void;
  onChangePriority?: (opperToken: string, lineToken: string | null) => void;

  onDelete?: (row: Row) => void;
};

export const ActivityItem = React.memo(function ActivityItem({
  row,
  icon,
  title,
  subtitle,
  state,
  stateColor,
  priority,
  priorityColor,
  responsibleName,
  onClick,
  onChangeStatus,
  onChangePriority,
  onDelete,
}: ActivityItemProps) {
  const { data: stateOptions = [] } = useActivityState();
  const { data: priorityOptions = [] } = usePriorityState();

  const pickers = useActivityPickers(
    stateOptions,
    priorityOptions,
    onChangeStatus,
    onChangePriority
  );

  
  
  return (
    <>
      <ActivityItemCard onClick={onClick}>
        {/* Ícono */}
        <div className="grid place-content-center size-10 shrink-0 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
          <div className="size-5">{icon}</div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <ActivityItemHeader
            title={title}
            state={state ?? undefined}
            stateColor={stateColor ?? undefined}
            priority={priority ?? undefined}
            priorityColor={priorityColor ?? undefined}
            responsibleName={responsibleName ?? undefined}
            onOpenState={(anchor) => pickers.openStatusAc(row, anchor)}
            onOpenPriority={(anchor) => pickers.openPriorityAc(row, anchor)}
            onDelete={() => onDelete?.(row)}
          />
          <ActivityItemSubtitle text={subtitle} />
        </div>
      </ActivityItemCard>

      {/* Diálogos */}
      <ActivityDialogs
        panel={pickers.panel}
        anchorEl={pickers.anchorEl}
        stateOptions={stateOptions}
        currentStateId={pickers.currentStateId}
        onSelectState={pickers.selectStatus}
        priorityOptions={priorityOptions}
        currentPriorityId={pickers.currentPriorityStateId}
        onSelectPriority={pickers.selectPriority}
        onClose={pickers.close}
      />
    </>
  );
});
