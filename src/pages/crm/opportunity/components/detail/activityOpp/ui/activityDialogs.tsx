import type {
  ActivityStateSelectDto,
  PriorityStateSelectDto,
} from "@/application";
import PriorityPickerDialog from "../../taskOpp/states/priorityPickerDialog";
import ActivityStatePickerDialog from "../state/activityStatePickerDialog";

export function ActivityDialogs({
  panel,
  anchorEl,
  stateOptions,
  currentStateId,
  onSelectState,
  priorityOptions,
  currentPriorityId,
  onSelectPriority,
  onClose,
}: {
  panel: "none" | "status" | "priority";
  anchorEl: HTMLElement | null;
  stateOptions: ActivityStateSelectDto[];
  currentStateId: string | null;
  onSelectState: (opt: ActivityStateSelectDto) => void;
  priorityOptions: PriorityStateSelectDto[];
  currentPriorityId: string | null;
  onSelectPriority: (opt: PriorityStateSelectDto | null) => void;
  onClose: () => void;
}) {
  return (
    <>
      <ActivityStatePickerDialog
        open={panel === "status"}
        anchorEl={anchorEl}
        options={stateOptions}
        valueId={currentStateId}
        onSelect={onSelectState}
        onClose={onClose}
        title="Cambiar estado"
      />
      <PriorityPickerDialog
        open={panel === "priority"}
        anchorEl={anchorEl}
        options={priorityOptions}
        valueId={currentPriorityId}
        onSelect={onSelectPriority}
        onClose={onClose}
        title="Cambiar prioridad"
      />
    </>
  );
}
